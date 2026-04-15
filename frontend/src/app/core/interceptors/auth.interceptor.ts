import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const send = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(send).pipe(
    catchError((err) => {
      if (err.status === 401 && token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        return next(req);
      }
      return throwError(() => err);
    })
  );
};
