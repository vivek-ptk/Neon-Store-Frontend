import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Sparkles, ArrowRight, Heart, Download, Share } from 'lucide-react';
import toast from 'react-hot-toast';
import './Home.css';

interface Meme {
  id: string;
  image_url: string;
  title: string;
  tags: string[];
  upvotes: number;
  downloads: number;
}

interface HomeProps {
  onOpenMemeCreator?: () => void;
}

const Home: React.FC<HomeProps> = ({ onOpenMemeCreator }) => {
  const [trendingMemes, setTrendingMemes] = useState<Meme[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch trending memes and popular tags
    fetchTrendingMemes();
    fetchPopularTags();
  }, []);

  const handleUpvote = async (memeId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upvote');
      }

      if (data.success) {
        // Update local state
        setTrendingMemes(trendingMemes.map(meme => 
          meme.id === memeId 
            ? { ...meme, upvotes: data.meme?.upvotes || meme.upvotes + 1 }
            : meme
        ));
        toast.success('Meme upvoted! 💖');
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      // Still update locally if API fails
      setTrendingMemes(trendingMemes.map(meme => 
        meme.id === memeId 
          ? { ...meme, upvotes: meme.upvotes + 1 }
          : meme
      ));
      toast.success('Upvoted! ❤️');
    }
  };

  const handleDownload = async (meme: Meme) => {
    try {
      // Track download with API first
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/track-downloads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memeId: meme.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track download');
      }

      // Download the image to local device
      try {
        // Fetch the image as a blob
        const imageResponse = await fetch(meme.image_url);
        const imageBlob = await imageResponse.blob();
        
        // Create a download link
        const downloadUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get file extension from URL or default to jpg
        const urlParts = meme.image_url.split('.');
        const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
        
        link.download = `${meme.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.${extension}`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(downloadUrl);
        
        toast.success('Meme downloaded! 📱');
      } catch (downloadError) {
        console.error('Error downloading image:', downloadError);
        toast.error('Failed to download image');
        return;
      }
      
      if (data.success) {
        // Update download count with API response or increment locally
        setTrendingMemes(trendingMemes.map(m => 
          m.id === meme.id 
            ? { ...m, downloads: data.meme?.downloads || m.downloads + 1 }
            : m
        ));
      } else {
        // Still update locally if API tracking fails but download succeeded
        setTrendingMemes(trendingMemes.map(m => 
          m.id === meme.id 
            ? { ...m, downloads: m.downloads + 1 }
            : m
        ));
      }
    } catch (error) {
      console.error('Error tracking download:', error);
      
      // Still allow download even if tracking fails
      try {
        // Fetch the image as a blob
        const imageResponse = await fetch(meme.image_url);
        const imageBlob = await imageResponse.blob();
        
        // Create a download link
        const downloadUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get file extension from URL or default to jpg
        const urlParts = meme.image_url.split('.');
        const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
        
        link.download = `${meme.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.${extension}`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(downloadUrl);
        
        toast.success('Downloaded! 📱');
        
        // Update local count since tracking failed
        setTrendingMemes(trendingMemes.map(m => 
          m.id === meme.id 
            ? { ...m, downloads: m.downloads + 1 }
            : m
        ));
      } catch (downloadError) {
        console.error('Error downloading meme:', downloadError);
        toast.error('Failed to download meme');
      }
    }
  };

  const handleShare = async (meme: Meme) => {
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: meme.title,
          text: `Check out this awesome meme: ${meme.title}`,
          url: window.location.href
        });
        toast.success('Shared successfully! 🚀');
      } else {
        // Fallback to clipboard copy
        const shareText = `Check out this awesome meme: ${meme.title} - ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard! 📋');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share meme');
    }
  };

  const fetchTrendingMemes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/trending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch trending memes');
      }

      if (data.success && data.trendingMemes) {
        // Transform API response to match Meme interface
        const memes: Meme[] = data.trendingMemes.map((meme: any) => ({
          id: meme.id,
          image_url: meme.image_url,
          title: meme.description || 'Untitled Meme', // Use description as title
          tags: meme.tags || [],
          upvotes: meme.upvotes || 0,
          downloads: meme.downloads || 0
        }));
        
        setTrendingMemes(memes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch trending memes:', error);
      
      // Fallback to mock memes if API fails
      const mockMemes: Meme[] = [
        {
          id: '1',
          image_url: 'https://via.placeholder.com/300x300/ff0080/ffffff?text=Neon+Meme+1',
          title: 'Epic Neon Meme',
          tags: ['funny', 'neon', 'trending'],
          upvotes: 1250,
          downloads: 890
        },
        {
          id: '2',
          image_url: 'https://via.placeholder.com/300x300/00ffff/000000?text=Cyber+Meme+2',
          title: 'Cyber Meme Storm',
          tags: ['cyber', 'future', 'ai'],
          upvotes: 980,
          downloads: 645
        },
        {
          id: '3',
          image_url: 'https://via.placeholder.com/300x300/8000ff/ffffff?text=Purple+Meme+3',
          title: 'Purple Rain Meme',
          tags: ['purple', 'rain', 'vibes'],
          upvotes: 756,
          downloads: 432
        }
      ];
      setTrendingMemes(mockMemes);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch popular tags');
      }

      if (data.success && data.popularTags) {
        // Extract tag names from the API response and sort by count
        const tags = data.popularTags
          .sort((a: any, b: any) => b.count - a.count) // Sort by popularity (count)
          .map((tagData: any) => tagData.tag);
        
        setPopularTags(tags);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
      
      // Fallback to mock tags if API fails
      const mockTags = ['funny', 'neon', 'cyber', 'ai', 'future', 'memes', 'trending', 'viral'];
      setPopularTags(mockTags);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title" >
              <span className="neon-text-cyan">NEON-DRENCHED</span>
              <br />
              <span className="neon-text-pink">MEME MARKETPLACE</span>
            </h1>
            <p className="hero-subtitle">
              Dive into the electric world of next-gen memes where creativity meets technology
            </p>
            <div className="hero-buttons">
              <Link to="/trending" style={{display:"flex", justifyContent:"center", alignItems:"center", gap:"10px"}} className="neon-btn neon-btn-cyan">
                <TrendingUp size={20} />
                Explore Trending
              </Link>              
              <button style={{display:"flex", justifyContent:"center", alignItems:"center", gap:"10px"}} className="neon-btn neon-btn-pink" onClick={onOpenMemeCreator}>
                <Sparkles size={20} />
                Create Meme
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tags Section */}
      <section className="popular-tags-section">
        <div className="container">
          <h2 className="section-title neon-text-purple">Popular Tags</h2>
          <div className="tags-grid">
            {popularTags.map((tag, index) => (
              <div key={index} className="tag-card">
                <span className="tag-name">#{tag}</span>
                <Zap className="tag-icon" size={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Memes Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title neon-text-cyan">Trending Memes</h2>
            <Link to="/trending" className="section-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="memes-grid">
            {trendingMemes.map((meme) => (
              <div key={meme.id} className="meme-card">
                <div className="meme-image-container" style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                  <img src={meme.image_url} alt={meme.title} style={{aspectRatio:"auto", width:"100%", maxHeight:"100%"}} />
                  <div className="meme-overlay">
                    <div className="meme-actions">
                      <button 
                        className="action-btn upvote-btn"
                        onClick={() => handleUpvote(meme.id)}
                      >
                        <Heart size={18} />
                        {meme.upvotes}
                      </button>
                      <button 
                        className="action-btn download-btn"
                        onClick={() => handleDownload(meme)}
                      >
                        <Download size={18} />
                        {meme.downloads}
                      </button>
                      <button 
                        className="action-btn share-btn"
                        onClick={() => handleShare(meme)}
                      >
                        <Share size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="meme-info">
                  <h3 className="meme-title">{meme.title}</h3>
                  <div className="meme-tags">
                    {meme.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="meme-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title neon-text-cyan">NEONSTORE</h3>
              <p className="footer-description">
                The ultimate destination for neon-drenched memes and digital creativity.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-subtitle">Explore</h4>
              <ul className="footer-links">
                <li><Link to="/trending">Trending</Link></li>
                <li><Link to="/popular">Popular</Link></li>
                <li><Link to="/meme-storm">Meme Storm</Link></li>
                <li><Link to="/meme-evolution">Meme Evolution</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-subtitle">Community</h4>
              <ul className="footer-links">
                <li><a href="#discord">Discord</a></li>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#reddit">Reddit</a></li>
                <li><a href="#github">GitHub</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-subtitle">Resources</h4>
              <ul className="footer-links">
                <li><a href="#api">API</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#support">Support</a></li>
                <li><a href="#about">About</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 NeonStore. All rights reserved.</p>
          </div>        </div>
      </footer>
    </div>
  );
};

export default Home;
