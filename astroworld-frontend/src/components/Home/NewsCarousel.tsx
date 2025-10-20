import React from "react";
import { useNews } from "../../hooks/useNewsData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NewsCarousel: React.FC = () => {
  const { data, isLoading } = useNews({  });

  return (
    <section className="py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-10">Latest Space News</h2>
      {isLoading ? (
        <div className="text-gray-500">Loading news...</div>
      ) : (
        <div className="flex overflow-x-auto space-x-6 px-4 snap-x">
          {data?.data?.results?.slice(0, 5).map((news: any, i: number) => (
            <motion.div
              key={news.id}
              className="min-w-[320px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg snap-center"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={news.image_url || "/static/imgs/news-default.jpg"}
                alt={news.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 text-left">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {news.summary}
                </p>
                <Link
                  to={`/news/${news.id}`}
                  className="text-space-violet text-sm mt-3 inline-block hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsCarousel;
