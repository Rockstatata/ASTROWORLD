import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Header from '../../components/murphai/Header';
import Sidebar from '../../components/murphai/Sidebar';
import Composer from '../../components/murphai/Composer';
import MessageBubble from '../../components/murphai/MessageBubble';
import TypingDots from '../../components/murphai/TypingDots';
import { useSessions } from '../../hooks/useMurphAi';
import { apiPostChat } from '../../utils/murphaiUtils';
import { uid, nowISO } from '../../utils/murphaiUtils';
import type { Message } from '../../types';
import Layout from '../../components/Layout';


const MurphAIChatApp: React.FC = () => {
  const [sessions, activeId, setActiveId, updateActive, handleNew, , deleteSession, clearSession, clearAllSessions, renameSession] = useSessions();
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => sessions.find((s) => s.id === activeId), [sessions, activeId]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.messages?.length, loading]);


  const handleSend = async () => {
  const prompt = input.trim();
  if (!prompt || loading) return;
  setInput('');

  const userMsgId = uid();
  const aiMsgId = uid();
  const userMsg: Message = { id: userMsgId, role: 'user', content: prompt, ts: nowISO() };
  const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', ts: nowISO() };

  updateActive((s) => {
    const existingUserMsg = s.messages.find(m => m.id === userMsgId);
    const existingAiMsg = s.messages.find(m => m.id === aiMsgId);
    if (!existingUserMsg) s.messages.push(userMsg);
    if (!existingAiMsg) s.messages.push(aiMsg);
    s.updatedAt = nowISO();
    return s;
  });

  setLoading(true);

  try {
    // Send conversation ID to backend
    const answer = await apiPostChat(prompt, activeId);  // Pass conversation ID
    updateActive((s) => {
      const last = s.messages[s.messages.length - 1];
      if (last && last.role === 'assistant') {
        last.content = answer;
      }
      return s;
    });
  } catch (error) {
    console.error('Error sending message:', error);
    updateActive((s) => {
      const last = s.messages[s.messages.length - 1];
      if (last && last.role === 'assistant') {
        last.content = 'Sorry, I encountered an error. Please try again.';
      }
      return s;
    });
  } finally {
    setLoading(false);
  }
};

const handleDeleteSession = useCallback(async (sessionId: string): Promise<boolean> => { // Add return type
  if (sessions.length <= 1) {
    alert('Cannot delete the last session.');
    return false;
  }

  const success = await deleteSession(sessionId);
  
  if (success && sessionId === activeId) {
    const nextActive = sessions.find(s => s.id !== sessionId)?.id;
    if (nextActive) {
      setActiveId(nextActive);
    } else {
      handleNew();
    }
  }
  
  return success;
}, [sessions, activeId, setActiveId, handleNew, deleteSession]);

const handleClearActiveSession = useCallback(async (): Promise<boolean> => { // Add return type
  return await clearSession(activeId);
}, [activeId, clearSession]);

const handleRenameSession = useCallback(async (sessionId: string, newTitle: string): Promise<void> => { // Add return type
  await renameSession(sessionId, newTitle);
}, [renameSession]);

  return (
    <Layout>
      <div className="flex h-screen w-full overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Sidebar 
          sessions={sessions} 
          activeId={activeId} 
          onSelect={setActiveId} 
          onCreate={handleNew}
          onDelete={handleDeleteSession}
          onClearAll={clearAllSessions}
          onRename={handleRenameSession}
        />
        <div className="flex grow flex-col">
          <Header 
            theme={theme} 
            setTheme={setTheme} 
            onNew={handleNew} 
            onClearActive={handleClearActiveSession}
          />
          <main ref={scrollRef} className="flex grow flex-col gap-4 overflow-y-auto p-4 md:p-6">
            {active?.messages?.length ? (
              <div className="mx-auto w-full max-w-3xl space-y-4">
                {active.messages.map((m) => <MessageBubble key={m.id} m={m} />)}
                {loading && <TypingDots />}
              </div>
            ) : (
              <div className="mx-auto mt-12 max-w-2xl text-center text-zinc-400">Ask the cosmos ✨</div>
            )}
          </main>
          <div className="border-t border-zinc-800/60 bg-zinc-950/60 p-4">
            <Composer value={input} setValue={setInput} onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MurphAIChatApp;
