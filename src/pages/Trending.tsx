import React, { useEffect, useState } from 'react';
import { TrendingUp, Download, Heart, Share, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import './Trending.css';

interface Meme {
  id: string;
  image_url: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  downloads: number;
  uploadedBy: {
    name: string;
    avatar: string;
  };
  createdAt: string;
}

const Trending: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'upvotes' | 'downloads' | 'recent'>('upvotes');
  const [filterTag, setFilterTag] = useState<string>('');

  useEffect(() => {
    fetchTrendingMemes();
  }, [sortBy, filterTag]);

  const fetchTrendingMemes = async () => {
    setLoading(true);
    try {
      // Replace with actual API call to /api/trending
      // const response = await fetch('/api/trending');
      // const data = await response.json();
      
      // Mock data for now
      const mockMemes: Meme[] = [
        {
          id: '1',
          image_url: 'https://via.placeholder.com/400x400/ff0080/ffffff?text=Trending+Meme+1',
          title: 'Epic Neon Explosion',
          description: 'When the RGB lighting hits just right',
          tags: ['neon', 'rgb', 'gaming', 'viral'],
          upvotes: 2847,
          downloads: 1923,
          uploadedBy: { name: 'NeonMaster', avatar: 'https://via.placeholder.com/40x40/00ffff/000000?text=NM' },
          createdAt: '2025-06-15T10:30:00Z'
        },
        {
          id: '2',
          image_url: 'https://via.placeholder.com/400x400/00ffff/000000?text=Cyber+Meme+2',
          title: 'Cyberpunk Dreams',
          description: 'Living in 2077 vibes',
          tags: ['cyberpunk', 'future', 'tech', 'ai'],
          upvotes: 2156,
          downloads: 1654,
          uploadedBy: { name: 'CyberVibe', avatar: 'https://via.placeholder.com/40x40/ff0080/ffffff?text=CV' },
          createdAt: '2025-06-14T15:45:00Z'
        },
        {
          id: '3',
          image_url: 'https://via.placeholder.com/400x400/8000ff/ffffff?text=Purple+Power+3',
          title: 'Purple Power Mode',
          description: 'When you activate maximum overdrive',
          tags: ['purple', 'power', 'energy', 'mood'],
          upvotes: 1834,
          downloads: 1287,
          uploadedBy: { name: 'PowerUser', avatar: 'https://via.placeholder.com/40x40/8000ff/ffffff?text=PU' },
          createdAt: '2025-06-13T08:20:00Z'
        },
        {
          id: '4',
          image_url: 'https://via.placeholder.com/400x400/00ff00/000000?text=Matrix+Code+4',
          title: 'Matrix Vibes',
          description: 'There is no spoon',
          tags: ['matrix', 'code', 'green', 'hacker'],
          upvotes: 1675,
          downloads: 1098,
          uploadedBy: { name: 'Neo2025', avatar: 'https://via.placeholder.com/40x40/00ff00/000000?text=N2' },
          createdAt: '2025-06-12T20:15:00Z'
        },
        {
          id: '5',
          image_url: 'https://via.placeholder.com/400x400/ffff00/000000?text=Electric+5',
          title: 'Electric Mood',
          description: 'Charged up and ready to go',
          tags: ['electric', 'energy', 'yellow', 'lightning'],
          upvotes: 1456,
          downloads: 892,
          uploadedBy: { name: 'ElectricBolt', avatar: 'https://via.placeholder.com/40x40/ffff00/000000?text=EB' },
          createdAt: '2025-06-11T12:00:00Z'
        },
        {
          id: '6',
          image_url: 'https://via.placeholder.com/400x400/ff8000/ffffff?text=Fire+Meme+6',
          title: 'Fire in the Code',
          description: 'When your code compiles on first try',
          tags: ['fire', 'coding', 'programming', 'success'],
          upvotes: 1298,
          downloads: 734,
          uploadedBy: { name: 'CodeFire', avatar: 'https://via.placeholder.com/40x40/ff8000/ffffff?text=CF' },
          createdAt: '2025-06-10T16:30:00Z'
        }
      ];
      
      setMemes(mockMemes);
    } catch (error) {
      console.error('Failed to fetch trending memes:', error);
      toast.error('Failed to load trending memes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (memeId: string) => {
    try {
      // API call to upvote meme
      toast.success('Meme upvoted!');
      // Update local state
      setMemes(memes.map(meme => 
        meme.id === memeId 
          ? { ...meme, upvotes: meme.upvotes + 1 }
          : meme
      ));
    } catch (error) {
      toast.error('Failed to upvote meme');
    }
  };

  const handleDownload = async (meme: Meme) => {
    try {
      // API call to track download and get image
      const link = document.createElement('a');
      link.href = meme.image_url;
      link.download = `${meme.title.replace(/\s+/g, '_')}.jpg`;
      link.click();
      
      toast.success('Meme downloaded!');
      
      // Update download count
      setMemes(memes.map(m => 
        m.id === meme.id 
          ? { ...m, downloads: m.downloads + 1 }
          : m
      ));
    } catch (error) {
      toast.error('Failed to download meme');
    }
  };

  const handleShare = async (meme: Meme) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: meme.title,
          text: meme.description,
          url: window.location.href + '/' + meme.id
        });
      } else {
        navigator.clipboard.writeText(window.location.href + '/' + meme.id);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share meme');
    }
  };

  const filteredMemes = memes.filter(meme => 
    filterTag === '' || meme.tags.includes(filterTag.toLowerCase())
  );

  const sortedMemes = [...filteredMemes].sort((a, b) => {
    switch (sortBy) {
      case 'upvotes':
        return b.upvotes - a.upvotes;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text neon-text-cyan">Loading trending memes...</p>
      </div>
    );
  }

  return (
    <div className="trending-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <TrendingUp className="title-icon" size={40} />
            <span className="neon-text-cyan">Trending</span>
            <span className="neon-text-pink"> Memes</span>
          </h1>
          <p className="page-subtitle">
            Discover the hottest memes lighting up the digital universe
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="controls">
          <div className="sort-controls">
            <Filter size={20} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="upvotes">Most Upvoted</option>
              <option value="downloads">Most Downloaded</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
          
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Memes Grid */}
        <div className="memes-grid">
          {sortedMemes.map((meme) => (
            <div key={meme.id} className="meme-card">
              <div className="meme-image-container">
                <img src={meme.image_url} alt={meme.title} className="meme-image" />
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
              
              <div className="meme-content">
                <h3 className="meme-title">{meme.title}</h3>
                <p className="meme-description">{meme.description}</p>
                
                <div className="meme-tags">
                  {meme.tags.map((tag, index) => (
                    <span key={index} className="meme-tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="meme-footer">
                  <div className="uploader-info">
                    <img src={meme.uploadedBy.avatar} alt={meme.uploadedBy.name} className="uploader-avatar" />
                    <span className="uploader-name">{meme.uploadedBy.name}</span>
                  </div>
                  <span className="upload-date">
                    {new Date(meme.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}        </div>
      </div>
    </div>
  );
};

export default Trending;
