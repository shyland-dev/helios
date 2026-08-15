import { Injectable, inject, signal } from '@angular/core';
import { DebugService } from '@shyland-dev/utils';

import { StorageService } from '../storage/storage.service';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private debugService = inject(DebugService);
  private storageService = inject(StorageService);

  readonly currentTheme = signal<Theme>('light');

  init(): void {
    this.debugService.log(this, 'init');

    const stored = this.storageService.get(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = stored ?? (prefersDark ? 'dark' : 'light');

    this.applyTheme(theme);
  }

  toggle(): void {
    const next: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.debugService.log(this, 'toggle', next);
    this.applyTheme(next);
  }

  private applyTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.storageService.set(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
