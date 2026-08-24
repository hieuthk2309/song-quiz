import React from 'react';
import { ViewMode, UserProfile } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface TopHeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenMenu: () => void;
  user: UserProfile;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
  user,
}) => {
  return (
    <header className="w-full top-0 bg-[#f9f9f9]/95 backdrop-blur-md transition-colors duration-200 border-b border-[#e2e2e2] sticky z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-16 h-16 flex justify-between items-center">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            id="btn-header-menu"
            onClick={() => {
              soundEngine.playClick();
              onOpenMenu();
            }}
            aria-label="Menu"
            className="p-2 rounded-full hover:bg-[#e8e8e8] text-[#4f378a] transition-colors duration-200 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          
          <div
            id="brand-logo-button"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('home');
            }}
            className="cursor-pointer flex items-center gap-2 select-none group"
          >
            <h1 className="font-bold text-2xl md:text-3xl text-[#b70052] tracking-tight group-hover:opacity-90 transition-opacity">
              Vpop Quiz
            </h1>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            id="nav-link-home"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('home');
            }}
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentView === 'home'
                ? 'bg-[#e9ddff] text-[#4f378a] font-semibold'
                : 'text-[#494551] hover:bg-[#e8e8e8]'
            }`}
          >
            Trang chủ
          </button>
          <button
            id="nav-link-leagues"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('leagues');
            }}
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentView === 'leagues'
                ? 'bg-[#e9ddff] text-[#4f378a] font-semibold'
                : 'text-[#494551] hover:bg-[#e8e8e8]'
            }`}
          >
            Giải đấu
          </button>
          <button
            id="nav-link-history"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('history');
            }}
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentView === 'history'
                ? 'bg-[#e9ddff] text-[#4f378a] font-semibold'
                : 'text-[#494551] hover:bg-[#e8e8e8]'
            }`}
          >
            Lịch sử
          </button>
          <button
            id="nav-link-join"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('join-room');
            }}
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
              currentView === 'join-room'
                ? 'bg-[#e9ddff] text-[#4f378a] font-semibold'
                : 'text-[#494551] hover:bg-[#e8e8e8]'
            }`}
          >
            Phòng chơi
          </button>
        </nav>

        {/* Right: Quick Action & User Profile Avatar */}
        <div className="flex items-center gap-3">
          <button
            id="btn-quick-play-header"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('game');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#b70052] text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#dd2269] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Chơi ngay
          </button>

          <button
            id="btn-user-avatar"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('profile');
            }}
            title={`Hồ sơ: ${user.displayName}`}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#cbc4d2] hover:border-[#4f378a] transition-all cursor-pointer shadow-xs"
          >
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
