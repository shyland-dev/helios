import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@helios';

@Component({
  selector: 'hls-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  inviteCode = '';
  error = signal<string>('');
  loading = signal(false);

  onSubmit(): void {
    if (!this.username || !this.password || !this.inviteCode) {
      this.error.set('Preencha todos os campos.');
      return;
    }

    if (this.password.length < 8) {
      this.error.set('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.authService
      .register({
        username: this.username,
        password: this.password,
        invite_code: this.inviteCode,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(err.error?.error ?? 'Erro ao criar conta. Tente novamente.');
        },
      });
  }
}
