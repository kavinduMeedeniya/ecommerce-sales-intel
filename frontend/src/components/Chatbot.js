import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages(prev => [...prev, { user: userMsg, bot: null }]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { query: userMsg });
      setMessages(prev => [...prev.slice(0, -1), { user: userMsg, bot: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev.slice(0, -1), { user: userMsg, bot: "Oops, network hiccup—try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>Sales AI Assistant</h3>
        </div>
        <div className="chatbot-subtitle">Powered by AI Analytics</div>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Ask me about sales data</p>
            <div className="suggestions">
              <span>"Total revenue?"</span>
              <span>"Top products in 2004"</span>
              <span>"Sales trends analysis"</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="message-container">
            <div className="user-message">
              <div className="message-avatar">Y</div>
              <div className="message-bubble user-bubble">
                {msg.user}
              </div>
            </div>
            <div className="bot-message">
              <div className="message-avatar bot-avatar">AI</div>
              <div className="message-bubble bot-bubble">
                {msg.bot || (isLoading && idx === messages.length - 1 ? 'Thinking...' : msg.bot)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.bot === null && (
          <div className="bot-message">
            <div className="message-avatar bot-avatar">AI</div>
            <div className="message-bubble bot-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbot-input-form">
        <div className="input-container">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about sales data..." 
            disabled={isLoading}
            className="chatbot-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !query.trim()} 
            className="send-button"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;