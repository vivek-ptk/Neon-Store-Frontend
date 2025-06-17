import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Zap, ArrowLeft, Filter, ChevronLeft, ChevronRight, Grid, Heart, Download, Share } from 'lucide-react';
import toast from 'react-hot-toast';
import './Explore.css';

interface Meme {
  id: string;
  image_url: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  downloads: number;
  createdAt: string;
  relevanceScore?: number;
}

interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  totalItems: number;
}

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'popular' | 'recent' | 'trending'>('recent');
  const [filterTag, setFilterTag] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    total: 1,
    count: 0,
    totalItems: 0
  });

  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');


  useEffect(() => {
    if (query) {
      searchMemes(query, currentPage);
    } else {
      fetchAllMemes(currentPage);
    }
  }, [query, currentPage, sortBy, filterTag]);

  const fetchAllMemes = async (page: number = 1) => {
    setLoading(true);
    try {
      const limit = 20;
      let apiUrl = `http://localhost:5000/api/memes?page=${page}&limit=${limit}`;
      
      // Add sort parameter (map relevance to recent for general browse)
      const sortParam = sortBy === 'relevance' ? 'recent' : sortBy;
      apiUrl += `&sort=${sortParam}`;
      
      // Add tag filter if specified
      if (filterTag) {
        apiUrl += `&tags=${encodeURIComponent(filterTag)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch memes');
      }

      if (data.success && data.memes) {
        // Transform API response to match Meme interface
        const transformedMemes: Meme[] = data.memes.map((meme: any) => ({
          id: meme.id,
          image_url: meme.image_url,
          title: meme.description || meme.title || 'Untitled Meme',
          description: meme.description || '',
          tags: meme.tags || [],
          upvotes: meme.upvotes || 0,
          downloads: meme.downloads || 0,
          createdAt: meme.createdAt,
          relevanceScore: undefined // No relevance score for general browse
        }));

        setMemes(transformedMemes);
        setPagination(data.pagination);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch memes:', error);
      
      // Fallback to empty array if API fails
      setMemes([]);
      setPagination({
        current: 1,
        total: 1,
        count: 0,
        totalItems: 0
      });
      toast.error(`Failed to load memes`);
    } finally {
      setLoading(false);
    }
  };

  const searchMemes = async (searchQuery: string, page: number = 1) => {
    setLoading(true);
    try {
      // Encode the search query for URL
      const encodedQuery = encodeURIComponent(searchQuery);
      const limit = 20; // Items per page
      
      const response = await fetch(`http://localhost:5000/api/search?q=${encodedQuery}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search memes');
      }

      if (data.success && data.memes) {
        // Transform API response to match Meme interface
        let transformedMemes: Meme[] = data.memes.map((meme: any) => ({
          id: meme.id,
          image_url: meme.image_url,
          title: meme.description || 'Untitled Meme',
          description: meme.description || '',
          tags: meme.tags || [],
          upvotes: meme.upvotes || 0,
          downloads: meme.downloads || 0,
          createdAt: meme.createdAt,
          relevanceScore: meme.relevanceScore
        }));

        // Apply client-side sorting if needed (API already sorts by relevance)
        switch (sortBy) {
          case 'popular':
            transformedMemes.sort((a, b) => b.upvotes - a.upvotes);
            break;
          case 'recent':
            transformedMemes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'trending':
            transformedMemes.sort((a, b) => (b.upvotes + b.downloads) - (a.upvotes + a.downloads));
            break;
          case 'relevance':
          default:
            // API already sorts by relevance
            break;
        }

        // Apply tag filter
        if (filterTag) {
          transformedMemes = transformedMemes.filter(meme => 
            meme.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
          );
        }

        setMemes(transformedMemes);
        setPagination(data.pagination);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to search memes:', error);
      
      // Fallback to empty array if API fails
      setMemes([]);
      setPagination({
        current: 1,
        total: 1,
        count: 0,
        totalItems: 0
      });
      toast.error(`Failed to search memes`);
    } finally {
      setLoading(false);
    }
  };
  const handleUpvote = async (memeId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/upvote', {
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
        setMemes(memes.map(meme => 
          meme.id === memeId 
            ? { ...meme, upvotes: data.meme?.upvotes || meme.upvotes + 1 }
            : meme
        ));
        toast.success('Meme upvoted! 💖');
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      // Still update locally if API fails
      setMemes(memes.map(meme => 
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
      const response = await fetch('http://localhost:5000/api/track-downloads', {
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
        
        toast.success('Downloaded! 📱');
        
        // Update local count since tracking failed
        setMemes(memes.map(m => 
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
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', newPage.toString());
      setSearchParams(newSearchParams);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const renderPagination = () => {
    if (pagination.total <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.current - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.total, startPage + maxVisiblePages - 1);

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.current - 1)}
        disabled={pagination.current === 1}
        className="pagination-btn"
      >
        <ChevronLeft size={16} />
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.current ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < pagination.total) {
      if (endPage < pagination.total - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={pagination.total}
          onClick={() => handlePageChange(pagination.total)}
          className="pagination-btn"
        >
          {pagination.total}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.current + 1)}
        disabled={pagination.current === pagination.total}
        className="pagination-btn"
      >
        <ChevronRight size={16} />
      </button>
    );

    return pages;
  };

  // Determine page title and content based on whether it's search or browse
  const isSearching = !!query;
  const pageTitle = isSearching 
    ? `Search Results for: "${query}"` 
    : 'Explore All Memes';
  const pageIcon = isSearching ? <Search className="search-icon" size={24} /> : <Grid className="search-icon" size={24} />;

  return (
    <div className="explore-page">
      {/* Header Section */}
      <section className="explore-header">
        <div className="container">
          <div className="header-content">
            <button onClick={handleBackClick} className="back-btn">
              <ArrowLeft size={20} />
              Back
            </button>
            
            <div className="search-info">
              {pageIcon}
              <h1 className="search-title">
                {isSearching ? (
                  <>Search Results for: <span className="query-highlight">"{query}"</span></>
                ) : (
                  <span className="neon-text-cyan">Explore All Memes</span>
                )}
              </h1>
            </div>
            
            <div className="results-count">
              {loading ? (
                <span className="loading-text">{isSearching ? 'Searching...' : 'Loading...'}</span>
              ) : (
                <span className="count-text">
                  {pagination.totalItems} {isSearching ? 'results' : 'memes'} found 
                  {pagination.totalItems > 0 && (
                    <span className="page-info">
                      (Page {pagination.current} of {pagination.total})
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-content">
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">
                <Filter size={16} />
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                {isSearching && <option value="relevance">Relevance</option>}
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            <div className="tag-filter">
              <input
                type="text"
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="tag-filter-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{isSearching ? 'Searching for the best memes...' : 'Loading amazing memes...'}</p>
            </div>
          ) : memes.length > 0 ? (
            <>
              <div className="memes-grid">
                {memes.map((meme, index) => (
                  <div key={meme.id} className="meme-card" style={{ animationDelay: `${index * 0.1}s` }}>
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
                      <p className="meme-description">{meme.description}</p>
                      <div className="meme-meta">
                        <span className="meme-date">{new Date(meme.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="meme-tags">
                        {meme.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className={`meme-tag ${isSearching && query.toLowerCase().split(' ').some(word => tag.toLowerCase().includes(word)) ? 'highlighted' : ''}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.total > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    {renderPagination()}
                  </div>
                  <div className="pagination-info">
                    Showing {((pagination.current - 1) * 20) + 1}-{Math.min(pagination.current * 20, pagination.totalItems)} of {pagination.totalItems} {isSearching ? 'results' : 'memes'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <Search className="no-results-icon" size={48} />
              <h3>{isSearching ? `No memes found for "${query}"` : 'No memes available'}</h3>
              <p>{isSearching ? 'Try searching with different keywords or check out our trending memes!' : 'Upload some memes to get started!'}</p>
              <button 
                onClick={() => navigate(isSearching ? '/trending' : '/')} 
                className="trending-btn"
              >
                {isSearching ? 'Browse Trending Memes' : 'Go to Home'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;
