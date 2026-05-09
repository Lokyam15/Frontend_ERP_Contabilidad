import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserMe {
  id: number;
  username: string;
  correo: string;
  estado: boolean;
  idEmpresa: number | null;
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
  private readonly baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getMyProfile(): Promise<UserMe> {
    return firstValueFrom(this.http.get<UserMe>(`${this.baseUrl}/me`));
  }
}
