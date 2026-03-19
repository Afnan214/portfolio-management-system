import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith('http://localhost:8080/api');

  if (!isApiRequest) {
    return next(req);
  }

  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq);
};
