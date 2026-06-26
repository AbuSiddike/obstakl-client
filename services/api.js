import axios from "axios";
import { authClient } from "@/lib/auth-client";

const api = axios.create({
  baseURL: "/api/backend",
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      try {
        const { data } = await authClient.token();
        if (data?.token) {
          config.headers.Authorization = `Bearer ${data.token}`;
        }
      } catch (err) {
        console.error("Error setting auth token:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- PROPERTIES SERVICE ---
export const getProperties = async (params = {}) => {
  const response = await api.get("/properties", { params });
  return response.data;
};

export const getFeaturedProperties = async () => {
  const response = await api.get("/properties/featured");
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const addProperty = async (payload) => {
  const response = await api.post("/properties", payload);
  return response.data;
};

export const updateProperty = async (id, payload) => {
  const response = await api.put(`/properties/${id}`, payload);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

export const getMyListings = async () => {
  const response = await api.get("/properties/my-listings");
  return response.data;
};

// --- BOOKINGS SERVICE ---
export const createPaymentIntent = async (propertyId) => {
  const response = await api.post("/bookings/create-payment-intent", { propertyId });
  return response.data;
};

export const confirmBooking = async (payload) => {
  const response = await api.post("/bookings/confirm", payload);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const getBookingRequests = async () => {
  const response = await api.get("/bookings/requests");
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
};

export const getOwnerAnalytics = async () => {
  const response = await api.get("/bookings/owner-analytics");
  return response.data;
};

export const downloadOwnerReport = async () => {
  // Download report as a blob
  const response = await api.get("/bookings/owner-report", {
    responseType: "blob",
  });
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get("/bookings/all");
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await api.get("/bookings/transactions");
  return response.data;
};

// --- REVIEWS SERVICE ---
export const addReview = async (payload) => {
  const response = await api.post("/reviews", payload);
  return response.data;
};

export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(`/reviews/property/${propertyId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await api.get("/reviews/my-reviews");
  return response.data;
};

export const getAllReviews = async () => {
  const response = await api.get("/reviews");
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

// --- FAVORITES SERVICE ---
export const getFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

export const addToFavorites = async (propertyId) => {
  const response = await api.post("/favorites", { propertyId });
  return response.data;
};

export const removeFromFavorites = async (propertyId) => {
  const response = await api.delete(`/favorites/${propertyId}`);
  return response.data;
};

// --- ADMIN SERVICE ---
export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const changeUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const getAdminProperties = async () => {
  const response = await api.get("/admin/properties");
  return response.data;
};

export const approveOrRejectProperty = async (id, payload) => {
  const response = await api.patch(`/admin/properties/${id}/status`, payload);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export default api;
