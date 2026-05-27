import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CuentaPorCobrar {
  id: number;
  montoTotal: number;
  saldo: number;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADA';
  idEmpresa: number;
  facturaVenta?: {
    id: number;
    nroFactura: string;
    fecha: string;
    clienteNombre: string;
    clienteNit: string;
  };
}

export interface CuentaPorPagar {
  id: number;
  montoTotal: number;
  saldo: number;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADA';
  idEmpresa: number;
  facturaCompra?: {
    id: number;
    nroFactura: string;
    fecha: string;
    proveedorNombre: string;
    proveedorNit: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CarteraService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/operaciones`;

  getCuentasPorCobrar(idEmpresa?: number): Promise<CuentaPorCobrar[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<CuentaPorCobrar[]>(`${this.apiUrl}/cuentas-cobrar`, { params }));
  }

  getCuentasPorPagar(idEmpresa?: number): Promise<CuentaPorPagar[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<CuentaPorPagar[]>(`${this.apiUrl}/cuentas-pagar`, { params }));
  }

  registrarCobro(id: number, monto: number): Promise<CuentaPorCobrar> {
    return firstValueFrom(this.http.post<CuentaPorCobrar>(`${this.apiUrl}/cuentas-cobrar/${id}/pagar`, { monto }));
  }

  registrarPago(id: number, monto: number): Promise<CuentaPorPagar> {
    return firstValueFrom(this.http.post<CuentaPorPagar>(`${this.apiUrl}/cuentas-pagar/${id}/pagar`, { monto }));
  }
}
