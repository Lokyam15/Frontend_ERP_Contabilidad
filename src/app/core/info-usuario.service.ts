import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InfoUsuario {
  id?: number;
  nombre: string;
  ci: string;
  cargo: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class InfoUsuarioService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/info-usuario';

  getInfos(): Promise<InfoUsuario[]> {
    return firstValueFrom(this.http.get<InfoUsuario[]>(this.apiUrl));
  }

  getMyProfileInfo(): Promise<InfoUsuario> {
    return firstValueFrom(this.http.get<InfoUsuario>(`${this.apiUrl}/me`));
  }

  getInfoById(id: number): Promise<InfoUsuario> {
    return firstValueFrom(this.http.get<InfoUsuario>(`${this.apiUrl}/${id}`));
  }

  crearInfo(info: InfoUsuario): Promise<InfoUsuario> {
    return firstValueFrom(this.http.post<InfoUsuario>(this.apiUrl, info));
  }

  actualizarInfo(id: number, info: InfoUsuario): Promise<InfoUsuario> {
    return firstValueFrom(this.http.put<InfoUsuario>(`${this.apiUrl}/${id}`, info));
  }

  updateMyProfileInfo(info: InfoUsuario): Promise<InfoUsuario> {
    return firstValueFrom(this.http.put<InfoUsuario>(`${this.apiUrl}/me`, info));
  }
}
