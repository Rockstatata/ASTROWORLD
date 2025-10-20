// src/components/Home/DonkiPanel.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useDonki } from '../../hooks/nasa/useDonki';
import { AlertTriangle, Zap, Sun, Activity } from 'lucide-react';

const DonkiPanel: React.FC = () => {
  const { data, loading } = useDonki(7);

  const getIcon = (type?: string) => {
    if (!type) return <Activity className="h-5 w-5" />;
    if (type.includes('CME')) return <Zap className="h-5 w-5" />;
    if (type.includes('FLR')) return <Sun className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Space Weather Alerts
          </h2>
          <p className="text-gray-400 text-lg">Real-time notifications from NASA's DONKI system</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
              <p className="text-gray-500">Loading space weather data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sun className="h-16 w-16 mx-auto mb-4 text-yellow-500/50" />
            <p>No recent space weather alerts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 6).map((event, i) => (
              <motion.div
                key={event.messageID || event.activityID || event.messageIssueTime || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-lg backdrop-blur-sm hover:border-orange-500/50 hover:shadow-orange-500/20 transition-all duration-300"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-300" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-orange-400">
                      {getIcon(event.messageType)}
                      <span className="text-sm font-bold uppercase tracking-wide">
                        {event.messageType || 'Space Weather'}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  {event.messageIssueTime && (
                    <div className="mb-3 text-xs text-gray-400 font-mono">
                      {new Date(event.messageIssueTime).toLocaleString()}
                    </div>
                  )}

                  {/* Message Body */}
                  <p className="text-sm text-gray-200 leading-relaxed line-clamp-5">
                    {event.messageBody || 'No details available'}
                  </p>

                  {/* View More Indicator */}
                  {event.messageURL && (
                    <a
                      href={event.messageURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View full report →
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default DonkiPanel;
