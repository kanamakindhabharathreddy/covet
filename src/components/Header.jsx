import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Header() {
  const location = useLocation();

  const links = [
    { name: 'Convert', path: '/convert' },
    { name: 'OCR', path: '/ocr' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold"
            >
              C
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">
              Covet
            </span>
          </Link>
          <nav className="flex gap-6 h-full items-center">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors h-full flex items-center ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-[18px] left-0 right-0 h-0.5 bg-accent rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
