import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface PeriodoContable {
  id?: number;
  fechaInicio: string; // LocalDate format: YYYY-MM-DD
  fechaFin: string;    // LocalDate format: YYYY-MM-DD
  estado?: 'ABIERTO' | 'CERRADO';
  idEmpresa?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoContableService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contabilidad/periodos`;

  getPeriodos(idEmpresa?: number): Promise<PeriodoContable[]> {
    let params = new HttpParams();
    if (idEmpresa !== undefined && idEmpresa !== null) {
      params = params.set('idEmpresa', idEmpresa.toString());
    }
    return firstValueFrom(this.http.get<PeriodoContable[]>(this.apiUrl, { params }));
  }

  aperturarPeriodo(periodo: PeriodoContable): Promise<PeriodoContable> {
    return firstValueFrom(this.http.post<PeriodoContable>(this.apiUrl, periodo));
  }

  cerrarPeriodo(id: number): Promise<PeriodoContable> {
    return firstValueFrom(this.http.put<PeriodoContable>(`${this.apiUrl}/${id}/cerrar`, {}));
  }
}
