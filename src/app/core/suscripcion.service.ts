import { Injectable, inject, signal } from '@angular/core';
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

  public activeSub = signal<Suscripcion | null>(null);

  async getSuscripcionActiva(): Promise<Suscripcion> {
    try {
      const sub = await firstValueFrom(this.http.get<Suscripcion>(`${this.apiUrl}/activa`));
      this.activeSub.set(sub);
      return sub;
    } catch (error) {
      this.activeSub.set(null);
      throw error;
    }
  }

  getHistorial(): Promise<Suscripcion[]> {
    return firstValueFrom(this.http.get<Suscripcion[]>(this.apiUrl));
  }

  async suscribirse(payload: { planId: number, tipoRenovacion: string }): Promise<Suscripcion> {
    const body = {
      plan: { id: payload.planId },
      tipoRenovacion: payload.tipoRenovacion
    };
    try {
      const sub = await firstValueFrom(this.http.post<Suscripcion>(this.apiUrl, body));
      this.activeSub.set(sub);
      return sub;
    } catch (error) {
      throw error;
    }
  }
}
