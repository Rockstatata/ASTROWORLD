import React, { useState } from 'react';
import { Plus, TrashIcon, PencilIcon } from 'lucide-react'; // Add PencilIcon
import type { Session } from '../../types';

interface SidebarProps {
  sessions: Session[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => Promise<boolean>; // Change to Promise<boolean>
  onClearAll: () => Promise<boolean>; // Change to Promise<boolean>
  onRename: (id: string, newTitle: string) => Promise<void>; // Change to Promise<void>
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeId, 
  onSelect, 
  onCreate, 
  onDelete, 
  onClearAll,
  onRename
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleEditStart = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title || 'New chat');
  };

  const handleEditSave = async () => { // Make async
    if (editingId && editTitle.trim()) {
      try {
        await onRename(editingId, editTitle.trim()); // Await the promise
      } catch (error) {
        alert('Failed to rename conversation. Please try again.');
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleClearAll = async () => {
    if (showClearConfirm) {
      try {
        const success = await onClearAll(); // Await the promise
        if (success) {
          setShowClearConfirm(false);
        }
      } catch (error) {
        alert('Failed to clear all conversations. Please try again.');
      }
    } else {
      setShowClearConfirm(true);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await onDelete(sessionId); // Await the promise
      if (!success) {
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      alert('Failed to delete conversation. Please try again.');
    }
  };

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-800/60 bg-zinc-950/40 p-3 md:block">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Sessions</h2>
        <button
          onClick={onCreate}
          className="rounded-lg border border-zinc-700/60 p-1 hover:bg-zinc-800"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {sessions.length === 0 && <div className="text-sm text-zinc-500">No sessions yet.</div>}
          {sessions.map((s) => (
            <div key={s.id} className="group relative">
              <button
                onClick={() => onSelect(s.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  s.id === activeId
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                    : 'border-zinc-800/60 hover:bg-zinc-900/50'
                }`}
              >
                {editingId === s.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleEditSave}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="line-clamp-1 font-medium">{s.title || 'New chat'}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {new Date(s.updatedAt).toLocaleDateString()} • {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </>
                )}
              </button>
              
              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEditStart(s, e)}
                  className="p-1 rounded hover:bg-zinc-700"
                  title="Rename conversation"
                >
                  <PencilIcon className="h-3 w-3 text-zinc-400 hover:text-zinc-200" />
                </button>
                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="p-1 rounded hover:bg-red-700"
                  title="Delete conversation"
                >
                  <TrashIcon className="h-3 w-3 text-red-400 hover:text-red-200" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Clear All button */}
      <div className="mt-4 border-t border-zinc-800/60 pt-4">
        {showClearConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              Delete all conversations?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleClearAll}
                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-3 py-2 bg-zinc-500 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
            title="Clear all conversations"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear All Chats
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;