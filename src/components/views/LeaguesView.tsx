import React, { useState } from 'react';
import { ViewMode, UserProfile, LeaderboardPlayer } from '../../types';
import { INITIAL_LEADERBOARD } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';

interface LeaguesViewProps {
  user: UserProfile;
  onNavigate: (view: ViewMode) => void;
}

export const LeaguesView: React.FC<LeaguesViewProps> = ({ user, onNavigate }) => {
  const [selectedTier, setSelectedTier] = useState<'All' | 'Diamond' | 'Gold' | 'Silver'>('All');

  const filteredPlayers = INITIAL_LEADERBOARD.filter((p) => {
    if (selectedTier === 'All') return true;
    return p.tier === selectedTier;
  });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#b70052]">
            MÙA GIẢI 2024
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1c1c]">
            Bảng Vàng Cao Thủ
          </h2>
          <p className="text-sm text-[#494551] mt-1">
            Thi đấu tích điểm mỗi ngày để leo rank và nhận huy hiệu danh giá
          </p>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex bg-[#f3f3f3] p-1 rounded-2xl border border-[#e2e2e2]">
          {(['All', 'Diamond', 'Gold', 'Silver'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => {
                soundEngine.playClick();
                setSelectedTier(tier);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-white text-[#4f378a] shadow-xs'
                  : 'text-[#7a7582] hover:text-[#1a1c1c]'
              }`}
            >
              {tier === 'All' ? 'Tất cả' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 items-end">
        {/* Rank 2 */}
        <div className="bg-white border border-[#e2e2e2] rounded-3xl p-6 flex flex-col items-center text-center shadow-md relative order-2 md:order-1">
          <div className="w-8 h-8 rounded-full bg-[#cbc4d2] text-white font-bold flex items-center justify-center text-sm absolute -top-3 left-1/2 -translate-x-1/2 shadow-xs">
            2
          </div>
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#cbc4d2] mb-3 mt-2">
            <img
              src={INITIAL_LEADERBOARD[1].avatarUrl}
              alt="Rank 2"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="font-bold text-base text-[#1a1c1c]">{INITIAL_LEADERBOARD[1].name}</h3>
          <span className="text-xs text-[#006b61] font-semibold">{INITIAL_LEADERBOARD[1].badge}</span>
          <div className="mt-3 text-2xl font-extrabold text-[#4f378a]">
            {INITIAL_LEADERBOARD[1].score.toLocaleString()} <span className="text-xs text-[#7a7582]">pts</span>
          </div>
        </div>

        {/* Rank 1 (Champion) */}
        <div className="bg-gradient-to-b from-[#e9ddff]/50 to-white border-2 border-[#4f378a] rounded-3xl p-8 flex flex-col items-center text-center shadow-xl relative order-1 md:order-2 md:-translate-y-3">
          <div className="w-10 h-10 rounded-full bg-[#f59e0b] text-white font-extrabold flex items-center justify-center text-base absolute -top-5 left-1/2 -translate-x-1/2 shadow-md">
            👑 1
          </div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#f59e0b] mb-3 mt-2 shadow-sm">
            <img
              src={INITIAL_LEADERBOARD[0].avatarUrl}
              alt="Rank 1"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="font-extrabold text-lg text-[#1a1c1c]">{INITIAL_LEADERBOARD[0].name}</h3>
          <span className="text-xs text-[#b70052] font-bold">{INITIAL_LEADERBOARD[0].badge}</span>
          <div className="mt-3 text-3xl font-extrabold text-[#4f378a]">
            {INITIAL_LEADERBOARD[0].score.toLocaleString()} <span className="text-xs text-[#7a7582]">pts</span>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="bg-white border border-[#e2e2e2] rounded-3xl p-6 flex flex-col items-center text-center shadow-md relative order-3 md:order-3">
          <div className="w-8 h-8 rounded-full bg-[#b45309] text-white font-bold flex items-center justify-center text-sm absolute -top-3 left-1/2 -translate-x-1/2 shadow-xs">
            3
          </div>
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#b45309] mb-3 mt-2">
            <img
              src={INITIAL_LEADERBOARD[2].avatarUrl}
              alt="Rank 3"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="font-bold text-base text-[#1a1c1c]">{INITIAL_LEADERBOARD[2].name}</h3>
          <span className="text-xs text-[#4f378a] font-semibold">{INITIAL_LEADERBOARD[2].badge}</span>
          <div className="mt-3 text-2xl font-extrabold text-[#4f378a]">
            {INITIAL_LEADERBOARD[2].score.toLocaleString()} <span className="text-xs text-[#7a7582]">pts</span>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#e2e2e2] flex justify-between items-center bg-[#f9f9f9]">
          <h3 className="font-bold text-base text-[#1a1c1c]">Bảng Xếp Hạng Toàn Server</h3>
          <span className="text-xs text-[#7a7582]">Cập nhật mỗi 5 phút</span>
        </div>

        <div className="divide-y divide-[#e2e2e2]">
          {filteredPlayers.map((player) => (
            <div
              key={player.rank}
              className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-colors ${
                player.isCurrentUser ? 'bg-[#e9ddff]/40 font-semibold' : 'hover:bg-[#f9f9f9]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="w-7 text-center font-bold text-sm text-[#7a7582]">
                  #{player.rank}
                </span>
                <div className="w-11 h-11 rounded-full overflow-hidden border border-[#cbc4d2] shrink-0">
                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#1a1c1c]">{player.name}</p>
                    {player.isCurrentUser && (
                      <span className="bg-[#4f378a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        BẠN
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#7a7582]">{player.badge || `Tier ${player.tier}`}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-base text-[#4f378a]">{player.score.toLocaleString()}</p>
                <span className="text-xs text-[#b70052] font-medium">🔥 {player.streak} streak</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
