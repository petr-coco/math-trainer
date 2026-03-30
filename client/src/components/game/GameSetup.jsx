import React, { useState } from 'react';
import './GameSetup.css';

const GameSetup = ({ mode, onStart, onBack }) => {
  const [difficulty, setDifficulty] = useState('rookie');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  
  const gameConfigs = {
    tower: {
      title: '🏰 Башня',
      description: 'Строй башню, решая примеры. Чем выше этаж, тем сложнее!',
      difficulties: [
        { id: 'easy', name: 'Лёгкая', desc: 'Только сложение' },
        { id: 'normal', name: 'Средняя', desc: 'Сложение и вычитание' },
        { id: 'hard', name: 'Сложная', desc: 'Все операции' }
      ]
    },
    sprint: {
      title: '⚡ Спринт',
      description: 'Решай примеры на скорость. У тебя ограниченное время!',
      difficulties: [
        { id: 'easy', name: '60 сек', desc: '60 секунд', time: 60 },
        { id: 'normal', name: '45 сек', desc: '45 секунд', time: 45 },
        { id: 'hard', name: '30 сек', desc: '30 секунд', time: 30 }
      ]
    },
    duel: {
      title: '⚔️ Дуэль',
      description: 'Сразись с ботом. Кто быстрее и правильнее?',
      difficulties: [
        { id: 'rookie', name: '🤖 Новичок', desc: 'Медленный, часто ошибается', speed: 3000, accuracy: 0.6 },
        { id: 'experienced', name: '⚙️ Опытный', desc: 'Средняя скорость', speed: 2000, accuracy: 0.8 },
        { id: 'master', name: '🧠 Мастер', desc: 'Быстрый, редко ошибается', speed: 1200, accuracy: 0.95 },
        { id: 'champion', name: '👑 Чемпион', desc: 'Молниеносный, почти идеальный', speed: 600, accuracy: 0.99 }
      ]
    }
  };
  
  const config = gameConfigs[mode];
  
  const handleStart = () => {
    const settings = {
      mode,
      difficulty,
      ...(mode === 'sprint' && { timeLimit }),
      ...(mode === 'tower' && { questionsCount }),
      ...(mode === 'duel' && { botId: difficulty })
    };
    onStart(settings);
  };
  
  return (
    <div className="game-setup-container">
      <div className="setup-header">
        <h2 className="setup-title">{config.title}</h2>
        <p className="setup-desc">{config.description}</p>
      </div>
      
      <div className="setup-card">
        <div className="setup-card-title">
          <span>🎮</span> Настройки игры
        </div>
        
        {mode === 'tower' && (
          <>
            <div className="setup-card-title">📊 Сложность</div>
            <div className="options-grid">
              {config.difficulties.map(diff => (
                <div
                  key={diff.id}
                  className={`option-btn ${difficulty === diff.id ? 'selected' : ''}`}
                  onClick={() => setDifficulty(diff.id)}
                >
                  <div className="option-name">{diff.name}</div>
                  <div className="option-desc">{diff.desc}</div>
                </div>
              ))}
            </div>
            
            <div className="slider-container">
              <div className="slider-label">🎯 Количество вопросов</div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                className="slider"
              />
              <div className="slider-value">{questionsCount} вопросов</div>
            </div>
          </>
        )}
        
        {mode === 'sprint' && (
          <>
            <div className="setup-card-title">⏱️ Время на игру</div>
            <div className="options-grid">
              {config.difficulties.map(diff => (
                <div
                  key={diff.id}
                  className={`option-btn ${difficulty === diff.id ? 'selected' : ''}`}
                  onClick={() => {
                    setDifficulty(diff.id);
                    setTimeLimit(diff.time);
                  }}
                >
                  <div className="option-name">{diff.name}</div>
                  <div className="option-desc">{diff.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {mode === 'duel' && (
          <>
            <div className="setup-card-title">🤖 Выбери противника</div>
            <div className="options-grid">
              {config.difficulties.map(bot => (
                <div
                  key={bot.id}
                  className={`option-btn ${difficulty === bot.id ? 'selected' : ''}`}
                  onClick={() => setDifficulty(bot.id)}
                >
                  <div className="option-name">{bot.name}</div>
                  <div className="option-desc">{bot.desc}</div>
                  <div className="option-stats">
                    ⚡ {bot.speed}ms | 🎯 {Math.round(bot.accuracy * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <button className="start-btn" onClick={handleStart}>
        🚀 Начать игру
      </button>
      
      <button className="back-btn" onClick={onBack}>
        ← Назад к играм
      </button>
    </div>
  );
};

export default GameSetup;
