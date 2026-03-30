import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './StatsPage.css';

const StatsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, tower, sprint, duel
  const [sortBy, setSortBy] = useState('date'); // date, score, accuracy

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/game/stats/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data.stats);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (mode) => {
    switch(mode) {
      case 'tower': return '🏰';
      case 'sprint': return '⚡';
      case 'duel': return '⚔️';
      default: return '🎮';
    }
  };

  const getGameName = (mode) => {
    switch(mode) {
      case 'tower': return 'Башня';
      case 'sprint': return 'Спринт';
      case 'duel': return 'Дуэль';
      default: return mode;
    }
  };

  const getAccuracy = (correct, total) => {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 1000) return '#ffd700';
    if (score >= 500) return '#c0c0c0';
    if (score >= 100) return '#cd7f32';
    return '#666';
  };

  // Фильтрация
  const filteredHistory = history.filter(game => {
    if (filter === 'all') return true;
    return game.mode === filter;
  });

  // Сортировка
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'accuracy') {
      const accA = getAccuracy(a.correct, a.total);
      const accB = getAccuracy(b.correct, b.total);
      return accB - accA;
    }
    return 0;
  });

  const accuracy = stats?.total > 0 
    ? Math.round((stats.correct / stats.total) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="stats-container">
      {/* Шапка */}
      <div className="stats-header">
        <h1>📊 Статистика</h1>
        <span className="player-name">{user?.username}</span>
      </div>

      {/* Карточки статистики */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">⭐ {stats?.score || 0}</span>
          <span className="stat-label">Всего очков</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">🎮 {stats?.games || 0}</span>
          <span className="stat-label">Сыграно игр</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">✅ {stats?.correct || 0}/{stats?.total || 0}</span>
          <span className="stat-label">Правильных</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Точность</span>
        </div>
        {stats?.maxTowerLevel > 0 && (
          <div className="stat-card">
            <span className="stat-value">🏰 {stats.maxTowerLevel}</span>
            <span className="stat-label">Макс. этаж</span>
          </div>
        )}
        {stats?.maxSprintScore > 0 && (
          <div className="stat-card">
            <span className="stat-value">⚡ {stats.maxSprintScore}</span>
            <span className="stat-label">Рекорд спринта</span>
          </div>
        )}
      </div>

      {/* История игр */}
      <div className="history-section">
        <div className="history-header">
          <h2 className="section-title">📜 История игр</h2>
          
          {/* Фильтры и сортировка */}
          <div className="history-controls">
            <div className="filter-group">
              <span className="filter-label">Фильтр:</span>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все игры</option>
                <option value="tower">🏰 Башня</option>
                <option value="sprint">⚡ Спринт</option>
                <option value="duel">⚔️ Дуэль</option>
              </select>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Сортировка:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">📅 По дате</option>
                <option value="score">⭐ По очкам</option>
                <option value="accuracy">🎯 По точности</option>
              </select>
            </div>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">🎮</div>
            <p>Вы ещё не играли</p>
            <span>Начните игру, чтобы увидеть историю</span>
          </div>
        ) : (
          <div className="history-table">
            <div className="table-header">
              <div className="col-mode">Режим</div>
              <div className="col-score">Очки</div>
              <div className="col-accuracy">Точность</div>
              <div className="col-result">Результат</div>
              <div className="col-date">Дата</div>
            </div>
            
            {sortedHistory.map((game, index) => {
              const gameAccuracy = getAccuracy(game.correct, game.total);
              const scoreColor = getScoreColor(game.score);
              
              return (
                <div key={index} className="table-row">
                  <div className="col-mode">
                    <span className="game-icon">{getGameIcon(game.mode)}</span>
                    <span className="game-name">{getGameName(game.mode)}</span>
                    {game.level > 1 && (
                      <span className="game-level">lvl {game.level}</span>
                    )}
                  </div>
                  <div className="col-score" style={{ color: scoreColor, fontWeight: 'bold' }}>
                    ⭐ {game.score}
                  </div>
                  <div className="col-accuracy">
                    <div className="accuracy-bar">
                      <div 
                        className="accuracy-fill" 
                        style={{ width: `${gameAccuracy}%` }}
                      />
                      <span className="accuracy-text">{gameAccuracy}%</span>
                    </div>
                  </div>
                  <div className="col-result">
                    <span className="result-correct">✅ {game.correct}</span>
                    <span className="result-total">/ {game.total}</span>
                  </div>
                  <div className="col-date">
                    {new Date(game.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
