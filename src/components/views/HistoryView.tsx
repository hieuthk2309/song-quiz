import React from 'react';
import { ViewMode, MatchResult } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface HistoryViewProps {
  history: MatchResult[];
  onNavigate: (view: ViewMode) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onNavigate,
  onClearHistory,
}) => {
  const totalGames = history.length;
  const totalPoints = history.reduce((acc, h) => acc + h.score, 0);
  const avgAccuracy = totalGames > 0
    ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalGames)
    : 85;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#b70052]">
            NHẬT KÝ ĐẤU
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1c1c]">
            Lịch Sử Trận Đấu
          </h2>
          <p className="text-sm text-[#494551] mt-1">
            Xem lại kết quả các vòng thi đấu và mức độ chính xác của bạn
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearHistory();
            }}
            className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/50 px-3 py-1.5 rounded-xl border border-[#ffdad6] transition-colors cursor-pointer"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e9ddff] text-[#4f378a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">sports_esports</span>
          </div>
          <div>
            <p className="text-xs text-[#7a7582] uppercase font-bold">Số trận đã chơi</p>
            <p className="text-2xl font-extrabold text-[#1a1c1c]">{totalGames}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ffd9df] text-[#b70052] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">stars</span>
          </div>
          <div>
            <p className="text-xs text-[#7a7582] uppercase font-bold">Tổng điểm ghi được</p>
            <p className="text-2xl font-extrabold text-[#1a1c1c]">{totalPoints.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#40f1dd]/30 text-[#005148] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>
          <div>
            <p className="text-xs text-[#7a7582] uppercase font-bold">Độ chính xác TB</p>
            <p className="text-2xl font-extrabold text-[#1a1c1c]">{avgAccuracy}%</p>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e2e2e2] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#f3f3f3] text-[#7a7582] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
          </div>
          <h3 className="text-lg font-bold text-[#1a1c1c]">Chưa có lịch sử đấu nào</h3>
          <p className="text-xs md:text-sm text-[#7a7582] mt-1 max-w-sm mx-auto">
            Hãy bắt đầu một ván chơi ngay để thử thách tài năng âm nhạc và lưu lại kỷ lục của bạn!
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-6 bg-[#b70052] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#dd2269] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Chơi ván đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e2e2e2] shadow-xs overflow-hidden divide-y divide-[#e2e2e2]">
          {history.map((match) => (
            <div
              key={match.id}
              className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f9f9f9] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f3f3f3] border border-[#e2e2e2] flex items-center justify-center text-[#4f378a] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">music_note</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#1a1c1c]">
                      {match.categoryName}
                    </h4>
                    <span className="text-xs text-[#7a7582]">({match.date})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#494551] mt-1">
                    <span className="text-[#006b61] font-semibold">
                      ✓ {match.correctCount}/{match.totalQuestions} đúng
                    </span>
                    <span>•</span>
                    <span>{match.accuracy}% chính xác</span>
                    <span>•</span>
                    <span>🔥 {match.maxStreak} streak</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-xl font-extrabold text-[#4f378a]">
                    +{match.score.toLocaleString()} <span className="text-xs text-[#7a7582]">pts</span>
                  </p>
                  <p className="text-[11px] text-[#7a7582]">{match.timeSpentSeconds}s thời gian</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
