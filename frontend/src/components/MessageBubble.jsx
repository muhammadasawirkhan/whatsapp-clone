import React from 'react';

const TickIcon = ({ status }) => {
  if (status === 'sent') {
    return <span className="text-gray-400 text-xs ml-1">✓</span>;
  }

  if (status === 'delivered') {
    return <span className="text-gray-400 text-xs ml-1">✓✓</span>;
  }

  if (status === 'read') {
    return <span className="text-blue-500 text-xs ml-1">✓✓</span>;
  }

  return null;
};

export default function MessageBubble({ message, isOwn }) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const isImage = message.fileType?.startsWith('image/');
  const isAudio = message.fileType?.startsWith('audio/');
  const isFile = message.fileUrl && !isImage && !isAudio;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5`}>
      <div
        className={`
          max-w-[80%] sm:max-w-[65%]
          rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm
          ${
            isOwn
              ? 'bg-whatsapp-light rounded-tr-none'
              : 'bg-white rounded-tl-none'
          }
        `}
      >
        {/* Image Message */}
        {isImage && (
          <img
            src={message.fileUrl}
            alt="attachment"
            className="max-w-full rounded-lg mb-1 cursor-pointer max-h-60 object-cover"
            onClick={() => window.open(message.fileUrl, '_blank')}
          />
        )}

        {/* Audio Message */}
        {isAudio && (
          <div className="flex items-center gap-2 mb-1 min-w-[200px]">
            <span className="text-xl flex-shrink-0">🎤</span>

            <audio
              controls
              className="max-w-[220px] h-9"
              style={{ filter: 'invert(0)' }}
            >
              <source src={message.fileUrl} type={message.fileType} />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* File Message */}
        {isFile && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-1 hover:bg-gray-200 transition-colors"
          >
            <span className="text-xl sm:text-2xl">📎</span>

            <span className="text-xs sm:text-sm text-blue-600 truncate max-w-[120px] sm:max-w-[150px]">
              {message.fileUrl.split('/').pop()}
            </span>
          </a>
        )}

        {/* Text Message */}
        {message.content && (
          <p className="text-sm text-gray-800 leading-relaxed break-words">
            {message.content}
          </p>
        )}

        {/* Time & Status */}
        <div className="flex items-center justify-end gap-0.5 mt-0.5">
          <span className="text-[10px] sm:text-xs text-gray-400">
            {time}
          </span>

          {isOwn && <TickIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}


// import React from 'react';

// const TickIcon = ({ status }) => {
//     if (status === 'sent') return <span className="text-gray-400 text-xs">✓</span>;
//     if (status === 'delivered') return <span className="text-gray-400 text-xs">✓✓</span>;
//     if (status === 'read') return <span className="text-blue-500 text-xs">✓✓</span>;
//     return null;
// };

// export default function MessageBubble({ message, isOwn }) {
//     const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     const isImage = message.fileType?.startsWith('image/');
//     const isAudio = message.fileType?.startsWith('audio/');
//     const isFile = message.fileUrl && !isImage && !isAudio;
//     return (
//         <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
//             <div className={`max-w-[65%] rounded-xl px-3 py-2 shadow-sm relative ${isOwn ? 'bg-whatsapp-light rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
//                 {isImage && (
//                     <img
//                         // src={`${import.meta.env.VITE_API_URL}${message.fileUrl}`}
//                         src={message.fileUrl}
//                         alt="attachment"
//                         className="max-w-full rounded-lg mb-1 cursor-pointer"
//                         onClick={() => window.open(`${import.meta.env.VITE_API_URL}${message.fileUrl}`, '_blank')}
//                     />
//                 )}
//                 {isFile && (
//                     <a
//                         // href={`${import.meta.env.VITE_API_URL}${message.fileUrl}`}
//                         src={message.fileUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-1 hover:bg-gray-200 transition-colors"
//                     >
//                         <span className="text-2xl">📎</span>
//                         <span className="text-sm text-blue-600 truncate max-w-[150px]">
//                             {message.fileUrl.split('/').pop()}
//                         </span>
//                     </a>
//                 )}
//                 {message.content && <p className="text-sm text-gray-800 leading-relaxed">{message.content}</p>}
//                 <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-end'}`}>
//                     <span className="text-xs text-gray-400">{time}</span>
//                     {isOwn && <TickIcon status={message.status} />}
//                 </div>
//             </div>
//         </div>
//     );
// }