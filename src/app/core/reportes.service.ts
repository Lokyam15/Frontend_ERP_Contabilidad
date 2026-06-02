import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface ReporteCriterios {
  fechaDesde?: string;
  fechaHasta?: string;
  clienteNombre?: string;
  proveedorNombre?: string;
  productoId?: number;
  estado?: string;
  cuentaContableId?: number;
  centroCostoId?: number;
}

export interface ReporteQbeQuery {
  origen: 'VENTAS' | 'COMPRAS' | 'INVENTARIO' | 'CONTABILIDAD';
  columnas: string[];
  filtros: {
    campo: string;
    operador: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'LIKE' | 'BETWEEN';
    valor: string;
    valorHasta?: string;
  }[];
  agruparPor?: string;
  ordenarPor?: string;
  direccion?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  // Reporte Analítico de Ventas
  getVentasAnalitico(criterios: ReporteCriterios): Promise<any[]> {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/ventas/analitico`, criterios));
  }

  // Reporte Gerencial de Ventas
  getVentasGerencial(params?: any): Promise<any> {
    let httpParams = new HttpParams();
    if (params?.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/ventas/gerencial`, { params: httpParams }));
  }

  // Reporte Analítico de Compras
  getComprasAnalitico(criterios: ReporteCriterios): Promise<any[]> {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/compras/analitico`, criterios));
  }

  // Reporte Gerencial de Compras
  getComprasGerencial(params?: any): Promise<any> {
    let httpParams = new HttpParams();
    if (params?.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/compras/gerencial`, { params: httpParams }));
  }

  // Reporte de Kardex Físico (Inventario)
  getKardex(productoId: number, fechaDesde?: string, fechaHasta?: string): Promise<any[]> {
    let httpParams = new HttpParams();
    if (fechaDesde) httpParams = httpParams.set('fechaDesde', fechaDesde);
    if (fechaHasta) httpParams = httpParams.set('fechaHasta', fechaHasta);
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/inventario/kardex/${productoId}`, { params: httpParams }));
  }

  // Reporte Analítico de Cartera (Cuentas por Cobrar / Pagar)
  getCarteraSaldos(tipo: 'COBRAR' | 'PAGAR', criterios: ReporteCriterios): Promise<any[]> {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/cartera/saldos?tipo=${tipo}`, criterios));
  }

  // Reporte de Libro Diario (Contabilidad)
  getLibroDiario(criterios: ReporteCriterios): Promise<any[]> {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/contabilidad/libro-diario`, criterios));
  }

  // Descarga del PDF del Libro Diario generado desde el Backend
  descargarLibroDiarioPdf(criterios: ReporteCriterios): Promise<Blob> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/contabilidad/libro-diario/pdf`, criterios, { responseType: 'blob' }));
  }

  // Consulta dinámica QBE
  ejecutarQbe(query: ReporteQbeQuery): Promise<any[]> {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/qbe`, query));
  }
}
