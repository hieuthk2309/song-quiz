import React, { useState, useRef } from 'react';
import { ViewMode } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface JoinRoomViewProps {
  onNavigate: (view: ViewMode) => void;
  onJoinRoom: (pin: string) => void;
}

export const JoinRoomView: React.FC<JoinRoomViewProps> = ({
  onNavigate,
  onJoinRoom,
}) => {
  const [pinCode, setPinCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanMessage, setScanMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setPinCode(val);
  };

  const handleJoin = () => {
    if (pinCode.length < 4) {
      soundEngine.playWrong();
      setScanMessage('Vui lòng nhập ít nhất 4 ký tự mã phòng!');
      return;
    }
    soundEngine.playCorrect();
    onJoinRoom(pinCode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundEngine.playClick();
      setScanMessage(`Đang phân tích mã QR từ "${file.name}"...`);
      setTimeout(() => {
        setPinCode('VP8866');
        setScanMessage('Đã phát hiện mã phòng: VP8866');
        soundEngine.playCorrect();
      }, 1000);
    }
  };

  const handleSimulateScan = () => {
    soundEngine.playClick();
    setScanMessage('Đang quét camera...');
    setTimeout(() => {
      setPinCode('TP9902');
      setScanMessage('Đã nhận diện mã QR: TP9902!');
      soundEngine.playCorrect();
    }, 800);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-16 flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-[#cbc4d2] rounded-3xl p-6 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1c1c] mb-2">
            Tham Gia Phòng
          </h2>
          <p className="text-sm md:text-base text-[#494551]">
            Chọn một cách để kết nối và bắt đầu trò chơi cùng bạn bè
          </p>
        </div>

        {/* 2-Column Grid: Left QR / Right PIN */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-8 md:gap-12 items-center">
          {/* Left: QR Scan */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-bold text-[#1a1c1c] mb-1">
              Quét mã QR
            </h3>
            <p className="text-xs md:text-sm text-[#494551] text-center mb-6 max-w-xs">
              Sử dụng camera hoặc nhấp vào khung hình để quét nhanh mã phòng.
            </p>

            {/* QR Viewfinder with scanline */}
            <div
              onClick={handleSimulateScan}
              title="Nhấn để quét mã QR giả lập"
              className="relative w-full max-w-[260px] aspect-square rounded-2xl bg-[#e8e8e8] overflow-hidden flex items-center justify-center group cursor-pointer shadow-inner"
            >
              <div className="absolute inset-0 border-4 border-[#17deca] rounded-2xl z-20 pointer-events-none transition-all duration-300 group-hover:border-[#4ffbe6]" />
              
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#17deca] shadow-[0_0_14px_rgba(23,222,202,0.9)] z-30 animate-scan pointer-events-none" />
              )}

              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK34QOPtA4qoiugvlJ-xAmLtrrEtZdCnvGyRE7iIr_q8kuS74PTw0SAku6PJKe5CWfVtumB5Cq0S4tq0w0aDnTqFjtXPkDplRL9AS5rPxeBbM_A-9N_WtQLbPAjs_qJaPwLOjS_39bKeSXrB6Sc43qgan45tg13HwBgHBCx6iYIe_KD8bMMT9eY8oeG1kUSJNDm_vuy0KTgClnEeKHe_hEtDOrvAtlYv0SegWA5wEl8f1hkAHhKs3kEw"
                alt="QR Code camera view"
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300 z-10"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-[#4f378a]/10 z-15 pointer-events-none" />
            </div>

            {scanMessage && (
              <p className="text-xs text-[#005148] font-semibold mt-2 text-center bg-[#40f1dd]/20 px-3 py-1 rounded-full animate-in fade-in">
                {scanMessage}
              </p>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 flex items-center justify-center gap-2 px-6 py-3 w-full max-w-[260px] border-2 border-[#4f378a] text-[#4f378a] bg-transparent rounded-2xl font-semibold text-sm hover:bg-[#e9ddff]/40 transition-colors duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Tải ảnh QR lên
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-full h-full bg-[#e2e2e2] rounded-full min-h-[300px]" />
          <div className="md:hidden w-full h-px bg-[#e2e2e2] rounded-full my-2" />

          {/* Right: Manual PIN Input */}
          <div className="flex flex-col items-center h-full justify-center">
            <div className="w-16 h-16 rounded-full bg-[#ffd9df] text-[#3f0018] flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[32px]">pin</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-[#1a1c1c] mb-1">
              Nhập mã thủ công
            </h3>
            <p className="text-xs md:text-sm text-[#494551] text-center mb-6 max-w-xs">
              Hoặc nhập mã phòng gồm 6 chữ số/chữ cái được cung cấp bởi Host.
            </p>

            <div className="w-full max-w-[280px] flex flex-col gap-6">
              <div className="relative">
                <input
                  id="input-room-pin"
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={handlePinChange}
                  placeholder="------"
                  className="w-full bg-[#f9f9f9] border-0 border-b-2 border-[#cbc4d2] text-center font-mono font-bold text-3xl md:text-4xl tracking-[0.25em] text-[#1a1c1c] placeholder:text-[#7a7582] focus:ring-0 focus:outline-none focus:border-[#4f378a] focus:border-2 focus:rounded-2xl focus:bg-white transition-all duration-300 py-3 uppercase shadow-inner"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {['TP9902', 'VP8866', 'MTP2024'].map((quickCode) => (
                  <button
                    key={quickCode}
                    onClick={() => {
                      soundEngine.playClick();
                      setPinCode(quickCode);
                    }}
                    className="text-xs bg-[#f3f3f3] hover:bg-[#e9ddff] text-[#4f378a] font-mono font-semibold px-2.5 py-1 rounded-lg border border-[#cbc4d2] cursor-pointer transition-colors"
                  >
                    #{quickCode}
                  </button>
                ))}
              </div>

              <button
                id="btn-join-room-submit"
                onClick={handleJoin}
                className="w-full bg-[#b70052] text-white rounded-2xl py-4 font-semibold text-base hover:bg-[#dd2269] transition-all duration-200 shadow-md active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
              >
                Tham Gia
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('create-room');
                }}
                className="text-xs text-[#4f378a] hover:underline text-center font-medium cursor-pointer"
              >
                Muốn tạo phòng mới? Nhấn vào đây
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
