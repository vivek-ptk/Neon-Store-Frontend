import React, { useState } from 'react';
import { Upload, Search, Clock, TrendingUp, Users, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import './MemeEvolution.css';

interface EvolutionData {
  origin: {
    date: string;
    platform: string;
    description: string;
  };
  timeline: {
    date: string;
    event: string;
    platform: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  popularity: {
    peak_date: string;
    total_shares: number;
    platforms: {
      name: string;
      shares: number;
    }[];
  };
  variations: {
    name: string;
    description: string;
    popularity: number;
  }[];
  cultural_impact: string;
}

const MemeEvolution: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('meme', selectedFile);

      const response = await fetch('http://localhost:5000/api/meme-evolution', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze meme');
      }

      if (data.success) {
        setEvolutionData(data.evolution);
        toast.success('Meme evolution analysis complete!');
        console.log('Analysis metadata:', data.metadata);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing meme:', error);
      
      // Mock data for demonstration when API fails
      const mockData: EvolutionData = {
        origin: {
          date: '2020-03-15',
          platform: 'Reddit',
          description: 'First appeared on r/memes as a reaction to remote work situations during the pandemic.'
        },
        timeline: [
          {
            date: '2020-03-15',
            event: 'Original meme posted on Reddit',
            platform: 'Reddit',
            impact: 'low'
          },
          {
            date: '2020-03-18',
            event: 'Gained traction on Twitter',
            platform: 'Twitter',
            impact: 'medium'
          },
          {
            date: '2020-03-22',
            event: 'Viral spread on Instagram',
            platform: 'Instagram',
            impact: 'high'
          },
          {
            date: '2020-03-25',
            event: 'Featured in mainstream media',
            platform: 'News',
            impact: 'high'
          },
          {
            date: '2020-04-01',
            event: 'Peak popularity reached',
            platform: 'Multiple',
            impact: 'high'
          }
        ],
        popularity: {
          peak_date: '2020-04-01',
          total_shares: 2847396,
          platforms: [
            { name: 'Twitter', shares: 1200000 },
            { name: 'Instagram', shares: 856000 },
            { name: 'Facebook', shares: 534000 },
            { name: 'TikTok', shares: 257396 }
          ]
        },
        variations: [
          {
            name: 'Office Version',
            description: 'Adapted for corporate work-from-home scenarios',
            popularity: 85
          },
          {
            name: 'Student Edition',
            description: 'Modified for online learning situations',
            popularity: 72
          },
          {
            name: 'Gaming Variant',
            description: 'Reimagined for gaming communities',
            popularity: 68
          }
        ],
        cultural_impact: 'This meme became a defining symbol of the early pandemic era, capturing the universal experience of adapting to remote work and social distancing. It transcended digital spaces to influence workplace culture and communication patterns.'
      };
      
      setEvolutionData(mockData);
      toast.error(`Failed to analyze meme`);
      toast.success('Using demo data instead');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'var(--neon-pink)';
      case 'medium': return 'var(--neon-yellow)';
      case 'low': return 'var(--neon-cyan)';
      default: return 'var(--text-secondary)';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💫';
      default: return '📊';
    }
  };

  return (
    <div className="meme-evolution-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Clock className="title-icon" size={40} />
            <span className="neon-text-cyan">Meme</span>
            <span className="neon-text-pink"> Evolution</span>
          </h1>
          <p className="page-subtitle">
            Trace the time, discover where it all started
          </p>
          <p className="page-description">
            Upload any meme and discover its fascinating journey through digital culture
          </p>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div 
            className={`upload-area ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <div className="preview-overlay">
                  <button 
                    className="change-image-btn"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-content">
                <Upload className="upload-icon" size={60} />
                <h2 className="upload-title">Know Your Meme</h2>
                <p className="upload-description">
                  Drag & drop your meme here or click to browse
                </p>
                <button 
                  className="upload-btn"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Choose File
                </button>
              </div>
            )}
            
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {selectedFile && (
            <div className="analyze-section">
              <button 
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing Evolution...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Know Your Meme
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Evolution Results */}
        {evolutionData && (
          <div className="results-section">
            <h2 className="results-title neon-text-purple">Evolution Analysis</h2>
            
            {/* Origin */}
            <div className="info-card origin-card">
              <h3 className="card-title">
                <Globe size={24} />
                Origin Story
              </h3>
              <div className="origin-content">
                <div className="origin-date">
                  <strong>First Appeared:</strong> {new Date(evolutionData.origin.date).toLocaleDateString()}
                </div>
                <div className="origin-platform">
                  <strong>Platform:</strong> {evolutionData.origin.platform}
                </div>
                <p className="origin-description">{evolutionData.origin.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="info-card timeline-card">
              <h3 className="card-title">
                <Clock size={24} />
                Evolution Timeline
              </h3>
              <div className="timeline">
                {evolutionData.timeline.map((event, index) => (
                  <div key={index} className="timeline-event">
                    <div className="timeline-marker" style={{ background: getImpactColor(event.impact) }}>
                      <span className="impact-icon">{getImpactIcon(event.impact)}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="event-title">{event.event}</div>
                      <div className="event-platform">{event.platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popularity Stats */}
            <div className="info-card popularity-card">
              <h3 className="card-title">
                <TrendingUp size={24} />
                Popularity Statistics
              </h3>
              <div className="popularity-content">
                <div className="popularity-header">
                  <div className="peak-date">
                    <strong>Peak Date:</strong> {new Date(evolutionData.popularity.peak_date).toLocaleDateString()}
                  </div>
                  <div className="total-shares">
                    <strong>Total Shares:</strong> {evolutionData.popularity.total_shares.toLocaleString()}
                  </div>
                </div>
                <div className="platforms-breakdown">
                  <h4>Platform Breakdown:</h4>
                  <div className="platform-stats">
                    {evolutionData.popularity.platforms.map((platform, index) => (
                      <div key={index} className="platform-stat">
                        <span className="platform-name">{platform.name}</span>
                        <div className="platform-bar">
                          <div 
                            className="platform-fill"
                            style={{ 
                              width: `${(platform.shares / evolutionData.popularity.total_shares) * 100}%`,
                              background: `var(--neon-${['cyan', 'pink', 'purple', 'yellow'][index % 4]})`
                            }}
                          ></div>
                        </div>
                        <span className="platform-shares">{platform.shares.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Variations */}
            <div className="info-card variations-card">
              <h3 className="card-title">
                <Users size={24} />
                Popular Variations
              </h3>
              <div className="variations-grid">
                {evolutionData.variations.map((variation, index) => (
                  <div key={index} className="variation-item">
                    <div className="variation-header">
                      <h4 className="variation-name">{variation.name}</h4>
                      <div className="variation-popularity">
                        <div className="popularity-bar">
                          <div 
                            className="popularity-fill"
                            style={{ width: `${variation.popularity}%` }}
                          ></div>
                        </div>
                        <span>{variation.popularity}%</span>
                      </div>
                    </div>
                    <p className="variation-description">{variation.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Impact */}
            <div className="info-card impact-card">
              <h3 className="card-title">
                <Globe size={24} />
                Cultural Impact
              </h3>
              <p className="impact-text">{evolutionData.cultural_impact}</p>            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeEvolution;
