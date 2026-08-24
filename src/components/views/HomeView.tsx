import React, { useState } from 'react';
import { ViewMode, UserProfile, QuizCategory } from '../../types';
import { CATEGORIES } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (view: ViewMode) => void;
  onStartQuiz: (categoryId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onStartQuiz,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('hot-pop');

  const handleQuickPlay = () => {
    soundEngine.playClick();
    onStartQuiz(selectedTopic);
  };

  return (
    <div className="w-full flex flex-col pb-24 md:pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] md:min-h-[560px] overflow-hidden flex items-center justify-center">
        {/* Background Image with Concert/Festival theme */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC8KluJZ5T2vpa-oEmHAPaazJqCGm9aBM2oyq28ttIuit3AxACP-GqiU4nFNcjQfHJ8UZdfozb_RbvZlgBs-zGFv5p9ClOvJDIvqVFjdnrlf1P5OcAyCBcKUTVGGoC-_7hA7d4UNTsmGkff_YoGrrdI1c_ZAYNN99iv6yebpNgORH3Cvf81i2f-9HRzxE9W5SIudPCX_j5S0Qu6XX_954LJaGft0RmsrABtYtY6w0Ok8oz2JF3Hr_kceg')`,
          }}
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 hero-gradient z-10" />
        <div className="absolute inset-0 hero-pattern z-20" />

        <div className="relative z-30 max-w-7xl mx-auto px-4 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 w-full">
          {/* Left Text & CTA */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-4 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#4ffbe6] tracking-wider uppercase">
              <span className="material-symbols-outlined text-[16px]">headphones</span>
              Âm Nhạc V-Pop 2024
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Bậc Thầy Giai Điệu
            </h2>

            <p className="text-base sm:text-lg text-[#cfbcff] max-w-xl">
              Thử thách kiến thức của bạn về những bản hit, nghệ sĩ và giai điệu đỉnh cao trong thế giới nhạc Việt. Nghe nhạc và trổ tài ngay!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
              <button
                id="hero-start-play-btn"
                onClick={handleQuickPlay}
                className="bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                Bắt đầu chơi
              </button>

              <button
                id="hero-join-room-btn"
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('join-room');
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold text-base px-6 py-4 rounded-2xl backdrop-blur-md border border-white/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">group</span>
                Phòng đấu ({user.globalRank <= 50 ? 'Live' : 'Mở'})
              </button>
            </div>
          </div>

          {/* Right: Logo & Glassmorphism High Score Card */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
            {/* Logo Badge */}
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-3xl bg-white/95 p-3.5 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk00T3f_9y9K2pBkZwqy_xRDU49V4trbFy5EldKDCG1ElqJzVsQ_1Y8FTVpnda5xMCOs6-SdlxBpOxSjOQi72D6c8L7B5GlkoKpKuTJYcekhgxV2fU1OZPvIArgzuQcwXSK7vXauj5QwV9C6EP0M5Rto4X-wtlGiJQod5N4XUUyBPKEOHWSu1GZTQhWHcNgVu4VSHT9tkq0LRLQoUg87AnTsA8P7ya-wmZo0j1GwaPcRkoNQZ72rY-sA"
                alt="Vpop Master Quiz Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Glass High Score Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-5 flex flex-col items-center text-white shadow-xl w-full">
              <div className="flex items-center gap-2 mb-1 text-[#4ffbe6]">
                <span className="material-symbols-outlined text-[20px]">trophy</span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  Global Rank #{user.globalRank}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {user.highScore.toLocaleString()}
              </div>
              <div className="text-xs text-[#cfbcff] mt-1 flex items-center gap-2">
                <span>Kỷ lục cá nhân</span>
                <span>•</span>
                <span>{user.totalGames} ván đã đấu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Topic Selector Mobile Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-16 -mt-6 z-30 w-full">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-[#cbc4d2] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#e9ddff] text-[#4f378a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">music_note</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7a7582]">Chủ đề đang chọn</p>
              <h4 className="font-bold text-base md:text-lg text-[#1a1c1c]">
                {CATEGORIES.find((c) => c.id === selectedTopic)?.name || 'Hot Pop'}
              </h4>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <select
                id="select-topic-dropdown"
                value={selectedTopic}
                onChange={(e) => {
                  soundEngine.playClick();
                  setSelectedTopic(e.target.value);
                }}
                className="w-full appearance-none bg-[#f9f9f9] border border-[#cbc4d2] text-[#1a1c1c] font-medium text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-[#4f378a] transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.questionCount}+ câu)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7a7582]">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>

            <button
              id="btn-quick-start-topic"
              onClick={handleQuickPlay}
              className="w-full sm:w-auto bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              Chơi ngay
            </button>
          </div>
        </div>
      </section>

      {/* Category Selector (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-16 py-12 w-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1c1c]">Chọn một danh mục</h3>
            <p className="text-sm text-[#494551] mt-1">Chọn lĩnh vực âm nhạc sở trường của bạn</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onStartQuiz('hot-pop');
            }}
            className="text-[#4f378a] font-semibold text-sm hover:underline flex items-center gap-1 cursor-pointer"
          >
            Chơi ngẫu nhiên
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                soundEngine.playClick();
                onStartQuiz(category.id);
              }}
              className="group relative overflow-hidden rounded-3xl bg-white border border-[#e2e2e2] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-72 flex flex-col justify-end p-6"
            >
              {/* Background Cover */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${category.coverImage}')` }}
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1c]/95 via-[#1a1c1c]/50 to-transparent" />

              {/* Card Content */}
              <div className="relative z-10 text-white flex flex-col">
                <span
                  className={`${category.tagBg} text-white text-xs font-semibold px-3 py-1 rounded-full mb-2.5 self-start shadow-xs`}
                >
                  {category.tag}
                </span>
                <h4 className="text-xl font-bold tracking-tight">{category.name}</h4>
                <p className="text-xs text-[#e2e2e2]/80 mt-1 line-clamp-2">{category.description}</p>
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#cfbcff]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px]">{category.icon}</span>
                    {category.questionCount}+ Câu hỏi
                  </span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform text-[#4ffbe6]">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Multiplayer Challenge Highlight */}
      <section className="max-w-7xl mx-auto px-4 md:px-16 pb-12 w-full">
        <div className="bg-gradient-to-r from-[#4f378a] to-[#005148] rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
              🔥
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-bold">Thách Đấu Cùng Bạn Bè</h4>
              <p className="text-sm text-[#e0d2ff] mt-1">
                Tạo phòng đấu hoặc quét mã QR để bắt đầu trận chiến âm nhạc thời gian thực!
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                soundEngine.playClick();
                onNavigate('create-room');
              }}
              className="flex-1 md:flex-none bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Tạo phòng
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onNavigate('join-room');
              }}
              className="flex-1 md:flex-none bg-white text-[#4f378a] hover:bg-[#f3f3f3] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              Vào phòng
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
