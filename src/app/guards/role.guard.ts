import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const roleGuard = (
  role: 'vendor' | 'customer' | 'admin'
): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isAuthenticated() && auth.hasRole(role)) return true;
    router.navigate(['/']);
    return false;
  };
};
