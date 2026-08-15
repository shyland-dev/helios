import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@helios';

@Component({
  selector: 'hls-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal<string>('');
  loading = signal(false);

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.error.set('Preencha todos os campos.');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.error ?? 'Erro ao fazer login. Tente novamente.');
      },
    });
  }
}
