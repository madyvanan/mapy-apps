import api from './api';
import type { Restaurant, MenuItem, ApiResponse } from '../types';

export const listRestaurants = (params?: Record<string, string>) =>
  api.get<ApiResponse<Restaurant[]>>('/restaurants', { params });

export const getNearby = (lat: number, lng: number, radius = 5) =>
  api.get<ApiResponse<Restaurant[]>>('/restaurants/nearby', { params: { lat, lng, radius } });

export const searchRestaurants = (q: string) =>
  api.get<ApiResponse<Restaurant[]>>('/restaurants/search', { params: { q } });

export const getRestaurantById = (id: string) =>
  api.get<ApiResponse<{ restaurant: Restaurant; menu: Record<string, MenuItem[]> }>>(`/restaurants/${id}`);

export const createRestaurant = (data: Partial<Restaurant>) =>
  api.post<ApiResponse<Restaurant>>('/restaurants', data);

export const updateRestaurant = (id: string, data: Partial<Restaurant>) =>
  api.patch<ApiResponse<Restaurant>>(`/restaurants/${id}`, data);

export const toggleOpen = (id: string) =>
  api.patch<ApiResponse<{ isOpen: boolean }>>(`/restaurants/${id}/toggle`);

export const addMenuItem = (restaurantId: string, data: Partial<MenuItem>) =>
  api.post<ApiResponse<MenuItem>>(`/restaurants/${restaurantId}/menu/items`, data);

export const updateMenuItem = (restaurantId: string, itemId: string, data: Partial<MenuItem>) =>
  api.patch<ApiResponse<MenuItem>>(`/restaurants/${restaurantId}/menu/items/${itemId}`, data);

export const deleteMenuItem = (restaurantId: string, itemId: string) =>
  api.delete<ApiResponse>(`/restaurants/${restaurantId}/menu/items/${itemId}`);
