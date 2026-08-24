import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, ViewMode, MatchResult } from '../../types';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';
import { audioPreview } from '../../utils/audioPreview';
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
  const [previewSource, setPreviewSource] = useState<'itunes' | 'deezer' | 'synth' | null>(null);
  const [audioElapsed, setAudioElapsed] = useState<number>(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Initialize questions dynamically
  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      // Fallback to local question bank
      let defaultList = QUIZ_QUESTIONS.filter((q) => q.category === category);
      if (defaultList.length < 4) defaultList = [...QUIZ_QUESTIONS];
      const shuffledDefault = [...defaultList].sort(() => Math.random() - 0.5);

      try {
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
            const limit = category === 'random' ? 30 : 20;
            setQuestions(shuffledApi.slice(0, limit));
            return;
          }
        }
      } catch (e) {
        console.warn('Using local question bank:', e);
      }

      if (isMounted) setQuestions(shuffledDefault.slice(0, 20));
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
      audioPreview.stop();
    };
  }, [category]);

  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];

  // ── Play preview audio ─────────────────────────────────────────────────────
  const playCurrentMelody = useCallback(async () => {
    if (!currentQuestion) return;

    soundEngine.resumeAudioContext();
    setIsPlayingMelody(true);
    setPreviewSource(null);
    setAudioElapsed(0);

    // Stop any currently playing audio
    audioPreview.stop();
    soundEngine.stopCurrentAudio();

    const title = currentQuestion.songTitle || currentQuestion.question;
    const artist = currentQuestion.artist || '';

    // Try iTunes/Deezer preview first
    const result = await audioPreview.playPreview(title, artist, 0, () => {
      setIsPlayingMelody(false);
    });

    if (result === 'playing') {
      const src = audioPreview.getSource() as 'itunes' | 'deezer' | null;
      setPreviewSource(src ?? 'itunes');
    } else {
      // Fallback: harmonic Web Audio synthesizer
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
      setAudioElapsed((prev) => (prev < 29 ? prev + 1 : 29));
    }, 1000);
  }, [currentQuestion]);

  // Start countdown timer and preview on each new question
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(QUESTION_TIME_LIMIT);
    setSelectedOption(null);
    setIsAnswered(false);
    playCurrentMelody();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) soundEngine.playTick();
        if (prev <= 1) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQuestion]);

  // Handle user answer
  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    soundEngine.stopCurrentAudio();
    audioPreview.stop();
    setIsPlayingMelody(false);

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion?.correctIndex;

    if (isCorrect) {
      soundEngine.playCorrect();
      const speedBonus = timeLeft * 10;
      const streakBonus = currentStreak * 20;
      setScore((prev) => prev + 100 + speedBonus + streakBonus);
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

    window.setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
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
  const isRealPreview = previewSource === 'itunes' || previewSource === 'deezer';

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
              audioPreview.stop();
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
            title="Nghe lại"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8e8e8] text-[#494551] hover:bg-[#e2e2e2] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
          </button>
        </div>

        {/* Progress Bar & Current Score */}
        <div className="flex-grow max-w-lg mx-2 md:mx-6">
          <div className="flex justify-between text-xs md:text-sm font-semibold text-[#494551] mb-1.5">
            <span>Câu {currentIndex + 1}/{questions.length}</span>
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
          {isRealPreview
            ? `🎵 Đang phát bản xem trước thật từ ${previewSource === 'itunes' ? 'Apple Music' : 'Deezer'} — nghe và chọn đáp án!`
            : 'Chọn đáp án chính xác nhất dựa trên giai điệu và kiến thức V-pop của bạn'}
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
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${isRealPreview ? 'bg-black/60 border-[#1db954]/40' : 'bg-black/40 border-white/20'}`}>
                {isRealPreview ? (
                  /* Apple Music / Deezer icon */
                  previewSource === 'itunes' ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 animate-pulse" fill="white"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.17 3.34.428 2.067.945 1.134 1.8.557 3.048A7.497 7.497 0 00.09 5.19 50.149 50.149 0 000 6.125v11.749c.01.161.017.324.026.487.06 1.242.28 2.44.917 3.517.49.832 1.164 1.48 2.005 1.96.76.44 1.58.687 2.44.814.69.099 1.387.13 2.08.132h11.017c.764-.014 1.527-.07 2.28-.214.965-.185 1.857-.542 2.64-1.114 1.08-.788 1.81-1.822 2.147-3.09.145-.55.217-1.11.24-1.678.013-.262.02-.524.02-.786V6.124zm-7.477 9.957a.69.69 0 01-.69.69H8.173a.69.69 0 01-.69-.69v-.386a.69.69 0 01.69-.69h7.654a.69.69 0 01.69.69zm0-3.31a.69.69 0 01-.69.69H8.173a.69.69 0 01-.69-.69v-.387a.69.69 0 01.69-.69h7.654a.69.69 0 01.69.69zm0-3.31a.69.69 0 01-.69.69H8.173a.69.69 0 01-.69-.69v-.387a.69.69 0 01.69-.69h7.654a.69.69 0 01.69.69z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#ff0092] animate-pulse"><path d="M11.996 0C5.373 0 0 5.373 0 11.997 0 18.625 5.373 24 11.996 24 18.625 24 24 18.625 24 11.997 24 5.373 18.625 0 11.996 0zm4.374 16.898a.71.71 0 01-.978.23 18.61 18.61 0 00-2.736-1.18 13.52 13.52 0 01-3.546-.43c-1.037-.267-1.96-.71-2.706-1.41a3.87 3.87 0 01-1.189-2.842c0-1.048.38-1.98 1.096-2.694.718-.716 1.638-1.078 2.688-1.078 1.024 0 1.95.358 2.668 1.065.718.707 1.1 1.637 1.1 2.682v.078c0 .267-.088.534-.223.756-.238.37-.638.608-1.083.608h-.018c-.44 0-.838-.237-1.075-.608a1.37 1.37 0 01-.224-.756v-.078c0-.5-.178-.92-.534-1.272a1.755 1.755 0 00-1.239-.505 1.74 1.74 0 00-1.225.49c-.35.326-.53.73-.53 1.22 0 .74.315 1.327.93 1.787.617.46 1.45.76 2.474.9a15.81 15.81 0 003.3.268 15.8 15.8 0 001.946-.178.71.71 0 01.824.562.696.696 0 01-.015.385z"/></svg>
                  )
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
                  {isRealPreview
                    ? `Đang phát từ ${previewSource === 'itunes' ? 'Apple Music' : 'Deezer'}...`
                    : isPlayingMelody
                    ? 'Đang phát giai điệu...'
                    : 'Tạm dừng giai điệu'}
                </span>
              </div>
            </div>

            {/* Quick Replay Floating Button */}
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

          {/* Player Bar */}
          <div className="p-4 md:p-5 bg-white flex items-center justify-between border-t border-[#e2e2e2]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (isPlayingMelody) {
                    soundEngine.stopCurrentAudio();
                    audioPreview.pause();
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
                  {isAnswered ? currentQuestion.songTitle || 'Bản hit V-pop' : 'Bản xem trước'}
                </span>
                <span className="text-xs text-[#7a7582]">
                  {isAnswered
                    ? `${currentQuestion.artist || ''} (${currentQuestion.releaseYear || 2023})`
                    : isRealPreview
                    ? `0:${String(audioElapsed).padStart(2, '0')} — preview thật`
                    : `0:${String(audioElapsed).padStart(2, '0')} / 0:15`}
                </span>
              </div>
            </div>

            {/* Source badge */}
            <div className="flex items-center gap-2">
              {isRealPreview && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${previewSource === 'itunes' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-[#ff0092] text-white'}`}>
                  {previewSource === 'itunes' ? '🎵 Apple Music' : '🎵 Deezer'}
                </span>
              )}
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
            const letter = String.fromCharCode(65 + idx);
            let cardStyle = 'bg-white border-[#cbc4d2] hover:border-[#4f378a] hover:bg-[#f9f9f9] text-[#1a1c1c]';
            let badgeStyle = 'bg-[#e2e2e2] text-[#1a1c1c] group-hover:bg-[#4f378a] group-hover:text-white';
            let iconElement = null;

            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
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
                  <span className="text-base md:text-lg font-medium leading-tight">{option}</span>
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

          {/* Explanation Box */}
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
