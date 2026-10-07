import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Film,
  Star,
  Bookmark,
  Check,
  ShieldCheck,
  Bot,
  Info,
} from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const GENRE_CHIPS = [
  { label: '🚀 Sci-Fi', prompt: 'Recommend some great Sci-Fi movies!' },
  { label: '🔪 Psychological Thriller', prompt: 'Suggest some tense psychological thrillers!' },
  { label: '👻 Atmospheric Horror', prompt: 'Give me great atmospheric horror films!' },
  { label: '🎭 Emotional Drama', prompt: 'Suggest powerful, emotional drama movies!' },
  { label: '🕵️ Neo-Noir & Mystery', prompt: 'What are some great Neo-Noir or mystery films?' },
  { label: '😂 Dark Comedy', prompt: 'Recommend smart dark comedies!' },
  { label: '🎨 Japanese Animation', prompt: 'Suggest iconic anime movies to watch!' },
  { label: '⚡ Action & Heist', prompt: 'Recommend thrilling action or heist movies!' },
  { label: '📼 90s Cult Classics', prompt: 'Give me 90s cult classic film recommendations!' },
  { label: '✨ Hidden Gems', prompt: 'Suggest some underrated hidden gem movies!' },
];

export const CineBotModal = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExclusionTooltip, setShowExclusionTooltip] = useState(false);
  const [addedWatchlistIds, setAddedWatchlistIds] = useState(new Set());

  const [exclusions, setExclusions] = useState({
    titles: [],
    watchedCount: 0,
    watchlistCount: 0,
    watchedSet: new Set(),
    watchlistSet: new Set(),
  });

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Greetings cinephile! 🎬 I'm **CineBot**, your AI Film Curator powered by Groq. Ask me for recommendations in any genre, mood, or decade, and I'll handpick films for you.\n\n🛡️ **Guaranteed Fresh:** I automatically cross-reference your personal Cine-Log history so I will **never** suggest any movie already in your Watched log or Watchlist!",
      recommendedMovies: [],
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Listen for custom trigger to open CineBot from navbar or links
  useEffect(() => {
    const handleOpenTrigger = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };

    window.addEventListener('open-cinebot', handleOpenTrigger);
    return () => window.removeEventListener('open-cinebot', handleOpenTrigger);
  }, []);

  // Fetch user exclusions whenever auth changes or modal opens
  useEffect(() => {
    const loadExclusions = async () => {
      if (isAuthenticated && user?.username) {
        const data = await chatbotService.getUserExclusions(user.username);
        setExclusions(data);
      } else {
        setExclusions({
          titles: [],
          watchedCount: 0,
          watchlistCount: 0,
          watchedSet: new Set(),
          watchlistSet: new Set(),
        });
      }
    };

    loadExclusions();
  }, [user, isAuthenticated, isOpen]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        messages: [...messages, userMsg],
        excludedTitles: exclusions.titles,
        watchedSet: exclusions.watchedSet,
        watchlistSet: exclusions.watchlistSet,
      });

      const botMsg = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: response.reply,
        recommendedMovies: response.recommendedMovies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('CineBot chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content:
            "I apologize, I had trouble contacting my film database right now. Please try asking again in a moment!",
          recommendedMovies: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWatchlist = async (movie) => {
    if (!isAuthenticated) {
      alert('Please log in to add films to your Cine-Log watchlist!');
      return;
    }

    const tmdbId = movie.tmdbId || movie.id;
    try {
      await userService.toggleWatchlist({
        tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres || (movie.genreList ? movie.genreList.join(', ') : ''),
        voteAverage: movie.voteAverage,
      });

      setAddedWatchlistIds((prev) => new Set(prev).add(tmdbId));

      // Dynamically add to local exclusions so CineBot knows right away
      if (movie.title) {
        setExclusions((prev) => {
          const updatedTitles = [...prev.titles, movie.title];
          const updatedSet = new Set(prev.watchlistSet);
          updatedSet.add(movie.title.toLowerCase().replace(/[^a-z0-9]/g, '').trim());
          return {
            ...prev,
            titles: updatedTitles,
            watchlistCount: prev.watchlistCount + 1,
            watchlistSet: updatedSet,
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle watchlist from CineBot:', err);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          "Conversation cleared! 🎬 What genre, vibe, or film style would you like to explore next?",
        recommendedMovies: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const totalExcluded = exclusions.watchedCount + exclusions.watchlistCount;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="cinebot-fab"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          title="Ask CineBot AI for personalized movie suggestions"
          aria-label="Open CineBot AI Film Curator"
        >
          <div className="cinebot-fab-pulse">
            <Sparkles size={18} color="var(--yellow-butter)" />
          </div>
          <span>CineBot AI</span>
          {totalExcluded > 0 && (
            <span
              style={{
                background: 'rgba(230, 35, 46, 0.85)',
                color: '#fff',
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              🛡️ {totalExcluded}
            </span>
          )}
        </button>
      )}

      {/* Slide-Up Chat Drawer */}
      {isOpen && (
        <div className="cinebot-drawer" role="dialog" aria-modal="true" aria-label="CineBot AI Film Curator">
          {/* Header */}
          <div className="cinebot-header">
            <div className="cinebot-header-left">
              <div className="cinebot-avatar">
                <Bot size={22} />
                <span className="cinebot-avatar-status" />
              </div>
              <div>
                <h3 className="cinebot-header-title">CineBot AI</h3>
                <span className="cinebot-header-subtitle">
                  <Sparkles size={11} color="var(--yellow-butter)" /> Film Curator • Groq AI
                </span>
              </div>
            </div>

            <div className="cinebot-header-actions">
              <button
                className="cinebot-btn-icon"
                onClick={handleClearChat}
                title="Restart conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="cinebot-btn-icon"
                onClick={() => setIsOpen(false)}
                title="Close CineBot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Exclusions Bar & Protection Badge */}
          <div className="cinebot-exclusions-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#34d399" />
              <span>Smart Exclusion Guard:</span>
            </div>
            {isAuthenticated ? (
              <div
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setShowExclusionTooltip((prev) => !prev)}
              >
                <span className="cinebot-exclusion-tag" title="Click for details">
                  🛡️ {totalExcluded} Films Excluded
                  <Info size={11} />
                </span>

                {showExclusionTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '24px',
                      background: 'var(--bg-marine-surface)',
                      border: '1px solid var(--border-marine-light)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      width: '260px',
                      zIndex: 10,
                      boxShadow: 'var(--shadow-lg)',
                      fontSize: '0.72rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <p style={{ fontWeight: 700, color: 'var(--yellow-butter)', marginBottom: '4px' }}>
                      Zero Overlap Guarantee
                    </p>
                    <p>
                      • <strong>{exclusions.watchedCount}</strong> watched films excluded
                    </p>
                    <p>
                      • <strong>{exclusions.watchlistCount}</strong> watchlist films excluded
                    </p>
                    <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                      CineBot will never suggest any movie you have already logged or bookmarked.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                <Link to="/login" style={{ color: 'var(--yellow-butter)', textDecoration: 'underline' }}>
                  Log in
                </Link>{' '}
                to exclude watched films
              </span>
            )}
          </div>

          {/* Quick Genre Chips */}
          <div style={{ padding: '8px 16px 0 16px', borderBottom: '1px solid rgba(31, 59, 97, 0.4)' }}>
            <div className="cinebot-chip-tray">
              {GENRE_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  className="cinebot-chip"
                  onClick={() => handleSend(chip.prompt)}
                  disabled={loading}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="cinebot-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`cinebot-row ${
                  msg.role === 'user' ? 'cinebot-row-user' : 'cinebot-row-bot'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'var(--bg-marine-card)',
                      border: '1px solid var(--border-marine)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  >
                    <Film size={14} color="var(--yellow-butter)" />
                  </div>
                )}

                <div
                  className={
                    msg.role === 'user' ? 'cinebot-bubble-user' : 'cinebot-bubble-bot'
                  }
                >
                  {/* Message Text with simple formatting */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content.split('\n').map((paragraph, pIdx) => {
                      if (!paragraph.trim()) return <div key={pIdx} style={{ height: '8px' }} />;

                      // Render bold titles with yellow emphasis
                      const parts = paragraph.split(/(\*\*[^*]+?\*\*)/g);
                      return (
                        <p key={pIdx}>
                          {parts.map((part, partIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={partIdx}>
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Enriched Recommended Movie Cards Grid */}
                  {msg.recommendedMovies && msg.recommendedMovies.length > 0 && (
                    <div className="cinebot-cards-grid">
                      {msg.recommendedMovies.map((movie) => {
                        const tmdbId = movie.tmdbId || movie.id;
                        const posterUrl = movie.posterPath
                          ? movie.posterPath.startsWith('http')
                            ? movie.posterPath
                            : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                          : null;
                        const year =
                          movie.releaseYear ||
                          (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '');
                        const inWatchlist =
                          addedWatchlistIds.has(tmdbId) || movie.inWatchlist;

                        return (
                          <div key={tmdbId} className="cinebot-mini-card">
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={movie.title}
                                className="cinebot-mini-poster"
                                loading="lazy"
                              />
                            ) : (
                              <div className="cinebot-mini-poster-placeholder">
                                <Film size={24} />
                              </div>
                            )}

                            <div className="cinebot-mini-content">
                              <span className="cinebot-mini-title" title={movie.title}>
                                {movie.title}
                              </span>
                              <div className="cinebot-mini-meta">
                                <span>{year || '—'}</span>
                                {movie.voteAverage ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--yellow-butter)', fontWeight: 600 }}>
                                    <Star size={11} fill="currentColor" />
                                    {Number(movie.voteAverage).toFixed(1)}
                                  </span>
                                ) : null}
                              </div>

                              <div className="cinebot-mini-actions">
                                <Link
                                  to={`/movie/${tmdbId}`}
                                  className="cinebot-mini-btn cinebot-mini-btn-details"
                                  onClick={() => setIsOpen(false)}
                                >
                                  View
                                </Link>
                                <button
                                  className={`cinebot-mini-btn cinebot-mini-btn-watchlist ${
                                    inWatchlist ? 'in-watchlist' : ''
                                  }`}
                                  onClick={() => handleAddWatchlist(movie)}
                                  title={
                                    inWatchlist
                                      ? 'In your watchlist'
                                      : 'Add to Cine-Log Watchlist'
                                  }
                                >
                                  {inWatchlist ? (
                                    <>
                                      <Check size={11} /> Saved
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark size={11} /> +Watch
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.65rem',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-dim)',
                      textAlign: 'right',
                      marginTop: '6px',
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="cinebot-row cinebot-row-bot">
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'var(--bg-marine-card)',
                    border: '1px solid var(--border-marine)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                >
                  <Film size={14} color="var(--yellow-butter)" />
                </div>
                <div className="cinebot-typing">
                  <div className="cinebot-typing-dot" />
                  <div className="cinebot-typing-dot" />
                  <div className="cinebot-typing-dot" />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginLeft: '6px',
                    }}
                  >
                    CineBot is curating recommendations...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            className="cinebot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="cinebot-input-row">
              <input
                ref={inputRef}
                type="text"
                className="cinebot-input-field"
                placeholder="Ask for movies by genre, mood, decade..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="cinebot-send-btn"
                disabled={!input.trim() || loading}
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="cinebot-footer-hint">
              Powered by Groq LLaMA / GPT OSS • Zero Watchlist & Watched Overlap
            </div>
          </form>
        </div>
      )}
    </>
  );
};
