import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Suscripcion {
  id: number;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
  monto: number;
  estado: boolean;
}

export interface Empresa {
  id: number;
  nombre: string;
  razonSocial: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado?: boolean;
  suscripcion?: Suscripcion; // Relación opcional con suscripción
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

  // Permite al administrador actualizar los datos de su propia empresa
  updateEmpresa(id: number, empresa: Partial<Empresa>): Promise<Empresa> {
    return firstValueFrom(this.http.put<Empresa>(`${this.baseUrl}/${id}`, empresa));
  }

  // Nuevo método para que el SUPERADMIN vea todas las empresas
  getAllEmpresas(): Promise<Empresa[]> {
    return firstValueFrom(this.http.get<Empresa[]>(this.baseUrl));
  }
}
