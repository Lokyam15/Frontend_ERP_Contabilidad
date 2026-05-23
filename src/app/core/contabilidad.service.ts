import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  idEmpresa: number;
  estado: boolean;
}

export interface DetalleAsiento {
  id: number;
  cuenta: CuentaContable;
  debe: number;
  haber: number;
}

export interface AsientoContable {
  id: number;
  fecha: string;
  glosa: string;
  idEmpresa: number;
  origenDocumento: string;
  origenId: number;
  detalles: DetalleAsiento[];
}

export interface SincronizacionResultado {
  mensaje: string;
  asientosCreados: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContabilidadService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contabilidad`;

  async sincronizarCompras(idEmpresa?: number): Promise<SincronizacionResultado> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.post<SincronizacionResultado>(`${this.apiUrl}/sincronizar-compras`, {}, { params })
    );
  }

  async sincronizarVentas(idEmpresa?: number): Promise<SincronizacionResultado> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.post<SincronizacionResultado>(`${this.apiUrl}/sincronizar-ventas`, {}, { params })
    );
  }

  async getAsientos(idEmpresa?: number): Promise<AsientoContable[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.get<AsientoContable[]>(`${this.apiUrl}/asientos`, { params })
    );
  }

  async getCuentas(idEmpresa?: number): Promise<CuentaContable[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.get<CuentaContable[]>(`${this.apiUrl}/cuentas`, { params })
    );
  }
}
