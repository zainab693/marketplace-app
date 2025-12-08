import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // wait for auth service to finish restoring saved session
  try {
    await auth.ready();
  } catch (e) {
    // ignore
  }
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login'], { queryParams: { redirect: state.url } });
  return false;
};
