import axios from 'axios';

export const uid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
export const nowISO = (): string => new Date().toISOString();
export const cls = (
  ...classes: (string | false | null | undefined)[]
): string => classes.filter(Boolean).join(" ");
export const fmtTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const apiPostChat = async (prompt: string, conversationId?: string) => {
  const response = await axios.post('/murphai/chat/', { 
    prompt,
    conversation_id: conversationId 
  });
  
  return response.data?.response || response.data || 'Error: Unexpected response format';
};

export const apiStreamChat = async (prompt: string, onToken: (token: string) => void) => {
  const response = await fetch(`http://localhost:8000/murphai/stream/?prompt=${encodeURIComponent(prompt)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            onToken(data.chunk);
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e);
        }
      }
    }
  }
};

export const createConversation = async (conversationId: string, title: string = 'New Chat') => {
  const response = await axios.post('/murphai/conversations/', { 
    conversation_id: conversationId,
    title 
  });
  return response.data;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await axios.delete(`/murphai/conversations/${conversationId}/`);
  return response.data;
};

export const clearConversation = async (conversationId: string) => {
  const response = await axios.delete(`/murphai/conversations/${conversationId}/clear/`);
  return response.data;
};

export const clearAllConversations = async () => {
  const response = await axios.delete('/murphai/conversations/clear-all/');
  return response.data;
};

export const renameConversation = async (conversationId: string, newTitle: string) => {
  const response = await axios.patch(`/murphai/conversations/${conversationId}/rename/`, { title: newTitle });
  return response.data;
};