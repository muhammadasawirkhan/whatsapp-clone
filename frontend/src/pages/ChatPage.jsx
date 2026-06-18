import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="flex h-screen bg-whatsapp-panel overflow-hidden">
      <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
      {activeChat ? (
        <ChatWindow chat={activeChat} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
          <div className="text-8xl mb-6">💬</div>
          <h2 className="text-2xl font-light text-gray-500">WhatsApp Clone</h2>
          <p className="text-gray-400 text-sm mt-2">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
}