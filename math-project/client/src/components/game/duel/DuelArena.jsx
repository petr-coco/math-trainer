import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import '../GamePage.css';

const DuelArena = ({ botId, onEndGame }) => {
  const { user } = useAuth();
  
  const bots = {
    rookie: { name: 'Новичок', speed: 2000, accuracy: 0.6, avatar: '🤖' },
    experienced: { name: 'Опытный', speed: 1200, accuracy: 0.8, avatar: '⚙️' },
    master: { name: 'Мастер', speed: 800, accuracy: 0.95, avatar: '🧠' },
    champion: { name: 'Чемпион', speed: 400, accuracy: 0.99, avatar: '👑' }
  };
  
  const bot = bots[botId] || bots.rookie;
  
  const [question, setQuestion] = useState({ text: '5 + 3', answer: 8 });
  const [userAnswer, setUserAnswer] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [roundActive, setRoundActive] = useState(true);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const inputRef = useRef(null);
  
  // Таймер для бота
  useEffect(() => {
    if (!roundActive || loading || roundResult) return;
    
    const botTimer = setTimeout(() => {
      if (!roundResult && roundActive) {
        const isCorrect = Math.random() < bot.accuracy;
        
        setRoundResult('bot');
        
        if (isCorrect) {
          setBotScore(prev => prev + 10);
          setMessage(`🤖 Бот ответил правильно! +10`);
          setMessageType('error');
        } else {
          setMessage(`🤖 Бот ошибся`);
          setMessageType('warning');
        }
        
        setRoundActive(false);
      }
    }, bot.speed);
    
    return () => clearTimeout(botTimer);
  }, [roundActive, loading, roundResult, bot.speed, bot.accuracy]);
  
  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setRoundResult(null);
    setRoundActive(true);
    setUserAnswer('');
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/game/question/duel`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      
      if (data && data.question && data.answer !== undefined) {
        setQuestion({
          text: data.question,
          answer: data.answer
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки вопроса:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const checkAnswer = () => {
    if (!roundActive || loading || roundResult) return;
    
    const userAnswerNum = parseInt(userAnswer);
    if (isNaN(userAnswerNum)) {
      setMessage('Введите число!');
      setMessageType('warning');
      setTimeout(() => setMessage(''), 1000);
      return;
    }
    
    const isCorrect = userAnswerNum === question.answer;
    
    setRoundResult('player');
    setRoundActive(false);
    
    if (isCorrect) {
      setPlayerScore(prev => prev + 10);
      setMessage(`✅ +10 очков!`);
      setMessageType('success');
    } else {
      setMessage(`❌ Правильно: ${question.answer}`);
      setMessageType('error');
    }
  };
  
  const endGame = useCallback(async () => {
    if (gameOver) return;
    const won = playerScore > botScore;
    setWinner(won ? 'player' : 'bot');
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
          mode: 'duel',
          score: playerScore,
          correct: Math.floor(playerScore / 10),
          total: round - 1
        })
      });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [gameOver, playerScore, botScore, user, round]);
  
  // Переход к следующему раунду
  useEffect(() => {
    if (!roundActive && roundResult) {
      const timer = setTimeout(() => {
        if (round >= 10 || playerScore >= 100 || botScore >= 100) {
          endGame();
        } else {
          setRound(prev => prev + 1);
          fetchQuestion();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [roundActive, roundResult, round, playerScore, botScore, endGame, fetchQuestion]);
  
  useEffect(() => {
    fetchQuestion();
  }, []);
  
  useEffect(() => {
    if (!loading && !gameOver && roundActive && !roundResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question, loading, gameOver, roundActive, roundResult]);
  
  if (gameOver) {
    return (
      <div className="gameover-screen">
        <h2 className="gameover-title">
          {winner === 'player' ? '🏆 ПОБЕДА!' : '💔 ПОРАЖЕНИЕ'}
        </h2>
        <div className="gameover-score">
          {playerScore} : {botScore}
        </div>
        <div className="gameover-stats">
          <div className="gameover-stat">
            <div className="gameover-stat-value">{round - 1}</div>
            <div className="gameover-stat-label">Раундов</div>
          </div>
        </div>
        <button className="gameover-btn" onClick={onEndGame}>
          В меню
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-stats">
          <div className="stats-group">
            <div className="stat-item">
              <div className="stat-value">👤 {playerScore}</div>
              <div className="stat-label">Ты</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">🤖 {botScore}</div>
              <div className="stat-label">{bot.name}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">⚔️ {round}</div>
              <div className="stat-label">Раунд</div>
            </div>
          </div>
          
          <button className="end-game-btn" onClick={endGame}>
            ✖ Выйти
          </button>
        </div>
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
            disabled={loading || !roundActive || roundResult !== null}
            autoFocus
          />
          <button
            className="submit-btn"
            onClick={checkAnswer}
            disabled={loading || !roundActive || roundResult !== null}
          >
            ✅
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

export default DuelArena;
