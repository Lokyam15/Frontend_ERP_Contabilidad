import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface AuditLog {
  id?: number;
  empresaId?: number;
  usuarioId?: number;
  usuarioNombre?: string;
  modulo: string;
  accion: string;
  entidadAfectada?: string;
  entidadId?: string;
  descripcion?: string;
  ipAddress?: string;
  userAgent?: string;
  fechaHora: string;
  valoresAnteriores?: string;
  valoresNuevos?: string;
  resultado: string;
  detallesError?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auditoria`;

  getLogs(): Promise<AuditLog[]> {
    return firstValueFrom(this.http.get<AuditLog[]>(this.apiUrl));
  }
}
