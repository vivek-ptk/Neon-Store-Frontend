import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Sparkles, Lightbulb, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './MemeStorm.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const MemeStorm: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there, future meme legend! 🚀 I'm your AI meme generator, ready to transform any situation, idea, or random thought into the next viral sensation. Whether you're dealing with Monday blues, celebrating a win, or just had a weird shower thought - I'll help you turn it into meme gold! What's your story?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme-storm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideas: userMessage.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get AI response');
      }

      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      if (data.success && data.memeConcepts && data.memeConcepts.length > 0) {
        // Add introduction message
        const introMessage: Message = {
          id: `intro-${Date.now()}`,
          text: `🚀 Amazing! I've generated ${data.memeConcepts.length} viral meme concepts for you! Here they are:`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, introMessage]);

        // Add each meme concept as separate messages with a small delay for better UX
        data.memeConcepts.forEach((concept: any, index: number) => {
          setTimeout(() => {
            const conceptMessage: Message = {
              id: `concept-${Date.now()}-${index}`,
              text: `🎨 **Meme Concept ${index + 1}:**\n\n📷 **Image Description:**\n${concept['image-description']}\n\n💬 **Caption:**\n"${concept.caption}"`,
              sender: 'ai',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, conceptMessage]);
          }, index * 1000); // 1 second delay between each concept
        });

        // Add closing message after all concepts
        setTimeout(() => {
          const closingMessage: Message = {
            id: `closing-${Date.now()}`,
            text: "✨ There you have it! Which one's your favorite? Feel free to describe another situation for more viral meme ideas! 🔥",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, closingMessage]);
        }, data.memeConcepts.length * 1000 + 500);

      } else {
        // Fallback message if no concepts generated
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: "Hmm, let me cook up something viral for you! Try describing your situation in more detail - the funnier or more relatable, the better the meme will be!",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and add error response
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Oops! My meme generator is having a moment 😅 But don't worry - I can still help you brainstorm! Try describing your situation or idea, and I'll help you craft the perfect meme concept manually!",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Meme generator temporarily offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "I just woke up at 6 AM for a 9 AM meeting that got cancelled",
    "When you order food delivery and realize you have no money left",
    "My boss said 'quick meeting' and it's been 2 hours",
    "That moment when you close 20 browser tabs and your laptop still runs slow",
  
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="meme-storm-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <TrendingUp className="title-icon" size={40} />
            <span className="neon-text-cyan">Viral</span>
            <span className="neon-text-pink"> Meme</span>
            <span className="neon-text-purple"> Generator</span>
          </h1>
          <p className="page-subtitle">
            Transform any situation, idea, or life moment into the next viral meme sensation
          </p>
          <div className="page-description">
            <p>Got a funny situation? Weird experience? Random shower thought? 
               Share it with me and I'll help you turn it into meme magic! ✨</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="chat-container">
          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <User size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.isTyping ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <div className="message-content-formatted">
                        {message.text.split('\n').map((line, index) => {
                          // Handle bold text formatting
                          if (line.includes('**') && line.includes('**')) {
                            const parts = line.split('**');
                            return (
                              <div key={index} className="message-line">
                                {parts.map((part, partIndex) => (
                                  partIndex % 2 === 1 ? 
                                    <strong key={partIndex} className="message-bold">{part}</strong> : 
                                    <span key={partIndex}>{part}</span>
                                ))}
                              </div>
                            );
                          }
                          // Handle emoji prefixed lines
                          else if (line.trim().startsWith('🎨') || line.trim().startsWith('📷') || line.trim().startsWith('💬')) {
                            return <div key={index} className="message-line concept-section">{line}</div>;
                          }
                          // Handle quoted text (captions)
                          else if (line.trim().startsWith('"') && line.trim().endsWith('"')) {
                            return <div key={index} className="message-line caption-text">{line}</div>;
                          }
                          // Regular lines
                          else {
                            return line.trim() ? <div key={index} className="message-line">{line}</div> : <br key={index} />;
                          }
                        })}
                      </div>
                    )}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="suggested-prompts">
              <h3 className="prompts-title">
                <Lightbulb size={20} />
                Try these relatable situations:
              </h3>
              <div className="prompts-grid">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="prompt-btn"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <Sparkles size={16} />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="input-form">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your situation, idea, or experience... (e.g., 'When you pretend to work from home but spend 3 hours choosing the perfect Zoom background')"
                className="message-input"
                rows={2}
                disabled={isLoading}
                style={{ resize: 'none' }}
              />
              <button
                type="submit"
                className={`send-btn ${inputText.trim() && !isLoading ? 'active' : ''}`}
                disabled={!inputText.trim() || isLoading}
              >
                <Zap size={20} />
              </button>
            </div>
            <div className="input-hint">
              <p>🚀 Share your story and I'll create a viral meme concept for you!</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemeStorm;
