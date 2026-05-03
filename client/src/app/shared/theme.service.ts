import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';
export type Accent = 'rose' | 'violet' | 'cyan' | 'lime';

const KEY = 'ps-theme';

interface ThemeState { theme: Theme; accent: Accent; }

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private state = new BehaviorSubject<ThemeState>(this.read());
  state$ = this.state.asObservable();

  constructor() {
    this.apply(this.state.value);
  }

  toggleTheme(): void {
    const next: ThemeState = { ...this.state.value, theme: this.state.value.theme === 'light' ? 'dark' : 'light' };
    this.state.next(next);
    this.persist(next);
    this.apply(next);
  }

  setAccent(accent: Accent): void {
    const next = { ...this.state.value, accent };
    this.state.next(next);
    this.persist(next);
    this.apply(next);
  }

  get current(): ThemeState { return this.state.value; }

  private read(): ThemeState {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // migrate old stored theme values if they exist
        if (parsed?.theme === 'dark' || parsed?.theme === 'light') return parsed;
      }
    } catch { /* ignore */ }
    return { theme: 'light', accent: 'rose' };
  }

  private persist(s: ThemeState): void {
    localStorage.setItem(KEY, JSON.stringify(s));
  }

  private apply(s: ThemeState): void {
    document.body.classList.toggle('dark', s.theme === 'dark');
    (['rose', 'violet', 'cyan', 'lime'] as Accent[]).forEach(a => {
      // rose is the new default — no class needed
      document.body.classList.toggle(`accent-${a}`, s.accent === a && a !== 'rose');
    });
  }
}
