import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogIn, Menu, X, Sparkles } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onOpenMemeCreator?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenMemeCreator }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Trending', path: '/trending' },
    // { name: 'Popular', path: '/popular' },
    { name: 'Meme Storm', path: '/meme-storm' },
    { name: 'Meme Evolution', path: '/meme-evolution' },
  ];
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to explore page with search query
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search input
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="neon-text-cyan">NEON</span>
            <span className="neon-text-pink">STORE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-only">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form desktop-only">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* User Section */}
          <div className="user-section">
            {/* Meme Creator Button */}
            <button 
              className="creator-btn"
              onClick={onOpenMemeCreator}
            >
              <Sparkles size={20} />
              <span className="desktop-only">Create</span>
            </button>


            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle mobile-only"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mobile-search">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button 
              className="mobile-creator-btn"
              onClick={() => {
                onOpenMemeCreator?.();
                setIsMobileMenuOpen(false);
              }}
            >
              <Sparkles size={20} />
              Create Meme
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
