import axios from "../../../../Utils/axios";

export const getNotifications = async () => {
  const response = await axios.get("/notifications");
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get("/notifications/unread-count");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.put(
    `/notifications/${id}/read`
  );

  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.put(
    "/notifications/read-all"
  );

  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axios.delete(
    `/notifications/${id}`
  );

  return response.data;
};