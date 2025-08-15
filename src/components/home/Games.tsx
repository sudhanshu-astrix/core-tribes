import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail?: string;
}

const games: Game[] = [
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    url: 'https://flappy-d.netlify.app/',
    description: 'Navigate through pipes in this classic arcade game',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    url: 'https://sudoku-xdc.netlify.app/',
    description: 'Solve the puzzle by filling the grid with numbers',
  },
];

export function Games() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayGame = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">Games</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Take a break and have some fun!
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <motion.div
            key={game.id}
            className="relative group bg-lightCard dark:bg-darkCard rounded-lg overflow-hidden border border-lightCard/30 dark:border-darkCard/30 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Game iframe container */}
            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
              <iframe
                src={game.url}
                title={game.title}
                className="w-full h-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
                <motion.button
                  onClick={() => handlePlayGame(game)}
                  className="bg-accentBlue hover:bg-accentBlue/90 text-white rounded-full p-4 shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="h-6 w-6 ml-1" />
                </motion.button>
              </div>
            </div>

            {/* Game info */}
            <div className="p-4">
              <h3 className="font-semibold text-black dark:text-white mb-1">
                {game.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {game.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full-screen game modal */}
      <AnimatePresence>
        {isModalOpen && selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-6xl h-[80vh] bg-lightCard dark:bg-darkCard rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-lightCard/30 dark:border-darkCard/30">
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {selectedGame.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-lightBg dark:hover:bg-darkBg rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Game iframe */}
              <div className="w-full h-full p-4">
                <iframe
                  src={selectedGame.url}
                  title={selectedGame.title}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 