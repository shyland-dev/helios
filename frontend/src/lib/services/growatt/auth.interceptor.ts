import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { AuthService } from '../auth/auth.service';

// Interceptor que adiciona o JWT como Authorization: Bearer em todas as requests para /api
// e trata respostas 401 (sessão revogada) redirecionando para login
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Não adicionar token em rotas de auth (login/register)
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (token && req.url.startsWith('/api')) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedReq).pipe(
      tap({
        error: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            authService.handleSessionRevoked();
          }
        },
      }),
    );
  }

  return next(req);
};
