import React, { useState } from 'react';
import { ViewMode, UserProfile } from '../../types';
import { AVATAR_OPTIONS } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (view: ViewMode) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onNavigate,
}) => {
  const [displayName, setDisplayName] = useState<string>(user.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatarUrl);
  const [soundOn, setSoundOn] = useState<boolean>(user.soundEnabled);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCorrect();
    onUpdateUser({
      displayName: displayName.trim() || 'Người chơi Vpop',
      avatarUrl: selectedAvatar,
      soundEnabled: soundOn,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const nextLevelExp = 2000;
  const currentExp = 1450;
  const expPercent = Math.round((currentExp / nextLevelExp) * 100);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b70052]">
            TÀI KHOẢN CỦA BẠN
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1c1c]">
            Thông Tin Người Chơi
          </h2>
          <p className="text-sm text-[#494551] mt-1">
            Tùy chỉnh tên hiển thị, ảnh đại diện và tùy chọn trải nghiệm âm nhạc
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#cbc4d2] p-6 md:p-10 shadow-lg space-y-8">
          {/* Level Progress */}
          <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#e2e2e2] flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4f378a] text-white flex items-center justify-center font-bold text-sm">
                  {user.level}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1a1c1c]">Cấp độ {user.level}: Bậc Thầy Giai Điệu</h4>
                  <p className="text-xs text-[#7a7582]">Cần thêm {nextLevelExp - currentExp} EXP để lên Cấp {user.level + 1}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#4f378a]">{expPercent}%</span>
            </div>

            <div className="w-full bg-[#e2e2e2] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4f378a] h-full rounded-full transition-all duration-500"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494551] mb-3">
                Chọn ảnh đại diện (3D Avatar)
              </label>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {AVATAR_OPTIONS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedAvatar(avatar);
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-3 transition-all cursor-pointer group ${
                      selectedAvatar === avatar
                        ? 'border-[#4f378a] scale-105 shadow-md ring-4 ring-[#e9ddff]'
                        : 'border-[#e2e2e2] hover:border-[#cbc4d2]'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute top-1 right-1 bg-[#4f378a] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494551] mb-2">
                Tên hiển thị trong game
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={24}
                  placeholder="Nhập tên của bạn..."
                  className="w-full bg-[#f9f9f9] border border-[#cbc4d2] text-[#1a1c1c] font-medium text-base rounded-2xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:bg-white transition-all"
                />
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a7582] text-[22px]">
                  badge
                </span>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className="bg-[#f9f9f9] p-4 rounded-2xl border border-[#e2e2e2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9ddff] text-[#4f378a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    {soundOn ? 'volume_up' : 'volume_off'}
                  </span>
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#1a1c1c]">Hiệu ứng âm thanh & Giai điệu</h5>
                  <p className="text-xs text-[#7a7582]">Phát synth giai điệu bài hát khi làm quiz</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  const next = !soundOn;
                  setSoundOn(next);
                  soundEngine.setMuted(!next);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundOn ? 'bg-[#4f378a]' : 'bg-[#cbc4d2]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    soundOn ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Career Stats Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494551] mb-2">
                Thành tích cá nhân
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] text-center">
                  <p className="text-xs text-[#7a7582]">Điểm cao nhất</p>
                  <p className="text-lg font-extrabold text-[#4f378a]">{user.highScore.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] text-center">
                  <p className="text-xs text-[#7a7582]">Xếp hạng Global</p>
                  <p className="text-lg font-extrabold text-[#b70052]">#{user.globalRank}</p>
                </div>
                <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] text-center">
                  <p className="text-xs text-[#7a7582]">Trận đã đấu</p>
                  <p className="text-lg font-extrabold text-[#005148]">{user.totalGames}</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-save-profile"
                type="submit"
                className="flex-1 bg-[#4f378a] hover:bg-[#6750a4] text-white font-semibold text-base py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">check</span>
                Lưu thay đổi
              </button>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-6 py-3.5 rounded-2xl border border-[#cbc4d2] text-[#494551] font-semibold text-sm hover:bg-[#f3f3f3] transition-colors cursor-pointer"
              >
                Quay lại
              </button>
            </div>
          </form>

          {savedToast && (
            <div className="bg-[#40f1dd]/20 border border-[#006b61] text-[#005148] text-xs md:text-sm font-semibold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Đã cập nhật thông tin người chơi thành công!
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
