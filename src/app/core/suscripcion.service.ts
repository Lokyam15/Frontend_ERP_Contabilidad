import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Plan } from './plan.service';

export interface Suscripcion {
  id?: number;
  idEmpresa: number;
  plan: Plan;
  fechaInicio: string;
  fechaFin: string;
  monto: number;
  montoPagado: number;
  estado: boolean;
  tipoRenovacion: 'MENSUAL' | 'ANUAL';
}

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suscripciones`;

  getSuscripcionActiva(): Promise<Suscripcion> {
    return firstValueFrom(this.http.get<Suscripcion>(`${this.apiUrl}/activa`));
  }

  getHistorial(): Promise<Suscripcion[]> {
    return firstValueFrom(this.http.get<Suscripcion[]>(this.apiUrl));
  }

  suscribirse(payload: { planId: number, tipoRenovacion: string }): Promise<Suscripcion> {
    // Nota: El backend espera { plan: { id: X }, tipoRenovacion: Y }
    const body = {
      plan: { id: payload.planId },
      tipoRenovacion: payload.tipoRenovacion
    };
    return firstValueFrom(this.http.post<Suscripcion>(this.apiUrl, body));
  }
}
