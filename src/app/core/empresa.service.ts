import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Empresa {
  id: number;
  nombre: string;
  razonSocial: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly baseUrl = 'http://localhost:8080/api/empresas';

  constructor(private http: HttpClient) {}

  getEmpresaById(id: number): Promise<Empresa> {
    return firstValueFrom(this.http.get<Empresa>(`${this.baseUrl}/${id}`));
  }
}
