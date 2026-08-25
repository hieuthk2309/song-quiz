'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, ViewMode, MatchResult } from '../../types';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';
import { audioPreview } from '../../utils/audioPreview';
import { ShaderSoundwave } from '../common/ShaderSoundwave';
import {
  useGameplayLoop,
  QUESTION_TIME_LIMIT,
  ANSWER_REVEAL_AT,
  PREVIEW_SECONDS,
} from '../../hooks/useGameplayLoop';

interface TensionBarProps {
  elapsed: number;
  totalTime: number;
  isWarning: boolean;
  isCritical: boolean;
}

function lerpColor(from: [number, number, number], to: [number, number, number], t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(from[0] + (to[0] - from[0]) * u);
  const g = Math.round(from[1] + (to[1] - from[1]) * u);
  const b = Math.round(from[2] + (to[2] - from[2]) * u);
  return `rgb(${r}, ${g}, ${b})`;
}

const GREEN: [number, number, number] = [45, 213, 91];
const YELLOW: [number, number, number] = [245, 197, 24];
const RED: [number, number, number] = [255, 59, 48];

const TensionBar: React.FC<TensionBarProps> = ({ elapsed, totalTime, isWarning, isCritical }) => {
  const remaining = Math.max(0, totalTime - elapsed);
  const pct = Math.max(0, Math.min(100, (remaining / totalTime) * 100));

  let fillColor: string;
  if (elapsed < 7) {
    fillColor = lerpColor(GREEN, YELLOW, elapsed / 7);
  } else if (elapsed < 12) {
    fillColor = lerpColor(YELLOW, RED, (elapsed - 7) / 5);
  } else {
    fillColor = `rgb(${RED[0]}, ${RED[1]}, ${RED[2]})`;
  }

  const zoneClass = isCritical ? 'tension-bar--late' : isWarning ? 'tension-bar--mid' : '';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${zoneClass} ${isCritical ? 'animate-shake' : ''}`}
      style={{ height: isCritical ? 10 : 8 }}
    >
      <div className="absolute inset-0 rounded-full bg-black/10" />
      <div
        id="tension-progress-bar"
        className="tension-bar-fill absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: fillColor }}
      />
      <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-b from-white/25 to-transparent" />
    </div>
  );
};

interface GameplayViewProps {
  category: string;
  onFinishGame: (result: MatchResult) => void;
  onExit: (view: ViewMode) => void;
}

export const GameplayView: React.FC<GameplayViewProps> = ({ category, onFinishGame, onExit }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    currentQuestion,
    selectedOption,
    isAnswered,
    timeLeft,
    elapsed,
    score,
    liveScore,
    currentStreak,
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
  } = useGameplayLoop({
    questions,
    currentIndex,
    setQuestions,
    setCurrentIndex,
    onFinishGame,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      let defaultList = QUIZ_QUESTIONS.filter((q) => q.category === category);
      if (defaultList.length < 4) defaultList = [...QUIZ_QUESTIONS];
      const shuffledDefault = [...defaultList].sort(() => Math.random() - 0.5);

      try {
        const apiUrl = `/api/deezer/questions?categoryId=${encodeURIComponent(category)}&seed=${Date.now()}`;
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.questions && data.questions.length >= 4 && isMounted) {
            const shuffledApi = [...data.questions].sort(() => Math.random() - 0.5);
            const limit = category === 'random' ? 30 : 20;
            setQuestions(shuffledApi.slice(0, limit));
            resetMatchStats();
            return;
          }
        }
      } catch (e) {
        console.warn('Using local question bank:', e);
      }

      if (isMounted) {
        setQuestions(shuffledDefault.slice(0, 20));
        resetMatchStats();
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
      audioPreview.stop();
    };
  }, [category, resetMatchStats]);

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
  const revealIn = Math.max(0, Math.ceil(ANSWER_REVEAL_AT - elapsed));

  return (
    <main className="flex-grow flex flex-col px-4 md:px-16 py-4 md:py-8 max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-4 md:mb-6 w-full gap-3">
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

        <div
          id="timer-ring"
          className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-4 font-bold text-lg md:text-xl transition-colors shadow-xs ${
            isCritical
              ? 'border-[#ff3b30] text-[#ff3b30] bg-[#ffdad6]/40 animate-shake-ring'
              : isWarning
              ? 'border-[#f5c518] text-[#c49200] bg-[#fffbe6]/60'
              : 'border-[#2dd55b] text-[#1a8036] bg-white'
          }`}
        >
          {timeLeft}
        </div>
      </div>

      <div className="w-full mb-4 md:mb-6 px-0.5">
        <TensionBar
          elapsed={elapsed}
          totalTime={QUESTION_TIME_LIMIT}
          isWarning={isWarning}
          isCritical={isCritical}
        />

        <div className="flex justify-between items-center mt-1.5 text-xs font-semibold">
          <span
            className={`transition-colors duration-700 ${
              isCritical ? 'text-[#ff3b30]' : isWarning ? 'text-[#c49200]' : 'text-[#1a8036]'
            }`}
          >
            {isCritical ? '⚡ Sắp hết giờ!' : isWarning ? '⏳ Nhanh lên!' : '🎵 Đang nghe...'}
          </span>
          <span
            id="live-score-badge"
            className={`px-2.5 py-0.5 rounded-full font-bold tabular-nums transition-all duration-200 ${
              isBlind
                ? 'bg-[#e9ddff] text-[#4f378a]'
                : isCritical
                ? 'bg-[#ff3b30] text-white scale-110'
                : isWarning
                ? 'bg-[#f5c518] text-[#1a1c1c]'
                : 'bg-[#2dd55b] text-white'
            }`}
          >
            {isBlind ? '🙈 ' : ''}+{liveScore}
          </span>
        </div>
      </div>

      <div className="w-full text-center mb-5 md:mb-7">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1a1c1c] max-w-3xl mx-auto leading-snug">
          {currentQuestion.question}
        </h1>
        <p className="text-xs md:text-sm text-[#7a7582] mt-1.5">
          {isBlind
            ? `🙈 Nghe trước — đáp án hiện đúng giây thứ ${ANSWER_REVEAL_AT}!`
            : isRealPreview
            ? `🎵 Đang phát bản xem trước ${PREVIEW_SECONDS}s từ ${previewSource === 'itunes' ? 'Apple Music' : 'Deezer'} — nghe và chọn đáp án!`
            : 'Chọn đáp án chính xác nhất dựa trên giai điệu và kiến thức V-pop của bạn'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full items-stretch flex-1">
        <div className="flex-1 rounded-3xl overflow-hidden bg-white border border-[#e2e2e2] shadow-md relative min-h-[260px] md:min-h-[360px] flex flex-col">
          <div className="flex-grow relative w-full h-full bg-black flex items-center justify-center min-h-[200px]">
            <ShaderSoundwave isPlaying={isPlayingMelody} intensity={1.2} />

            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white pointer-events-none p-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${
                  isRealPreview ? 'bg-black/60 border-[#ff0092]/40' : 'bg-black/40 border-white/20'
                }`}
              >
                {isRealPreview ? (
                  previewSource === 'itunes' ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 animate-pulse" fill="white">
                      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.17 3.34.428 2.067.945 1.134 1.8.557 3.048A7.497 7.497 0 00.09 5.19 50.149 50.149 0 000 6.125v11.749c.01.161.017.324.026.487.06 1.242.28 2.44.917 3.517.49.832 1.164 1.48 2.005 1.96.76.44 1.58.687 2.44.814.69.099 1.387.13 2.08.132h11.017c.764-.014 1.527-.07 2.28-.214.965-.185 1.857-.542 2.64-1.114 1.08-.788 1.81-1.822 2.147-3.09.145-.55.217-1.11.24-1.678.013-.262.02-.524.02-.786V6.124z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#ff0092] animate-pulse">
                      <path d="M11.996 0C5.373 0 0 5.373 0 11.997 0 18.625 5.373 24 11.996 24 18.625 24 24 18.625 24 11.997 24 5.373 18.625 0 11.996 0zm4.374 16.898a.71.71 0 01-.978.23 18.61 18.61 0 00-2.736-1.18 13.52 13.52 0 01-3.546-.43c-1.037-.267-1.96-.71-2.706-1.41a3.87 3.87 0 01-1.189-2.842c0-1.048.38-1.98 1.096-2.694.718-.716 1.638-1.078 2.688-1.078 1.024 0 1.95.358 2.668 1.065.718.707 1.1 1.637 1.1 2.682v.078c0 .267-.088.534-.223.756-.238.37-.638.608-1.083.608h-.018c-.44 0-.838-.237-1.075-.608a1.37 1.37 0 01-.224-.756v-.078c0-.5-.178-.92-.534-1.272a1.755 1.755 0 00-1.239-.505 1.74 1.74 0 00-1.225.49c-.35.326-.53.73-.53 1.22 0 .74.315 1.327.93 1.787.617.46 1.45.76 2.474.9a15.81 15.81 0 003.3.268 15.8 15.8 0 001.946-.178.71.71 0 01.824.562.696.696 0 01-.015.385z" />
                    </svg>
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

              {isBlind && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 text-white text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/20 whitespace-nowrap">
                  <span className="animate-pulse">🙈</span>
                  <span>Nghe {Math.min(PREVIEW_SECONDS, Math.floor(elapsed))}s — đáp án hiện sau {revealIn}s</span>
                </div>
              )}
            </div>

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

          <div className="p-4 md:p-5 bg-white flex items-center justify-between border-t border-[#e2e2e2]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (isPlayingMelody) {
                    pauseMelody();
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
                    : `0:${String(Math.min(PREVIEW_SECONDS, audioElapsed)).padStart(2, '0')} / 0:${String(PREVIEW_SECONDS).padStart(2, '0')}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRealPreview && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    previewSource === 'itunes'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-[#ff0092] text-white'
                  }`}
                >
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

        <div className="flex-1 flex flex-col justify-center gap-3.5 min-h-[280px]">
          {isBlind && !isAnswered ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#cbc4d2] bg-[#f3f3f3]/80 py-16 px-6 text-center">
              <span className="material-symbols-outlined text-4xl text-[#4f378a] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                hearing
              </span>
              <p className="text-base font-bold text-[#1a1c1c]">Đáp án đang ẩn</p>
              <p className="text-sm text-[#7a7582]">
                Nghe thuộc lòng — 4 lựa chọn hiện đúng giây thứ {ANSWER_REVEAL_AT} ({revealIn}s)
              </p>
            </div>
          ) : (
            currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              let cardStyle =
                'bg-white border-[#cbc4d2] hover:border-[#4f378a] hover:bg-[#f9f9f9] text-[#1a1c1c]';
              let badgeStyle =
                'bg-[#e2e2e2] text-[#1a1c1c] group-hover:bg-[#4f378a] group-hover:text-white';
              let iconElement: React.ReactNode = null;

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
                  key={`${currentQuestion.id}-${idx}-${option}`}
                  id={`answer-option-${letter.toLowerCase()}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={[
                    'w-full text-left p-4 md:p-5 border-2 rounded-2xl flex items-center justify-between gap-4',
                    'transition-all duration-200 cursor-pointer group active:scale-[0.98]',
                    cardStyle,
                    wasJustRevealed ? 'animate-blind-reveal' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
            })
          )}

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
