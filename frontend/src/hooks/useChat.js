import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${chatId}`);
      setMessages(data);
      await api.put(`/messages/read/${chatId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const updateMessageStatus = (messageId, status) => {
    setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, status } : m));
  };

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, status: 'read' })));
  };

  return { messages, loading, addMessage, updateMessageStatus, markAllRead };
};