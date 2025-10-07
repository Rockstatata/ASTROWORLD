import React, { useRef } from 'react';


interface MarkdownLiteProps { text: string; }


/**
* Lightweight renderer: **bold**, *italic*, `code`, and ``` fenced blocks.
* For full Markdown, replace with `react-markdown` and rehype plugins.
*/
const MarkdownLite: React.FC<MarkdownLiteProps> = ({ text }) => {

  if (typeof text !== 'string' || !text.trim()) {
    return <div className="text-gray-400 italic">...</div>;  // Fallback for invalid text
  }

    const inTriple = useRef(false);
    const lines = text.split('\n');  // Split by lines, not characters
    const out: React.ReactNode[] = [];


    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('```') && !inTriple.current) {
            inTriple.current = true;
            out.push(
                <pre key={`pre-open-${i}`} className="my-2 w-full overflow-x-auto rounded-xl bg-zinc-900/80 p-3 text-zinc-100 shadow-inner dark:bg-zinc-800">
                    <code />
                </pre>
            );
            return;
        }
        if (trimmed.startsWith('```') && inTriple.current) {
            inTriple.current = false;
            return;
        }


        if (inTriple.current) {
            out.push(
                <pre key={`pre-${i}`} className="-mt-2 w-full overflow-x-auto rounded-xl bg-zinc-900/80 p-3 text-zinc-100 shadow-inner dark:bg-zinc-800">
                    <code>{line}</code>
                </pre>
            );
            return;
        }


        const html = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-zinc-800/70 dark:bg-zinc-700'>$1</code>");


        out.push(
            <p key={`p-${i}`} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
        );
    });


    return <div className="prose prose-invert max-w-none prose-p:my-2 prose-code:text-inherit">{out}</div>;
};


export default MarkdownLite;