'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#4f378a] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-[#4f378a]">Đang khởi động V-Pop Music Quiz...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <App />
    </main>
  );
}
