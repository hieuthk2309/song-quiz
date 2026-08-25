import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { QuizQuestion, MatchResult } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { audioPreview } from '../utils/audioPreview';

export const QUESTION_TIME_LIMIT = 15;
export const ANSWER_REVEAL_AT = 4;
export const SCORE_MAX = 1000;
export const PREVIEW_SECONDS = 15;

/**
 * Linear decay through the spec points, clamped to [0, 1000]:
 *   t = 3s → 850
 *   t = 14s → 100
 * score(t) = 850 + (100 - 850) / (14 - 3) * (t - 3)
 */
export function calcDecayingScore(elapsedSeconds: number): number {
  const score = 850 + ((100 - 850) / (14 - 3)) * (elapsedSeconds - 3);
  return Math.max(0, Math.min(SCORE_MAX, Math.round(score)));
}

interface UseGameplayLoopArgs {
  questions: QuizQuestion[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  onFinishGame: (result: MatchResult) => void;
}

export function useGameplayLoop({
  questions,
  currentIndex,
  setCurrentIndex,
  onFinishGame,
}: UseGameplayLoopArgs) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [liveScore, setLiveScore] = useState(SCORE_MAX);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isBlind, setIsBlind] = useState(true);
  const [wasJustRevealed, setWasJustRevealed] = useState(false);
  const [isPlayingMelody, setIsPlayingMelody] = useState(true);
  const [previewSource, setPreviewSource] = useState<'itunes' | 'deezer' | 'synth' | null>(null);
  const [audioElapsed, setAudioElapsed] = useState(0);

  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const blindTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const urgentTickRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const isCritical = elapsed >= 12;
  const isWarning = elapsed >= 7 && elapsed < 12;

  const isAnsweredRef = useRef(isAnswered);
  isAnsweredRef.current = isAnswered;
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;
  const currentStreakRef = useRef(currentStreak);
  currentStreakRef.current = currentStreak;
  const maxStreakRef = useRef(maxStreak);
  maxStreakRef.current = maxStreak;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const correctCountRef = useRef(correctCount);
  correctCountRef.current = correctCount;
  const wrongCountRef = useRef(wrongCount);
  wrongCountRef.current = wrongCount;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const stopRafScoreLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRafScoreLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const t = (Date.now() - questionStartRef.current) / 1000;
      setElapsed(t);
      setLiveScore(calcDecayingScore(t));
      setIsBlind(t < ANSWER_REVEAL_AT);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const playCurrentMelody = useCallback(async () => {
    if (!currentQuestion) return;

    soundEngine.resumeAudioContext();
    setIsPlayingMelody(true);
    setPreviewSource(null);
    setAudioElapsed(0);

    audioPreview.stop();
    soundEngine.stopCurrentAudio();

    const title = currentQuestion.songTitle || currentQuestion.question;
    const artist = currentQuestion.artist || '';

    const result = await audioPreview.playPreview(title, artist, 0, () => {
      setIsPlayingMelody(false);
    }, PREVIEW_SECONDS);

    if (result === 'playing') {
      const src = audioPreview.getSource() as 'itunes' | 'deezer' | null;
      setPreviewSource(src ?? 'itunes');
    } else {
      setPreviewSource('synth');
      const notes =
        currentQuestion.melodyNotes && currentQuestion.melodyNotes.length > 0
          ? currentQuestion.melodyNotes
          : soundEngine.generateMelodyForTrack(title, artist);
      soundEngine.playMelody(notes, () => {
        setIsPlayingMelody(false);
      });
    }

    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = window.setInterval(() => {
      setAudioElapsed((prev) => (prev < PREVIEW_SECONDS ? prev + 1 : PREVIEW_SECONDS));
    }, 1000);
  }, [currentQuestion]);

  const pauseMelody = useCallback(() => {
    soundEngine.stopCurrentAudio();
    audioPreview.pause();
    setIsPlayingMelody(false);
  }, []);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnsweredRef.current) return;

      if (timerRef.current) clearInterval(timerRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (blindTimerRef.current) clearTimeout(blindTimerRef.current);
      if (urgentTickRef.current) clearInterval(urgentTickRef.current);
      stopRafScoreLoop();
      soundEngine.stopCurrentAudio();
      audioPreview.stop();
      setIsPlayingMelody(false);

      setSelectedOption(optionIndex);
      setIsAnswered(true);
      setIsBlind(false);

      const q = currentQuestionRef.current;
      const isCorrect = optionIndex === q?.correctIndex;
      const t = (Date.now() - questionStartRef.current) / 1000;
      const earnedScore = isCorrect ? calcDecayingScore(t) : 0;

      if (isCorrect) {
        soundEngine.playCorrect();
        const streakBonus = currentStreakRef.current * 50;
        setScore((prev) => prev + earnedScore + streakBonus);
        setCorrectCount((prev) => prev + 1);
        setCurrentStreak((prev) => {
          const next = prev + 1;
          if (next > maxStreakRef.current) setMaxStreak(next);
          return next;
        });
      } else {
        soundEngine.playWrong();
        setWrongCount((prev) => prev + 1);
        setCurrentStreak(0);
      }

      window.setTimeout(() => {
        const qs = questionsRef.current;
        const ci = currentIndexRef.current;
        if (ci + 1 < qs.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
          const finalCorrect = correctCountRef.current + (isCorrect ? 1 : 0);
          const finalWrong = wrongCountRef.current + (isCorrect ? 0 : 1);
          const finalScore = scoreRef.current + earnedScore + (isCorrect ? currentStreakRef.current * 50 : 0);
          const finalResult: MatchResult = {
            id: `match-${Date.now()}`,
            date: new Date().toLocaleDateString('vi-VN'),
            categoryName: q?.category.toUpperCase() || 'UNKNOWN',
            score: finalScore,
            maxScore: qs.length * SCORE_MAX,
            correctCount: finalCorrect,
            wrongCount: finalWrong,
            totalQuestions: qs.length,
            timeSpentSeconds: totalDuration,
            maxStreak: Math.max(
              maxStreakRef.current,
              isCorrect ? currentStreakRef.current + 1 : currentStreakRef.current,
            ),
            accuracy: Math.round((finalCorrect / qs.length) * 100),
          };
          onFinishGame(finalResult);
        }
      }, 1800);
    },
    [stopRafScoreLoop, onFinishGame, setCurrentIndex],
  );

  const resetMatchStats = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    startTimeRef.current = Date.now();
  }, [setCurrentIndex]);

  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(QUESTION_TIME_LIMIT);
    setElapsed(0);
    setLiveScore(SCORE_MAX);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsBlind(true);
    setWasJustRevealed(false);
    questionStartRef.current = Date.now();

    playCurrentMelody();

    if (blindTimerRef.current) clearTimeout(blindTimerRef.current);
    blindTimerRef.current = window.setTimeout(() => {
      setIsBlind(false);
      setWasJustRevealed(true);
      soundEngine.playBlindReveal();
      window.setTimeout(() => setWasJustRevealed(false), 500);
    }, ANSWER_REVEAL_AT * 1000);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        if (prev > 5) soundEngine.playTick();
        return prev - 1;
      });
    }, 1000);

    if (urgentTickRef.current) clearInterval(urgentTickRef.current);
    urgentTickRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 5 && t > 0) soundEngine.playUrgentTick();
        return t;
      });
    }, 500);

    startRafScoreLoop();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (blindTimerRef.current) clearTimeout(blindTimerRef.current);
      if (urgentTickRef.current) clearInterval(urgentTickRef.current);
      stopRafScoreLoop();
      soundEngine.stopCurrentAudio();
    };
    // Restart only when the question index changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQuestion?.id]);

  return {
    currentQuestion,
    selectedOption,
    isAnswered,
    timeLeft,
    elapsed,
    score,
    liveScore,
    correctCount,
    wrongCount,
    currentStreak,
    maxStreak,
    isBlind,
    wasJustRevealed,
    isPlayingMelody,
    previewSource,
    audioElapsed,
    isCritical,
    isWarning,
    handleAnswer,
    playCurrentMelody,
    pauseMelody,
    resetMatchStats,
  };
}
