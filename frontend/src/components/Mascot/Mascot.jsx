import { useRef, useEffect, useState } from 'react';
import styles from './Mascot.module.css';

import baseVideo from '../../assets/Базаовая анимация.mp4';
import neutralVideo from '../../assets/Спокойствие, наслаждение.mp4';
import happyVideo from '../../assets/Счастье.mp4';
import sadVideo from '../../assets/Грусть.mp4';
import enthusiasmVideo from '../../assets/Радость.mp4';
import fearVideo from '../../assets/Тревога.mp4';

const BASE_VIDEO = baseVideo;

const EMOTION_VIDEOS = {
  'нейтральный': neutralVideo,
  'счастье':     happyVideo,
  'грусть':      sadVideo,
  'энтузиазм':   enthusiasmVideo,
  'страх':       fearVideo,
};

export default function Mascot({ emotionTrigger }) {
  const videoRef = useRef(null);
  const [src, setSrc] = useState(BASE_VIDEO);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!emotionTrigger) return;
    const vid = EMOTION_VIDEOS[emotionTrigger.emotion];
    if (!vid) return;
    setSrc(vid);
  }, [emotionTrigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setVisible(false);

    const loadTimer = setTimeout(() => {
      video.load();
      const handleCanPlay = () => {
        video.loop = src === BASE_VIDEO;
        video.play().catch(() => {});
        setVisible(true);
      };
      video.addEventListener('canplay', handleCanPlay, { once: true });
    }, 150);

    return () => {
      clearTimeout(loadTimer);
      video.removeEventListener('canplay', () => {});
    };
  }, [src]);

  const handleEnded = () => {
    setSrc(BASE_VIDEO);
  };

  return (
    <video
      ref={videoRef}
      className={styles.mascotVideo}
      src={src}
      muted
      playsInline
      onEnded={handleEnded}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.15s ease' }}
    />
  );
}