import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
  private readonly apiUrl = `${environment.apiUrl}/permisos`;

  getPermisos(): Promise<Permiso[]> {
    return firstValueFrom(this.http.get<Permiso[]>(this.apiUrl));
  }

  crearPermiso(permiso: Permiso): Promise<Permiso> {
    return firstValueFrom(this.http.post<Permiso>(this.apiUrl, permiso));
  }

  actualizarPermiso(id: number, permiso: Permiso): Promise<Permiso> {
    return firstValueFrom(this.http.put<Permiso>(`${this.apiUrl}/${id}`, permiso));
  }
}
