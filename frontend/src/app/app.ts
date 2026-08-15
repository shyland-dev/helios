import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DebugService } from '@shyland-dev/utils';
import { TranslateModule } from '@ngx-translate/core';

import { ThemeService, AuthService, LanguageService, APP_VERSION } from '@helios';
import { IconComponent } from '@shyland-dev/ui';

@Component({
  selector: 'hls-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private debugService = inject(DebugService);
  private themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly languageService = inject(LanguageService);

  readonly version = APP_VERSION;
  isSideMenuOpen = false;

  constructor() {
    this.debugService.log(this);
  }

  ngOnInit(): void {
    this.debugService.log(this);
    this.themeService.init();
    this.languageService.init();
  }

  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  closeSideMenu(): void {
    this.isSideMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleLanguage(): void {
    this.languageService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.closeSideMenu();
  }
}
