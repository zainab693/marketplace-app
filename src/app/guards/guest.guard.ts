import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try { await auth.ready(); } catch (e) { /* ignore */ }
  if (!auth.isAuthenticated()) return true;
  router.navigate(['/']);
  return false;
};
