import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Producto } from './producto.service';

export interface MovimientoInventario {
  id?: number;
  fecha?: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  costoUnitario: number;
  documentoOrigen?: string;
  origenId?: number;
  producto: Producto;
  idEmpresa?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario/movimientos`;

  getMovimientos(idEmpresa?: number): Promise<MovimientoInventario[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<MovimientoInventario[]>(this.apiUrl, { params }));
  }

  getMovimientosByProducto(productoId: number, idEmpresa?: number): Promise<MovimientoInventario[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<MovimientoInventario[]>(`${this.apiUrl}/producto/${productoId}`, { params }));
  }

  registrarMovimiento(movimiento: MovimientoInventario): Promise<MovimientoInventario> {
    return firstValueFrom(this.http.post<MovimientoInventario>(this.apiUrl, movimiento));
  }
}
