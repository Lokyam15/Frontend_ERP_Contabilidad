import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackupService, BackupMetadata } from '../core/backup.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService, UserMe } from '../core/user.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Copias de Seguridad</h2>
          <p class="text-slate-500 font-medium">Exporta, descarga y restaura los datos de tu empresa en formato JSON de forma segura.</p>
        </div>
      </div>

      <!-- Superadmin Company Filter -->
      <div *ngIf="isSuperAdmin()" class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Empresa Administrada</span>
          <p class="text-slate-500 text-xs font-medium">Filtra la lista de respaldos y selecciona la empresa para exportación o restauración.</p>
        </div>
        <div class="flex items-center gap-4">
          <select [(ngModel)]="selectedEmpresaId" (change)="onEmpresaChange()" 
                  class="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary outline-none font-bold text-slate-900 min-w-[280px]">
            <option [value]="null">Seleccionar Empresa...</option>
            <option *ngFor="let emp of empresas()" [value]="emp.id">{{ emp.nombre }} (NIT: {{ emp.nit }})</option>
          </select>
        </div>
      </div>

      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Tarjeta 1: Total Backups -->
        <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-black text-slate-455 uppercase tracking-wider block">Total de Respaldos</span>
            <span class="text-2xl font-black text-slate-800 block mt-1">{{ backups().length }}</span>
          </div>
        </div>

        <!-- Tarjeta 2: Última Copia -->
        <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-black text-slate-455 uppercase tracking-wider block">Último Respaldo</span>
            <span class="text-base font-black text-slate-800 block mt-1 truncate">{{ getUltimaFecha() || 'Ninguno' }}</span>
          </div>
        </div>

        <!-- Tarjeta 3: Almacenamiento Estimado -->
        <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-black text-slate-455 uppercase tracking-wider block">Espacio Utilizado</span>
            <span class="text-2xl font-black text-slate-800 block mt-1">{{ getEspacioTotal() }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <h3 class="text-lg font-black text-slate-800 tracking-tight">Acciones del Sistema</h3>
        <div class="flex flex-wrap gap-4">
          
          <!-- Botón Generar Copia -->
          <button (click)="generarBackup()" [disabled]="loading() || (isSuperAdmin() && !selectedEmpresaId)"
                  class="px-6 py-4 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none active:scale-95">
            <span *ngIf="loading() && actionType() === 'export'" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <svg *ngIf="!(loading() && actionType() === 'export')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Generar Copia de Seguridad (Empresa)
          </button>

          <!-- Botón Generar Backup Global (Solo Superadmin) -->
          <button *ngIf="isSuperAdmin()" (click)="generarBackupGlobal()" [disabled]="loading()"
                  class="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none active:scale-95">
            <span *ngIf="loading() && actionType() === 'export-global'" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <svg *ngIf="!(loading() && actionType() === 'export-global')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Generar Respaldo Global (Toda la BD)
          </button>

          <!-- Botón Cargar y Restaurar -->
          <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" class="hidden">
          <button (click)="triggerFileInput()" [disabled]="loading() || (isSuperAdmin() && !selectedEmpresaId)"
                  class="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none active:scale-95">
            <span *ngIf="loading() && actionType() === 'import'" class="w-5 h-5 border-2 border-slate-700/30 border-t-slate-700 rounded-full animate-spin"></span>
            <svg *ngIf="!(loading() && actionType() === 'import')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Restaurar Copia (Importar JSON)
          </button>
        </div>
        <p *ngIf="isSuperAdmin() && !selectedEmpresaId" class="text-xs text-amber-600 font-bold flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Debes seleccionar una empresa para habilitar las acciones de copia de seguridad.
        </p>
      </div>

      <!-- Tabla de Historial -->
      <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800 tracking-tight">Historial de Copias</h3>
          <button (click)="loadBackups()" class="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all" title="Actualizar Historial">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A9 9 0 1111 2.05v2.05m0 0a17.924 17.924 0 001-1.02" />
            </svg>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th class="p-6">Nombre de Archivo</th>
                <th class="p-6">Tamaño</th>
                <th class="p-6">Tipo</th>
                <th class="p-6">Creado por</th>
                <th class="p-6">Fecha de Creación</th>
                <th class="p-6">Estado</th>
                <th class="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 font-bold text-slate-700 text-sm">
              <tr *ngFor="let b of backups()" class="hover:bg-slate-50/50 transition-colors">
                <td class="p-6 font-black text-slate-800">{{ b.nombreArchivo }}</td>
                <td class="p-6">{{ formatBytes(b.tamanoBytes) }}</td>
                <td class="p-6">
                  <span [class]="b.tipo === 'GLOBAL' ? 'px-2 py-1 bg-purple-50 text-purple-700 text-[10px] rounded-lg border border-purple-100 uppercase tracking-wider' : 'px-2 py-1 bg-blue-50 text-blue-700 text-[10px] rounded-lg border border-blue-100 uppercase tracking-wider'">
                    {{ b.tipo }}
                  </span>
                </td>
                <td class="p-6 text-slate-500">{{ b.creadoPor }}</td>
                <td class="p-6 text-slate-550">{{ b.fechaCreacion | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                <td class="p-6">
                  <span *ngIf="b.estado === 'COMPLETADO'" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-wider">
                    COMPLETADO
                  </span>
                  <span *ngIf="b.estado === 'PENDIENTE'" class="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100 uppercase tracking-wider animate-pulse">
                    PENDIENTE
                  </span>
                  <span *ngIf="b.estado === 'FALLIDO'" class="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-wider">
                    FALLIDO
                  </span>
                </td>
                <td class="p-6 text-right">
                  <button *ngIf="b.estado === 'COMPLETADO'" (click)="descargarBackup(b)"
                          class="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </button>
                </td>
              </tr>
              <tr *ngIf="backups().length === 0">
                <td colspan="7" class="p-12 text-center text-slate-400 font-medium italic">
                  No se encontraron registros de copias de seguridad.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Confirmación de Restauración -->
      <div *ngIf="showRestoreConfirmModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
          <div class="p-8 text-center space-y-4">
            <div class="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-2xl font-black text-slate-800 tracking-tight">¿Confirmar Restauración?</h3>
            <p class="text-slate-500 font-medium leading-relaxed">
              Está a punto de iniciar una restauración de datos. 
              <span class="text-amber-600 font-black block mt-2">¡ATENCIÓN! Este proceso eliminará de forma irreversible todos los datos actuales de la empresa en el sistema y los reemplazará con el contenido del archivo de respaldo.</span>
            </p>
          </div>
          <div class="p-8 bg-slate-50 flex flex-col gap-3">
            <button (click)="confirmarRestauracion()"
                    class="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Sí, Iniciar Restauración
            </button>
            <button (click)="cancelarRestauracion()" 
                    class="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Notificación Toast -->
      <div *ngIf="toastMessage()" 
           [class]="toastType() === 'success' ? 'fixed bottom-10 right-10 p-5 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-[200]' : 'fixed bottom-10 right-10 p-5 bg-red-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-[200]'">
        <span class="font-black text-sm">{{ toastMessage() }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BackupsComponent implements OnInit {
  private backupService = inject(BackupService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);

  userProfile = signal<UserMe | null>(null);
  backups = signal<BackupMetadata[]>([]);
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId: number | null = null;

  loading = signal(false);
  actionType = signal<'export' | 'export-global' | 'import' | 'load' | null>(null);

  showRestoreConfirmModal = signal(false);
  selectedRestoreFile: File | null = null;

  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  async ngOnInit() {
    try {
      const profile = await this.userService.getMyProfile();
      this.userProfile.set(profile);
      
      if (this.isSuperAdmin()) {
        const list = await this.empresaService.getAllEmpresas();
        this.empresas.set(list);
      } else {
        this.selectedEmpresaId = profile.idEmpresa;
      }
      
      await this.loadBackups();
    } catch (error) {
      this.showToast('Error al inicializar la pantalla de respaldos', 'error');
    }
  }

  isSuperAdmin(): boolean {
    return this.userProfile()?.rol?.nombre === 'SUPERADMIN';
  }

  async loadBackups() {
    this.loading.set(true);
    this.actionType.set('load');
    try {
      const data = await this.backupService.getBackups();
      // Si es Superadmin y hay una empresa seleccionada, filtramos en el frontend
      if (this.isSuperAdmin() && this.selectedEmpresaId) {
        this.backups.set(data.filter(b => b.idEmpresa === Number(this.selectedEmpresaId)));
      } else {
        this.backups.set(data);
      }
    } catch (error) {
      this.showToast('Error al cargar la lista de respaldos', 'error');
    } finally {
      this.loading.set(false);
      this.actionType.set(null);
    }
  }

  onEmpresaChange() {
    this.loadBackups();
  }

  async generarBackup() {
    const targetId = this.isSuperAdmin() ? this.selectedEmpresaId : undefined;
    
    if (this.isSuperAdmin() && !targetId) {
      this.showToast('Debes seleccionar una empresa para exportar', 'error');
      return;
    }

    this.loading.set(true);
    this.actionType.set('export');
    try {
      await this.backupService.exportarBackup(targetId || undefined);
      this.showToast('Copia de seguridad generada con éxito', 'success');
      await this.loadBackups();
    } catch (error) {
      this.showToast('Error al exportar la copia de seguridad', 'error');
    } finally {
      this.loading.set(false);
      this.actionType.set(null);
    }
  }

  async generarBackupGlobal() {
    this.loading.set(true);
    this.actionType.set('export-global');
    try {
      await this.backupService.exportarBackupGlobal();
      this.showToast('Respaldo global de la base de datos generado con éxito', 'success');
      await this.loadBackups();
    } catch (error) {
      this.showToast('Error al generar el respaldo global de la base de datos', 'error');
    } finally {
      this.loading.set(false);
      this.actionType.set(null);
    }
  }

  triggerFileInput() {
    const fileInputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.value = '';
      fileInputElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedRestoreFile = input.files[0];
      this.showRestoreConfirmModal.set(true);
    }
  }

  cancelarRestauracion() {
    this.showRestoreConfirmModal.set(false);
    this.selectedRestoreFile = null;
  }

  async confirmarRestauracion() {
    if (!this.selectedRestoreFile) return;
    
    this.showRestoreConfirmModal.set(false);
    this.loading.set(true);
    this.actionType.set('import');
    
    const targetId = this.isSuperAdmin() ? this.selectedEmpresaId : undefined;

    try {
      const response = await this.backupService.importarBackup(this.selectedRestoreFile, targetId || undefined);
      this.showToast(response.mensaje || 'Copia de seguridad restaurada correctamente', 'success');
      await this.loadBackups();
    } catch (error: any) {
      const errorMsg = error.error?.error || error.message || 'Error desconocido';
      this.showToast(`Error al restaurar: ${errorMsg}`, 'error');
    } finally {
      this.loading.set(false);
      this.actionType.set(null);
      this.selectedRestoreFile = null;
    }
  }

  async descargarBackup(backup: BackupMetadata) {
    try {
      const blob = await this.backupService.descargarBackup(backup.id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.showToast('Descarga completada', 'success');
    } catch (error) {
      this.showToast('Error al descargar el archivo', 'error');
    }
  }

  getUltimaFecha(): string | null {
    if (this.backups().length === 0) return null;
    const completed = this.backups().filter(b => b.estado === 'COMPLETADO');
    if (completed.length === 0) return null;
    
    // El primer item ordenado por fecha desc
    const sorted = [...completed].sort((a,b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    const date = new Date(sorted[0].fechaCreacion);
    return date.toLocaleString();
  }

  getEspacioTotal(): string {
    if (this.backups().length === 0) return '0 Bytes';
    const total = this.backups().reduce((acc, b) => acc + (b.tamanoBytes || 0), 0);
    return this.formatBytes(total);
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private showToast(text: string, type: 'success' | 'error') {
    this.toastMessage.set(text);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 5000);
  }
}
