import React from 'react';
import { ViewMode, UserProfile } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
  user: UserProfile;
  onToggleSound: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  user,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  const navItems: Array<{ id: ViewMode; label: string; icon: string; desc: string }> = [
    { id: 'home', label: 'Trang chủ', icon: 'home', desc: 'Chọn danh mục & bắt đầu chơi' },
    { id: 'game', label: 'Chơi ngay', icon: 'play_circle', desc: 'Thử thách đoán bài hát V-pop' },
    { id: 'join-room', label: 'Tham gia phòng', icon: 'qr_code_scanner', desc: 'Quét QR hoặc nhập mã PIN' },
    { id: 'create-room', label: 'Tạo phòng chơi', icon: 'group_add', desc: 'Mời bạn bè cùng thi đấu' },
    { id: 'leagues', label: 'Bảng xếp hạng', icon: 'leaderboard', desc: 'Bảng vàng cao thủ V-pop' },
    { id: 'history', label: 'Lịch sử đấu', icon: 'history', desc: 'Xem lại các ván đã chơi' },
    { id: 'profile', label: 'Hồ sơ người chơi', icon: 'account_circle', desc: 'Đổi tên & ảnh đại diện' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[#ffffff] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e2e2] flex justify-between items-center bg-[#f9f9f9]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#4f378a]">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1a1c1c]">{user.displayName}</h3>
              <p className="text-xs text-[#4f378a] font-medium">Hạng #{user.globalRank} • {user.highScore.toLocaleString()} điểm</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full hover:bg-[#e8e8e8] flex items-center justify-center text-[#7a7582] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.playClick();
                onNavigate(item.id);
                onClose();
              }}
              className="w-full text-left flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#f3f3f3] active:bg-[#e8e8e8] transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#e9ddff] text-[#4f378a] flex items-center justify-center group-hover:bg-[#4f378a] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1a1c1c] group-hover:text-[#4f378a] transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-[#7a7582] line-clamp-1">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-[#cbc4d2] text-[18px]">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-[#e2e2e2] bg-[#f9f9f9] flex items-center justify-between">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            className="flex items-center gap-2 text-xs font-medium text-[#494551] hover:text-[#4f378a] p-2 rounded-lg hover:bg-[#e8e8e8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {user.soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span>{user.soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
          </button>
          
          <span className="text-[11px] text-[#7a7582]">v2.4.0 • Vpop Quiz</span>
        </div>
      </div>
    </div>
  );
};
