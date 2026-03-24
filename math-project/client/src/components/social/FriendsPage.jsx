import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './FriendsPage.css';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [message, setMessage] = useState({ text: '', type: '' });
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Загружаем друзей
      const friendsRes = await fetch(`/api/friends/list/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const friendsData = await friendsRes.json();
      setFriends(Array.isArray(friendsData) ? friendsData : []);
    } catch (error) {
      console.error('Ошибка загрузки друзей:', error);
    }

    try {
      // Загружаем входящие заявки
      const incomingRes = await fetch(`/api/friends/requests/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const incomingData = await incomingRes.json();
      setIncomingRequests(Array.isArray(incomingData) ? incomingData : []);
    } catch (error) {
      console.error('Ошибка загрузки входящих заявок:', error);
    }

    try {
      // Загружаем отправленные заявки
      const outgoingRes = await fetch(`/api/friends/outgoing/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const outgoingData = await outgoingRes.json();
      setOutgoingRequests(Array.isArray(outgoingData) ? outgoingData : []);
    } catch (error) {
      console.error('Ошибка загрузки отправленных заявок:', error);
    }
    
    setLoading(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/search?query=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Фильтруем: убираем себя, друзей и тех, кому уже отправили
      const filtered = data.filter(u => {
        if (u.id === user.id) return false;
        if (friends.some(f => f.id === u.id)) return false;
        if (outgoingRequests.some(r => r.toId === u.id)) return false;
        return true;
      });
      
      setSearchResults(filtered);
      
      if (filtered.length === 0 && data.length > 0) {
        showMessage('Пользователь уже в друзьях или заявка отправлена', 'info');
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  const sendRequest = async (friendName) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, friendName })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showMessage('✅ Заявка отправлена', 'success');
        setSearchQuery('');
        setSearchResults([]);
        // Перезагружаем отправленные заявки
        const outgoingRes = await fetch(`/api/friends/outgoing/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const outgoingData = await outgoingRes.json();
        setOutgoingRequests(Array.isArray(outgoingData) ? outgoingData : []);
      } else {
        showMessage(data.error || '❌ Ошибка', 'error');
      }
    } catch (error) {
      showMessage('❌ Ошибка отправки заявки', 'error');
    }
  };

  const acceptRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        showMessage('✅ Заявка принята', 'success');
        loadData(); // Перезагружаем всё
      }
    } catch (error) {
      showMessage('❌ Ошибка принятия заявки', 'error');
    }
  };

  const removeFriend = async (friendId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/friends/${user.id}/${friendId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        showMessage('✅ Друг удалён', 'success');
        // Перезагружаем друзей
        const friendsRes = await fetch(`/api/friends/list/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const friendsData = await friendsRes.json();
        setFriends(Array.isArray(friendsData) ? friendsData : []);
      }
    } catch (error) {
      showMessage('❌ Ошибка удаления друга', 'error');
    }
  };

  if (loading) {
    return (
      <div className="friends-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="friends-container">
      {/* Шапка */}
      <div className="friends-header">
        <h1>👥 Друзья</h1>
        {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
          <span className="requests-badge">
            {incomingRequests.length + outgoingRequests.length}
          </span>
        )}
      </div>

      {/* Сообщения */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Поиск */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Найти</button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(user => (
              <div key={user.id} className="search-item">
                <span>{user.username}</span>
                <button onClick={() => sendRequest(user.username)}>
                  Добавить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Табы */}
      <div className="friends-tabs">
        <button
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👥 Мои друзья ({friends.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          📨 Входящие {incomingRequests.length > 0 && `(${incomingRequests.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          📤 Отправленные {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
        </button>
      </div>

      {/* Мои друзья */}
      {activeTab === 'friends' && (
        <div className="friends-list">
          {friends.length === 0 ? (
            <div className="empty-state">
              <p>У вас пока нет друзей</p>
              <span>Найдите пользователей и добавьте в друзья</span>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <span className="friend-name">{friend.username}</span>
                <button 
                  className="remove-btn"
                  onClick={() => removeFriend(friend.id)}
                >
                  Удалить
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Входящие заявки */}
      {activeTab === 'incoming' && (
        <div className="requests-list">
          {incomingRequests.length === 0 ? (
            <div className="empty-state">
              <p>Нет входящих заявок</p>
            </div>
          ) : (
            incomingRequests.map(request => (
              <div key={request.id} className="request-item">
                <span>{request.fromName}</span>
                <button 
                  className="accept-btn"
                  onClick={() => acceptRequest(request.id)}
                >
                  Принять
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Отправленные заявки */}
      {activeTab === 'outgoing' && (
        <div className="requests-list">
          {outgoingRequests.length === 0 ? (
            <div className="empty-state">
              <p>Нет отправленных заявок</p>
            </div>
          ) : (
            outgoingRequests.map(request => (
              <div key={request.id} className="request-item outgoing">
                <span>{request.toName}</span>
                <span className="pending-status">Ожидает ответа</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
