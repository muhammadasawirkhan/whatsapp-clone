import React from 'react';

const TickIcon = ({ status }) => {
    if (status === 'sent') return <span className="text-gray-400 text-xs">✓</span>;
    if (status === 'delivered') return <span className="text-gray-400 text-xs">✓✓</span>;
    if (status === 'read') return <span className="text-blue-500 text-xs">✓✓</span>;
    return null;
};

export default function MessageBubble({ message, isOwn }) {
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isImage = message.fileType?.startsWith('image/');
    const isFile = message.fileUrl && !isImage;

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
            <div className={`max-w-[65%] rounded-xl px-3 py-2 shadow-sm relative ${isOwn ? 'bg-whatsapp-light rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                {isImage && (
                    <img
                        src={`${import.meta.env.VITE_API_URL}${message.fileUrl}`}
                        alt="attachment"
                        className="max-w-full rounded-lg mb-1 cursor-pointer"
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}${message.fileUrl}`, '_blank')}
                    />
                )}
                {isFile && (
                    <a
                        href={`${import.meta.env.VITE_API_URL}${message.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-1 hover:bg-gray-200 transition-colors"
                    >
                        <span className="text-2xl">📎</span>
                        <span className="text-sm text-blue-600 truncate max-w-[150px]">
                            {message.fileUrl.split('/').pop()}
                        </span>
                    </a>
                )}
                {message.content && <p className="text-sm text-gray-800 leading-relaxed">{message.content}</p>}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-end'}`}>
                    <span className="text-xs text-gray-400">{time}</span>
                    {isOwn && <TickIcon status={message.status} />}
                </div>
            </div>
        </div>
    );
}