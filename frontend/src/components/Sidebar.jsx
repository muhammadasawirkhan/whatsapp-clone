import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ContactList from './ContactList';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activeChat, setActiveChat }) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/users/chats');
      setChats(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (newMsg) => {
      const targetChatId = newMsg.chat?._id || newMsg.chat;
      if (!targetChatId) return;

      setChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex(c => c._id === targetChatId);
        
        if (existingChatIndex !== -1) {
          const updatedChats = [...prevChats];
          const currentSenderId = newMsg.sender?._id || newMsg.sender;
          
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            lastMessage: newMsg,
           
            unreadCount: activeChat?._id === targetChatId 
              ? 0 
              : (updatedChats[existingChatIndex].unreadCount || 0) + (currentSenderId !== user?._id ? 1 : 0)
          };
          
          
          const [movedChat] = updatedChats.splice(existingChatIndex, 1);
          return [movedChat, ...updatedChats];
        } else {
          
          fetchChats();
          return prevChats;
        }
      });
    };

    socket.on('message:receive', (msg) => handleIncomingMessage(msg));
    socket.on('sidebar:update', (msg) => handleIncomingMessage(msg));
    socket.on('message:read:update', () => fetchChats());

    return () => {
      socket.off('message:receive');
      socket.off('sidebar:update');
      socket.off('message:read:update');
    };
  }, [socket, activeChat, user?._id]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (search.trim()) {
        setSearching(true);
        try {
          const { data } = await api.get(`/users/search?search=${search}`);
          setSearchResults(data);
        } catch (err) { console.error(err); }
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const openChat = async (userId) => {
    try {
      const { data } = await api.post('/users/chat', { userId });
      setActiveChat(data);
      setSearch('');
      setSearchResults([]);
      fetchChats();
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    navigate('/auth');
  };

  return (
    <div className="w-[360px] flex flex-col bg-white border-r border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-whatsapp-panel border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-gray-800">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-whatsapp-panel rounded-full text-sm focus:outline-none"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {search ? (
          <div>
            <p className="text-xs text-gray-400 uppercase px-4 py-2">Search Results</p>
            {searching && <p className="text-center text-gray-400 text-sm py-4">Searching...</p>}
            {searchResults.map((u) => (
              <div key={u._id} onClick={() => openChat(u._id)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-whatsapp-darkgreen flex items-center justify-center text-white font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
            ))}
            {!searching && searchResults.length === 0 && search && (
              <p className="text-center text-gray-400 text-sm py-6">No users found</p>
            )}
          </div>
        ) : (
          <ContactList chats={chats} activeChat={activeChat} setActiveChat={setActiveChat} currentUser={user} />
        )}
      </div>
    </div>
  );
}