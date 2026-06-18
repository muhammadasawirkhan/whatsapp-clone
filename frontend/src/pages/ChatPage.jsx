import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleBack = () => {
    setActiveChat(null);
  };

  return (
    <div className="flex h-screen bg-whatsapp-panel overflow-hidden">
      
      
      <div
        className={`
          ${activeChat ? 'hidden' : 'flex'} md:flex
          w-full md:w-[360px] flex-shrink-0
          flex-col
        `}
      >
        <Sidebar activeChat={activeChat} setActiveChat={handleSelectChat} />
      </div>

    
      <div
        className={`
          ${activeChat ? 'flex' : 'hidden'} md:flex
          flex-1 flex-col
        `}
      >
        {activeChat ? (
          
          <ChatWindow chat={activeChat} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
            <div className="text-8xl mb-6 select-none">💬</div>
            <h2 className="text-2xl font-light text-gray-500">WhatsApp Clone</h2>
            <p className="text-gray-400 text-sm mt-2">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}