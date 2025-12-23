import TourPackage from '../models/TourPackage.js';
import { escapeRegExp } from 'lodash';

/**
 * Search for tour packages
 * @param {Object} query - Search query parameters
 * @param {string} [query.q] - Search term
 * @param {string} [query.destination] - Destination filter
 * @param {number} [query.minPrice] - Minimum price
 * @param {number} [query.maxPrice] - Maximum price
 * @param {number} [query.duration] - Duration in days
 * @param {Date} [query.startDate] - Start date
 * @param {string} [query.sortBy] - Sort field
 * @param {string} [query.sortOrder] - Sort order (asc/desc)
 * @param {number} [query.page=1] - Page number
 * @param {number} [query.limit=10] - Results per page
 * @returns {Promise<Object>} - Search results
 */
export const searchTours = async (query = {}) => {
  try {
    const {
      q,
      destination,
      minPrice,
      maxPrice,
      duration,
      startDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Build the filter
    const filter = { isActive: true };

    // Text search
    if (q) {
      const searchRegex = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex },
        { 'location.country': searchRegex },
        { 'highlights': searchRegex },
        { 'inclusions': searchRegex },
      ];
    }

    // Destination filter
    if (destination) {
      const destRegex = new RegExp(escapeRegExp(destination), 'i');
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'location.city': destRegex },
        { 'location.country': destRegex },
        { 'location.region': destRegex }
      );
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Duration filter
    if (duration) {
      filter.duration = { $lte: Number(duration) };
    }

    // Start date filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      filter.$or = filter.$or || [];
      filter.$or.push(
        // One-time tours on the specified date
        { 
          'schedule.type': 'one-time',
          'schedule.startDate': { $lte: start },
          'schedule.endDate': { $gte: start },
        },
        // Recurring tours that include the specified day
        {
          'schedule.type': 'recurring',
          'schedule.daysOfWeek': start.getDay(),
          'schedule.startDate': { $lte: start },
          $or: [
            { 'schedule.endDate': { $exists: false } },
            { 'schedule.endDate': { $gte: start } },
          ],
        },
        // Flexible tours that can start any day
        { 'schedule.type': 'flexible' }
      );
    }

    // Build sort
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [tours, total] = await Promise.all([
      TourPackage.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v -updatedAt')
        .lean(),
      TourPackage.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: tours,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error('Error searching tours:', error);
    throw error;
  }
};

/**
 * Get search suggestions
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Search suggestions
 */
export const getSearchSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    const searchRegex = new RegExp(escapeRegExp(query), 'i');

    // Search in tour names
    const tourResults = await TourPackage.find({
      name: searchRegex,
      isActive: true,
    })
      .select('name slug')
      .limit(5)
      .lean();

    // Search in destinations
    const destinationResults = await TourPackage.aggregate([
      {
        $match: {
          $or: [
            { 'location.city': searchRegex },
            { 'location.country': searchRegex },
            { 'location.region': searchRegex },
          ],
          isActive: true,
        },
      },
      {
        $group: {
          _id: {
            city: '$location.city',
            country: '$location.country',
            region: '$location.region',
          },
          count: { $sum: 1 },
        },
      },
      { $limit: 5 },
    ]);

    // Format results
    const suggestions = [
      ...tourResults.map(tour => ({
        type: 'tour',
        id: tour._id,
        name: tour.name,
        slug: tour.slug,
      })),
      ...destinationResults.map(dest => ({
        type: 'destination',
        id: `${dest._id.city}-${dest._id.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: [dest._id.city, dest._id.region, dest._id.country]
          .filter(Boolean)
          .join(', '),
        count: dest.count,
      })),
    ];

    return { suggestions };
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return { suggestions: [] };
  }
};

/**
 * Get popular searches
 * @returns {Promise<Array>} - Popular search terms
 */
export const getPopularSearches = async () => {
  try {
    // In a real app, you might want to track popular searches in a separate collection
    // For now, we'll return some hardcoded popular searches
    return [
      { term: 'Weekend Getaways', count: 1243 },
      { term: 'Himalayan Treks', count: 987 },
      { term: 'Beach Holidays', count: 876 },
      { term: 'Spiritual Tours', count: 765 },
      { term: 'Adventure Sports', count: 654 },
    ];
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};

/**
 * Get search filters
 * @returns {Promise<Object>} - Available search filters
 */
export const getSearchFilters = async () => {
  try {
    // Get price range
    const priceRange = await TourPackage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    // Get available durations
    const durations = await TourPackage.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$duration' } },
      { $sort: { _id: 1 } },
    ]);

    // Get destinations
    const destinations = await TourPackage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            city: '$location.city',
            country: '$location.country',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get tour types
    const types = await TourPackage.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100000 },
      durations: durations.map(d => d._id).filter(Boolean).sort((a, b) => a - b),
      destinations: destinations.map(d => ({
        id: `${d._id.city}-${d._id.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: [d._id.city, d._id.country].filter(Boolean).join(', '),
        count: d.count,
      })),
      types: types.map(t => ({
        id: t._id.toLowerCase().replace(/\s+/g, '-'),
        name: t._id,
        count: t.count,
      })),
    };
  } catch (error) {
    console.error('Error getting search filters:', error);
    return {
      priceRange: { minPrice: 0, maxPrice: 100000 },
      durations: [],
      destinations: [],
      types: [],
    };
  }
};

export default {
  searchTours,
  getSearchSuggestions,
  getPopularSearches,
  getSearchFilters,
};