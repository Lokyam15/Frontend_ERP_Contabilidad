import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Configuracion {
  id?: number;
  iva: number;
  it: number;
  moneda: string;
  tipoCambio: number;
  estado: boolean;
  idEmpresa?: number;
  idCuentaCaja?: number | null;
  idCuentaClientes?: number | null;
  idCuentaProveedores?: number | null;
  idCuentaVentas?: number | null;
  idCuentaCompras?: number | null;
  idCuentaIvaDebito?: number | null;
  idCuentaIvaCredito?: number | null;
  idCuentaItGasto?: number | null;
  idCuentaItPasivo?: number | null;
  idCuentaInventario?: number | null;
  idCuentaCostoVentas?: number | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/configuraciones`;

  getConfiguracion(idEmpresa?: number | null): Promise<Configuracion> {
    const url = idEmpresa ? `${this.apiUrl}?idEmpresa=${idEmpresa}` : this.apiUrl;
    return firstValueFrom(this.http.get<Configuracion>(url));
  }

  getAllConfiguraciones(): Promise<Configuracion[]> {
    return firstValueFrom(this.http.get<Configuracion[]>(`${this.apiUrl}/all`));
  }

  crearConfiguracion(config: Configuracion): Promise<Configuracion> {
    return firstValueFrom(this.http.post<Configuracion>(this.apiUrl, config));
  }

  actualizarConfiguracion(config: Configuracion): Promise<Configuracion> {
    return firstValueFrom(this.http.put<Configuracion>(this.apiUrl, config));
  }
}
