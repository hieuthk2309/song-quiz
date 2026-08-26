let activeAudio: HTMLAudioElement | null = null;
let activeReject: ((error: Error) => void) | null = null;

export function stopQuestionIntroAudio() {
  activeReject?.(new Error('Question intro audio cancelled'));
  activeReject = null;
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio.src = '';
  activeAudio = null;
}

export function playQuestionIntroAudio(promptType: 'melody' | 'artist' | 'lyric' | 'year' | 'album') {
  stopQuestionIntroAudio();
  const source = promptType === 'artist' ? '/assets/whatsinger.mp3' : '/assets/whatsong.mp3';

  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(source);
    activeAudio = audio;
    activeReject = reject;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      if (activeAudio === audio) activeAudio = null;
      if (activeReject === reject) activeReject = null;
      error ? reject(error) : resolve();
    };

    audio.onended = () => finish();
    audio.onerror = () => finish(new Error('Question intro audio playback failed'));
    audio.play().catch((error) => finish(error instanceof Error ? error : new Error('Autoplay blocked')));
  });
}