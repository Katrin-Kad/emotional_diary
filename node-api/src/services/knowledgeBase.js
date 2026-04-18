const db = require('../db');

const DEFAULT_RECOMMENDATIONS = {
  'нейтральный': 'Всё идёт своим чередом',
  'счастье': 'Отличное настроение! Поделись позитивом с близкими',
  'грусть': 'Позаботься о себе. Это пройдёт',
  'энтузиазм': 'Используй этот заряд энергии!',
  'страх': 'Сделай глубокий вдох. Ты справишься',
  'гнев': 'Дай себе время успокоиться',
  'отвращение': 'Прислушайся к своим чувствам',
};

const UI_REACTIONS = {
  'нейтральный': { animation: 'normal', uiStyle: 'neutral', accentColor: 'gray' },
  'счастье':     { animation: 'dynamic', uiStyle: 'bright', accentColor: 'yellow' },
  'грусть':      { animation: 'slow', uiStyle: 'soft', accentColor: 'blue' },
  'энтузиазм':   { animation: 'fast', uiStyle: 'vibrant', accentColor: 'orange' },
  'страх':       { animation: 'pulse', uiStyle: 'dark', accentColor: 'purple' },
  'гнев':        { animation: 'sharp', uiStyle: 'intense', accentColor: 'red' },
  'отвращение':  { animation: 'freeze', uiStyle: 'muted', accentColor: 'olive' },
};

exports.getRecommendation = async (emotion, tag) => {
  if (tag) {
    const result = await db.query(
      'SELECT recommendation FROM rules WHERE tag = $1 AND emotion = $2',
      [tag, emotion]
    );
    if (result.rows.length) {
      return { recommendation: result.rows[0].recommendation };
    }
  }
  return { recommendation: DEFAULT_RECOMMENDATIONS[emotion] || 'Не забывай заботиться о себе' };
};

exports.getUiReaction = (emotion) => {
  return UI_REACTIONS[emotion] || UI_REACTIONS['нейтральный'];
};
