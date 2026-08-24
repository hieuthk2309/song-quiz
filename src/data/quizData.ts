import { QuizCategory, QuizQuestion, LeaderboardPlayer } from '../types';

export const CATEGORIES: QuizCategory[] = [
  {
    id: 'hot-pop',
    name: 'Hot Pop',
    tag: 'Popular',
    questionCount: 150,
    icon: 'library_music',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-mhDkIVbhW_qPboX3smRWrg6N1tZ9BkIkIATFpdeGA32AhxWznLAR7mmhjDL4axCs7xquVnDZFVjnEm7wI7TfsaNYiJPvXAqfxwn2iSuuY9eYBmYA_mVlV7WHWHQPdJL8ZlLoyJNGmDdLVV35MASpDzCzev0ROMPDnKs6UiZMIz_LaSw9c8N4jG4gJBFkKX5qHoqyZt2zxTWq_A5hH31fC4pIekmkE2GxSCIfORxxYl-wFHpei8dyYA',
    description: 'Những bản hit bùng nổ các bảng xếp hạng âm nhạc hiện nay.',
    gradient: 'from-[#4f378a]/90 to-[#b70052]/90',
    tagBg: 'bg-[#b70052]',
  },
  {
    id: '2010s-hits',
    name: '2010s Hits',
    tag: 'Trending',
    questionCount: 200,
    icon: 'album',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADHATFK37p3uRYoMEw0hXxw4M3ejr2dCD6fhORmcUSr3U8ue_s4nTkwDLb_5-FoiRdyh4yhjD0rQx2xU0cHFyS38wNTf9i7-Bzbqd_JatZ7PBD6iNNRS6RzpKCX2S_V1-yIWNT6izoqtAGVYQITB5OLJdWwWAZFxXlcD6QyGWEVX7BEbJgNBiTc0y9yyEIGanRkOd7rSS_KUh78cSat6MaVNxvonEEh4ewk3kFT9LT_NpLImqDE5ufGQ',
    description: 'Thời kỳ hoàng kim của Pop, EDM và những giai điệu thanh xuân.',
    gradient: 'from-[#006b61]/90 to-[#4f378a]/90',
    tagBg: 'bg-[#4f378a]',
  },
  {
    id: 'indie',
    name: 'Indie Vietnam',
    tag: 'Niche',
    questionCount: 80,
    icon: 'headphones',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJiqt8FjFqU_mqChdFQhM1YEJBJDPlEUGV-e702PX03vKa0nGuaiukRKV4kUgqc_tKdRhzOJUrYDejYvDiBBqIMhzaZONa4rMBXLxSUq8Anj3VYuvtOQG_LVF58tRRBt1TZLu8F2m7kHo1IgJ8NOR7h6QKZ82S0dNwE6y_YRrh1WuSOFIJT3iL_NdiD5xDXrtORJ8iEg4KUCDYt9Y-6hyo2ehxvq3XVBZzA-du1zn6SWy0Xns5eaydjg',
    description: 'Âm nhạc mộc mạc, sâu lắng từ những nghệ sĩ độc lập tài năng.',
    gradient: 'from-[#005148]/90 to-[#17deca]/70',
    tagBg: 'bg-[#005148]',
  },
  {
    id: 'rap-viet',
    name: 'Rap Việt',
    tag: 'Popular',
    questionCount: 120,
    icon: 'mic',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8KluJZ5T2vpa-oEmHAPaazJqCGm9aBM2oyq28ttIuit3AxACP-GqiU4nFNcjQfHJ8UZdfozb_RbvZlgBs-zGFv5p9ClOvJDIvqVFjdnrlf1P5OcAyCBcKUTVGGoC-_7hA7d4UNTsmGkff_YoGrrdI1c_ZAYNN99iv6yebpNgORH3Cvf81i2f-9HRzxE9W5SIudPCX_j5S0Qu6XX_954LJaGft0RmsrABtYtY6w0Ok8oz2JF3Hr_kceg',
    description: 'Những con flow đỉnh cao, punchline gắt và beat bốc lửa.',
    gradient: 'from-[#b70052]/90 to-[#6750a4]/90',
    tagBg: 'bg-[#dd2269]',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    category: 'hot-pop',
    question: 'Nghệ sĩ nào đã phát hành bản hit đầu tay "Anh Nhà Ở Đâu Thế?" vào năm 2019?',
    promptType: 'artist',
    songTitle: 'Anh Nhà Ở Đâu Thế?',
    artist: 'AMEE ft. B Ray',
    releaseYear: 2019,
    options: ['Amee', 'Min', 'Bich Phuong', 'Hoang Thuy Linh'],
    correctIndex: 0,
    explanation: 'AMEE chính thức debut vào tháng 4 năm 2019 với đĩa đơn "Anh Nhà Ở Đâu Thế?" kết hợp cùng B Ray và nhanh chóng tạo nên cơn sốt V-pop.',
    melodyNotes: [
      { freq: 587.33, duration: 0.3 }, // D5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 783.99, duration: 0.4 }, // G5
      { freq: 880.00, duration: 0.3 }, // A5
      { freq: 783.99, duration: 0.3 }, // G5
      { freq: 659.25, duration: 0.5 }, // E5
    ],
  },
  {
    id: 'q-2',
    category: 'hot-pop',
    question: 'Đây là bài hát nào với giai điệu gây bão mạng xã hội suốt năm 2023?',
    promptType: 'melody',
    songTitle: 'Cắt Đôi Nỗi Sầu',
    artist: 'Tăng Duy Tân',
    releaseYear: 2023,
    options: [
      'Cắt Đôi Nỗi Sầu - Tăng Duy Tân',
      'Lệ Lưu Ly - Vũ Phụng Tiên',
      'Ngày Mai Người Ta Lấy Chồng - Thành Đạt',
      'Khuất Lối - H-Kray',
    ],
    correctIndex: 0,
    explanation: '"Cắt Đôi Nỗi Sầu" của Tăng Duy Tân sản xuất bởi Drum7 phát hành tháng 10/2023, thống trị vị trí #1 trending YouTube và TikTok Việt Nam.',
    melodyNotes: [
      { freq: 440.0, duration: 0.25 }, // A4
      { freq: 523.25, duration: 0.25 }, // C5
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 523.25, duration: 0.25 }, // C5
      { freq: 440.0, duration: 0.35 },  // A4
      { freq: 392.0, duration: 0.35 },  // G4
      { freq: 440.0, duration: 0.6 },   // A4
    ],
  },
  {
    id: 'q-3',
    category: 'hot-pop',
    question: 'MV "Hãy Trao Cho Anh" (2019) của Sơn Tùng M-TP có sự góp mặt đặc biệt của huyền thoại rap quốc tế nào?',
    promptType: 'artist',
    songTitle: 'Hãy Trao Cho Anh',
    artist: 'Sơn Tùng M-TP ft. Snoop Dogg',
    releaseYear: 2019,
    options: ['Eminem', 'Snoop Dogg', 'Wiz Khalifa', '50 Cent'],
    correctIndex: 1,
    explanation: 'Sơn Tùng M-TP đã hợp tác lịch sử cùng rapper Snoop Dogg và nữ chính Madison Beer trong siêu phẩm "Hãy Trao Cho Anh".',
    melodyNotes: [
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 587.33, duration: 0.2 }, // D5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 783.99, duration: 0.4 }, // G5
      { freq: 659.25, duration: 0.5 }, // E5
    ],
  },
  {
    id: 'q-4',
    category: 'hot-pop',
    question: 'Giai điệu vui tươi "Để Mị Nói Cho Mà Nghe" thuộc album nổi tiếng nào của Hoàng Thùy Linh?',
    promptType: 'album',
    songTitle: 'Để Mị Nói Cho Mà Nghe',
    artist: 'Hoàng Thùy Linh',
    releaseYear: 2019,
    options: ['LINK', 'Hoàng', 'Bánh Trôi Nước', 'Duyên Âm'],
    correctIndex: 1,
    explanation: '"Để Mị Nói Cho Mà Nghe" mở đường cho album "Hoàng" (2019), xuất sắc giành vô số giải thưởng Cống Hiến.',
    melodyNotes: [
      { freq: 523.25, duration: 0.2 },
      { freq: 587.33, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.3 },
      { freq: 880.0, duration: 0.4 },
      { freq: 1046.5, duration: 0.5 },
    ],
  },
  {
    id: 'q-5',
    category: 'hot-pop',
    question: 'Bản hit nào của MONO đã trở thành hiện tượng vũ đạo lan tỏa khắp châu Á năm 2022?',
    promptType: 'melody',
    songTitle: 'Waiting For You',
    artist: 'MONO',
    releaseYear: 2022,
    options: ['Waiting For You', 'Quên Anh Đi', 'Em Là', 'Chăm Hoa'],
    correctIndex: 0,
    explanation: '"Waiting For You" sản xuất bởi Onionn nằm trong album "22" của tân binh MONO đã trở thành ca khúc quốc dân của năm 2022.',
    melodyNotes: [
      { freq: 493.88, duration: 0.25 }, // B4
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 659.25, duration: 0.3 },  // E5
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 493.88, duration: 0.5 },  // B4
    ],
  },
  {
    id: 'q-6',
    category: 'indie',
    question: 'Ca khúc "Bước Qua Mùa Cô Đơn" và "Bước Qua Nhau" là sáng tác gắn liền với tên tuổi của hoàng tử Indie nào?',
    promptType: 'artist',
    songTitle: 'Bước Qua Mùa Cô Đơn',
    artist: 'Vũ.',
    releaseYear: 2020,
    options: ['Thái Đinh', 'Vũ.', 'Thịnh Suy', 'Trang'],
    correctIndex: 1,
    explanation: 'Vũ. (Hoàng Thái Vũ) được mệnh danh là "Hoàng tử Indie Việt" với loạt hit acoustic/ballad sâu lắng như Lạ Lùng, Bước Qua Nhau.',
    melodyNotes: [
      { freq: 392.0, duration: 0.4 },
      { freq: 440.0, duration: 0.4 },
      { freq: 493.88, duration: 0.4 },
      { freq: 587.33, duration: 0.6 },
    ],
  },
  {
    id: 'q-7',
    category: 'indie',
    question: 'Ca khúc indie mộc mạc "Một Đêm Say" (2019) do ai sáng tác và thể hiện?',
    promptType: 'artist',
    songTitle: 'Một Đêm Say',
    artist: 'Thịnh Suy',
    releaseYear: 2019,
    options: ['Ngọt', 'Thịnh Suy', 'Cá Hồi Hoang', 'Da LAB'],
    correctIndex: 1,
    explanation: '"Một Đêm Say" là hiện tượng indie năm 2019 do ca nhạc sĩ trẻ Thịnh Suy tự đàn tự hát.',
    melodyNotes: [
      { freq: 349.23, duration: 0.3 },
      { freq: 392.0, duration: 0.3 },
      { freq: 440.0, duration: 0.3 },
      { freq: 523.25, duration: 0.5 },
    ],
  },
  {
    id: 'q-8',
    category: '2010s-hits',
    question: 'Bản hit pop dance "Ghen" (2017) của Khắc Hưng do cặp đôi ca sĩ nào thể hiện?',
    promptType: 'artist',
    songTitle: 'Ghen',
    artist: 'Erik ft. Min',
    releaseYear: 2017,
    options: ['Erik & Min', 'Soobin Hoàng Sơn & Suni Hạ Linh', 'Noo Phước Thịnh & Đông Nhi', 'Trọng Hiếu & Hoàng Thùy Linh'],
    correctIndex: 0,
    explanation: '"Ghen" do Khắc Hưng sáng tác và Erik x Min thể hiện, sau này được chuyển thể thành bản hit toàn cầu "Ghen Cô Vy" trong đại dịch 2020.',
    melodyNotes: [
      { freq: 523.25, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 523.25, duration: 0.4 },
    ],
  },
  {
    id: 'q-9',
    category: 'rap-viet',
    question: 'Ca khúc "Trốn Tìm" (2021) của Đen Vâu có sự góp giọng kinh điển của ban nhạc huyền thoại nào?',
    promptType: 'artist',
    songTitle: 'Trốn Tìm',
    artist: 'Đen ft. MTV Band',
    releaseYear: 2021,
    options: ['Bức Tường', 'MTV Band', '1088', 'Quả Dưa Hấu'],
    correctIndex: 1,
    explanation: '"Trốn Tìm" là sự kết hợp xúc động giữa chất thơ mộc mạc của Đen Vâu và giọng bè điêu luyện của nhóm MTV.',
    melodyNotes: [
      { freq: 440.0, duration: 0.3 },
      { freq: 493.88, duration: 0.3 },
      { freq: 587.33, duration: 0.3 },
      { freq: 659.25, duration: 0.5 },
    ],
  },
  {
    id: 'q-10',
    category: 'hot-pop',
    question: 'Ca khúc "Từng Quen" (2023) với giai điệu R&B bắt tai là sản phẩm của nghệ sĩ Gen Z nào?',
    promptType: 'artist',
    songTitle: 'Từng Quen',
    artist: 'Wren Evans',
    releaseYear: 2023,
    options: ['Grey D', 'Wren Evans', 'MCK', 'Captain Boy'],
    correctIndex: 1,
    explanation: '"Từng Quen" nằm trong album "LoiChoi" của Wren Evans đã đứng đầu Apple Music & Spotify Việt Nam nhiều tuần liên tiếp.',
    melodyNotes: [
      { freq: 587.33, duration: 0.25 },
      { freq: 659.25, duration: 0.25 },
      { freq: 783.99, duration: 0.25 },
      { freq: 880.0, duration: 0.4 },
    ],
  }
];

