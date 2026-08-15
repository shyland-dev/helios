import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DebugService } from '@shyland-dev/utils';

import { StorageService } from '../storage/storage.service';

export type Lang = 'pt-br' | 'eng';

const STORAGE_KEY = 'language';
const SUPPORTED_LANGS: Lang[] = ['pt-br', 'eng'];
const DEFAULT_LANG: Lang = 'pt-br';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private debugService = inject(DebugService);
  private storageService = inject(StorageService);
  private translateService = inject(TranslateService);

  readonly currentLang = signal<Lang>(DEFAULT_LANG);

  /** Inicializa o idioma a partir do localStorage ou usa o padrão */
  init(): void {
    this.debugService.log(this, 'init');

    const stored = this.storageService.get(STORAGE_KEY) as Lang | null;
    const lang: Lang = stored && SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;

    this.applyLang(lang);
  }

  /** Alterna entre pt-br e eng */
  toggle(): void {
    const next: Lang = this.currentLang() === 'pt-br' ? 'eng' : 'pt-br';
    this.debugService.log(this, 'toggle', next);
    this.applyLang(next);
  }

  /** Define um idioma específico */
  setLang(lang: Lang): void {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this.debugService.log(this, 'setLang', lang);
    this.applyLang(lang);
  }

  /** Retorna o idioma salvo no localStorage (para uso no app.config.ts) */
  static getStoredLang(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      return stored && SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  private applyLang(lang: Lang): void {
    this.currentLang.set(lang);
    this.storageService.set(STORAGE_KEY, lang);
    this.translateService.use(lang);
    document.documentElement.lang = lang === 'pt-br' ? 'pt-BR' : 'en';
  }
}
