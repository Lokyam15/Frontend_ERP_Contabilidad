import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserMe {
  id: number;
  username: string;
  correo: string;
  estado: boolean;
  idEmpresa: number | null;
  empresa?: {
    id: number;
    nombre: string;
  } | null;
  rol: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  info?: {
    nombre?: string;
    ci?: string;
    cargo?: string;
    telefono?: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/users';

  getMyProfile(): Promise<UserMe> {
    return firstValueFrom(this.http.get<UserMe>(`${this.baseUrl}/me`));
  }

  getUsers(): Promise<UserMe[]> {
    return firstValueFrom(this.http.get<UserMe[]>(this.baseUrl));
  }

  createUser(user: any): Promise<UserMe> {
    return firstValueFrom(this.http.post<UserMe>(this.baseUrl, user));
  }

  updateUser(id: number, user: any): Promise<UserMe> {
    return firstValueFrom(this.http.put<UserMe>(`${this.baseUrl}/${id}`, user));
  }

  deleteUser(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
