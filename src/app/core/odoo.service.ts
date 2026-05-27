import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface OdooProducto {
  id: number;
  name: string;
  list_price: number;
  default_code: string | null;
  type: string;
}

export interface OdooVenta {
  id: number;
  name: string;
  date_order: string;
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  state: string;
  partner_id: [number, string]; // format [id, name] for Odoo many2one
}

@Injectable({
  providedIn: 'root'
})
export class OdooService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/odoo`;

  async getProductos(idEmpresa?: number): Promise<OdooProducto[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.get<OdooProducto[]>(`${this.apiUrl}/productos`, { params })
    );
  }

  async getVentas(idEmpresa?: number): Promise<OdooVenta[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(
      this.http.get<OdooVenta[]>(`${this.apiUrl}/ventas`, { params })
    );
  }
}
