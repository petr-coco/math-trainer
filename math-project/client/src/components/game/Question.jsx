import React, { memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Question = memo(({ question, userAnswer, setUserAnswer, onCheck, inputRef, loading }) => {
  const { currentColors } = useTheme();
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      onCheck();
    }
  };
  
  const questionText = question?.text || '5 + 3';
  const displayText = questionText.replace('*', '×').replace('/', '÷');
  
  const styles = {
    container: {
      textAlign: 'center',
      padding: '40px',
      background: currentColors.surface,
      borderRadius: '24px',
      border: `1px solid ${currentColors.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    question: {
      fontSize: '72px',
      fontWeight: 'bold',
      marginBottom: '40px',
      color: currentColors.text,
      letterSpacing: '4px'
    },
    inputArea: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    },
    input: {
      fontSize: '48px',
      padding: '15px 25px',
      width: '200px',
      textAlign: 'center',
      border: `2px solid ${currentColors.border}`,
      borderRadius: '16px',
      background: currentColors.background,
      color: currentColors.text,
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      fontSize: '32px',
      padding: '15px 40px',
      background: currentColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1,
      transition: 'transform 0.2s'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.question}>
        {displayText} = ?
      </div>
      
      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
          placeholder="?"
          disabled={loading}
          autoFocus
        />
        
        <button
          onClick={onCheck}
          style={styles.button}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? '...' : '✅'}
        </button>
      </div>
    </div>
  );
});

export default Question;
