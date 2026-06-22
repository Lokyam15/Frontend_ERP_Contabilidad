import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CentroCosto } from './centro-costo.service';

export interface CuentaContable {
  id?: number;
  codigo: string;
  nombre: string;
  tipo?: string;
  nivel?: number;
  idEmpresa?: number;
  estado?: boolean;
  cuentaPadre?: CuentaContable | null;
}

export interface DetalleAsiento {
  id?: number;
  cuenta?: CuentaContable; // Retrocompatibilidad
  cuentaContable?: CuentaContable; // Mapeo real
  debe: number;
  haber: number;
  centroCosto?: CentroCosto | null;
}

export interface AsientoContable {
  id?: number;
  nroAsiento?: string;
  fecha: string;
  glosa: string;
  estado?: 'BORRADOR' | 'APROBADO' | 'ANULADO';
  idEmpresa?: number;
  origenDocumento?: string;
  origenId?: number;
  periodoContable?: any;
  usuario?: any;
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

  crearCuenta(cuenta: CuentaContable): Promise<CuentaContable> {
    return firstValueFrom(
      this.http.post<CuentaContable>(`${this.apiUrl}/cuentas`, cuenta)
    );
  }

  actualizarCuenta(id: number, cuenta: CuentaContable): Promise<CuentaContable> {
    return firstValueFrom(
      this.http.put<CuentaContable>(`${this.apiUrl}/cuentas/${id}`, cuenta)
    );
  }

  eliminarCuenta(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/cuentas/${id}`)
    );
  }

  async getAsientoById(id: number): Promise<AsientoContable> {
    return firstValueFrom(
      this.http.get<AsientoContable>(`${this.apiUrl}/asientos/${id}`)
    );
  }

  async crearAsiento(asiento: AsientoContable): Promise<AsientoContable> {
    return firstValueFrom(
      this.http.post<AsientoContable>(`${this.apiUrl}/asientos`, asiento)
    );
  }

  async actualizarAsiento(id: number, asiento: AsientoContable): Promise<AsientoContable> {
    return firstValueFrom(
      this.http.put<AsientoContable>(`${this.apiUrl}/asientos/${id}`, asiento)
    );
  }

  async aprobarAsiento(id: number): Promise<AsientoContable> {
    return firstValueFrom(
      this.http.put<AsientoContable>(`${this.apiUrl}/asientos/${id}/aprobar`, {})
    );
  }

  async anularAsiento(id: number): Promise<AsientoContable> {
    return firstValueFrom(
      this.http.put<AsientoContable>(`${this.apiUrl}/asientos/${id}/anular`, {})
    );
  }
}
