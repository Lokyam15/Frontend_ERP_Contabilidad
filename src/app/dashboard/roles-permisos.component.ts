import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService, Rol } from '../core/rol.service';
import { PermisoService, Permiso } from '../core/permiso.service';

interface ModuloConfig {
  key: string;
  nombre: string;
  descripcion: string;
  readKeys: string[];
  writeKeys: string[];
}

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Roles y Permisos</h2>
          <p class="text-slate-500 font-medium">Gestiona los niveles de acceso y permisos de tu empresa.</p>
        </div>
        <button *ngIf="!showForm()" (click)="openCreateForm()" 
                class="px-6 py-3 bg-erp-primary text-white rounded-xl font-black text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Crear Nuevo Rol
        </button>
      </div>

      <!-- VISTA DE LISTADO -->
      <div *ngIf="!showForm()" class="space-y-6">
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="mt-4 text-slate-400 font-bold">Cargando roles y permisos...</p>
        </div>

        <!-- Grid de Roles -->
        <div *ngIf="!loading()" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let rol of roles()" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 bg-erp-primary/5 text-erp-primary rounded-lg text-[10px] font-black uppercase tracking-wider border border-erp-primary/10">
                Empresa
              </span>
              <div class="flex gap-2">
                <button (click)="openEditForm(rol)" class="p-2 text-slate-400 hover:text-erp-primary hover:bg-erp-primary/5 rounded-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button (click)="eliminarRol(rol)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 3h-6.117" /></svg>
                </button>
              </div>
            </div>
            
            <h4 class="text-lg font-black text-slate-800 mb-1">{{ rol.nombre }}</h4>
            <p class="text-slate-500 text-sm font-medium mb-4 line-clamp-2">{{ rol.descripcion }}</p>
            
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span *ngFor="let p of rol.permisos" class="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100">
                {{ p.nombre }}
              </span>
              <span *ngIf="!rol.permisos || rol.permisos.length === 0" class="text-[10px] text-slate-300 italic">Sin permisos asignados</span>
            </div>

            <div class="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
               <span class="text-[10px] font-black uppercase tracking-widest">Permisos</span>
               <span class="text-[10px] font-bold">{{ rol.permisos?.length || 0 }}</span>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="roles().length === 0" class="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <p class="text-slate-400 font-bold">No se han creado roles personalizados aún.</p>
             <button (click)="openCreateForm()" class="mt-4 text-erp-primary font-black text-sm hover:underline">Crear el primer rol</button>
          </div>
        </div>

        <!-- Sección de Permisos Informativa -->
        <div class="pt-10 space-y-4">
          <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Permisos del Sistema</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div *ngFor="let p of permisos()" class="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
              <p class="text-[10px] font-black text-erp-primary mb-1">{{ p.nombre }}</p>
              <p class="text-[9px] text-slate-400 font-medium leading-tight">{{ p.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMULARIO CREAR/EDITAR -->
      <div *ngIf="showForm()" class="max-w-5xl w-full mx-auto animate-slide-up">
        <div class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          <div class="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-erp-dark rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900">{{ isEditing() ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
                <p class="text-slate-400 text-sm font-medium">Configura el nombre, descripción y privilegios.</p>
              </div>
            </div>
            <button (click)="closeForm()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form (ngSubmit)="saveRol()" #rolForm="ngForm" class="p-8 space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-1 space-y-6">
                <div class="space-y-2">
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Rol</label>
                  <input type="text" name="nombre" [(ngModel)]="model.nombre" required
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej: CONTADOR_GENERAL">
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</label>
                  <textarea name="descripcion" [(ngModel)]="model.descripcion" required rows="4"
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Describe las responsabilidades de este rol..."></textarea>
                </div>
              </div>

              <!-- Matriz de Privilegios -->
              <div class="lg:col-span-2 space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest block">Matriz de Privilegios del Rol</label>
                <div class="overflow-hidden border border-slate-100 rounded-3xl shadow-sm bg-white">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                          <th class="px-6 py-4">Funcionalidad</th>
                          <th class="px-6 py-4 text-center">No Visible</th>
                          <th class="px-6 py-4 text-center">Solo Lectura</th>
                          <th class="px-6 py-4 text-center">Lectura y Escritura</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr *ngFor="let mod of modulosList" class="hover:bg-slate-50/30 transition-colors">
                          <td class="px-6 py-4 max-w-xs">
                            <p class="font-black text-slate-800 text-sm">{{ mod.nombre }}</p>
                            <p class="text-[11px] text-slate-400 font-medium leading-tight">{{ mod.descripcion }}</p>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <label class="inline-flex items-center justify-center cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-all">
                              <input type="radio" [name]="mod.key" [value]="0" [(ngModel)]="model.valoresModulos[mod.key]"
                                     class="w-5 h-5 text-red-500 border-slate-200 focus:ring-red-500 rounded-full cursor-pointer">
                            </label>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <label class="inline-flex items-center justify-center cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-all">
                              <input type="radio" [name]="mod.key" [value]="1" [(ngModel)]="model.valoresModulos[mod.key]"
                                     class="w-5 h-5 text-amber-500 border-slate-200 focus:ring-amber-500 rounded-full cursor-pointer">
                            </label>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <label class="inline-flex items-center justify-center cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-all">
                              <input type="radio" [name]="mod.key" [value]="2" [(ngModel)]="model.valoresModulos[mod.key]"
                                     class="w-5 h-5 text-erp-primary border-slate-200 focus:ring-erp-primary rounded-full cursor-pointer">
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
               <button type="button" (click)="closeForm()" [disabled]="saving()"
                       class="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">
                 Cancelar
               </button>
               <button type="submit" [disabled]="!rolForm.valid || saving()"
                       class="px-10 py-3 bg-erp-primary text-white rounded-xl font-black shadow-lg shadow-erp-primary/30 hover:shadow-erp-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3">
                 <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 {{ isEditing() ? 'Actualizar Rol' : 'Crear Rol' }}
               </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Feedback -->
      <div *ngIf="message()" 
           [class]="messageType() === 'success' ? 'fixed bottom-8 right-8 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up z-50' : 'fixed bottom-8 right-8 p-4 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up z-50'">
        <svg *ngIf="messageType() === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
        <svg *ngIf="messageType() === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span class="font-bold text-sm">{{ message() }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RolesPermisosComponent implements OnInit {
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);

  roles = signal<Rol[]>([]);
  permisos = signal<Permiso[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);
  isEditing = signal(false);
  
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  modulosList: ModuloConfig[] = [
    { key: 'mi-empresa', nombre: 'Mi Empresa', descripcion: 'Datos generales y fiscales de la empresa', readKeys: ['PERM_EMPRESA_READ'], writeKeys: ['PERM_EMPRESA_WRITE'] },
    { key: 'empleados', nombre: 'Gestión de Empleados', descripcion: 'Administración de personal y colaboradores', readKeys: ['PERM_USER_READ'], writeKeys: ['PERM_USER_WRITE'] },
    { key: 'roles-permisos', nombre: 'Roles y Permisos', descripcion: 'Configuración de perfiles y niveles de privilegios', readKeys: ['PERM_ROL_READ'], writeKeys: ['PERM_ROL_WRITE'] },
    { key: 'configuraciones', nombre: 'Configuraciones', descripcion: 'Ajustes y parámetros globales de la empresa', readKeys: ['PERM_CONFIG_READ'], writeKeys: ['PERM_CONFIG_WRITE'] },
    { key: 'inventario', nombre: 'Inventario / Catálogo', descripcion: 'Control de catálogo de productos e ingresos/salidas (Kardex)', readKeys: ['PERM_PRODUCTO_READ', 'PERM_INVENTARIO_READ'], writeKeys: ['PERM_PRODUCTO_WRITE', 'PERM_INVENTARIO_WRITE'] },
    { key: 'contabilidad', nombre: 'Contabilidad', descripcion: 'Libro diario, plan de cuentas y asientos contables', readKeys: ['PERM_CONTABILIDAD_READ'], writeKeys: ['PERM_CONTABILIDAD_WRITE'] },
    { key: 'operaciones', nombre: 'Operaciones (Ventas, Compras y Cartera)', descripcion: 'Facturación de venta/compra y control de cartera', readKeys: ['PERM_OPERACIONES_READ'], writeKeys: ['PERM_OPERACIONES_WRITE'] },
    { key: 'suscripcion', nombre: 'Mi Suscripción', descripcion: 'Gestión de planes de suscripción y límites de la empresa', readKeys: ['PERM_SUSCRIPCION_READ'], writeKeys: ['PERM_SUSCRIPCION_WRITE'] },
    { key: 'reportes', nombre: 'Reportes', descripcion: 'Visualización y generación de reportes del sistema', readKeys: ['PERM_REPORTES_READ'], writeKeys: ['PERM_REPORTES_WRITE'] },
    { key: 'auditoria', nombre: 'Auditoría (Logs)', descripcion: 'Bitácora de movimientos y accesos del sistema', readKeys: ['PERM_AUDITORIA_READ'], writeKeys: ['PERM_AUDITORIA_WRITE'] },
    { key: 'panel-control', nombre: 'Panel de Control', descripcion: 'Gestión del panel de control de la empresa y branding', readKeys: ['PERM_PANEL_CONTROL_READ'], writeKeys: ['PERM_PANEL_CONTROL_WRITE'] }
  ];

  model = {
    id: 0,
    nombre: '',
    descripcion: '',
    valoresModulos: {} as { [key: string]: number },
    unmappedPermissionIds: [] as number[]
  };

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    try {
      const [rolesData, permisosData] = await Promise.all([
        this.rolService.getRoles(),
        this.permisoService.getPermisos()
      ]);
      this.roles.set(rolesData);
      this.permisos.set(permisosData);
    } catch (error) {
      console.error('Error al cargar datos', error);
      this.showMessage('Error al cargar la información', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateForm() {
    this.isEditing.set(false);
    const valores: { [key: string]: number } = {};
    for (const mod of this.modulosList) {
      valores[mod.key] = 0; // Por defecto No visible
    }
    this.model = { 
      id: 0, 
      nombre: '', 
      descripcion: '', 
      valoresModulos: valores,
      unmappedPermissionIds: []
    };
    this.showForm.set(true);
  }

  async openEditForm(rol: Rol) {
    this.loading.set(true);
    try {
      const detail = await this.rolService.getRolById(rol.id);
      this.isEditing.set(true);
      
      const rolePermNames = detail.permisos?.map(p => p.nombre) || [];
      const valores: { [key: string]: number } = {};
      
      for (const mod of this.modulosList) {
        const hasRead = mod.readKeys.every(k => rolePermNames.includes(k));
        const hasWrite = mod.writeKeys.every(k => rolePermNames.includes(k));
        
        if (hasRead && hasWrite) {
          valores[mod.key] = 2; // Lectura y Escritura (Editable)
        } else if (hasRead) {
          valores[mod.key] = 1; // Solo Lectura (No editable)
        } else {
          valores[mod.key] = 0; // No visible
        }
      }

      // Guardar permisos no mapeados para preservar cualquier otro permiso especial
      const mappedKeys = this.modulosList.flatMap(m => [...m.readKeys, ...m.writeKeys]);
      const unmappedPermissionIds: number[] = [];
      for (const p of detail.permisos || []) {
        if (!mappedKeys.includes(p.nombre || '')) {
          unmappedPermissionIds.push(p.id);
        }
      }

      this.model = {
        id: detail.id,
        nombre: detail.nombre,
        descripcion: detail.descripcion,
        valoresModulos: valores,
        unmappedPermissionIds
      };
      this.showForm.set(true);
    } catch (error) {
      this.showMessage('Error al cargar detalle del rol', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  closeForm() {
    this.showForm.set(false);
  }

  async saveRol() {
    this.saving.set(true);
    const listToSave: { id: number }[] = [];
    const allPermsInSystem = this.permisos();

    for (const mod of this.modulosList) {
      const val = this.model.valoresModulos[mod.key] || 0;
      let keysToAdd: string[] = [];
      if (val === 2) {
        keysToAdd = [...mod.readKeys, ...mod.writeKeys];
      } else if (val === 1) {
        keysToAdd = [...mod.readKeys];
      }
      
      for (const keyName of keysToAdd) {
        const found = allPermsInSystem.find(p => p.nombre === keyName);
        if (found && found.id) {
          listToSave.push({ id: found.id });
        }
      }
    }

    // Agregar permisos no mapeados
    for (const id of this.model.unmappedPermissionIds || []) {
      listToSave.push({ id });
    }

    const payload = {
      nombre: this.model.nombre,
      descripcion: this.model.descripcion,
      permisos: listToSave
    };

    try {
      if (this.isEditing()) {
        await this.rolService.actualizarRol(this.model.id, payload);
        this.showMessage('Rol actualizado correctamente', 'success');
      } else {
        await this.rolService.crearRol(payload);
        this.showMessage('Rol creado con éxito', 'success');
      }
      this.closeForm();
      await this.loadAll();
    } catch (error: any) {
      this.showMessage('Error al guardar: ' + (error.error?.message || error.message), 'error');
    } finally {
      this.saving.set(false);
    }
  }

  async eliminarRol(rol: Rol) {
    if (!confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) return;
    
    try {
      await this.rolService.eliminarRol(rol.id);
      this.showMessage('Rol eliminado correctamente', 'success');
      await this.loadAll();
    } catch (error) {
      this.showMessage('No se pudo eliminar el rol', 'error');
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }
}
