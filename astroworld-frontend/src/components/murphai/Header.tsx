import React, { useState } from 'react';
import { Plus, Trash2, Sparkles  } from 'lucide-react';


interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onNew: () => void;
    onClearActive: () => Promise<boolean>; // Only keep this one
}


const Header: React.FC<HeaderProps> = ({ theme, setTheme, onNew, onClearActive }) => {
    const [showClearConfirm, setShowClearConfirm] = useState(false);


    const handleClear = async () => {
        if (showClearConfirm) {
            const success = await onClearActive(); // This returns Promise<boolean>, so await it
            if (success) {
                setShowClearConfirm(false);
            }
        } else {
            setShowClearConfirm(true);
        }
    };


    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950/70 p-3 backdrop-blur dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h1 className="font-semibold tracking-tight">Murph AI</h1>
                <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">Astronomy</span>
            </div>
            <div className="flex items-center gap-2">
                {showClearConfirm ? (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Clear this chat?</span>
                        <button
                            onClick={handleClear}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setShowClearConfirm(false)}
                            className="px-3 py-1 bg-zinc-500 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <button onClick={onNew} className="inline-flex items-center gap-1 rounded-xl border border-zinc-700/60 px-3 py-1.5 text-sm hover:bg-zinc-800" title="New Chat">
                            <Plus className="h-4 w-4" /> New chat
                        </button>
                        <button onClick={handleClear} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title="Clear Chat">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </header>
    );
};


export default Header;