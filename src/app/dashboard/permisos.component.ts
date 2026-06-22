import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermisoService, Permiso } from '../core/permiso.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Permisos</h2>
          <p class="text-slate-500 font-medium">Control de acceso granular para las funcionalidades del sistema.</p>
        </div>
        <button (click)="editingPermisoId() !== null ? cancelarEdicion() : (showForm() ? cancelarEdicion() : showForm.set(true))" 
                class="px-6 py-2.5 bg-erp-primary text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ showForm() ? 'Cancelar' : 'Nuevo Permiso' }}
        </button>
      </div>

      <!-- Formulario de Creación / Edición -->
      <div *ngIf="showForm()" class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-slide-down">
        <h3 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <span class="w-2 h-6 bg-erp-primary rounded-full"></span>
          {{ editingPermisoId() !== null ? 'Editar Permiso' : 'Registrar Nuevo Permiso' }}
        </h3>
        <form (ngSubmit)="guardarPermiso()" #f="ngForm" class="grid md:grid-cols-2 gap-6 items-end">
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Permiso</label>
            <input type="text" name="nombre" [(ngModel)]="nuevoPermiso.nombre" required
                   class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                   placeholder="Ej: USUARIO_READ">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</label>
            <input type="text" name="descripcion" [(ngModel)]="nuevoPermiso.descripcion" required
                   class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                   placeholder="Describe qué permite hacer...">
          </div>
          <div class="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="submit" [disabled]="!f.valid || saving()"
                    class="px-8 py-3 bg-erp-dark text-white rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2">
              <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ editingPermisoId() !== null ? 'Actualizar Permiso' : 'Guardar Permiso' }}
            </button>
          </div>
        </form>

        <!-- Feedback Visual -->
        <div *ngIf="message()" 
             [class]="messageType() === 'success' ? 'mt-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-slide-up' : 'mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-slide-up'">
          <svg *ngIf="messageType() === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          <svg *ngIf="messageType() === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
          <span class="font-bold text-sm">{{ message() }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-bold">Cargando permisos...</p>
      </div>

      <!-- Listado de Permisos -->
      <div *ngIf="!loading()" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let p of permisos()" class="hover:bg-slate-50/30 transition-colors group">
                <td class="px-8 py-5">
                  <span class="px-3 py-1 bg-erp-primary/10 text-erp-primary rounded-lg font-bold text-sm tracking-tight border border-erp-primary/20">
                    {{ p.nombre }}
                  </span>
                </td>
                <td class="px-8 py-5 text-slate-600 font-medium">{{ p.descripcion }}</td>
                <td class="px-8 py-5 text-right">
                  <button (click)="iniciarEdicion(p)" class="text-slate-300 group-hover:text-erp-primary transition-colors" title="Editar Permiso">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="permisos().length === 0">
                <td colspan="3" class="px-8 py-20 text-center">
                  <div class="flex flex-col items-center">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p class="text-slate-400 font-bold">No hay permisos registrados aún.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-slide-down {
      animation: slideDown 0.3s ease-out;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PermisosComponent implements OnInit {
  private permisoService = inject(PermisoService);

  permisos = signal<Permiso[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  editingPermisoId = signal<number | null>(null);

  nuevoPermiso: Permiso = {
    nombre: '',
    descripcion: ''
  };

  async ngOnInit() {
    await this.loadPermisos();
  }

  async loadPermisos() {
    this.loading.set(true);
    try {
      const data = await this.permisoService.getPermisos();
      this.permisos.set(data);
    } catch (error) {
      console.error('Error al cargar permisos', error);
    } finally {
      this.loading.set(false);
    }
  }

  iniciarEdicion(p: Permiso) {
    if (!p.id) return;
    this.editingPermisoId.set(p.id);
    this.nuevoPermiso = {
      nombre: p.nombre,
      descripcion: p.descripcion
    };
    this.showForm.set(true);
  }

  cancelarEdicion() {
    this.editingPermisoId.set(null);
    this.nuevoPermiso = { nombre: '', descripcion: '' };
    this.showForm.set(false);
  }

  async guardarPermiso() {
    this.saving.set(true);
    this.message.set('');
    try {
      if (this.editingPermisoId() !== null) {
        await this.permisoService.actualizarPermiso(this.editingPermisoId()!, this.nuevoPermiso);
        this.showMessage('Permiso actualizado correctamente', 'success');
      } else {
        await this.permisoService.crearPermiso(this.nuevoPermiso);
        this.showMessage('Permiso creado correctamente', 'success');
      }
      this.cancelarEdicion();
      await this.loadPermisos();
    } catch (error: any) {
      console.error('Error al guardar permiso', error);
      this.showMessage('Error al guardar permiso: ' + (error.error?.message || error.message), 'error');
    } finally {
      this.saving.set(false);
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }
}

