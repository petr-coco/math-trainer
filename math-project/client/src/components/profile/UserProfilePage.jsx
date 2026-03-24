import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';

const UserProfilePage = ({ user, setCurrentPage }) => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setCurrentPage('leaderboard');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const statsRes = await fetch(`/api/game/stats/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData.stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }

    try {
      const trophiesRes = await fetch(`/api/trophies/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const trophiesData = await trophiesRes.json();
      setTrophies(trophiesData);
    } catch (error) {
      console.error('Ошибка загрузки трофеев:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId: currentUser.id, 
          friendName: user.username 
        })
      });
      
      if (res.ok) {
        setMessage('✅ Заявка отправлена');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Ошибка');
      setTimeout(() => setMessage(''), 3000);
    }
  };

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
    <div className="profile-container">
      {/* Шапка */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => setCurrentPage('leaderboard')}>
          ← Назад
        </button>
        <div className="user-info">
          <h2 className="username">{user?.username}</h2>
          <p className="user-id">ID: {user?.id}</p>
        </div>
        {currentUser.id !== user.id && (
          <button className="add-friend-btn" onClick={addFriend}>
            + В друзья
          </button>
        )}
      </div>

      {/* Сообщение */}
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Статистика */}
      <div className="stats-section">
        <h3 className="section-title">Статистика</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">⭐ {stats?.score || 0}</div>
            <div className="stat-label">Очки</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">🎮 {stats?.games || 0}</div>
            <div className="stat-label">Игр</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">✅ {stats?.correct || 0}/{stats?.total || 0}</div>
            <div className="stat-label">Правильно</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Точность</div>
          </div>
        </div>
      </div>

      {/* Трофеи */}
      <div className="trophies-section">
        <h3 className="section-title">Трофеи</h3>
        {trophies.length === 0 ? (
          <div className="empty-trophies">
            <p>У пользователя пока нет трофеев</p>
          </div>
        ) : (
          <div className="trophies-grid">
            {trophies.map((trophy, index) => (
              <div key={index} className="trophy-card">
                <span className="trophy-icon">🏆</span>
                <span className="trophy-name">{trophy.trophy_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
