import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  
  const { register, login } = useAuth();

  const switchMode = (newMode) => {
    setAnimating(true);
    setError('');
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 300);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, password);
    } catch (err) {
      setError('Ошибка регистрации. Возможно, имя занято');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${animating ? 'fade-out' : 'fade-in'}`}>
        <h1 className="auth-title">🧮 MathTrainer</h1>
        
        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {error}
            <div className="error-progress"></div>
          </div>
        )}
        
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>Вход</h2>
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`auth-input ${error ? 'shake' : ''}`}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`auth-input ${error ? 'shake' : ''}`}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="auth-button login"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
            
            <div className="auth-switch">
              Нет аккаунта?{' '}
              <button 
                type="button"
                onClick={() => switchMode('register')}
                className="auth-link"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <h2>Регистрация</h2>
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`auth-input ${error ? 'shake' : ''}`}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`auth-input ${error ? 'shake' : ''}`}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="auth-button register"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            
            <div className="auth-switch">
              Уже есть аккаунт?{' '}
              <button 
                type="button"
                onClick={() => switchMode('login')}
                className="auth-link"
              >
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
