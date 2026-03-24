import React, { useState, useEffect } from 'react';

const TowerGame = ({ onEndGame }) => {
  const [floor, setFloor] = useState(1);
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [op, setOp] = useState('+');
  const [answer, setAnswer] = useState(8);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  // Цвет этажа (чем выше, тем светлее)
  const getFloorColor = () => {
    const colors = [
      '#4CAF50', // 1-5
      '#FF9800', // 6-10
      '#f44336', // 11-15
      '#9C27B0', // 16-20
      '#FFD700'  // 21+
    ];
    const index = Math.min(Math.floor((floor - 1) / 5), colors.length - 1);
    return colors[index];
  };

  const generateProblem = () => {
    const max = 3 + Math.floor(floor / 2);
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * max) + 2;
    const ops = floor < 3 ? ['+'] : floor < 6 ? ['+', '-'] : ['+', '-', '×'];
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
  }, [floor]);

  const checkAnswer = () => {
    if (parseInt(input) === answer) {
      setFloor(floor + 1);
      setScore(score + 10 * floor);
      setMessage(`+${10 * floor} ⭐`);
    } else {
      setMessage('❌');
    }
    setInput('');
    generateProblem();
    setTimeout(() => setMessage(''), 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '20px',
      fontFamily: 'Arial',
      transition: 'background 0.3s'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Шапка */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px',
          padding: '20px',
          background: '#2a2a2a',
          borderRadius: '15px',
          border: `2px solid ${getFloorColor()}`
        }}>
          <div>
            <div style={{ color: '#888', fontSize: '14px' }}>ЭТАЖ</div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              color: getFloorColor()
            }}>
              {floor}
            </div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '14px' }}>СЧЕТ</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
              {score}
            </div>
          </div>
        </div>

        {/* Пример */}
        <div style={{
          background: '#2a2a2a',
          padding: '60px 20px',
          borderRadius: '15px',
          border: `2px solid ${getFloorColor()}`,
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: getFloorColor(),
            textShadow: `0 0 20px ${getFloorColor()}80`
          }}>
            {num1} {op} {num2} = ?
          </div>
        </div>

        {/* Ввод */}
        <div style={{
          background: '#2a2a2a',
          padding: '30px',
          borderRadius: '15px',
          border: `2px solid ${getFloorColor()}`
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '20px',
                fontSize: '24px',
                background: '#1a1a1a',
                border: `2px solid ${getFloorColor()}`,
                borderRadius: '10px',
                color: '#fff',
                textAlign: 'center',
                outline: 'none'
              }}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              autoFocus
            />
            <button
              onClick={checkAnswer}
              style={{
                padding: '20px 40px',
                fontSize: '24px',
                background: getFloorColor(),
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ВВЕРХ
            </button>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={onEndGame}
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 30px',
            background: '#2a2a2a',
            color: '#888',
            border: `1px solid ${getFloorColor()}`,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>

        {/* Сообщение */}
        {message && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: message.includes('+') ? getFloorColor() : '#f44336',
            zIndex: 100,
            animation: 'pop 0.8s forwards'
          }}>
            {message}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }
      `}</style>
    </div>
  );
};

export default TowerGame;
