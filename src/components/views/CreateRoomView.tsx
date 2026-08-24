import React, { useState } from 'react';
import { ViewMode, UserProfile, RoomParticipant, QuizCategory } from '../../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/quizData';
import { soundEngine } from '../../utils/soundEngine';

interface CreateRoomViewProps {
  user: UserProfile;
  categories?: QuizCategory[];
  onNavigate: (view: ViewMode) => void;
  onStartRoomGame: (category: string) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = ({
  user,
  categories = DEFAULT_CATEGORIES,
  onNavigate,
  onStartRoomGame,
}) => {
  const currentCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [roomPin] = useState<string>('TP9902');
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategories[0]?.id || 'hot-pop');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const [participants, setParticipants] = useState<RoomParticipant[]>([
    {
      id: 'host-1',
      name: `${user.displayName} (Host)`,
      avatarUrl: user.avatarUrl,
      isHost: true,
      ready: true,
    },
    {
      id: 'guest-1',
      name: 'SonTung_Fan99',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp9F14ZYNPybtpAkMg3DRWBODmjosd7-MzDNqwAuwF4dl80qXQC0NsklwhIOVE3__GH6oJmM7fEZrHQpqcIwnfyna-deZqGx3V7XV8u3osVMo3z0SsW-ecyaWZtHIyOtN-lpfxOBAsOIzJOaxvJZl_IghIloCXnFbWkq68MIB0SGQ32jomVWUWWV5ccelDpABxjyXxVfNiC4V55Mc0ZhNlrkKofWXA7Yui60wmrHHM8SIU3jZGe8ZYJw',
      isHost: false,
      ready: true,
    },
    {
      id: 'guest-2',
      name: 'IndieSoul_Vn',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEbQ4vayRryqOrKLDxJNpXQNjpYQRN4wPS1j4WyeagYDO3th3hPj52RMSrZmET3TTK8TjQtyq-oVinLFQjspDFvgoifUdgdkdKvZXcgyVJIPYfTGiDC7RFsJ320XXiF9l-qUHAHrWxkVzGsAiqSNP1kXEiOeLzhQuS0UqoXJ4qvI9RNr0Cj2zb_h6qwjUobxcqQKH4dRC_g_rMtCGbXT1O3gdf2Q-Bjn4a2sGwmP0uenkmnxYrMC0zEA',
      isHost: false,
      ready: true,
    },
  ]);

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(roomPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBot = () => {
    soundEngine.playClick();
    if (participants.length >= 6) return;
    const botNames = ['BeatMaster_HCM', 'PopQueen_HN', 'Acoustic_DaLat'];
    const newParticipant: RoomParticipant = {
      id: `bot-${Date.now()}`,
      name: botNames[participants.length % botNames.length],
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAow6oQIOU-O1FsLj_3OAN55z6khECTyWjcp4WQunAZAITNZtbw9kQ4X04Mg_CRW6mpi6S5IVxNhDVeSbEJJ_FyewQchDf0wLZ8QfdpHq9INiqPsmKSYzv5XHiV8W-LRPCU7KMsVxRAAl49vKWkyP6lCdI_0VEjDgwXqOPcaNoXL71TdWLFPbrAtxtRS7F4FHZmWGbEGmzZinIYHH6prTGF8JSE-VFR7gBDFYMxOI7oSbn6SfpEJ71y9w',
      isHost: false,
      ready: true,
    };
    setParticipants((prev) => [...prev, newParticipant]);
  };

  const handleStartGame = () => {
    soundEngine.playCorrect();
    onStartRoomGame(selectedCategory);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl mx-auto bg-white border border-[#cbc4d2] rounded-3xl p-6 md:p-10 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#e2e2e2]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#b70052]">
              PHÒNG ĐẤU NHIỀU NGƯỜI
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] flex items-center gap-2">
              Mã phòng: <span className="text-[#4f378a] font-mono">#{roomPin}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-[#e9ddff] hover:bg-[#cfbcff] text-[#4f378a] font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Đã sao chép!' : 'Sao chép mã'}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-full hover:bg-[#e8e8e8] text-[#7a7582] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Room Config & QR Sharing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          {/* Left: Settings */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494551] mb-2">
                Thể loại âm nhạc
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'border-[#4f378a] bg-[#e9ddff]/40 text-[#4f378a] font-bold shadow-xs'
                        : 'border-[#cbc4d2] bg-[#f9f9f9] text-[#1a1c1c] hover:bg-[#f3f3f3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon || 'music_note'}</span>
                    <span className="text-xs md:text-sm line-clamp-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494551] mb-2">
                Số lượng câu hỏi
              </label>
              <div className="flex gap-3">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      soundEngine.playClick();
                      setQuestionCount(cnt);
                    }}
                    className={`flex-1 py-2.5 rounded-xl border text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                      questionCount === cnt
                        ? 'border-[#b70052] bg-[#ffd9df] text-[#3f0018] shadow-xs'
                        : 'border-[#cbc4d2] bg-[#f9f9f9] text-[#1a1c1c]'
                    }`}
                  >
                    {cnt} Câu
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: QR Code Visual */}
          <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#e2e2e2] flex flex-col items-center justify-center text-center">
            <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-[#cbc4d2] shadow-sm mb-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK34QOPtA4qoiugvlJ-xAmLtrrEtZdCnvGyRE7iIr_q8kuS74PTw0SAku6PJKe5CWfVtumB5Cq0S4tq0w0aDnTqFjtXPkDplRL9AS5rPxeBbM_A-9N_WtQLbPAjs_qJaPwLOjS_39bKeSXrB6Sc43qgan45tg13HwBgHBCx6iYIe_KD8bMMT9eY8oeG1kUSJNDm_vuy0KTgClnEeKHe_hEtDOrvAtlYv0SegWA5wEl8f1hkAHhKs3kEw"
                alt="QR Code"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-[#7a7582]">
              Quét mã để bạn bè cùng tham gia phòng trực tiếp
            </p>
          </div>
        </div>

        {/* Participants List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-base text-[#1a1c1c]">
              Người tham gia ({participants.length}/6)
            </h3>
            {participants.length < 6 && (
              <button
                onClick={handleAddBot}
                className="text-xs text-[#4f378a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Thêm người chơi giả lập
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-[#f9f9f9] border border-[#e2e2e2] rounded-2xl"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#4f378a] shrink-0">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1a1c1c] truncate">{p.name}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#006b61]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006b61]" />
                    Sẵn sàng
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="flex gap-4">
          <button
            id="btn-start-room-game"
            onClick={handleStartGame}
            className="flex-1 bg-[#b70052] hover:bg-[#dd2269] text-white font-semibold text-base py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">play_arrow</span>
            Bắt đầu trận đấu
          </button>
        </div>
      </div>
    </main>
  );
};