export const INITIAL_LEADERBOARD: LeaderboardPlayer[] = [
  {
    rank: 1,
    name: 'SonTung_OfficialFan',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp9F14ZYNPybtpAkMg3DRWBODmjosd7-MzDNqwAuwF4dl80qXQC0NsklwhIOVE3__GH6oJmM7fEZrHQpqcIwnfyna-deZqGx3V7XV8u3osVMo3z0SsW-ecyaWZtHIyOtN-lpfxOBAsOIzJOaxvJZl_IghIloCXnFbWkq68MIB0SGQ32jomVWUWWV5ccelDpABxjyXxVfNiC4V55Mc0ZhNlrkKofWXA7Yui60wmrHHM8SIU3jZGe8ZYJw',
    score: 18450,
    tier: 'Diamond',
    badge: '🏆 Quán Quân Vpop',
    streak: 24,
  },
  {
    rank: 2,
    name: 'MelodyHunter_99',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAow6oQIOU-O1FsLj_3OAN55z6khECTyWjcp4WQunAZAITNZtbw9kQ4X04Mg_CRW6mpi6S5IVxNhDVeSbEJJ_FyewQchDf0wLZ8QfdpHq9INiqPsmKSYzv5XHiV8W-LRPCU7KMsVxRAAl49vKWkyP6lCdI_0VEjDgwXqOPcaNoXL71TdWLFPbrAtxtRS7F4FHZmWGbEGmzZinIYHH6prTGF8JSE-VFR7gBDFYMxOI7oSbn6SfpEJ71y9w',
    score: 17200,
    tier: 'Diamond',
    badge: '⚡ Siêu Thính Giác',
    streak: 18,
  },
  {
    rank: 3,
    name: 'IndieLover_Vn',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEbQ4vayRryqOrKLDxJNpXQNjpYQRN4wPS1j4WyeagYDO3th3hPj52RMSrZmET3TTK8TjQtyq-oVinLFQjspDFvgoifUdgdkdKvZXcgyVJIPYfTGiDC7RFsJ320XXiF9l-qUHAHrWxkVzGsAiqSNP1kXEiOeLzhQuS0UqoXJ4qvI9RNr0Cj2zb_h6qwjUobxcqQKH4dRC_g_rMtCGbXT1O3gdf2Q-Bjn4a2sGwmP0uenkmnxYrMC0zEA',
    score: 16100,
    tier: 'Diamond',
    badge: '🎵 Chill Master',
    streak: 15,
  },
  {
    rank: 42,
    name: 'Bạn (Player)',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC46dd6dOyLzYc9J5PXdcmCnvq4EBFYgZyKv7g6vsg4EpvlmVmpELJkUkxmZ8OLaJmjtkLGsfLMj1a75hRNc7qL5ECKd0VDlD9IQmfHHalf9cVt9bLuzk_Qko--bycL5mWDWwLE3j9-MWMDGy6ALcQE38lBuoakgj3Roq8fMHImVuN7BtZ_Xu4qxphBOA2fO-A-_smi5L-otneAOcAhWDVhapLRVfVOOzwxdOHTrOuAA_ZVSVfd2AhE9g',
    score: 14250,
    tier: 'Gold',
    badge: '🔥 Fan Cứng Vpop',
    streak: 12,
    isCurrentUser: true,
  },
  {
    rank: 43,
    name: 'RapViet_Freestyle',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp9F14ZYNPybtpAkMg3DRWBODmjosd7-MzDNqwAuwF4dl80qXQC0NsklwhIOVE3__GH6oJmM7fEZrHQpqcIwnfyna-deZqGx3V7XV8u3osVMo3z0SsW-ecyaWZtHIyOtN-lpfxOBAsOIzJOaxvJZl_IghIloCXnFbWkq68MIB0SGQ32jomVWUWWV5ccelDpABxjyXxVfNiC4V55Mc0ZhNlrkKofWXA7Yui60wmrHHM8SIU3jZGe8ZYJw',
    score: 14100,
    tier: 'Gold',
    badge: '🎤 Flow Master',
    streak: 9,
  }
];

