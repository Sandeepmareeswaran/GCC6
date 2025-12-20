import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './ChatbotWidget.css';

const API_BASE = 'https://jira-api.outliersunited.com';

// Simple markdown parser for chat messages
function parseMarkdown(text) {
          if (!text) return '';

          // Parse **bold** or __bold__
          let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          parsed = parsed.replace(/__(.*?)__/g, '<strong>$1</strong>');

          // Parse *italic* or _italic_
          parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
          parsed = parsed.replace(/_(.*?)_/g, '<em>$1</em>');

          // Parse `code`
          parsed = parsed.replace(/`(.*?)`/g, '<code>$1</code>');

          // Parse bullet points (• or -)
          parsed = parsed.replace(/^[•\-]\s(.+)$/gm, '<li>$1</li>');

          return parsed;
}

// Render message with markdown support
function MessageContent({ content }) {
          const lines = content.split('\n');

          return (
                    <>
                              {lines.map((line, i) => {
                                        const parsedLine = parseMarkdown(line);
                                        return (
                                                  <React.Fragment key={i}>
                                                            <span dangerouslySetInnerHTML={{ __html: parsedLine }} />
                                                            {i < lines.length - 1 && <br />}
                                                  </React.Fragment>
                                        );
                              })}
                    </>
          );
}

export default function ChatbotWidget() {
          const [isOpen, setIsOpen] = useState(false);
          const [messages, setMessages] = useState([
                    { role: 'assistant', content: '👋 Hi! I\'m your **IntegrationStore Assistant**.\n\nI can help you:\n• Search your ToDo tasks\n• View your Notes\n• Check Inventory products\n• View Sales data\n\nHow can I help you today?' }
          ]);
          const [input, setInput] = useState('');
          const [isLoading, setIsLoading] = useState(false);
          const messagesEndRef = useRef(null);
          const inputRef = useRef(null);
          const { t, language } = useLanguage();
          const { currentTheme } = useTheme();

          const scrollToBottom = () => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          };

          useEffect(() => {
                    scrollToBottom();
          }, [messages]);

          useEffect(() => {
                    if (isOpen && inputRef.current) {
                              inputRef.current.focus();
                    }
          }, [isOpen]);

          const sendMessage = async () => {
                    if (!input.trim() || isLoading) return;

                    const userMessage = input.trim();
                    setInput('');
                    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
                    setIsLoading(true);

                    try {
                              const userEmail = localStorage.getItem('userEmail') || 'guest';
                              const response = await fetch(`${API_BASE}/api/chat/query`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                                  message: userMessage,
                                                  userEmail,
                                                  language,
                                                  history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
                                        })
                              });

                              const data = await response.json();

                              if (data.success) {
                                        let botResponse = data.response;

                                        if (data.action?.success) {
                                                  if (data.action.task) {
                                                            botResponse += '\n\n✅ **Task created successfully!**';
                                                  } else if (data.action.note) {
                                                            botResponse += '\n\n✅ **Note created successfully!**';
                                                  }
                                        }

                                        setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
                              } else {
                                        setMessages(prev => [...prev, {
                                                  role: 'assistant',
                                                  content: `❌ Sorry, I encountered an error: ${data.error || 'Unknown error'}`
                                        }]);
                              }
                    } catch (error) {
                              setMessages(prev => [...prev, {
                                        role: 'assistant',
                                        content: '❌ **Connection Error**\n\nCouldn\'t connect to the server. Please make sure the backend is running.'
                              }]);
                    } finally {
                              setIsLoading(false);
                    }
          };

          const handleKeyPress = (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                    }
          };

          const quickActions = [
                    { label: '📋 Tasks', query: 'Show my todo tasks' },
                    { label: '📝 Notes', query: 'Show my notes' },
                    { label: '📦 Inventory', query: 'Show inventory' },
                    { label: '💰 Sales', query: 'Show sales summary' },
          ];

          return (
                    <>
                              {/* Floating Chat Button */}
                              <button
                                        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                                        onClick={() => setIsOpen(!isOpen)}
                                        title={t('Chat Assistant')}
                              >
                                        {isOpen ? (
                                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M18 6L6 18M6 6l12 12" />
                                                  </svg>
                                        ) : (
                                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                  </svg>
                                        )}
                              </button>

                              {/* Chat Window */}
                              {isOpen && (
                                        <div className="chatbot-window">
                                                  {/* Header */}
                                                  <div className="chatbot-header">
                                                            <div className="chatbot-header-info">
                                                                      <div className="chatbot-avatar">🤖</div>
                                                                      <div>
                                                                                <div className="chatbot-title">AI Assistant</div>
                                                                                <div className="chatbot-status">
                                                                                          <span className="status-dot"></span>
                                                                                          Online
                                                                                </div>
                                                                      </div>
                                                            </div>
                                                            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                                                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M18 6L6 18M6 6l12 12" />
                                                                      </svg>
                                                            </button>
                                                  </div>

                                                  {/* Messages */}
                                                  <div className="chatbot-messages">
                                                            {messages.map((msg, idx) => (
                                                                      <div key={idx} className={`chatbot-message ${msg.role}`}>
                                                                                {msg.role === 'assistant' && <div className="message-avatar">🤖</div>}
                                                                                <div className="message-content">
                                                                                          <MessageContent content={msg.content} />
                                                                                </div>
                                                                      </div>
                                                            ))}
                                                            {isLoading && (
                                                                      <div className="chatbot-message assistant">
                                                                                <div className="message-avatar">🤖</div>
                                                                                <div className="message-content typing">
                                                                                          <span></span><span></span><span></span>
                                                                                </div>
                                                                      </div>
                                                            )}
                                                            <div ref={messagesEndRef} />
                                                  </div>

                                                  {/* Quick Actions */}
                                                  {messages.length <= 2 && (
                                                            <div className="chatbot-quick-actions">
                                                                      {quickActions.map((action, idx) => (
                                                                                <button
                                                                                          key={idx}
                                                                                          className="quick-action-btn"
                                                                                          onClick={() => {
                                                                                                    setInput(action.query);
                                                                                                    setTimeout(() => {
                                                                                                              setInput(action.query);
                                                                                                              sendMessage();
                                                                                                    }, 50);
                                                                                          }}
                                                                                >
                                                                                          {action.label}
                                                                                </button>
                                                                      ))}
                                                            </div>
                                                  )}

                                                  {/* Input */}
                                                  <div className="chatbot-input-area">
                                                            <input
                                                                      ref={inputRef}
                                                                      type="text"
                                                                      className="chatbot-input"
                                                                      placeholder="Type your message..."
                                                                      value={input}
                                                                      onChange={(e) => setInput(e.target.value)}
                                                                      onKeyPress={handleKeyPress}
                                                                      disabled={isLoading}
                                                            />
                                                            <button
                                                                      className="chatbot-send"
                                                                      onClick={sendMessage}
                                                                      disabled={!input.trim() || isLoading}
                                                            >
                                                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                                                      </svg>
                                                            </button>
                                                  </div>
                                        </div>
                              )}
                    </>
          );
}
