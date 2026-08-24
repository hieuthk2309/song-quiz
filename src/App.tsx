import React, { useState } from 'react';
import { ViewMode, UserProfile, MatchResult } from './types';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { MenuDrawer } from './components/modals/MenuDrawer';
import { HomeView } from './components/views/HomeView';
import { GameplayView } from './components/views/GameplayView';
import { ResultsView } from './components/views/ResultsView';
import { JoinRoomView } from './components/views/JoinRoomView';
import { CreateRoomView } from './components/views/CreateRoomView';
import { LeaguesView } from './components/views/LeaguesView';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { soundEngine } from './utils/soundEngine';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<string>('hot-pop');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);

  // User Profile State with local storage persistence fallback
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vpop_quiz_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // safe fallback
    }
    return {
      id: 'usr-1',
      displayName: 'Bạn (Player)',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC46dd6dOyLzYc9J5PXdcmCnvq4EBFYgZyKv7g6vsg4EpvlmVmpELJkUkxmZ8OLaJmjtkLGsfLMj1a75hRNc7qL5ECKd0VDlD9IQmfHHalf9cVt9bLuzk_Qko--bycL5mWDWwLE3j9-MWMDGy6ALcQE38lBuoakgj3Roq8fMHImVuN7BtZ_Xu4qxphBOA2fO-A-_smi5L-otneAOcAhWDVhapLRVfVOOzwxdOHTrOuAA_ZVSVfd2AhE9g',
      level: 5,
      exp: 1450,
      highScore: 14250,
      globalRank: 42,
      totalGames: 18,
      correctAnswers: 142,
      wrongAnswers: 28,
      soundEnabled: true,
      musicVolume: 0.8,
    };
  });

  // History matches state
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>(() => {
    try {
      const saved = localStorage.getItem('vpop_quiz_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // safe fallback
    }
    return [
      {
        id: 'hist-1',
        date: '23/08/2024',
        categoryName: 'HOT POP',
        score: 950,
        maxScore: 1000,
        correctCount: 9,
        wrongCount: 1,
        totalQuestions: 10,
        timeSpentSeconds: 68,
        maxStreak: 8,
        accuracy: 90,
      },
      {
        id: 'hist-2',
        date: '22/08/2024',
        categoryName: '2010S HITS',
        score: 820,
        maxScore: 1000,
        correctCount: 8,
        wrongCount: 2,
        totalQuestions: 10,
        timeSpentSeconds: 75,
        maxStreak: 6,
        accuracy: 80,
      },
      {
        id: 'hist-3',
        date: '21/08/2024',
        categoryName: 'INDIE VIETNAM',
        score: 750,
        maxScore: 1000,
        correctCount: 7,
        wrongCount: 3,
        totalQuestions: 10,
        timeSpentSeconds: 84,
        maxStreak: 5,
        accuracy: 70,
      },
    ];
  });

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('vpop_quiz_user', JSON.stringify(next));
      } catch {
        // safe
      }
      return next;
    });
  };

  const handleToggleSound = () => {
    const nextSound = !user.soundEnabled;
    soundEngine.setMuted(!nextSound);
    handleUpdateUser({ soundEnabled: nextSound });
  };

  const handleStartQuiz = (category: string) => {
    setActiveCategory(category);
    setCurrentView('game');
  };

  const handleFinishGame = (result: MatchResult) => {
    setLastMatchResult(result);
    setMatchHistory((prev) => {
      const next = [result, ...prev];
      try {
        localStorage.setItem('vpop_quiz_history', JSON.stringify(next));
      } catch {
        // safe
      }
      return next;
    });

    // Update career stats
    const newHigh = Math.max(user.highScore, result.score);
    handleUpdateUser({
      highScore: newHigh,
      totalGames: user.totalGames + 1,
      correctAnswers: user.correctAnswers + result.correctCount,
      wrongAnswers: user.wrongAnswers + result.wrongCount,
      exp: user.exp + Math.round(result.score / 2),
    });

    setCurrentView('results');
  };

  const handleClearHistory = () => {
    setMatchHistory([]);
    try {
      localStorage.removeItem('vpop_quiz_history');
    } catch {
      // safe
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col selection:bg-[#e9ddff] selection:text-[#4f378a]">
      {/* Top App Header (hidden during gameplay for maximum focus) */}
      {currentView !== 'game' && (
        <TopHeader
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenMenu={() => setIsMenuOpen(true)}
          user={user}
        />
      )}

      {/* Menu Drawer Modal */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeView
            user={user}
            onNavigate={(view) => setCurrentView(view)}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentView === 'game' && (
          <GameplayView
            category={activeCategory}
            onFinishGame={handleFinishGame}
            onExit={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            result={lastMatchResult}
            onPlayAgain={() => setCurrentView('game')}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'join-room' && (
          <JoinRoomView
            onNavigate={(view) => setCurrentView(view)}
            onJoinRoom={() => {
              // Connect and start room game
              setCurrentView('game');
            }}
          />
        )}

        {currentView === 'create-room' && (
          <CreateRoomView
            user={user}
            onNavigate={(view) => setCurrentView(view)}
            onStartRoomGame={(category) => {
              setActiveCategory(category);
              setCurrentView('game');
            }}
          />
        )}

        {currentView === 'leagues' && (
          <LeaguesView
            user={user}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={matchHistory}
            onNavigate={(view) => setCurrentView(view)}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            onUpdateUser={handleUpdateUser}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </div>

      {/* Mobile Responsive Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
}

export default App;
