import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TrophiesPage.css';

// Все трофеи с описаниями
const ALL_TROPHIES = [
  // Башня
  { id: 'tower_5', name: 'Новичок', desc: 'Достиг 5 этажа в Башне', icon: '🏰', category: 'tower' },
  { id: 'tower_10', name: 'Высотник', desc: 'Достиг 10 этажа в Башне', icon: '🏰', category: 'tower' },
  { id: 'tower_20', name: 'Строитель', desc: 'Достиг 20 этажа в Башне', icon: '🏰', category: 'tower' },
  { id: 'tower_35', name: 'Архитектор', desc: 'Достиг 35 этажа в Башне', icon: '🏰', category: 'tower' },
  { id: 'tower_50', name: 'Легенда', desc: 'Достиг 50 этажа в Башне', icon: '🏰', category: 'tower' },
  { id: 'tower_100', name: 'Небоскрёб', desc: 'Достиг 100 этажа в Башне', icon: '🏰', category: 'tower' },
  
  // Спринт
  { id: 'sprint_100', name: 'Разминка', desc: 'Набрал 100 очков в Спринте', icon: '⚡', category: 'sprint' },
  { id: 'sprint_300', name: 'Спринтер', desc: 'Набрал 300 очков в Спринте', icon: '⚡', category: 'sprint' },
  { id: 'sprint_500', name: 'Ускоритель', desc: 'Набрал 500 очков в Спринте', icon: '⚡', category: 'sprint' },
  { id: 'sprint_800', name: 'Вихрь', desc: 'Набрал 800 очков в Спринте', icon: '⚡', category: 'sprint' },
  { id: 'sprint_1000', name: 'Ураган', desc: 'Набрал 1000 очков в Спринте', icon: '⚡', category: 'sprint' },
  { id: 'sprint_1500', name: 'Молния', desc: 'Набрал 1500 очков в Спринте', icon: '⚡', category: 'sprint' },
  
  // Дуэль
  { id: 'duel_first', name: 'Первый бой', desc: 'Выиграл первую дуэль', icon: '⚔️', category: 'duel' },
  { id: 'duel_5', name: 'Победитель', desc: 'Выиграл 5 дуэлей', icon: '⚔️', category: 'duel' },
  { id: 'duel_10', name: 'Чемпион', desc: 'Выиграл 10 дуэлей', icon: '⚔️', category: 'duel' },
  { id: 'duel_25', name: 'Гладиатор', desc: 'Выиграл 25 дуэлей', icon: '⚔️', category: 'duel' },
  { id: 'duel_50', name: 'Непобедимый', desc: 'Выиграл 50 дуэлей', icon: '⚔️', category: 'duel' },
  { id: 'duel_master', name: 'Мастер дуэлей', desc: 'Победил всех ботов', icon: '👑', category: 'duel' }
];

const TrophiesPage = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTrophies();
  }, []);

  const fetchTrophies = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/trophies/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTrophies(data);
    } catch (error) {
      console.error('Ошибка загрузки трофеев:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasTrophy = (trophyId) => {
    return trophies.some(t => t.trophy_id === trophyId);
  };

  const categories = [
    { id: 'all', name: 'Все', icon: '🏆' },
    { id: 'tower', name: 'Башня', icon: '🏰' },
    { id: 'sprint', name: 'Спринт', icon: '⚡' },
    { id: 'duel', name: 'Дуэль', icon: '⚔️' }
  ];

  const filteredTrophies = selectedCategory === 'all' 
    ? ALL_TROPHIES 
    : ALL_TROPHIES.filter(t => t.category === selectedCategory);

  const earnedCount = trophies.length;
  const totalCount = ALL_TROPHIES.length;
  const progressPercent = (earnedCount / totalCount) * 100;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="trophies-container">
      <div className="trophies-header">
        <button className="back-btn" onClick={() => setCurrentPage('menu')}>
          ← Назад
        </button>
        <h1>Зал трофеев</h1>
        <div className="trophies-stats">
          <span>{earnedCount} / {totalCount}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="categories-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="trophies-grid">
        {filteredTrophies.map(trophy => {
          const earned = hasTrophy(trophy.id);
          
          return (
            <div key={trophy.id} className={`trophy-item ${earned ? 'earned' : 'locked'}`}>
              <div className="trophy-icon">{earned ? trophy.icon : '🔒'}</div>
              <div className="trophy-info">
                <h3 className="trophy-name">{trophy.name}</h3>
                <p className="trophy-desc">{trophy.desc}</p>
              </div>
              {earned && <div className="trophy-earned">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrophiesPage;
