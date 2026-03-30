import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ setCurrentPage }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('auth');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '30px',
      padding: '15px 25px',
      background: '#1a2634',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
        onClick={() => setCurrentPage('menu')}
      >
        <span style={{ fontSize: '24px' }}>🧮</span>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 500,
          margin: 0,
          color: '#ffffff',
          letterSpacing: '0.5px'
        }}>
          MathTrainer
        </h1>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{
          padding: '6px 16px',
          background: '#2c3e50',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#ffffff',
          border: '1px solid #3a4a5a'
        }}>
          {user?.username}
        </span>
        
        {user?.isGuest && (
          <span style={{
            padding: '4px 12px',
            background: '#f39c12',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#1a2634'
          }}>
            Гость
          </span>
        )}

        <button
          onClick={handleLogout}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #3a4a5a',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2c3e50'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;
