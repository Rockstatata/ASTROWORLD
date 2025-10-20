import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MurphPreview: React.FC = () => {
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    const sessions = localStorage.getItem("murph_sessions_v1");
    if (sessions) {
      const parsed = JSON.parse(sessions);
      const latest = parsed[0]?.messages?.slice(-1)[0];
      setLastMessage(latest || null);
    }
  }, []);

  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">Murph AI Speaks</h2>
      <div className="relative max-w-2xl mx-auto bg-gradient-to-r from-space-blue/10 to-space-violet/10 p-6 rounded-3xl border border-space-violet/30 backdrop-blur-xl shadow-lg">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-lg text-gray-200 italic"
        >
          {lastMessage
            ? `"${lastMessage.content}"`
            : "Ask Murph anything about the cosmos..."}
        </motion.p>
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
          <Link
            to="/murph-ai"
            className="px-6 py-2 bg-space-violet rounded-xl text-white font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Continue Chat
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MurphPreview;
