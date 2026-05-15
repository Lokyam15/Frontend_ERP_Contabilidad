import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  empresa?: {
    id: number;
    nombre: string;
  } | null;
  permisos?: { id: number, nombre?: string, descripcion?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  getRoles(): Promise<Rol[]> {
    return firstValueFrom(this.http.get<Rol[]>(this.apiUrl));
  }

  getRolById(id: number): Promise<Rol> {
    return firstValueFrom(this.http.get<Rol>(`${this.apiUrl}/${id}`));
  }

  crearRol(rol: any): Promise<Rol> {
    return firstValueFrom(this.http.post<Rol>(this.apiUrl, rol));
  }

  actualizarRol(id: number, rol: any): Promise<Rol> {
    return firstValueFrom(this.http.put<Rol>(`${this.apiUrl}/${id}`, rol));
  }

  eliminarRol(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
