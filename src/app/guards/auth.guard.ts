import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const firebaseAuth = inject(AuthService);
  const router = inject(Router);

  const isLogged = firebaseAuth.isAuthenticated();
  if (!isLogged) {
    router.navigateByUrl('login');
  }
  return isLogged;
};
