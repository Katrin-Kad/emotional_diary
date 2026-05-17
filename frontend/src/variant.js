export const VARIANT = import.meta.env.VITE_VARIANT || 'a';

// Вариант A — полный эмоциональный отклик
// Вариант B — нейтральный интерфейс (без анимаций, без смены цвета, маскот статичный)
export const isEmotionalUI = VARIANT === 'a';
