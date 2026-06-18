import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import EmojiPickerComponent from './EmojiPickerComponent';

export default function MessageInput({ chat, onMessageSent, otherUserId }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const { socket } = useSocket();
  const typingRef = useRef(null);

  const handleTyping = (val) => {
    setText(val);
    if (socket) {
      socket.emit('typing:start', { chatId: chat._id, userName: 'User' });
      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => socket.emit('typing:stop', { chatId: chat._id }), 1500);
    }
  };

  const sendMessage = async (content = text, file = null) => {
    if (!content.trim() && !file) return;
    const formData = new FormData();
    formData.append('chatId', chat._id);
    if (content.trim()) formData.append('content', content.trim());
    if (file) formData.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/messages', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      onMessageSent(data);
      setText('');
      
      if (socket) {
        // Normalize structural layouts so frontend mappers can parse them safely
        const normalizedMessage = {
          ...data,
          chat: data.chat || chat._id,
          receiverId: otherUserId,
          sender: typeof data.sender === 'object' ? data.sender : { _id: data.sender }
        };

        socket.emit('message:send', { chatId: chat._id, message: normalizedMessage });
        socket.emit('typing:stop', { chatId: chat._id });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) sendMessage('', file);
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative px-3 py-3 bg-whatsapp-panel border-t border-gray-200">
      {showEmoji && (
        <EmojiPickerComponent
          onEmojiClick={(emoji) => setText((prev) => prev + emoji)}
          onClose={() => setShowEmoji(false)}
        />
      )}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
        <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-whatsapp-green text-xl transition-colors" title="Emoji">
          😊
        </button>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFile}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
        />
        <button onClick={() => fileRef.current.click()} className="text-gray-500 hover:text-whatsapp-green transition-colors" title="Attach file">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="flex-1 bg-transparent text-sm text-gray-800 resize-none focus:outline-none max-h-24 overflow-y-auto"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={(!text.trim() && !uploading) || uploading}
          className="w-9 h-9 bg-whatsapp-green hover:bg-whatsapp-darkgreen disabled:opacity-40 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}