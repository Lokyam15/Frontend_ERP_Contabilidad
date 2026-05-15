import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
<<<<<<< HEAD
=======
import { environment } from '../../environments/environment';
>>>>>>> sp1

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
<<<<<<< HEAD
  private readonly apiUrl = 'http://localhost:8080/api/configuraciones';
=======
  private readonly apiUrl = `${environment.apiUrl}/configuraciones`;
>>>>>>> sp1

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
