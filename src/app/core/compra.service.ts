import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface DetalleFacturaCompra {
  id?: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  producto: {
    id: number;
    codigo?: string;
    nombre?: string;
  };
}

export interface FacturaCompra {
  id?: number;
  nroFactura: string;
  fecha?: string;
  proveedorNombre: string;
  proveedorNit: string;
  subtotal?: number;
  total?: number;
  esCredito: boolean;
  estado?: 'REGISTRADA' | 'ANULADA';
  idEmpresa?: number;
  detalles: DetalleFacturaCompra[];
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/operaciones/compras`;

  getCompras(idEmpresa?: number): Promise<FacturaCompra[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<FacturaCompra[]>(this.apiUrl, { params }));
  }

  registrarCompra(factura: FacturaCompra): Promise<FacturaCompra> {
    return firstValueFrom(this.http.post<FacturaCompra>(this.apiUrl, factura));
  }
}
