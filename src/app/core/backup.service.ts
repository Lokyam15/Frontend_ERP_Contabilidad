import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackupMetadata {
  id?: number;
  idEmpresa?: number;
  nombreArchivo: string;
  storageUrl: string;
  tamanoBytes: number;
  fechaCreacion: string;
  estado: string;
  tipo: string;
  creadoPor: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/backups`;

  getBackups(): Promise<BackupMetadata[]> {
    return firstValueFrom(this.http.get<BackupMetadata[]>(this.apiUrl));
  }

  exportarBackup(idEmpresa?: number): Promise<BackupMetadata> {
    const url = idEmpresa ? `${this.apiUrl}/exportar?idEmpresa=${idEmpresa}` : `${this.apiUrl}/exportar`;
    return firstValueFrom(this.http.post<BackupMetadata>(url, {}));
  }

  exportarBackupGlobal(): Promise<BackupMetadata> {
    return firstValueFrom(this.http.post<BackupMetadata>(`${this.apiUrl}/exportar-global`, {}));
  }

  importarBackup(file: File, idEmpresa?: number): Promise<{ mensaje: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    let url = `${this.apiUrl}/importar`;
    if (idEmpresa) {
      url += `?idEmpresa=${idEmpresa}`;
    }
    return firstValueFrom(this.http.post<{ mensaje: string }>(url, formData));
  }

  descargarBackup(id: number): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.apiUrl}/${id}/descargar`, { responseType: 'blob' }));
  }
}
