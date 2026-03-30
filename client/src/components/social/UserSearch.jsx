import React, { useState } from 'react';

const UserSearch = ({ onSelect, currentUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
  if (!query.trim()) return;
  
  setLoading(true);
  try {
    
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/search?query=${query}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    
    
    if (Array.isArray(data)) {
      const filtered = data.filter(u => u.id !== currentUser?.id);
      setResults(filtered);
    } else {
      console.error('Не массив:', data);
      setResults([]);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    setLoading(false);
  }
};

    return (
    <div style={{
      background: '#f5f5f5',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '15px' }}>🔍 Поиск пользователей</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && search()}
          placeholder="Введите имя..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'Найти'}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h4>Результаты:</h4>
          {results.map(user => (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              style={{
                padding: '10px',
                background: 'white',
                borderRadius: '5px',
                marginBottom: '5px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{user.username}</span>
              <button style={{
                padding: '5px 10px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px'
              }}>
                Добавить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
