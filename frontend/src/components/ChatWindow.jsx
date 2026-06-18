import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';


export default function ChatWindow({ chat, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { messages, loading, addMessage, updateMessageStatus, markAllRead } = useChat(chat._id);
  const messagesEndRef = useRef(null);
  const [typing, setTyping] = React.useState(false);

  const otherUser = chat.participants.find((p) => p._id !== user._id);
  const isOnline = onlineUsers.includes(otherUser?._id);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', chat._id);
    
    socket.emit('message:read', { chatId: chat._id, senderId: otherUser?._id });

    socket.on('message:receive', (msg) => {
      addMessage(msg);
      socket.emit('message:read', { chatId: chat._id, senderId: msg.sender._id });
    });

    socket.on('message:status', ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on('message:read:update', ({ chatId }) => {
      if (chatId === chat._id) markAllRead();
    });

    socket.on('typing:show', () => setTyping(true));
    socket.on('typing:hide', () => setTyping(false));

    return () => {
      socket.off('message:receive');
      socket.off('message:status');
      socket.off('message:read:update');
      socket.off('typing:show');
      socket.off('typing:hide');
    };
  
  }, [socket, chat._id, otherUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      
      
      <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-panel border-b border-gray-200">
        
        
        <button 
          onClick={onBack}
          className="md:hidden p-1 mr-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-600"
          aria-label="Back to chat list"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-whatsapp-teal flex items-center justify-center text-white font-bold select-none">
            {otherUser?.name?.charAt(0).toUpperCase()}
          </div>
          {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-whatsapp-green rounded-full border-2 border-white" />}
        </div>
        <div>
          <p className="font-semibold text-gray-800 leading-tight">{otherUser?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {typing ? <span className="text-whatsapp-green font-medium">typing...</span> : isOnline ? 'online' : 'offline'}
          </p>
        </div>
      </div>

      
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23e5ddd5'/%3E%3C/svg%3E\")" }}
      >
        {loading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} isOwn={msg.sender._id === user._id} />
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl px-4 py-2 text-sm text-gray-500 shadow-sm">
              <span className="animate-pulse">●●●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

     
      <MessageInput chat={chat} onMessageSent={addMessage} otherUserId={otherUser?._id} />
    </div>
  );
}