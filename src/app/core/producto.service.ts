import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'PRODUCTO' | 'SERVICIO';
  precioVenta: number;
  costoUnitario: number;
  stockActual: number;
  unidadMedida?: string;
  estado?: boolean;
  idEmpresa?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getProductos(idEmpresa?: number): Promise<Producto[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<Producto[]>(this.apiUrl, { params }));
  }

  getProducto(id: number, idEmpresa?: number): Promise<Producto> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<Producto>(`${this.apiUrl}/${id}`, { params }));
  }

  createProducto(producto: Producto): Promise<Producto> {
    return firstValueFrom(this.http.post<Producto>(this.apiUrl, producto));
  }

  updateProducto(id: number, producto: Producto): Promise<Producto> {
    return firstValueFrom(this.http.put<Producto>(`${this.apiUrl}/${id}`, producto));
  }

  deleteProducto(id: number, idEmpresa?: number): Promise<Producto> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.delete<Producto>(`${this.apiUrl}/${id}`, { params }));
  }
}
