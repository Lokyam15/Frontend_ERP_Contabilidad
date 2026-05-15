import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Configuracion {
  id?: number;
  iva: number;
  it: number;
  moneda: string;
  tipoCambio: number;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/configuraciones`;

  getConfiguracion(): Promise<Configuracion> {
    return firstValueFrom(this.http.get<Configuracion>(this.apiUrl));
  }

  crearConfiguracion(config: Configuracion): Promise<Configuracion> {
    return firstValueFrom(this.http.post<Configuracion>(this.apiUrl, config));
  }

  actualizarConfiguracion(config: Configuracion): Promise<Configuracion> {
    return firstValueFrom(this.http.put<Configuracion>(this.apiUrl, config));
  }
}
