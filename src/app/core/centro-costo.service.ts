import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CentroCosto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
  idEmpresa?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CentroCostoService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contabilidad/centros-costo`;

  getCentrosCosto(idEmpresa?: number): Promise<CentroCosto[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<CentroCosto[]>(this.apiUrl, { params }));
  }

  crearCentroCosto(cc: CentroCosto): Promise<CentroCosto> {
    return firstValueFrom(this.http.post<CentroCosto>(this.apiUrl, cc));
  }

  actualizarCentroCosto(id: number, cc: CentroCosto): Promise<CentroCosto> {
    return firstValueFrom(this.http.put<CentroCosto>(`${this.apiUrl}/${id}`, cc));
  }

  eliminarCentroCosto(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
