import React from 'react';
import { ViewMode } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface BottomNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  // Suppress bottom bar on active game screen for immersion
  if (currentView === 'game') return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-18 px-3 pb-1 bg-[#ffffff] border-t border-[#e2e2e2] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
      {/* Home */}
      <button
        id="bottom-nav-home"
        onClick={() => {
          soundEngine.playClick();
          onNavigate('home');
        }}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 group cursor-pointer"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
            currentView === 'home'
              ? 'bg-[#6750a4] text-white shadow-xs'
              : 'text-[#494551] group-hover:bg-[#f3f3f3]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentView === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
        </div>
        <span
          className={`text-[11px] mt-0.5 font-medium ${
            currentView === 'home' ? 'text-[#4f378a] font-semibold' : 'text-[#494551]'
          }`}
        >
          Home
        </span>
      </button>

      {/* Leagues */}
      <button
        id="bottom-nav-leagues"
        onClick={() => {
          soundEngine.playClick();
          onNavigate('leagues');
        }}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 group cursor-pointer"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
            currentView === 'leagues'
              ? 'bg-[#6750a4] text-white shadow-xs'
              : 'text-[#494551] group-hover:bg-[#f3f3f3]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentView === 'leagues' ? "'FILL' 1" : "'FILL' 0" }}
          >
            leaderboard
          </span>
        </div>
        <span
          className={`text-[11px] mt-0.5 font-medium ${
            currentView === 'leagues' ? 'text-[#4f378a] font-semibold' : 'text-[#494551]'
          }`}
        >
          Leagues
        </span>
      </button>

      {/* History */}
      <button
        id="bottom-nav-history"
        onClick={() => {
          soundEngine.playClick();
          onNavigate('history');
        }}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 group cursor-pointer"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
            currentView === 'history'
              ? 'bg-[#6750a4] text-white shadow-xs'
              : 'text-[#494551] group-hover:bg-[#f3f3f3]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentView === 'history' ? "'FILL' 1" : "'FILL' 0" }}
          >
            history
          </span>
        </div>
        <span
          className={`text-[11px] mt-0.5 font-medium ${
            currentView === 'history' ? 'text-[#4f378a] font-semibold' : 'text-[#494551]'
          }`}
        >
          History
        </span>
      </button>

      {/* Profile */}
      <button
        id="bottom-nav-profile"
        onClick={() => {
          soundEngine.playClick();
          onNavigate('profile');
        }}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 group cursor-pointer"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
            currentView === 'profile'
              ? 'bg-[#6750a4] text-white shadow-xs'
              : 'text-[#494551] group-hover:bg-[#f3f3f3]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentView === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
        </div>
        <span
          className={`text-[11px] mt-0.5 font-medium ${
            currentView === 'profile' ? 'text-[#4f378a] font-semibold' : 'text-[#494551]'
          }`}
        >
          Profile
        </span>
      </button>
    </nav>
  );
};
