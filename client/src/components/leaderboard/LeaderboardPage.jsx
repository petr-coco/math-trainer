import React, { useState, useEffect } from 'react';
import './LeaderboardPage.css';

const LeaderboardPage = ({ setCurrentPage, setViewingUser }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      
      setLeaders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки лидеров:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = (user) => {
    setViewingUser(user);
    setCurrentPage('user-profile');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  const totalPlayers = leaders.length;
  const totalGames = leaders.reduce((sum, p) => sum + (p.games_played || 0), 0);
  const totalScore = leaders.reduce((sum, p) => sum + (p.total_score || 0), 0);

  return (
    <div className="leaderboard-container">
      {/* Шапка */}
      <div className="page-header">
        <h1>
          <span>🏆</span>
          Таблица лидеров
        </h1>
        {leaders.length > 0 && (
          <div className="header-stats">
            <span>👥 {totalPlayers}</span>
            <span>🎮 {totalGames}</span>
            <span>⭐ {totalScore}</span>
          </div>
        )}
      </div>

      {/* Список лидеров */}
      {leaders.length === 0 ? (
        <div className="empty-state">
          <p>Пока нет данных</p>
          <span>Сыграйте в игру, чтобы появиться в таблице</span>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaders.map((player, index) => (
            <div 
              key={player.id || index} 
              className={`leaderboard-item ${index < 3 ? `top-${index + 1}` : ''}`}
              onClick={() => viewProfile(player)}
            >
              <div className="rank">{index + 1}</div>
              <div className="player-info">
                <span className="player-name">{player.username}</span>
                <div className="player-stats">
                  <span>⭐ {player.total_score || 0}</span>
                  <span>🎮 {player.games_played || 0}</span>
                </div>
              </div>
              {index === 0 && <span className="crown">👑</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
