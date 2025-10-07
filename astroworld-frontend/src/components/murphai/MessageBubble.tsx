import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type{ Message } from '../../types';
import MarkdownLite from './MarkdownLite';


interface MessageBubbleProps { m: Message; onCopy?: () => void; }


const MessageBubble: React.FC<MessageBubbleProps> = ({ m, onCopy }) => {
const isUser = m.role === 'user';
const [copied, setCopied] = useState(false);


const handleCopy = async () => {
await navigator.clipboard.writeText(m.content);
setCopied(true);
setTimeout(() => setCopied(false), 1200);
onCopy?.();
};


return (
<div className={["group relative flex w-full gap-3", isUser ? 'justify-end' : 'justify-start'].join(' ')}>
{!isUser && <div className="mt-1 h-8 w-8 shrink-0 select-none rounded-full bg-indigo-600/20 text-center text-lg leading-8">🪐</div>}


<div className={[
'max-w-[85%] rounded-2xl border p-3 text-sm md:max-w-[70%]',
isUser ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-50' : 'border-zinc-800/60 bg-zinc-900/60 text-zinc-100',
].join(' ')}>
{isUser ? (
<p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
) : (
<MarkdownLite text={m.content} />
)}
<div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
<span>{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
<button onClick={handleCopy} className="invisible inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 px-2 py-0.5 group-hover:visible">
{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
</button>
</div>
</div>


{isUser && <div className="mt-1 h-8 w-8 shrink-0 select-none rounded-full bg-cyan-500/20 text-center text-lg leading-8">🧑‍🚀</div>}
</div>
);
};


export default MessageBubble;