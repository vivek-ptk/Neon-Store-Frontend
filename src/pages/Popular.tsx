import React, { useEffect, useState } from 'react';
import { Crown, TrendingUp, Download, Heart, Share, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './Popular.css';

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
  rank?: number;
}

const Popular: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchPopularMemes();
  }, [timeframe]);

  const fetchPopularMemes = async () => {
    setLoading(true);
    try {
      // Replace with actual API call to /api/popular
      // const response = await fetch(`/api/popular?timeframe=${timeframe}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockMemes: Meme[] = [
        {
          id: '1',
          image_url: 'https://via.placeholder.com/400x400/ff0080/ffffff?text=Popular+1',
          title: 'The Ultimate Neon Meme',
          description: 'The meme that started it all - pure neon excellence',
          tags: ['legendary', 'neon', 'classic', 'viral'],
          upvotes: 15847,
          downloads: 12934,
          uploadedBy: { name: 'NeonLegend', avatar: 'https://via.placeholder.com/40x40/ff0080/ffffff?text=NL' },
          createdAt: '2025-05-01T10:30:00Z',
          rank: 1
        },
        {
          id: '2',
          image_url: 'https://via.placeholder.com/400x400/00ffff/000000?text=Cyber+King+2',
          title: 'Cyberpunk Masterpiece',
          description: 'When cyberpunk meets perfection',
          tags: ['cyberpunk', 'masterpiece', 'tech', 'future'],
          upvotes: 13245,
          downloads: 10876,
          uploadedBy: { name: 'CyberKing', avatar: 'https://via.placeholder.com/40x40/00ffff/000000?text=CK' },
          createdAt: '2025-04-28T15:45:00Z',
          rank: 2
        },
        {
          id: '3',
          image_url: 'https://via.placeholder.com/400x400/8000ff/ffffff?text=Purple+Crown+3',
          title: 'Purple Reign Supreme',
          description: 'Royalty in digital form',
          tags: ['purple', 'royal', 'supreme', 'crown'],
          upvotes: 11876,
          downloads: 9543,
          uploadedBy: { name: 'PurpleKing', avatar: 'https://via.placeholder.com/40x40/8000ff/ffffff?text=PK' },
          createdAt: '2025-04-25T08:20:00Z',
          rank: 3
        },
        {
          id: '4',
          image_url: 'https://via.placeholder.com/400x400/00ff00/000000?text=Matrix+God+4',
          title: 'Matrix Code God',
          description: 'The one who controls the matrix',
          tags: ['matrix', 'code', 'god', 'legendary'],
          upvotes: 10234,
          downloads: 8765,
          uploadedBy: { name: 'MatrixGod', avatar: 'https://via.placeholder.com/40x40/00ff00/000000?text=MG' },
          createdAt: '2025-04-20T20:15:00Z',
          rank: 4
        },
        {
          id: '5',
          image_url: 'https://via.placeholder.com/400x400/ffff00/000000?text=Lightning+5',
          title: 'Lightning Strike',
          description: 'Fast as lightning, bright as the sun',
          tags: ['lightning', 'speed', 'bright', 'energy'],
          upvotes: 9876,
          downloads: 7654,
          uploadedBy: { name: 'LightningBolt', avatar: 'https://via.placeholder.com/40x40/ffff00/000000?text=LB' },
          createdAt: '2025-04-15T12:00:00Z',
          rank: 5
        },
        {
          id: '6',
          image_url: 'https://via.placeholder.com/400x400/ff8000/ffffff?text=Fire+Phoenix+6',
          title: 'Phoenix Rising',
          description: 'From the ashes of old memes, a legend is born',
          tags: ['phoenix', 'fire', 'rising', 'legend'],
          upvotes: 8745,
          downloads: 6234,
          uploadedBy: { name: 'PhoenixRise', avatar: 'https://via.placeholder.com/40x40/ff8000/ffffff?text=PR' },
          createdAt: '2025-04-10T16:30:00Z',
          rank: 6
        },
        {
          id: '7',
          image_url: 'https://via.placeholder.com/400x400/ff0080/ffffff?text=Neon+Heart+7',
          title: 'Neon Heart Beat',
          description: 'Feel the pulse of the neon world',
          tags: ['heart', 'pulse', 'neon', 'love'],
          upvotes: 7892,
          downloads: 5678,
          uploadedBy: { name: 'NeonHeart', avatar: 'https://via.placeholder.com/40x40/ff0080/ffffff?text=NH' },
          createdAt: '2025-04-05T09:45:00Z',
          rank: 7
        },
        {
          id: '8',
          image_url: 'https://via.placeholder.com/400x400/00ffff/000000?text=Cyber+Storm+8',
          title: 'Digital Storm',
          description: 'When the digital world rages',
          tags: ['digital', 'storm', 'cyber', 'rage'],
          upvotes: 7234,
          downloads: 4987,
          uploadedBy: { name: 'DigitalStorm', avatar: 'https://via.placeholder.com/40x40/00ffff/000000?text=DS' },
          createdAt: '2025-03-30T14:20:00Z',
          rank: 8
        }
      ];
      
      setMemes(mockMemes);
    } catch (error) {
      console.error('Failed to fetch popular memes:', error);
      toast.error('Failed to load popular memes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (memeId: string) => {
    try {
      // API call to upvote meme
      toast.success('Meme upvoted!');
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
      const link = document.createElement('a');
      link.href = meme.image_url;
      link.download = `${meme.title.replace(/\s+/g, '_')}.jpg`;
      link.click();
      
      toast.success('Meme downloaded!');
      
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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'var(--neon-yellow)';
      case 2: return 'var(--text-secondary)';
      case 3: return 'var(--neon-orange)';
      default: return 'var(--neon-cyan)';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Crown size={20} />;
    return <Star size={20} />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text neon-text-cyan">Loading popular memes...</p>
      </div>
    );
  }

  return (
    <div className="popular-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Crown className="title-icon" size={40} />
            <span className="neon-text-yellow">Popular</span>
            <span className="neon-text-pink"> Hall of Fame</span>
          </h1>
          <p className="page-subtitle">
            The legendary memes that have conquered the digital realm
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="timeframe-selector">
          {['today', 'week', 'month', 'all'].map((period) => (
            <button
              key={period}
              className={`timeframe-btn ${timeframe === period ? 'active' : ''}`}
              onClick={() => setTimeframe(period as any)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="podium-section">
          <div className="podium">
            {memes.slice(0, 3).map((meme, index) => (
              <div key={meme.id} className={`podium-item rank-${index + 1}`}>
                <div className="podium-rank">
                  <div className="rank-number" style={{ color: getRankColor(index + 1) }}>
                    {getRankIcon(index + 1)}
                    #{index + 1}
                  </div>
                </div>
                <div className="podium-meme">
                  <img src={meme.image_url} alt={meme.title} className="podium-image" />
                  <div className="podium-info">
                    <h3 className="podium-title">{meme.title}</h3>
                    <div className="podium-stats">
                      <span className="stat">
                        <Heart size={16} />
                        {meme.upvotes.toLocaleString()}
                      </span>
                      <span className="stat">
                        <Download size={16} />
                        {meme.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest of Popular Memes */}
        <div className="memes-list">
          <h2 className="list-title neon-text-cyan">The Elite Rankings</h2>
          <div className="memes-grid">
            {memes.slice(3).map((meme) => (
              <div key={meme.id} className="meme-card">
                <div className="meme-rank-badge">
                  <Star size={16} />
                  #{meme.rank}
                </div>
                
                <div className="meme-image-container">
                  <img src={meme.image_url} alt={meme.title} className="meme-image" />
                  <div className="meme-overlay">
                    <div className="meme-actions">
                      <button 
                        className="action-btn upvote-btn"
                        onClick={() => handleUpvote(meme.id)}
                      >
                        <Heart size={18} />
                        {meme.upvotes.toLocaleString()}
                      </button>
                      <button 
                        className="action-btn download-btn"
                        onClick={() => handleDownload(meme)}
                      >
                        <Download size={18} />
                        {meme.downloads.toLocaleString()}
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
            ))}
          </div>        </div>
      </div>
    </div>
  );
};

export default Popular;
