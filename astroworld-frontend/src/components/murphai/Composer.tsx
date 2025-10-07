import React, { useRef } from 'react';


interface ComposerProps {
    value: string;
    setValue: (v: string) => void;
    onSend: () => void;
    disabled?: boolean;
}


const Composer: React.FC<ComposerProps> = ({ value, setValue, onSend, disabled }) => {
    const ref = useRef<HTMLTextAreaElement>(null);


    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };


    return (
        <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-2 shadow-xl">
            <textarea
                ref={ref}
                rows={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about stars, galaxies, missions, or space weather…"
                className="max-h-40 w-full resize-none bg-transparent px-3 py-2 outline-none placeholder:text-zinc-500"
            />
            <div className="flex items-center justify-between px-2 pb-1">
                <div className="text-[11px] text-zinc-500">Shift+Enter for newline</div>
                <button
                    onClick={onSend}
                    disabled={disabled}
                    className={[
                        'inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm',
                        disabled ? 'cursor-not-allowed border-zinc-800/60 text-zinc-600' : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25',
                    ].join(' ')}
                >
                    Send
                </button>
            </div>
        </div>
    );
};


export default Composer;