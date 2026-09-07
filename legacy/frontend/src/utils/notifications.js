import { toast } from 'react-toastify';
import api from './api';

export const showNotification = (message, type = 'info') => {
  toast[type](message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const createNotification = async (notification) => {
  try {
    const response = await api.post('/notifications', notification);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};