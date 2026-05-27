import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface DetalleFacturaVenta {
  id?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: {
    id: number;
    codigo?: string;
    nombre?: string;
  };
}

export interface FacturaVenta {
  id?: number;
  nroFactura?: string;
  fecha?: string;
  clienteNombre: string;
  clienteNit: string;
  subtotal?: number;
  descuento: number;
  total?: number;
  esCredito: boolean;
  estado?: 'EMITIDA' | 'ANULADA';
  idEmpresa?: number;
  detalles: DetalleFacturaVenta[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/operaciones/ventas`;

  getVentas(idEmpresa?: number): Promise<FacturaVenta[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<FacturaVenta[]>(this.apiUrl, { params }));
  }

  registrarVenta(factura: FacturaVenta): Promise<FacturaVenta> {
    return firstValueFrom(this.http.post<FacturaVenta>(this.apiUrl, factura));
  }

  anularVenta(id: number): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/${id}/anular`, {}));
  }
}
