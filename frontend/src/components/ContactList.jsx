import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function ContactList({ chats, activeChat, setActiveChat, currentUser }) {
  const { onlineUsers } = useSocket();

  const getOtherUser = (chat) => chat.participants.find((p) => p._id !== currentUser._id);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  return (
    <div>
      {chats.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-10">No chats yet. Search for users to start!</p>
      )}
      {chats.map((chat) => {
        const other = getOtherUser(chat);
        if (!other) return null;
        const isOnline = onlineUsers.includes(other._id);
        const isActive = activeChat?._id === chat._id;

        return (
          <div key={chat._id} onClick={() => setActiveChat(chat)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-whatsapp-teal flex items-center justify-center text-white font-bold">
                {other.name.charAt(0).toUpperCase()}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 truncate">{other.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatTime(chat.lastMessage?.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {chat.lastMessage?.fileUrl ? '📎 File' : chat.lastMessage?.content || 'Start chatting'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}