export const AVATAR_OPTIONS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBp9F14ZYNPybtpAkMg3DRWBODmjosd7-MzDNqwAuwF4dl80qXQC0NsklwhIOVE3__GH6oJmM7fEZrHQpqcIwnfyna-deZqGx3V7XV8u3osVMo3z0SsW-ecyaWZtHIyOtN-lpfxOBAsOIzJOaxvJZl_IghIloCXnFbWkq68MIB0SGQ32jomVWUWWV5ccelDpABxjyXxVfNiC4V55Mc0ZhNlrkKofWXA7Yui60wmrHHM8SIU3jZGe8ZYJw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC46dd6dOyLzYc9J5PXdcmCnvq4EBFYgZyKv7g6vsg4EpvlmVmpELJkUkxmZ8OLaJmjtkLGsfLMj1a75hRNc7qL5ECKd0VDlD9IQmfHHalf9cVt9bLuzk_Qko--bycL5mWDWwLE3j9-MWMDGy6ALcQE38lBuoakgj3Roq8fMHImVuN7BtZ_Xu4qxphBOA2fO-A-_smi5L-otneAOcAhWDVhapLRVfVOOzwxdOHTrOuAA_ZVSVfd2AhE9g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAow6oQIOU-O1FsLj_3OAN55z6khECTyWjcp4WQunAZAITNZtbw9kQ4X04Mg_CRW6mpi6S5IVxNhDVeSbEJJ_FyewQchDf0wLZ8QfdpHq9INiqPsmKSYzv5XHiV8W-LRPCU7KMsVxRAAl49vKWkyP6lCdI_0VEjDgwXqOPcaNoXL71TdWLFPbrAtxtRS7F4FHZmWGbEGmzZinIYHH6prTGF8JSE-VFR7gBDFYMxOI7oSbn6SfpEJ71y9w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDEbQ4vayRryqOrKLDxJNpXQNjpYQRN4wPS1j4WyeagYDO3th3hPj52RMSrZmET3TTK8TjQtyq-oVinLFQjspDFvgoifUdgdkdKvZXcgyVJIPYfTGiDC7RFsJ320XXiF9l-qUHAHrWxkVzGsAiqSNP1kXEiOeLzhQuS0UqoXJ4qvI9RNr0Cj2zb_h6qwjUobxcqQKH4dRC_g_rMtCGbXT1O3gdf2Q-Bjn4a2sGwmP0uenkmnxYrMC0zEA'
];
