import { create } from 'zustand';

function readInitial() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem('theme', theme);
}

export const useThemeStore = create((set, get) => ({
  theme: readInitial(),
  setTheme(theme) {
    apply(theme);
    set({ theme });
  },
  toggle() {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    apply(next);
    set({ theme: next });
  },
}));
