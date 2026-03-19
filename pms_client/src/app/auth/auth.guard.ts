import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasCurrentUser()) {
    return true;
  }

  return authService.getMe().pipe(
    map((user) => {
      return user ? true : router.createUrlTree(['/login']);
    }),
  );
};
