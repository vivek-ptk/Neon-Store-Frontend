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
  createdAt: string;
  trendingScore?: number;
  daysSinceCreation?: number;
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
          description: meme.description || '',
          tags: meme.tags || [],
          upvotes: meme.upvotes || 0,
          downloads: meme.downloads || 0,
          createdAt: meme.createdAt,
          trendingScore: meme.trendingScore,
          daysSinceCreation: meme.daysSinceCreation
        }));
        
        setMemes(memes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch trending memes:', error);
      
      // Fallback to mock memes if API fails
      const mockMemes: Meme[] = [
        {
          id: '1',
          image_url: 'https://via.placeholder.com/400x400/ff0080/ffffff?text=Trending+Meme+1',
          title: 'Epic Neon Explosion',
          description: 'When the RGB lighting hits just right',
          tags: ['neon', 'rgb', 'gaming', 'viral'],
          upvotes: 2847,
          downloads: 1923,
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
          createdAt: '2025-06-13T08:20:00Z'
        }
      ];
      setMemes(mockMemes);
      toast.error('Failed to load trending memes - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (memeId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/update-upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memeId: memeId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upvote meme');
      }

      if (data.success) {
        toast.success('Meme upvoted!');
        
        // Update local state with the new upvote count from API response
        setMemes(memes.map(meme => 
          meme.id === memeId 
            ? { ...meme, upvotes: data.meme?.upvotes || meme.upvotes + 1 }
            : meme
        ));
      } else {
        throw new Error(data.message || 'Upvote failed');
      }
    } catch (error) {
      console.error('Error upvoting meme:', error);
      toast.error(`Failed to upvote meme`);
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
        
        toast.success('Meme downloaded to your device!');
      } catch (downloadError) {
        console.error('Error downloading image:', downloadError);
        toast.error('Failed to download image to device');
        return;
      }
      
      if (data.success) {
        // Update download count with API response or increment locally
        setMemes(memes.map(m => 
          m.id === meme.id 
            ? { ...m, downloads: data.meme?.downloads || m.downloads + 1 }
            : m
        ));
      } else {
        // Still update locally if API tracking fails but download succeeded
        setMemes(memes.map(m => 
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
        
        toast.success('Meme downloaded! (tracking failed)');
        
        // Update local count since tracking failed
        setMemes(memes.map(m => 
          m.id === meme.id 
            ? { ...m, downloads: m.downloads + 1 }
            : m
        ));
      } catch (downloadError) {
        console.error('Error downloading meme:', downloadError);
        toast.error('Failed to download meme to device');
      }
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

        {/* Controls remain the same */}
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

        {/* Updated Memes Grid - removed uploader info since API doesn't provide it */}
        <div className="memes-grid">
          {sortedMemes.map((meme) => (
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
              
              <div className="meme-content">
                <h3 className="meme-title">{meme.title}</h3>
                <p className="meme-description">{meme.description}</p>
                
                <div className="meme-tags">
                  {meme.tags.map((tag, index) => (
                    <span key={index} className="meme-tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="meme-footer">
                  <span className="upload-date">
                    {new Date(meme.createdAt).toLocaleDateString()}
                  </span>
                  {meme.trendingScore !== undefined && (
                    <span className="trending-score">
                      Score: {meme.trendingScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
