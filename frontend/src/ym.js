import { VARIANT } from './variant.js';

// Замени на свой ID счётчика из Яндекс Метрики
export const YM_ID = 0; // например: 98765432

export { VARIANT };

// Безопасная обёртка — не падает если Метрика не загружена (dev-режим)
// Вариант автоматически добавляется в параметры reachGoal
export const ym = (action, ...args) => {
  if (typeof window === 'undefined' || typeof window.ym !== 'function' || !YM_ID) return;
  if (action === 'reachGoal') {
    const [goalId, params = {}] = args;
    window.ym(YM_ID, action, goalId, { ...params, variant: VARIANT });
  } else {
    window.ym(YM_ID, action, ...args);
  }
};
