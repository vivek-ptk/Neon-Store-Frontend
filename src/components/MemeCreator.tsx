import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Download, Type, Palette, Sliders, Wand2, 
  AlignCenter, AlignLeft, AlignRight, Bold, Italic 
} from 'lucide-react';
import toast from 'react-hot-toast';
import './MemeCreator.css';

interface MemeCreatorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MemeCreator: React.FC<MemeCreatorProps> = ({ 
  isOpen = false, 
  onClose = () => {} 
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [imageFilter, setImageFilter] = useState('none');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [suggestedCaptions, setSuggestedCaptions] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const neonColors = [
    '#00ffff', '#ff0080', '#8000ff', '#00ff00', 
    '#ffff00', '#ff8000', '#ff0040', '#0080ff'
  ];

  const fontFamilies = [
    'Impact', 'Arial Black', 'Helvetica', 'Comic Sans MS', 
    'Orbitron', 'Rajdhani', 'Courier New'
  ];

  const filterOptions = [
    { name: 'None', value: 'none' },
    { name: 'Neon Glow', value: 'drop-shadow(0 0 10px #00ffff)' },
    { name: 'Pink Glow', value: 'drop-shadow(0 0 10px #ff0080)' },
    { name: 'Purple Glow', value: 'drop-shadow(0 0 10px #8000ff)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Blur', value: 'blur(2px)' },
    { name: 'Brightness', value: 'brightness(120%)' }
  ];

  useEffect(() => {
    if (selectedImage) {
      drawMeme();
    }
  }, [
    selectedImage, headerText, footerText, fontSize, fontFamily, 
    textColor, strokeColor, strokeWidth, textAlign, isBold, isItalic, imageFilter
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image with filter
      if (imageFilter !== 'none') {
        ctx.filter = imageFilter;
      }
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // Set text properties
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${fontSize}px ${fontFamily}`;
      ctx.textAlign = textAlign;
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.textBaseline = 'middle';

      // Draw header text
      if (headerText) {
        const x = textAlign === 'center' ? canvas.width / 2 : 
                  textAlign === 'left' ? 50 : canvas.width - 50;
        const y = fontSize / 2 + 30;
        
        ctx.strokeText(headerText, x, y);
        ctx.fillText(headerText, x, y);
      }

      // Draw footer text
      if (footerText) {
        const x = textAlign === 'center' ? canvas.width / 2 : 
                  textAlign === 'left' ? 50 : canvas.width - 50;
        const y = canvas.height - fontSize / 2 - 30;
        
        ctx.strokeText(footerText, x, y);
        ctx.fillText(footerText, x, y);
      }
    };
    img.src = selectedImage;
  };

  const generateCaptions = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGeneratingCaption(true);
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob);

        // Replace with actual API call to /api/caption-generator
        const response = await fetch('/api/caption-generator', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to generate captions');

        const data = await response.json();
        setSuggestedCaptions(data.captions || []);
        toast.success('Captions generated!');
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Error generating captions:', error);
      
      // Mock captions for demonstration
      const mockCaptions = [
        "When you finally understand the assignment",
        "POV: You're winning at life",
        "That feeling when everything goes right",
        "Me trying to be productive on Monday",
        "When the meme is so good you can't even"
      ];
      
      setSuggestedCaptions(mockCaptions);
      toast.success('Captions generated! (Demo)');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error('No meme to download');
      return;
    }

    const link = document.createElement('a');
    link.download = 'neon-meme.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success('Meme downloaded!');
  };

  const applyCaption = (caption: string) => {
    if (!headerText) {
      setHeaderText(caption);
    } else {
      setFooterText(caption);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meme-creator-overlay">
      <div className="meme-creator-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <Wand2 size={24} />
            Neon Meme Creator
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Left Panel - Controls */}
          <div className="controls-panel">
            {/* Upload Section */}
            <div className="control-section">
              <h3 className="section-title">Upload Image</h3>
              <button 
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Text Controls */}
            <div className="control-section">
              <h3 className="section-title">
                <Type size={20} />
                Text Settings
              </h3>
              
              <div className="input-group">
                <label>Header Text</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Top text..."
                  className="text-input"
                />
              </div>

              <div className="input-group">
                <label>Footer Text</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Bottom text..."
                  className="text-input"
                />
              </div>

              <div className="input-group">
                <label>Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="select-input"
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="range-input"
                />
              </div>

              <div className="button-group">
                <button
                  className={`style-btn ${isBold ? 'active' : ''}`}
                  onClick={() => setIsBold(!isBold)}
                >
                  <Bold size={16} />
                </button>
                <button
                  className={`style-btn ${isItalic ? 'active' : ''}`}
                  onClick={() => setIsItalic(!isItalic)}
                >
                  <Italic size={16} />
                </button>
                <button
                  className={`style-btn ${textAlign === 'left' ? 'active' : ''}`}
                  onClick={() => setTextAlign('left')}
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  className={`style-btn ${textAlign === 'center' ? 'active' : ''}`}
                  onClick={() => setTextAlign('center')}
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  className={`style-btn ${textAlign === 'right' ? 'active' : ''}`}
                  onClick={() => setTextAlign('right')}
                >
                  <AlignRight size={16} />
                </button>
              </div>
            </div>

            {/* Color Controls */}
            <div className="control-section">
              <h3 className="section-title">
                <Palette size={20} />
                Colors
              </h3>
              
              <div className="color-section">
                <label>Text Color</label>
                <div className="color-picker-group">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="color-input"
                  />
                  <div className="neon-palette">
                    {neonColors.map(color => (
                      <button
                        key={color}
                        className={`neon-color ${textColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="color-section">
                <label>Stroke Color</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="color-input"
                />
              </div>

              <div className="input-group">
                <label>Stroke Width: {strokeWidth}px</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="range-input"
                />
              </div>
            </div>

            {/* Image Filters */}
            <div className="control-section">
              <h3 className="section-title">
                <Sliders size={20} />
                Filters
              </h3>
              
              <select
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value)}
                className="select-input"
              >
                {filterOptions.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption Generator */}
            <div className="control-section">
              <h3 className="section-title">AI Caption Generator</h3>
              
              <button 
                className="generate-btn"
                onClick={generateCaptions}
                disabled={isGeneratingCaption || !selectedImage}
              >
                {isGeneratingCaption ? (
                  <>
                    <div className="spinner"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate Captions
                  </>
                )}
              </button>

              {suggestedCaptions.length > 0 && (
                <div className="captions-list">
                  {suggestedCaptions.map((caption, index) => (
                    <button
                      key={index}
                      className="caption-btn"
                      onClick={() => applyCaption(caption)}
                    >
                      {caption}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download */}
            <div className="control-section">
              <button 
                className="download-btn"
                onClick={downloadMeme}
                disabled={!selectedImage}
              >
                <Download size={20} />
                Download Meme
              </button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="preview-panel">
            <h3 className="section-title">Preview</h3>
            <div className="canvas-container">
              {selectedImage ? (
                <canvas 
                  ref={canvasRef}
                  className="meme-canvas"
                />
              ) : (
                <div className="empty-canvas">
                  <Upload size={60} />
                  <p>Upload an image to start creating</p>
                </div>
              )}
            </div>        </div>
        </div>
      </div>
    </div>
  );
};

export default MemeCreator;
