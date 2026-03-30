import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AuthPage } from './auth/AuthPage';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import GamesMenu from './game/GamesMenu';
import GamePage from './game/GamePage';
import StatsPage from './profile/StatsPage';
import LeaderboardPage from './leaderboard/LeaderboardPage';
import FriendsPage from './social/FriendsPage';
import TrophiesPage from './trophies/TrophiesPage.jsx'
import ProfilePage from './profile/ProfilePage';
import UserProfilePage from './profile/UserProfilePage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentColors } = useTheme();
  const [currentPage, setCurrentPage] = useState('menu');
  const [viewingUser, setViewingUser] = useState(null);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        background: currentColors.primary,
        color: 'white'
      }}>
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    
    
    switch(currentPage) {
      case 'menu':
        return <GamesMenu setCurrentPage={setCurrentPage} />;
      case 'tower':
      case 'sprint':
      case 'duel':
       return <GamesMenu setCurrentPage={setCurrentPage} />;
      case 'stats':
        return <StatsPage />;
      case 'leaderboard':
        return <LeaderboardPage 
          setCurrentPage={setCurrentPage} 
          setViewingUser={setViewingUser} 
        />;
      case 'friends':
        return <FriendsPage />;
      case 'auth':
        return <GamesMenu setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} />;
      case 'trophies':
        return <TrophiesPage setCurrentPage={setCurrentPage} />;
      case 'user-profile':
        return viewingUser ? (
          <UserProfilePage 
            user={viewingUser} 
            setCurrentPage={setCurrentPage} 
          />
        ) : (
          <div>Пользователь не найден</div>
        );
      default:
        return <div>Страница в разработке</div>;
    }
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: currentColors.background,
      transition: 'background 0.3s'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px'
    }
  };

  return (
    <div style={styles.app}>
      <Header setCurrentPage={setCurrentPage} />
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main style={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
};

export default AppContent;
