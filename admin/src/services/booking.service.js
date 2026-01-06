import axios from "../api/axios";

// GET all bookings (admin)
export const getAllBookings = async () => {
  const res = await axios.get("/api/v1/bookings");
  // API returns { success, data: { data: [...] } }
  return res.data?.data?.data || res.data?.data || res.data || [];
};

// UPDATE booking status
export const updateBookingStatus = async (id, status) => {
  const res = await axios.put(`/api/v1/bookings/${id}/status`, { status });
  return res.data;
};

// ADD admin note
export const addAdminNote = async (id, note) => {
  const res = await axios.post(`/api/v1/bookings/${id}/notes`, { note });
  return res.data;
};
