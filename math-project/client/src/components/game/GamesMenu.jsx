import React, { useState } from 'react';
import GameSetup from './GameSetup';
import GamePage from './GamePage';
import './GamesMenu.css';

const GamesMenu = ({ setCurrentPage }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const games = [
    {
      id: 'tower',
      title: 'Башня',
      desc: 'Строй башню, решая примеры. Чем выше этаж, тем сложнее.',
      color: '#2c3e50',
      icon: '🏰'
    },
    {
      id: 'sprint',
      title: 'Спринт',
      desc: '60 секунд на скорость. Успей решить максимум примеров.',
      color: '#34495e',
      icon: '⚡'
    },
    {
      id: 'duel',
      title: 'Дуэль',
      desc: 'Сразись с ботом. Кто быстрее и правильнее?',
      color: '#3d566e',
      icon: '⚔️'
    }
  ];

  const handleGameSelect = (gameId) => {
    console.log('🎮 Выбрана игра:', gameId);
    setSelectedGame(gameId);
    setShowSetup(true);
  };

  const handleStartGame = (settings) => {
    console.log('🚀 Старт игры:', settings);
    setGameSettings(settings);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    console.log('🔙 Возврат в меню');
    setSelectedGame(null);
    setShowSetup(false);
    setGameStarted(false);
    setGameSettings(null);
  };

  // Если игра запущена
  if (gameStarted && selectedGame) {
    console.log('🎮 Запускаем GamePage для:', selectedGame, gameSettings);
    return (
      <GamePage 
        mode={selectedGame}
        settings={gameSettings}
        onEndGame={handleBackToMenu}
      />
    );
  }

  // Если показываем меню настройки
  if (showSetup && selectedGame) {
    console.log('⚙️ Показываем GameSetup для:', selectedGame);
    return (
      <GameSetup
        mode={selectedGame}
        onStart={handleStartGame}
        onBack={handleBackToMenu}
      />
    );
  }

  // Главное меню игр
  return (
    <div className="games-menu-container">
      <h2 className="games-title">Выберите игру</h2>

      <div className="games-grid">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="game-card"
            style={{
              background: game.color,
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => handleGameSelect(game.id)}
          >
            <div className="game-icon">{game.icon}</div>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-desc">{game.desc}</p>
            <button className="play-btn">Играть →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesMenu;
