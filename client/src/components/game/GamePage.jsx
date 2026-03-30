import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DuelArena from './duel/DuelArena';
import './GamePage.css';

const GamePage = ({ mode, settings, onEndGame }) => {
  
  const { user } = useAuth();
  
  const [question, setQuestion] = useState({ text: '5 + 3', answer: 8 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [timeLeft, setTimeLeft] = useState(settings?.timeLimit || 60);
  const [gameOver, setGameOver] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(settings?.questionsCount || null);
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState('');
  const inputRef = useRef(null);
  
  const difficulty = settings?.difficulty || 'normal';
  
  const getScoreMultiplier = () => {
    switch(difficulty) {
      case 'easy': return 1;
      case 'normal': return 1.5;
      case 'hard': return 2;
      default: return 1;
    }
  };
  
  const scoreMultiplier = getScoreMultiplier();
  
  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/game/question/${mode}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      
      if (data && data.question && data.answer !== undefined) {
        setQuestion({
          text: data.question,
          answer: data.answer
        });
      } else {
        setMessage('Ошибка загрузки вопроса');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Ошибка загрузки вопроса:', error);
      setMessage('Ошибка соединения');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [mode]);
  
  const endGame = useCallback(async () => {
    if (gameOver) return;
    setGameOver(true);
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          mode: mode,
          score: score,
          level: mode === 'tower' ? level : 1,
          correct: correct,
          total: total
        })
      });
      
      setTimeout(() => {
        onEndGame();
      }, 1500);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setTimeout(() => {
        onEndGame();
      }, 1500);
    }
  }, [gameOver, user, mode, score, level, correct, total, onEndGame]);
  
  useEffect(() => {
    if (mode === 'sprint' && timeLeft > 0 && !gameOver && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'sprint' && timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setTimeout(() => endGame(), 500);
    }
  }, [timeLeft, gameOver, loading, mode, endGame]);
  
  useEffect(() => {
    if (!loading && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question, loading, gameOver]);
  
  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);
  
  const triggerEffect = (type) => {
    setEffectType(type);
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 500);
  };
  
  const checkAnswer = () => {
    if (gameOver || loading) return;
    
    const userAnswerNum = parseInt(userAnswer);
    if (isNaN(userAnswerNum)) {
      setMessage('Введите число!');
      setMessageType('warning');
      setTimeout(() => setMessage(''), 1000);
      return;
    }
    
    const isCorrect = userAnswerNum === question.answer;
    const points = isCorrect ? Math.floor(10 * level * scoreMultiplier) : 0;
    const newTotal = total + 1;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newScore = score + points;
    
    setTotal(newTotal);
    setCorrect(newCorrect);
    setScore(newScore);
    
    if (isCorrect) {
      setMessage(`✅ Правильно! +${points}`);
      setMessageType('success');
      triggerEffect('correct');
      
      if (mode === 'tower') {
        setLevel(prev => prev + 1);
      } else if ((correct + 1) % 5 === 0) {
        setLevel(prev => prev + 1);
      }
    } else {
      setMessage(`❌ Неправильно. Ответ: ${question.answer}`);
      setMessageType('error');
      triggerEffect('wrong');
    }
    
    setUserAnswer('');
    
    if (mode === 'tower' && questionsLeft !== null) {
      setQuestionsLeft(prev => prev - 1);
    }
    
    if (mode === 'tower' && questionsLeft !== null && questionsLeft <= 1) {
      setTimeout(() => endGame(), 500);
    } else {
      setTimeout(() => {
        setMessage('');
        fetchQuestion();
      }, 800);
    }
  };
  
  const getGameTitle = () => {
    switch(mode) {
      case 'tower': return '🏰 Башня';
      case 'sprint': return '⚡ Спринт';
      default: return 'Игра';
    }
  };
  
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progressPercent = (total / (settings?.questionsCount || 100)) * 100;
  
  if (mode === 'duel') {
    return (
      <DuelArena 
        botId={settings?.botId || 'rookie'} 
        onEndGame={onEndGame} 
      />
    );
  }
  
  if (loading && total === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p className="loading-text">Загрузка вопроса...</p>
      </div>
    );
  }
  
  if (gameOver) {
    return (
      <div className="gameover-screen">
        <h2 className="gameover-title">🎮 Игра завершена!</h2>
        <div className="gameover-score">⭐ {score}</div>
        
        <div className="gameover-stats">
          <div className="gameover-stat">
            <div className="gameover-stat-value">{correct}/{total}</div>
            <div className="gameover-stat-label">Правильных</div>
          </div>
          <div className="gameover-stat">
            <div className="gameover-stat-value">{accuracy}%</div>
            <div className="gameover-stat-label">Точность</div>
          </div>
          {mode === 'tower' && (
            <div className="gameover-stat">
              <div className="gameover-stat-value">{level}</div>
              <div className="gameover-stat-label">Уровень</div>
            </div>
          )}
        </div>
        
        <button className="gameover-btn" onClick={endGame}>
          В меню
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      {showEffect && (
        <div className="game-effect">
          {effectType === 'correct' ? '✓' : '✗'}
        </div>
      )}
      
      <div className="game-header">
        <div className="game-stats">
          <div className="stats-group">
            <div className="stat-item">
              <div className="stat-value">⭐ {score}</div>
              <div className="stat-label">Очки</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">✅ {correct}/{total}</div>
              <div className="stat-label">Правильно</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">🎯 {accuracy}%</div>
              <div className="stat-label">Точность</div>
            </div>
            {mode === 'tower' && (
              <div className="stat-item">
                <div className="stat-value">📈 {level}</div>
                <div className="stat-label">Уровень</div>
              </div>
            )}
          </div>
          
          <div className="game-mode">
            <div className="game-mode-value">{getGameTitle()}</div>
            <div className="game-mode-label">
              {difficulty === 'easy' ? 'Лёгкая' : difficulty === 'hard' ? 'Сложная' : 'Средняя'}
            </div>
          </div>
          
          <button className="end-game-btn" onClick={endGame}>
            ✖ Завершить
          </button>
        </div>
        
        {mode === 'sprint' && (
          <div className={`timer ${timeLeft < 10 ? 'warning' : ''}`}>
            ⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
        
        {mode === 'tower' && settings?.questionsCount && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>
      
      <div className="question-card">
        <div className="question-text">{question.text} = ?</div>
        
        <div className="question-input-area">
          <input
            ref={inputRef}
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            className="question-input"
            placeholder="?"
            disabled={loading}
          />
          <button
            className="submit-btn"
            onClick={checkAnswer}
            disabled={loading}
          >
            {loading ? '...' : '✅'}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`game-message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default GamePage;
