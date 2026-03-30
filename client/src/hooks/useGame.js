import { useState, useCallback } from 'react';
import { gameService } from '../services/gameService';

export const useGame = (mode, userId) => {
  const [question, setQuestion] = useState({ text: '5 + 3', answer: 8 });
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gameService.getQuestion(mode);
      setQuestion(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки вопроса');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const checkAnswer = useCallback((userAnswer) => {
    const isCorrect = parseInt(userAnswer) === question.answer;
    const newTotal = total + 1;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newScore = isCorrect ? score + 10 : score;

    setTotal(newTotal);
    setCorrect(newCorrect);
    setScore(newScore);

    fetchQuestion();
    
    return isCorrect;
  }, [question, score, correct, total, fetchQuestion]);

  const saveGame = useCallback(async () => {
    try {
      await gameService.saveResult({
        userId,
        mode,
        score,
        correct,
        total
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  }, [userId, mode, score, correct, total]);

  const resetGame = useCallback(() => {
    setScore(0);
    setCorrect(0);
    setTotal(0);
    fetchQuestion();
  }, [fetchQuestion]);

  return {
    question,
    score,
    correct,
    total,
    loading,
    error,
    fetchQuestion,
    checkAnswer,
    saveGame,
    resetGame
  };
};
