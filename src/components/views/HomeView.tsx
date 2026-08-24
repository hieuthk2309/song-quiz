import React, { useState } from 'react';
import { ViewMode, UserProfile, QuizCategory } from '../../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';

interface HomeViewProps {
  user: UserProfile;
  categories?: QuizCategory[];
  isLoadingCategories?: boolean;
  isSpotifyActive?: boolean;
  spotifyUser?: { displayName: string; avatar: string | null } | null;
  myPlaylists?: any[];
  isLoadingPlaylists?: boolean;
  onNavigate: (view: ViewMode) => void;
  onStartQuiz: (categoryId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  categories = DEFAULT_CATEGORIES,
  isLoadingCategories = false,
  isSpotifyActive = true,
  spotifyUser = null,
  myPlaylists = [],
  isLoadingPlaylists = false,
  onNavigate,
  onStartQuiz,
}) => {
  const currentCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [selectedTopic, setSelectedTopic] = useState<string>(currentCategories[0]?.id || 'hot-pop');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleQuickPlay = () => {
    soundEngine.playClick();
    onStartQuiz(selectedTopic);
  };

  const filteredCategories = selectedFilter === 'all'
    ? currentCategories
    : currentCategories.filter(c => c.tag.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="w-full flex flex-col pb-24 md:pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] md:min-h-[560px] overflow-hidden flex items-center justify-center">
        {/* Background Image with Concert/Festival theme */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 hero-gradient z-10" />
        <div className="absolute inset-0 hero-pattern z-20" />

        <div className="relative z-30 max-w-7xl mx-auto px-4 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 w-full">
          {/* Left Text & CTA */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-4 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#4ffbe6] tracking-wider uppercase">
              <span className="material-symbols-outlined text-[16px]">headphones</span>
              {isSpotifyActive ? 'Spotify Connected • V-Pop 2024' : 'V-Pop Master Quiz 2024'}
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Bậc Thầy Giai Điệu
            </h2>

            <p className="text-base sm:text-lg text-[#cfbcff] max-w-xl">
              Thử thách kiến thức âm nhạc của bạn về những bản hit, nghệ sĩ và giai điệu đỉnh cao. Khám phá {isLoadingCategories ? 'hàng chục' : currentCategories.length} danh mục âm nhạc phong phú!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
              <button
                id="hero-start-play-btn"
                onClick={handleQuickPlay}
                className="bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                Bắt đầu chơi ngay
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

          {/* Right: Glass High Score Card */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
            <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-6 flex flex-col items-center text-white shadow-xl w-full">
              <div className="flex items-center gap-2 mb-2 text-[#4ffbe6]">
                <span className="material-symbols-outlined text-[22px]">trophy</span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  Global Rank #{user.globalRank}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {user.highScore.toLocaleString()} pts
              </div>
              <p className="text-xs text-[#cfbcff] mt-1">Cấp độ {user.level} • {user.correctAnswers} câu trả lời đúng</p>

              <div className="w-full mt-4 pt-4 border-t border-white/20 flex justify-around text-center text-xs">
                <div>
                  <span className="text-[#4ffbe6] font-bold text-base block">{user.totalGames}</span>
                  <span className="text-[#e0d2ff]">Trận đã chơi</span>
                </div>
                <div className="border-r border-white/20" />
                <div>
                  <span className="text-[#4ffbe6] font-bold text-base block">
                    {user.totalGames > 0 ? Math.round((user.correctAnswers / (user.correctAnswers + user.wrongAnswers || 1)) * 100) : 100}%
                  </span>
                  <span className="text-[#e0d2ff]">Độ chính xác</span>
                </div>
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
                {isLoadingCategories
                  ? 'Đang tải danh mục...'
                  : currentCategories.find((c) => c.id === selectedTopic)?.name || currentCategories[0]?.name || 'Hot Pop'}
              </h4>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <select
                id="select-topic-dropdown"
                value={selectedTopic}
                disabled={isLoadingCategories}
                onChange={(e) => {
                  soundEngine.playClick();
                  setSelectedTopic(e.target.value);
                }}
                className="w-full appearance-none bg-[#f9f9f9] border border-[#cbc4d2] text-[#1a1c1c] font-medium text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-[#4f378a] transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoadingCategories ? (
                  <option>Đang tải danh mục từ Spotify...</option>
                ) : (
                  currentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.questionCount}+ câu)
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7a7582]">
                <span className="material-symbols-outlined text-[20px]">
                  {isLoadingCategories ? 'progress_activity' : 'expand_more'}
                </span>
              </div>
            </div>

            <button
              id="btn-quick-start-topic"
              onClick={handleQuickPlay}
              disabled={isLoadingCategories}
              className="w-full sm:w-auto bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              Chơi ngay
            </button>
          </div>
        </div>
      </section>

      {/* Category Selector (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-16 py-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl md:text-3xl font-bold text-[#1a1c1c]">Danh mục bài hát</h3>
              {isLoadingCategories ? (
                <span className="inline-flex items-center gap-1.5 bg-[#1db954]/15 text-[#1db954] text-xs font-bold px-3 py-1 rounded-full border border-[#1db954]/30 animate-pulse">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  Đang đồng bộ từ Spotify...
                </span>
              ) : (
                <span className="bg-[#e9ddff] text-[#4f378a] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {currentCategories.length} chủ đề
                </span>
              )}
            </div>
            <p className="text-sm text-[#494551] mt-1">Chọn lĩnh vực âm nhạc sở trường để bắt đầu thử thách</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['all', 'popular', 'trending', 'niche', 'classic', 'special'].map((filter) => (
              <button
                key={filter}
                disabled={isLoadingCategories}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedFilter(filter);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-[#4f378a] text-white shadow-xs'
                    : 'bg-white text-[#494551] border border-[#cbc4d2] hover:bg-[#f3f3f3]'
                } ${isLoadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {filter === 'all' ? 'Tất cả' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Content: Loading Animation or Grid */}
        {isLoadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="relative overflow-hidden rounded-3xl bg-[#f0edf5] border border-[#e2e2e2] h-72 flex flex-col justify-end p-6 animate-pulse"
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

                {/* Placeholder content skeleton */}
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="h-5 w-20 bg-[#cbc4d2]/60 rounded-full" />
                  <div className="h-6 w-3/4 bg-[#cbc4d2]/70 rounded-lg" />
                  <div className="h-3 w-full bg-[#cbc4d2]/40 rounded-md" />
                  <div className="h-3 w-2/3 bg-[#cbc4d2]/40 rounded-md" />

                  <div className="mt-2 pt-3 border-t border-[#cbc4d2]/40 flex items-center justify-between">
                    <div className="h-4 w-24 bg-[#cbc4d2]/50 rounded-md" />
                    <div className="w-5 h-5 rounded-full bg-[#cbc4d2]/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in duration-300">
            {filteredCategories.map((category) => (
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
                    className={`${category.tagBg || 'bg-[#4f378a]'} text-white text-xs font-semibold px-3 py-1 rounded-full mb-2.5 self-start shadow-xs`}
                  >
                    {category.tag}
                  </span>
                  <h4 className="text-xl font-bold tracking-tight">{category.name}</h4>
                  <p className="text-xs text-[#e2e2e2]/80 mt-1 line-clamp-2">{category.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#cfbcff]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px]">{category.icon || 'music_note'}</span>
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
        )}
      </section>

      {/* My Spotify Playlists Section */}
      {!spotifyUser ? (
        <section className="max-w-7xl mx-auto px-4 md:px-16 pb-6 w-full">
          <div className="bg-gradient-to-r from-[#1db954]/15 to-[#191414]/10 border border-[#1db954]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#1db954] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1c] text-sm">Kết nối Spotify của bạn</p>
                <p className="text-xs text-[#494551] mt-0.5">Đăng nhập để dùng playlist cá nhân làm bộ câu hỏi quiz</p>
              </div>
            </div>
            <a
              id="btn-spotify-login"
              href="/api/auth/spotify/login"
              className="shrink-0 bg-[#1db954] hover:bg-[#17a349] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              Đăng nhập Spotify
            </a>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 md:px-16 pb-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {spotifyUser.avatar && (
                <img src={spotifyUser.avatar} alt={spotifyUser.displayName} className="w-8 h-8 rounded-full object-cover border-2 border-[#1db954]" />
              )}
              <div>
                <h3 className="text-lg font-bold text-[#1a1c1c]">Playlist của tôi</h3>
                <p className="text-xs text-[#494551]">{spotifyUser.displayName} • {myPlaylists.length} playlist</p>
              </div>
            </div>
            <a href="/api/auth/spotify/login" className="text-xs text-[#1db954] hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Cập nhật
            </a>
          </div>

          {isLoadingPlaylists ? (
            <div className="flex items-center justify-center py-10 gap-3 text-[#494551]">
              <span className="material-symbols-outlined animate-spin text-[#1db954]">progress_activity</span>
              Đang tải danh sách playlist...
            </div>
          ) : myPlaylists.length === 0 ? (
            <div className="text-center py-8 text-[#7a7582] text-sm">
              Không tìm thấy playlist nào (cần ít nhất 4 bài hát)
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {myPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onStartQuiz(`playlist-${pl.id}`);
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-[#e2e2e2] cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 aspect-square flex flex-col justify-end"
                >
                  {pl.cover ? (
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${pl.cover}')` }} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954] to-[#191414] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[40px]">queue_music</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191414]/90 via-[#191414]/40 to-transparent" />
                  <div className="relative z-10 p-3 text-white">
                    <p className="font-bold text-sm leading-tight line-clamp-2">{pl.name}</p>
                    <p className="text-xs text-[#1db954] mt-0.5 font-medium">{pl.totalTracks} bài</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-[#1db954] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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
                Tạo phòng đấu hoặc nhập mã PIN để bắt đầu trận chiến âm nhạc thời gian thực!
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
