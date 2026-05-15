import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
=======
import { environment } from '../../environments/environment';
>>>>>>> sp1
import { firstValueFrom } from 'rxjs';

export interface Permiso {
  id?: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private http = inject(HttpClient);
<<<<<<< HEAD
  private readonly apiUrl = 'http://localhost:8080/api/permisos';
=======
  private readonly apiUrl = `${environment.apiUrl}/permisos`;
>>>>>>> sp1

  getPermisos(): Promise<Permiso[]> {
    return firstValueFrom(this.http.get<Permiso[]>(this.apiUrl));
  }

  crearPermiso(permiso: Permiso): Promise<Permiso> {
    return firstValueFrom(this.http.post<Permiso>(this.apiUrl, permiso));
  }
}
