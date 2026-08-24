import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, ViewMode, MatchResult } from '../../types';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';
import { spotifyPlayer } from '../../utils/spotifyPlayer';
import { ShaderSoundwave } from '../common/ShaderSoundwave';

interface GameplayViewProps {
  category: string;
  onFinishGame: (result: MatchResult) => void;
  onExit: (view: ViewMode) => void;
}

const QUESTION_TIME_LIMIT = 15; // 15 seconds per question

export const GameplayView: React.FC<GameplayViewProps> = ({
  category,
  onFinishGame,
  onExit,
}) => {
  // Filter questions by category or use all if category not specified
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isPlayingMelody, setIsPlayingMelody] = useState<boolean>(true);
  const [isSpotifyStreaming, setIsSpotifyStreaming] = useState<boolean>(false);
  const [audioElapsed, setAudioElapsed] = useState<number>(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    spotifyPlayer.init().catch(() => {});
    return () => {
      spotifyPlayer.pause();
    };
  }, []);

  // Initialize questions dynamically
  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      // 1. Initial fallback questions
      let defaultList = QUIZ_QUESTIONS.filter((q) => q.category === category);
      if (defaultList.length < 4) {
        defaultList = [...QUIZ_QUESTIONS];
      }
      const shuffledDefault = [...defaultList].sort(() => Math.random() - 0.5);

      try {
        // Detect if category is a personal Spotify playlist
        const isPlaylist = category.startsWith('playlist-');
        let apiUrl: string;
        if (isPlaylist) {
          const playlistId = category.replace('playlist-', '');
          apiUrl = `/api/spotify/playlist-questions?playlistId=${encodeURIComponent(playlistId)}&seed=${Date.now()}`;
        } else {
          apiUrl = `/api/spotify/questions?categoryId=${encodeURIComponent(category)}&seed=${Date.now()}`;
        }

        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.questions && data.questions.length >= 4 && isMounted) {
            const shuffledApi = [...data.questions].sort(() => Math.random() - 0.5);
            // Random mode gets 30 questions, others get 20
            const limit = category === 'random' ? 30 : 20;
            setQuestions(shuffledApi.slice(0, limit));
            return;
          }
        }
      } catch (e) {
        console.warn('Using local question bank:', e);
      }

      if (isMounted) {
        setQuestions(shuffledDefault.slice(0, 20));
      }
    }

    loadQuestions();
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    startTimeRef.current = Date.now();

    return () => {
      isMounted = false;
      spotifyPlayer.pause();
    };
  }, [category]);

  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];

  // Play question melody / stream via Spotify
  const playCurrentMelody = useCallback(async () => {
    if (!currentQuestion) return;
    
    // Ensure AudioContext is active
    soundEngine.resumeAudioContext();
    setIsPlayingMelody(true);
    setAudioElapsed(0);

    let streamedViaSpotify = false;

    // Try Spotify Web Playback SDK streaming if player is ready
    if (spotifyPlayer.getIsReady() && (currentQuestion.spotifyUri || currentQuestion.spotifyId)) {
      const target = currentQuestion.spotifyUri || currentQuestion.spotifyId!;
      const played = await spotifyPlayer.playTrack(target, 25000);
      if (played) {
        streamedViaSpotify = true;
        setIsSpotifyStreaming(true);
      }
    }

    // Fallback to rich Web Audio harmonic synthesizer
    if (!streamedViaSpotify) {
      setIsSpotifyStreaming(false);
      const notes = currentQuestion.melodyNotes && currentQuestion.melodyNotes.length > 0
        ? currentQuestion.melodyNotes
        : soundEngine.generateMelodyForTrack(currentQuestion.songTitle || currentQuestion.question, currentQuestion.artist || '');

      soundEngine.playMelody(notes, () => {
        setIsPlayingMelody(false);
      });
    }

    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = window.setInterval(() => {
      setAudioElapsed((prev) => (prev < 15 ? prev + 1 : 15));
    }, 1000);
  }, [currentQuestion]);

  // Start question countdown timer and melody
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(QUESTION_TIME_LIMIT);
    setSelectedOption(null);
    setIsAnswered(false);
    playCurrentMelody();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          soundEngine.playTick();
        }
        if (prev <= 1) {
          // Timeout -> count as wrong
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      soundEngine.stopCurrentAudio();
    };
  }, [currentIndex, currentQuestion]);

  // Handle user answer
  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    soundEngine.stopCurrentAudio();
    spotifyPlayer.pause();
    setIsPlayingMelody(false);

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion?.correctIndex;

    if (isCorrect) {
      soundEngine.playCorrect();
      const speedBonus = timeLeft * 10;
      const streakBonus = currentStreak * 20;
      const pointsEarned = 100 + speedBonus + streakBonus;

      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      soundEngine.playWrong();
      setWrongCount((prev) => prev + 1);
      setCurrentStreak(0);
    }

    // Auto advance after short review delay
    window.setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Complete Quiz!
        const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const finalResult: MatchResult = {
          id: `match-${Date.now()}`,
          date: new Date().toLocaleDateString('vi-VN'),
          categoryName: currentQuestion?.category.toUpperCase() || 'UNKNOWN',
          score: score + (isCorrect ? 100 : 0),
          maxScore: questions.length * 250,
          correctCount: correctCount + (isCorrect ? 1 : 0),
          wrongCount: wrongCount + (isCorrect ? 0 : 1),
          totalQuestions: questions.length,
          timeSpentSeconds: totalDuration,
          maxStreak: Math.max(maxStreak, isCorrect ? currentStreak + 1 : currentStreak),
          accuracy: Math.round(((correctCount + (isCorrect ? 1 : 0)) / questions.length) * 100),
        };
        onFinishGame(finalResult);
      }
    }, 1800);
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#4f378a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#7a7582]">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="flex-grow flex flex-col px-4 md:px-16 py-4 md:py-8 max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-200">
      {/* Game Header (Progress & Controls) */}
      <div className="flex justify-between items-center mb-6 md:mb-8 w-full gap-3">
        <div className="flex items-center gap-2">
          <button
            id="btn-quit-game"
            onClick={() => {
              soundEngine.playClick();
              soundEngine.stopCurrentAudio();
              spotifyPlayer.pause();
              onExit('home');
            }}
            aria-label="Thoát trò chơi"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8e8e8] text-[#494551] hover:bg-[#e2e2e2] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <button
            id="btn-replay-audio"
            onClick={() => {
              soundEngine.playClick();
              playCurrentMelody();
            }}
            title="Nghe lại giai điệu"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8e8e8] text-[#494551] hover:bg-[#e2e2e2] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
          </button>
        </div>

        {/* Progress Bar & Current Score */}
        <div className="flex-grow max-w-lg mx-2 md:mx-6">
          <div className="flex justify-between text-xs md:text-sm font-semibold text-[#494551] mb-1.5">
            <span>
              Câu {currentIndex + 1}/{questions.length}
            </span>
            <div className="flex items-center gap-2">
              {currentStreak > 1 && (
                <span className="text-[#b70052] flex items-center gap-0.5 text-xs font-bold animate-bounce">
                  🔥 x{currentStreak}
                </span>
              )}
              <span className="text-[#4f378a]">Điểm: {score.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full bg-[#e2e2e2] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#005148] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Ring */}
        <div
          className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-4 font-bold text-lg md:text-xl transition-colors shadow-xs ${
            timeLeft <= 4
              ? 'border-[#ba1a1a] text-[#ba1a1a] bg-[#ffdad6]/40 animate-pulse'
              : 'border-[#b70052] text-[#b70052] bg-white'
          }`}
        >
          {timeLeft}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="w-full text-center mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1a1c1c] max-w-3xl mx-auto leading-snug">
          {currentQuestion.question}
        </h1>
        <p className="text-xs md:text-sm text-[#7a7582] mt-1.5">
          Chọn đáp án chính xác nhất dựa trên giai điệu và kiến thức V-pop của bạn
        </p>
      </div>

      {/* Desktop/Tablet 2-Column: Visualizer on Left, Answers on Right */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full items-stretch flex-1">
        {/* Music Player & WebGL Soundwave Visualizer Card */}
        <div className="flex-1 rounded-3xl overflow-hidden bg-white border border-[#e2e2e2] shadow-md relative min-h-[260px] md:min-h-[360px] flex flex-col">
          {/* Visualizer Area */}
          <div className="flex-grow relative w-full h-full bg-black flex items-center justify-center min-h-[200px]">
            {/* Live WebGL Soundwave Shader */}
            <ShaderSoundwave isPlaying={isPlayingMelody} intensity={1.2} />

            {/* Scrim & Playing Indicator */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white pointer-events-none p-4">
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                {isSpotifyStreaming ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1db954] shrink-0 animate-pulse"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                ) : (
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      isPlayingMelody ? 'animate-pulse text-[#4ffbe6]' : 'text-white/60'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    graphic_eq
                  </span>
                )}
                <span className="text-sm font-medium tracking-wide">
                  {isSpotifyStreaming
                    ? 'Đang phát từ Spotify Premium'
                    : isPlayingMelody
                    ? 'Đang phát giai điệu...'
                    : 'Tạm dừng giai điệu'}
                </span>
              </div>
            </div>

            {/* Quick Replay Floating Button on Visualizer */}
            <button
              onClick={() => {
                soundEngine.playClick();
                playCurrentMelody();
              }}
              title="Nghe lại"
              className="absolute bottom-3 right-3 bg-white/25 hover:bg-white/40 p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">replay</span>
            </button>
          </div>

          {/* Player Bar (Bottom of Card) */}
          <div className="p-4 md:p-5 bg-white flex items-center justify-between border-t border-[#e2e2e2]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (isPlayingMelody) {
                    soundEngine.stopCurrentAudio();
                    setIsPlayingMelody(false);
                  } else {
                    playCurrentMelody();
                  }
                }}
                className="w-11 h-11 rounded-full bg-[#4f378a] hover:bg-[#6750a4] flex items-center justify-center text-white transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isPlayingMelody ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#1a1c1c]">
                  {isAnswered ? currentQuestion.songTitle || 'Bản hit V-pop' : 'Giai điệu câu hỏi'}
                </span>
                <span className="text-xs text-[#7a7582]">
                  {isAnswered
                    ? `${currentQuestion.artist || ''} (${currentQuestion.releaseYear || 2023})`
                    : `0:0${audioElapsed} / 0:15`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  soundEngine.setMuted(!soundEngine['isMuted']);
                }}
                className="w-9 h-9 rounded-full text-[#7a7582] hover:bg-[#f3f3f3] transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Answer Choices (A, B, C, D) */}
        <div className="flex-1 flex flex-col justify-center gap-3.5">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            let cardStyle = 'bg-white border-[#cbc4d2] hover:border-[#4f378a] hover:bg-[#f9f9f9] text-[#1a1c1c]';
            let badgeStyle = 'bg-[#e2e2e2] text-[#1a1c1c] group-hover:bg-[#4f378a] group-hover:text-white';
            let iconElement = null;

            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                // Correct styling: Teal container
                cardStyle = 'bg-[#006b61] border-[#005048] text-white shadow-md font-bold';
                badgeStyle = 'bg-[#40f1dd] text-[#00201c]';
                iconElement = (
                  <span
                    className="material-symbols-outlined text-[#40f1dd] text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                );
              } else if (selectedOption === idx) {
                // Incorrect chosen
                cardStyle = 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]';
                badgeStyle = 'bg-[#ba1a1a] text-white';
                iconElement = (
                  <span
                    className="material-symbols-outlined text-[#ba1a1a] text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cancel
                  </span>
                );
              } else {
                cardStyle = 'bg-[#f3f3f3] border-[#e2e2e2] text-[#7a7582] opacity-60';
              }
            }

            return (
              <button
                key={idx}
                id={`answer-option-${letter.toLowerCase()}`}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 md:p-5 border-2 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group active:scale-[0.98] ${cardStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {letter}
                  </div>
                  <span className="text-base md:text-lg font-medium leading-tight">
                    {option}
                  </span>
                </div>

                {iconElement ? (
                  iconElement
                ) : (
                  <span className="material-symbols-outlined text-[#cbc4d2] group-hover:text-[#4f378a] transition-colors text-[22px]">
                    radio_button_unchecked
                  </span>
                )}
              </button>
            );
          })}

          {/* Explanation Box shown after answer */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[#e9ddff]/60 border border-[#cfbcff] text-xs md:text-sm text-[#4f378a] animate-in fade-in duration-200">
              <span className="font-bold mr-1">💡 Thông tin bài hát:</span>
              {currentQuestion.explanation}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
