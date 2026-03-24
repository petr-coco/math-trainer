import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSettings = () => {
  const { theme, themes, changeTheme, currentColors } = useTheme();

  const styles = {
    container: {
      padding: '20px'
    },
    title: {
      fontSize: '18px',
      marginBottom: '20px',
      color: currentColors.text
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px'
    },
    themeCard: {
      padding: '20px',
      borderRadius: '15px',
      cursor: 'pointer',
      border: `2px solid ${currentColors.border}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      textAlign: 'center'
    },
    themeName: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: currentColors.text
    },
    preview: {
      display: 'flex',
      gap: '5px',
      justifyContent: 'center',
      marginTop: '10px'
    },
    colorDot: {
      width: '20px',
      height: '20px',
      borderRadius: '50%'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🎨 Тема оформления</h3>
      <div style={styles.grid}>
        {Object.entries(themes).map(([themeKey, themeValue]) => (
          <div
            key={themeKey}
            style={{
              ...styles.themeCard,
              background: themeValue.colors.surface,
              border: theme === themeKey ? `2px solid ${themeValue.colors.primary}` : `2px solid ${themeValue.colors.border}`
            }}
            onClick={() => changeTheme(themeKey)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={styles.themeName}>{themeValue.name}</div>
            <div style={styles.preview}>
              <div style={{...styles.colorDot, background: themeValue.colors.primary}} />
              <div style={{...styles.colorDot, background: themeValue.colors.secondary}} />
              <div style={{...styles.colorDot, background: themeValue.colors.background}} />
              <div style={{...styles.colorDot, background: themeValue.colors.text}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSettings;
