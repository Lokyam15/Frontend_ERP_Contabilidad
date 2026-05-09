import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token');
  const startTime = Date.now();

  // Clonar para añadir el token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - startTime;
          console.log(
            `%c[HTTP SUCCESS] %c${req.method} %c${req.urlWithParams} %c-> %c${event.status} %c(${elapsed}ms)`,
            'color: #10B981; font-weight: bold;', // Verde
            'color: #6366F1; font-weight: bold;', // Indigo
            'color: #94A3B8;',                   // Gris
            'color: #94A3B8;',                   // Gris
            'color: #10B981; font-weight: bold;', // Verde
            'color: #94A3B8; font-style: italic;' // Gris itálica
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        const elapsed = Date.now() - startTime;
        console.group(
          `%c[HTTP ERROR] %c${req.method} %c${req.urlWithParams} %c-> %c${error.status} %c(${elapsed}ms)`,
          'color: #EF4444; font-weight: bold;', // Rojo
          'color: #6366F1; font-weight: bold;', // Indigo
          'color: #94A3B8;',                   // Gris
          'color: #94A3B8;',                   // Gris
          'color: #EF4444; font-weight: bold;', // Rojo
          'color: #94A3B8; font-style: italic;' // Gris itálica
        );
        console.error('Mensaje:', error.message);
        if (error.error) console.error('Detalle del servidor:', error.error);
        console.groupEnd();
      }
    })
  );
};
