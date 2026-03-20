import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { map } from 'rxjs/operators';

export const loggedinRedirect: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasCurrentUser()) {
    return router.createUrlTree(['/console/dashboard']);
  }

  return authService.getMe().pipe(
    map((user) => {
      return user ? router.createUrlTree(['/console/dashboard']) : true;
    }),
  );
};
