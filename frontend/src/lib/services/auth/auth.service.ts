import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { DebugService } from '@shyland-dev/utils';

import { StorageService } from '../storage/storage.service';

const TOKEN_KEY = 'helios_token';
const USER_KEY = 'helios_user';

export interface AuthUser {
  id: number;
  username: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface RegisterPayload {
  username: string;
  password: string;
  invite_code: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private debugService = inject(DebugService);

  // Estado reativo do usuário autenticado
  private readonly _user = signal<AuthUser | null>(this.loadUserFromStorage());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  // Carrega o usuário do localStorage ao inicializar
  private loadUserFromStorage(): AuthUser | null {
    const token = this.storageService.get(TOKEN_KEY);
    const userJson = this.storageService.get(USER_KEY);

    if (!token || !userJson) return null;

    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }

  // Retorna o JWT armazenado
  getToken(): string | null {
    return this.storageService.get(TOKEN_KEY);
  }

  // Registro com invite code
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => {
        this.debugService.log(this, 'register error', error);
        return throwError(() => error);
      }),
    );
  }

  // Login
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', payload).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => {
        this.debugService.log(this, 'login error', error);
        return throwError(() => error);
      }),
    );
  }

  // Logout (limpa dados locais)
  logout(): void {
    this.debugService.log(this, 'logout');
    this.storageService.remove(TOKEN_KEY);
    this.storageService.remove(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  // Tratamento de sessão revogada (401)
  handleSessionRevoked(): void {
    this.debugService.log(this, 'session revoked — redirecting to login');
    this.logout();
  }

  // Salva token e user após auth bem-sucedido
  private handleAuthSuccess(response: AuthResponse): void {
    this.debugService.log(this, 'auth success', response.user.username);
    this.storageService.set(TOKEN_KEY, response.token);
    this.storageService.set(USER_KEY, JSON.stringify(response.user));
    this._user.set(response.user);
  }
}
