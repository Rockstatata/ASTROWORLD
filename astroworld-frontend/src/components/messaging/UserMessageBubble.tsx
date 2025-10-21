import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { UserMessage } from '../../types/messaging';

interface UserMessageBubbleProps { 
  message: UserMessage; 
  currentUserId: number;
  onCopy?: () => void; 
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ message, currentUserId, onCopy }) => {
  const isCurrentUser = message.sender.id === currentUserId;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    onCopy?.();
  };

  return (
    <div className={["group relative flex w-full gap-3", isCurrentUser ? 'justify-end' : 'justify-start'].join(' ')}>
      {!isCurrentUser && (
        <div className="mt-1 h-8 w-8 shrink-0 select-none rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {message.sender.profile_picture ? (
            <img src={message.sender.profile_picture} alt={message.sender.username} className="w-full h-full object-cover" />
          ) : (
            message.sender.full_name?.charAt(0).toUpperCase() || message.sender.username.charAt(0).toUpperCase()
          )}
        </div>
      )}

      <div className={[
        'max-w-[85%] rounded-2xl border p-3 text-sm md:max-w-[70%]',
        isCurrentUser 
          ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-50' 
          : 'border-zinc-800/60 bg-zinc-900/60 text-zinc-100',
      ].join(' ')}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button 
            onClick={handleCopy} 
            className="invisible inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 px-2 py-0.5 group-hover:visible"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} 
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {isCurrentUser && (
        <div className="mt-1 h-8 w-8 shrink-0 select-none rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {message.sender.profile_picture ? (
            <img src={message.sender.profile_picture} alt={message.sender.username} className="w-full h-full object-cover" />
          ) : (
            message.sender.full_name?.charAt(0).toUpperCase() || message.sender.username.charAt(0).toUpperCase()
          )}
        </div>
      )}
    </div>
  );
};

export default UserMessageBubble;