import { StatusCodes } from 'http-status-codes';
import Priest from '../models/Priest.js';
import PriestAvailability from '../models/PriestAvailability.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/responseUtils.js';

// @desc    Get priest availability
// @route   GET /api/priests/:id/availability
// @access  Private
export const getPriestAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if priest exists
    const priest = await Priest.findById(id);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Find or create availability record
    let availability = await PriestAvailability.findOne({ priest: id });
    
    if (!availability) {
      // Create default availability if not exists
      availability = new PriestAvailability({
        priest: id,
        timezone: 'Asia/Kolkata',
        bufferTime: 15
      });
      await availability.save();
    }

    // If date range is provided, get slots for that range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateArray = [];
      
      // Generate array of dates in range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateArray.push(new Date(d));
      }
      
      // Get available slots for each date
      const availabilityData = await Promise.all(
        dateArray.map(async (date) => {
          const slots = await availability.getAvailableSlots(date);
          return {
            date: date.toISOString().split('T')[0],
            available: slots.length > 0,
            slots
          };
        })
      );
      
      return successResponse(
        res,
        {
          priest: priest._id,
          timezone: availability.timezone,
          availability: availabilityData
        },
        'Priest availability retrieved successfully'
      );
    }

    // Return default availability if no date range provided
    return successResponse(
      res,
      {
        priest: priest._id,
        timezone: availability.timezone,
        defaultAvailability: availability.defaultAvailability,
        bufferTime: availability.bufferTime
      },
      'Priest availability retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving priest availability',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update priest availability
// @route   PUT /api/priests/:id/availability
// @access  Private/Admin,Priest
export const updatePriestAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      dayOfWeek, 
      timeSlots, 
      isAvailable, 
      reason, 
      timezone, 
      bufferTime 
    } = req.body;

    // Check if priest exists
    const priest = await Priest.findById(id);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Check if user is authorized (admin or the priest themselves)
    if (req.user.role !== 'admin' && req.user.id !== priest.user.toString()) {
      return errorResponse(
        res,
        'Not authorized to update this priest\'s availability',
        StatusCodes.FORBIDDEN
      );
    }

    // Find or create availability record
    let availability = await PriestAvailability.findOne({ priest: id });
    
    if (!availability) {
      availability = new PriestAvailability({
        priest: id,
        timezone: timezone || 'Asia/Kolkata',
        bufferTime: bufferTime || 15
      });
    }

    // Update timezone if provided
    if (timezone) {
      availability.timezone = timezone;
    }

    // Update buffer time if provided
    if (bufferTime !== undefined) {
      availability.bufferTime = bufferTime;
    }

    // Update specific day's availability if dayOfWeek is provided
    if (dayOfWeek) {
      await availability.setDefaultAvailability(
        dayOfWeek.toLowerCase(),
        timeSlots || [],
        isAvailable !== false // Default to true if not provided
      );
    } else {
      await availability.save();
    }

    return successResponse(
      res,
      availability,
      'Priest availability updated successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while updating priest availability',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Set custom availability for a specific date
// @route   POST /api/priests/:id/availability/date
// @access  Private/Admin,Priest
export const setCustomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      date, 
      timeSlots = [], 
      isAvailable = true, 
      reason = '',
      isRecurring = false,
      recurringPattern = null,
      recurringEndDate = null,
      excludeDates = []
    } = req.body;

    // Check if priest exists
    const priest = await Priest.findById(id);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Check if user is authorized (admin or the priest themselves)
    if (req.user.role !== 'admin' && req.user.id !== priest.user.toString()) {
      return errorResponse(
        res,
        'Not authorized to update this priest\'s availability',
        StatusCodes.FORBIDDEN
      );
    }

    // Find or create availability record
    let availability = await PriestAvailability.findOne({ priest: id });
    
    if (!availability) {
      availability = new PriestAvailability({
        priest: id,
        timezone: 'Asia/Kolkata',
        bufferTime: 15
      });
    }

    // Handle recurring availability
    if (isRecurring && recurringPattern && recurringEndDate) {
      const startDate = new Date(date);
      const endDate = new Date(recurringEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return errorResponse(
          res,
          'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
          StatusCodes.BAD_REQUEST
        );
      }

      // Generate dates based on recurring pattern
      const dates = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        // Skip excluded dates
        const dateStr = currentDate.toISOString().split('T')[0];
        if (!excludeDates.includes(dateStr)) {
          dates.push(new Date(currentDate));
        }
        
        // Move to next date based on pattern
        if (recurringPattern === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (recurringPattern === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (recurringPattern === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          break;
        }
      }
      
      // Set availability for each date
      await Promise.all(
        dates.map(date => 
          availability.setCustomAvailability(date, timeSlots, isAvailable, reason)
        )
      );
    } else {
      // Single date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return errorResponse(
          res,
          'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
          StatusCodes.BAD_REQUEST
        );
      }
      
      await availability.setCustomAvailability(
        dateObj, 
        timeSlots, 
        isAvailable, 
        reason
      );
    }

    return successResponse(
      res,
      availability,
      'Custom availability set successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while setting custom availability',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Check priest availability for a time slot
// @route   GET /api/priests/:id/availability/check
// @access  Private
export const checkPriestAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, excludeBookingId } = req.query;

    // Check if priest exists
    const priest = await Priest.findById(id);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Find availability record
    let availability = await PriestAvailability.findOne({ priest: id });
    
    if (!availability) {
      // If no custom availability, check priest's default working hours
      availability = new PriestAvailability({
        priest: id,
        timezone: 'Asia/Kolkata',
        bufferTime: 15
      });
    }

    // Check availability
    const isAvailable = await availability.checkAvailability(
      date,
      startTime,
      endTime,
      excludeBookingId
    );

    return successResponse(
      res,
      {
        priest: priest._id,
        date,
        startTime,
        endTime,
        ...isAvailable
      },
      'Availability checked successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while checking priest availability',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get available time slots for a priest on a specific date
// @route   GET /api/priests/:id/availability/slots
// @access  Private
export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, duration = 60 } = req.query;

    // Check if priest exists
    const priest = await Priest.findById(id).select('isAvailable isActive');
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Check if priest is available
    if (!priest.isAvailable || !priest.isActive) {
      return successResponse(
        res,
        {
          priest: id,
          date,
          available: false,
          reason: 'Priest is not currently available',
          slots: []
        },
        'Priest is not available'
      );
    }

    // Find availability record
    let availability = await PriestAvailability.findOne({ priest: id });
    
    if (!availability) {
      // If no custom availability, create default
      availability = new PriestAvailability({
        priest: id,
        timezone: 'Asia/Kolkata',
        bufferTime: 15
      });
      await availability.save();
    }

    // Get available slots
    const slots = await availability.getAvailableSlots(new Date(date), parseInt(duration, 10));
    
    return successResponse(
      res,
      {
        priest: id,
        date,
        duration: parseInt(duration, 10),
        timezone: availability.timezone,
        available: slots.length > 0,
        slots,
        bufferTime: availability.bufferTime
      },
      'Available slots retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving available slots',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
