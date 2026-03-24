import React from 'react';

const Navigation = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'trophies', label: '🏆 Трофеи', icon: '🏆' },
    { id: 'menu', label: '🎮 Игры', icon: '🎮' },
    { id: 'stats', label: '📊 Статистика', icon: '📊' },
    { id: 'leaderboard', label: '🏆 Лидеры', icon: '🏆' },
    { id: 'friends', label: '👥 Друзья', icon: '👥' },
    { id: 'profile', label: '⚙️ Профиль', icon: '⚙️' }
  ];

  return (
    <nav style={styles.nav}>
      {menuItems.map(item => (
        <button
          key={item.id}
          style={{
            ...styles.navBtn,
            ...(currentPage === item.id ? styles.navBtnActive : {})
          }}
          onClick={() => setCurrentPage(item.id)}
        >
          <span style={styles.navIcon}>{item.icon}</span>
          <span style={styles.navLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    background: 'white',
    borderBottom: '1px solid #e0e0e0'
  },
  navBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#666',
    transition: 'all 0.3s'
  },
  navBtnActive: {
    background: '#667eea',
    color: 'white'
  },
  navIcon: {
    fontSize: '20px'
  },
  navLabel: {
    fontSize: '12px'
  }
};

export default Navigation;
