import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const SprintGame = ({ onEndGame }) => {
  const { user } = useAuth();
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [op, setOp] = useState('+');
  const [answer, setAnswer] = useState(8);
  const [input, setInput] = useState('');

  const generateProblem = () => {
    const max = 5 + level * 2;
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * max) + 2;
    const ops = level < 3 ? ['+'] : level < 6 ? ['+', '-'] : ['+', '-', '×'];
    const operator = ops[Math.floor(Math.random() * ops.length)];
    
    let res;
    if (operator === '+') res = a + b;
    if (operator === '-') res = a - b;
    if (operator === '×') res = a * b;
    
    setNum1(a);
    setNum2(b);
    setOp(operator);
    setAnswer(res);
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) {
      saveGameResult();
    }
  }, [gameOver]);

  const saveGameResult = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    try {
      await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          gameType: 'sprint',
          score: score,
          level: level,
          correct: correct,
          total: total
        })
      });
      window.dispatchEvent(new Event('statsUpdated'));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const checkAnswer = () => {
    if (gameOver) return;
    
    const isCorrect = parseInt(input) === answer;
    
    if (isCorrect) {
      setScore(score + 10 * level);
      setCorrect(correct + 1);
    }
    
    setTotal(total + 1);
    setInput('');
    generateProblem();
    
    if (total > 0 && total % 5 === 0) {
      setLevel(level + 1);
    }
  };

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      marginBottom: '40px'
    },
    statBox: {
      background: '#f5f5f5',
      padding: '15px',
      borderRadius: '10px',
      textAlign: 'center'
    },
    timer: {
      fontSize: '48px',
      textAlign: 'center',
      color: timeLeft < 10 ? '#f44336' : '#2196F3',
      marginBottom: '40px'
    },
    question: {
      fontSize: '72px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '40px'
    },
    inputArea: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      marginBottom: '40px'
    },
    input: {
      fontSize: '32px',
      padding: '15px',
      width: '200px',
      textAlign: 'center',
      border: '2px solid #2196F3',
      borderRadius: '10px'
    },
    button: {
      fontSize: '32px',
      padding: '15px 30px',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
    },
    gameOver: {
      textAlign: 'center',
      padding: '40px'
    }
  };

  if (gameOver) {
    return (
      <div style={styles.container}>
        <div style={styles.gameOver}>
          <h2>⏱️ Игра окончена!</h2>
          <p>Счет: {score}</p>
          <p>Уровень: {level}</p>
          <p>Точность: {accuracy}%</p>
          <button 
            onClick={onEndGame}
            style={{
              padding: '15px 30px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            В меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.statBox}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{score}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Очки</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{level}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Уровень</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{correct}/{total}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Правильно</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{accuracy}%</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Точность</div>
        </div>
      </div>

      <div style={styles.timer}>
        ⏱️ {timeLeft}с
      </div>

      <div style={styles.question}>
        {num1} {op} {num2} = ?
      </div>

      <div style={styles.inputArea}>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          autoFocus
        />
        <button style={styles.button} onClick={checkAnswer}>
          ✅
        </button>
      </div>
    </div>
  );
};

export default SprintGame;
