import API from './api';

export const chatService = {
  getOrCreateConversation: (workerId) =>
    API.post('/chat/conversations', { workerId }),
  getMyConversations: () => API.get('/chat/conversations'),
  getMessages: (conversationId, params) =>
    API.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) =>
    API.post(`/chat/conversations/${conversationId}/messages`, data),
};

export default chatService;
