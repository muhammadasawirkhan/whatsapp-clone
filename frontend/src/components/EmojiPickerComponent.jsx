import React, { useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function EmojiPickerComponent({ onEmojiClick, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-16 left-2 z-50 shadow-2xl rounded-xl overflow-hidden">
      <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)} height={380} width={320} />
    </div>
  );
}