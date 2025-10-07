import { useState, useCallback } from "react";
import {
  createConversation,
  deleteConversation,
  clearConversation,
  clearAllConversations,
  renameConversation,
  uid,
  nowISO,
} from "../utils/murphaiUtils";
import type { Session } from "../types";

const STORAGE_KEY = "murph_sessions_v1";

export function useSessions(): [
  Session[],
  string,
  (id: string) => void,
  (fn: (s: Session) => Session) => void,
  () => void,
  () => void,
  (id: string) => Promise<boolean>,
  (id: string) => Promise<boolean>,
  () => Promise<boolean>,
  (sessionId: string, newTitle: string) => Promise<void>
] {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          {
            id: uid(),
            title: "New chat",
            messages: [],
            createdAt: nowISO(),
            updatedAt: nowISO(),
          },
        ];
  });

  const [activeId, setActiveId] = useState(() => {
    const existing = sessions[0]?.id;
    if (existing) return existing;

    // Create initial session if none exist
    const newSession: Session = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    // Save to localStorage and backend immediately
    setTimeout(() => {
      createConversation(newSession.id, newSession.title).catch(console.error);
    }, 0);

    return newSession.id;
  });

  const updateActive = (fn: (s: Session) => Session) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === activeId ? fn({ ...s }) : s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleNew = useCallback(async () => {
    const s: Session = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    try {
      // Create in backend immediately
      await createConversation(s.id, s.title);

      // Update frontend state
      setSessions((prev) => {
        const all = [s, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return all;
      });
      setActiveId(s.id);
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Still create locally even if backend fails
      setSessions((prev) => {
        const all = [s, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return all;
      });
      setActiveId(s.id);
    }
  }, []);

  const handleClear = () => updateActive((s) => ({ ...s, messages: [] }));

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteConversation(sessionId);

        setSessions((prev) => {
          const updated = prev.filter((s) => s.id !== sessionId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        return true;
      } catch (error) {
        console.error("Error deleting session:", error);
        return false;
      }
    },
    []
  );

  const clearSession = useCallback(
    async (sessionId: string) => {
      try {
        await clearConversation(sessionId);

        setSessions((prev) => {
          const updated = prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [], updatedAt: new Date().toISOString() }
              : s
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        return true;
      } catch (error) {
        console.error("Error clearing session:", error);
        return false;
      }
    },
    []
  );

  const clearAllSessions = useCallback(
    async () => {
      try {
        await clearAllConversations();

        // Create a new default session
        const newSession: Session = {
          id: uid(),
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create in backend
        await createConversation(newSession.id, newSession.title);

        setSessions([newSession]);
        setActiveId(newSession.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession]));

        return true;
      } catch (error) {
        console.error("Error clearing all sessions:", error);
        return false;
      }
    },
    []
  );

  const renameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      try {
        await renameConversation(sessionId, newTitle);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle } : s
          )
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.error("Error renaming session:", error);
        throw error; // Re-throw to handle in UI
      }
    },
    [sessions]
  );

  // Ensure we have at least one session
  if (sessions.length === 0) {
    const newSession: Session = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    setSessions([newSession]);
    setActiveId(newSession.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession]));

    // Create in backend
    createConversation(newSession.id, newSession.title).catch(console.error);
  }

  return [
    sessions,
    activeId,
    setActiveId,
    updateActive,
    handleNew,
    handleClear,
    deleteSession,
    clearSession,
    clearAllSessions,
    renameSession,
  ];
}
