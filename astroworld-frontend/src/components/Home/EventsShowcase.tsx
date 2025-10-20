import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const mockEvents = [
  { name: "Lyrid Meteor Shower", date: "April 22, 2025", type: "Meteor Shower" },
  { name: "Total Lunar Eclipse", date: "September 7, 2025", type: "Eclipse" },
  { name: "Mars Opposition", date: "December 10, 2025", type: "Planetary Event" },
];

const EventsShowcase: React.FC = () => (
  <section className="py-20 px-6 text-center">
    <h2 className="text-4xl font-bold mb-6">Upcoming Events</h2>
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center gap-6">
      {mockEvents.map((event, i) => (
        <motion.div
          key={event.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-space-violet/40 transition"
        >
          <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{event.date}</p>
          <span className="inline-block px-3 py-1 text-xs bg-space-violet/30 rounded-full text-space-violet uppercase">
            {event.type}
          </span>
        </motion.div>
      ))}
    </div>
    <Link
      to="/events"
      className="mt-10 inline-block px-6 py-2 bg-space-violet rounded-xl font-semibold hover:scale-105 transition-all"
    >
      View All Events
    </Link>
  </section>
);

export default EventsShowcase;
