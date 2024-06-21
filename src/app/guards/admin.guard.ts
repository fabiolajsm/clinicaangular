import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanMatchFn = (route, segments) => {
  const firebaseAuth = inject(AuthService);
  try {
    return firebaseAuth.getIsRole('ADMIN');
  } catch (error) {
    console.error('Error al verificar si es administrador:', error);
    return false;
  }
};
