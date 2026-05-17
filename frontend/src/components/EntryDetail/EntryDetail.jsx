import { useState, useEffect } from 'react';
import { api } from '../../api';
import styles from './EntryDetail.module.css';

import {
  IconArrowLeft,
  IconWind, IconWalk, IconRun, IconHeart, IconList, IconBrain,
  IconPencil, IconCheckbox, IconMessage, IconUsers, IconHandStop,
  IconNotebook, IconStar, IconEye, IconMusic,
  IconSun, IconCloudRain, IconAlertTriangle, IconBolt,
  IconFlame, IconLeaf, IconMoodConfuzed,
} from '@tabler/icons-react';

const ICON_MAP = {
  'ti-wind': IconWind, 'ti-walk': IconWalk, 'ti-run': IconRun,
  'ti-heart': IconHeart, 'ti-list': IconList, 'ti-brain': IconBrain,
  'ti-pencil': IconPencil, 'ti-checkbox': IconCheckbox,
  'ti-message': IconMessage, 'ti-users': IconUsers, 'ti-hand': IconHandStop,
  'ti-notebook': IconNotebook, 'ti-star': IconStar, 'ti-eye': IconEye,
  'ti-music': IconMusic,
};

const EMOTION_ICONS = {
  'счастье': IconSun, 'грусть': IconCloudRain, 'страх': IconAlertTriangle,
  'энтузиазм': IconBolt, 'гнев': IconFlame, 'нейтральный': IconLeaf,
  'отвращение': IconMoodConfuzed,
};

const EMOTION_COLORS = {
  'нейтральный': '#4E87F2', 'счастье': '#FEDC54', 'грусть': '#2CB6FE',
  'энтузиазм': '#FFA85C', 'страх': '#AD87E3', 'гнев': '#F49191',
  'отвращение': '#7CC87C',
};

const TYPE_STYLE = {
  'телесная':    { bg: '#e8faf4', color: '#22a06b' },
  'когнитивная': { bg: '#e8f0fe', color: '#3b72d9' },
  'социальная':  { bg: '#f0ebfe', color: '#7c5cbf' },
  'рефлексия':   { bg: '#fff0e6', color: '#d97b22' },
};

const SPHERE_LABEL = {
  'самореализация': 'сфера самореализации',
  'связи': 'сфера связей',
  'ресурс': 'сфера ресурса',
};

const formatHeaderDate = (createdAt) => {
  const d = new Date(createdAt);
  return 'Запись от ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

const formatTimestamp = (createdAt) => {
  const d = new Date(createdAt);
  const today = new Date();
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `сегодня, ${time}`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + `, ${time}`;
};

export default function EntryDetail({ entry, onBack }) {
  const [stratData, setStratData] = useState({ sphere: null, empathy: null, strategies: [] });
  const [loading, setLoading] = useState(true);

  const primaryTag = entry.tags?.[0] || null;
  const EmotionIcon = EMOTION_ICONS[entry.emotion] || IconMoodConfuzed;
  const emotionColor = EMOTION_COLORS[entry.emotion] || '#4E87F2';

  useEffect(() => {
    api.getStrategies(entry.emotion, primaryTag)
      .then(setStratData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entry.id]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Back + date */}
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={onBack}>
            <IconArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>{formatHeaderDate(entry.createdAt)}</span>
        </div>
        {/* Entry card */}
        <div className={styles.card}>
          <div className={styles.timestamp}>{formatTimestamp(entry.createdAt)}</div>
          <p className={styles.entryText}>{entry.text}</p>
          {entry.tags?.length > 0 && (
            <div className={styles.tagsRow}>
              {entry.tags.map(t => (
                <span key={t} className={styles.tagChip}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Emotion + sphere */}
        <div className={styles.card}>
          <div className={styles.emotionRow}>
            <div className={styles.emotionDot} style={{ background: emotionColor }} />
            <span className={styles.emotionName}>{entry.emotion}</span>
            {stratData.sphere && (
              <span className={styles.sphereBadge}>{SPHERE_LABEL[stratData.sphere] || stratData.sphere}</span>
            )}
          </div>
        </div>

        {/* Mascot recommendation */}
        <div className={styles.card}>
          <div className={styles.mascotRow}>
            <div className={styles.emotionCircle} style={{ background: emotionColor + '33' }}>
              <EmotionIcon size={28} color={emotionColor} />
            </div>
            <div className={styles.mascotText}>
              <div className={styles.empathy}>{stratData.empathy || 'Понимаю тебя'}</div>
              <div className={styles.recommendation}>{entry.recommendation}</div>
            </div>
          </div>
        </div>

        {/* Strategies */}
        {!loading && stratData.strategies.length > 0 && (
          <div className={styles.strategiesSection}>
            <div className={styles.strategiesTitle}>ПОПРОБУЙ СЕГОДНЯ</div>
            {stratData.strategies.map((s, i) => {
              const StrategyIcon = ICON_MAP[s.icon] || IconStar;
              const typeStyle = TYPE_STYLE[s.type] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
              return (
                <div key={i} className={styles.strategyCard}>
                  <div className={styles.strategyIcon} style={{ background: typeStyle.bg }}>
                    <StrategyIcon size={22} color={typeStyle.color} />
                  </div>
                  <div className={styles.strategyInfo}>
                    <div className={styles.strategyName}>{s.name}</div>
                    <div className={styles.strategyMeta}>
                      {s.type} · {s.duration} мин
                    </div>
                  </div>
                  {s.recommended && (
                    <span className={styles.recommendedBadge}>рекомендуем</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
