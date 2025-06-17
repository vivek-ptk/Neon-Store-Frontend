import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Sparkles, Brain } from 'lucide-react';
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
      text: "Welcome to Meme Storm! ⚡ I'm your AI meme assistant ready to help you brainstorm, analyze, and create the next viral sensation. What kind of meme magic shall we conjure today?",
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
      // Replace with actual API call to /api/meme-storm
      const response = await fetch('/api/meme-storm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response || "I'm experiencing some technical difficulties. Try asking about meme trends, creative ideas, or viral content strategies!",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and add error response
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting right now. But I can still help you brainstorm! Try asking me about current meme trends, creative concepts, or what makes content go viral!",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
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
    "Generate meme ideas about AI",
    "What's trending in memes right now?",
    "Create a cyberpunk meme concept",
    "Analyze viral meme patterns",
    "Help me brainstorm neon-themed memes"
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
            <Zap className="title-icon" size={40} />
            <span className="neon-text-cyan">Meme</span>
            <span className="neon-text-pink"> Storm</span>
          </h1>
          <p className="page-subtitle">
            Unleash the power of AI to brainstorm, analyze, and create viral meme content
          </p>
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
                      message.text
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
                <Sparkles size={20} />
                Try these prompts:
              </h3>
              <div className="prompts-grid">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="prompt-btn"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <Brain size={16} />
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
                placeholder="Ask me about memes, trends, or creative ideas..."
                className="message-input"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`send-btn ${inputText.trim() && !isLoading ? 'active' : ''}`}
                disabled={!inputText.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </div>        </form>
        </div>
      </div>
    </div>
  );
};

export default MemeStorm;
