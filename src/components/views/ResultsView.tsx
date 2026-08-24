import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchResult, ViewMode } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface ResultsViewProps {
  result: MatchResult | null;
  onPlayAgain: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onPlayAgain,
  onNavigate,
}) => {
  useEffect(() => {
    // Sound victory fanfare
    soundEngine.playVictory();

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f378a', '#b70052', '#005148', '#17deca', '#ffd9df'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const score = result ? result.score : 850;
  const maxScore = result ? result.maxScore : 1000;
  const correct = result ? result.correctCount : 8;
  const wrong = result ? result.wrongCount : 2;
  const streak = result ? result.maxStreak : 8;
  const duration = result ? result.timeSpentSeconds : 72;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  // Custom feedback badge based on accuracy
  const accuracy = Math.round((correct / (correct + wrong || 1)) * 100);
  let feedbackTitle = 'Bạn là một fan cứng Vpop!';
  let feedbackDesc = 'Tuyệt vời! Kiến thức âm nhạc của bạn thật đáng nể.';

  if (accuracy >= 90) {
    feedbackTitle = 'Bạn là một Siêu Fan Vpop!';
    feedbackDesc = 'Màn trình diễn tuyệt vời! Bạn thực sự là bậc thầy giai điệu nhạc Việt!';
  } else if (accuracy < 50) {
    feedbackTitle = 'Cố gắng ở lần sau nhé!';
    feedbackDesc = 'Luyện tập thêm để nâng cao khả năng thính giác và bảng vàng xếp hạng!';
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-8 relative z-10 animate-in fade-in duration-300">
      {/* Top Bar for Results */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('home');
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e8e8e8] text-[#4f378a] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-[#4f378a] text-center">
          Kết thúc lượt chơi!
        </h2>
        <div className="w-10" />
      </div>

      {/* Main Content Stage */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
        {/* Left: Trophy Badge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-3xl overflow-hidden shadow-lg border-2 border-[#e9ddff] bg-white flex items-center justify-center p-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANPZdkGyYgY62KMfEUJsRxAbugQ5utDYOJUTvxlKFEPk6_xpGk0OVXbTdsj_rZodm3I2UAJ0i5BIvDBwoks2DH4RmuvK1E0uNXrnf6K0ziVbbCucjRSBBVMZsHFrbMgAK1BvEc-2WDYf-1pZUqMNqs3Tvc3QYMG-DedT17KrpktS97oLhvDgl1-SpPh8NbHAA-zLKGqRse7Z8IRIaraYJBx-oWSwSbHR4sTpCw_6LS4mPLoP4DeuCIJg"
              alt="Trophy Celebration"
              className="w-full h-full object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Central Focus: Score & Stats Card */}
        <div className="md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left bg-white p-6 md:p-10 rounded-3xl border border-[#e2e2e2] shadow-xl relative overflow-hidden w-full">
          {/* Decorative glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#dd2269]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#4f378a]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title & Feedback */}
          <div className="space-y-1 relative z-10 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b70052]">
              ĐIỂM CỦA BẠN
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-5xl md:text-6xl font-extrabold text-[#4f378a] tracking-tight">
                {score}
              </span>
              <span className="text-xl md:text-2xl font-bold text-[#7a7582]">
                / {maxScore}
              </span>
            </div>
          </div>

          <div className="py-4 border-t border-b border-[#e2e2e2] w-full my-4 relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1c1c]">
              {feedbackTitle}
            </h3>
            <p className="text-sm text-[#494551] mt-1">
              {feedbackDesc}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full relative z-10 mb-6">
            <div className="bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e2e2e2] flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#006b61] text-[#40f1dd] flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <span className="text-xl font-bold text-[#1a1c1c]">{correct}</span>
              <span className="text-xs text-[#7a7582]">Đúng</span>
            </div>

            <div className="bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e2e2e2] flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cancel
                </span>
              </div>
              <span className="text-xl font-bold text-[#1a1c1c]">{wrong}</span>
              <span className="text-xs text-[#7a7582]">Sai</span>
            </div>

            <div className="bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e2e2e2] flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#e8e8e8] text-[#4f378a] flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
              <span className="text-xl font-bold text-[#1a1c1c]">{timeFormatted}</span>
              <span className="text-xs text-[#7a7582]">Thời gian</span>
            </div>

            <div className="bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e2e2e2] flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#ffd9df] text-[#b70052] flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
              </div>
              <span className="text-xl font-bold text-[#1a1c1c]">{streak}</span>
              <span className="text-xs text-[#7a7582]">Chuỗi cao nhất</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full relative z-10">
            <button
              id="btn-play-again"
              onClick={() => {
                soundEngine.playClick();
                onPlayAgain();
              }}
              className="flex-1 bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-sm md:text-base py-3.5 px-6 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">replay</span>
              Chơi lại
            </button>

            <button
              id="btn-back-home"
              onClick={() => {
                soundEngine.playClick();
                onNavigate('home');
              }}
              className="flex-1 border-2 border-[#4f378a] text-[#4f378a] hover:bg-[#e9ddff]/40 font-semibold text-sm md:text-base py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
