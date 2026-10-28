import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Явный выбор пользователя из localStorage или null, если он ничего не выбирал. */
function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null; // localStorage может быть недоступен (приватный режим и т.п.)
  }
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * Тема оформления.
 * По умолчанию — системная (prefers-color-scheme). После клика по переключателю
 * выбор сохраняется в localStorage и побеждает системную настройку.
 * Сама тема — это класс `dark` на <html>; Tailwind по нему включает `dark:`-стили.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readSavedTheme() ?? systemTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Пока пользователь сам не выбрал тему — следим за сменой системной.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (readSavedTheme() === null) setTheme(systemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Не сохранилось — не страшно, тема всё равно переключится.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
