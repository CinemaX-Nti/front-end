const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  bookings: `${API_BASE_URL}/bookings`,
  admin: `${API_BASE_URL}/admin`,
  restaurantMenu: `${API_BASE_URL}/restaurant/menu`,
} as const;

