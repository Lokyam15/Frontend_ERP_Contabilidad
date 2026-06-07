import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, UserMe } from '../core/user.service';
import { RolService, Rol } from '../core/rol.service';
import { SuscripcionCapabilitiesService } from '../core/suscripcion-capabilities.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Empleados</h2>
          <p class="text-slate-500 font-medium">
            {{ isSuperAdmin() ? 'Panel de supervisión global de usuarios y empresas.' : 'Administra los accesos y colaboradores de tu empresa.' }}
          </p>
        </div>
        
        <!-- Botón Crear (Solo con permiso de escritura) -->
        <button *ngIf="!isSuperAdmin() && canWrite() && !showForm()" (click)="openCreateForm()" 
                [disabled]="isLimitReached()"
                [class]="isLimitReached() ? 
                         'px-6 py-3 bg-slate-200 text-slate-400 cursor-not-allowed rounded-xl font-black text-sm transition-all flex items-center gap-2' : 
                         'px-6 py-3 bg-erp-primary text-white rounded-xl font-black text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Nuevo Empleado
        </button>

        <!-- Buscador -->
        <div class="relative max-w-sm w-full">
           <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </span>
           <input type="text" [(ngModel)]="searchQuery" (input)="filterEmployees()"
                  [placeholder]="isSuperAdmin() ? 'Buscar por empresa o usuario...' : 'Buscar empleado...'"
                  class="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:border-erp-primary outline-none transition-all shadow-sm font-medium text-slate-700">
        </div>
      </div>

      <!-- VISTA DE LISTADO -->
      <div *ngIf="!showForm()" class="space-y-6">

        <!-- Alerta de Límite de Plan Alcanzado (SaaS) -->
        <div *ngIf="!isSuperAdmin() && isLimitReached()" class="p-6 bg-amber-50 border border-amber-200 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-black text-amber-900">Has alcanzado el límite de usuarios de tu plan actual</h4>
              <p class="text-xs text-amber-700 font-medium font-bold">Límite: {{ maxEmployeesAllowed() }} empleado(s). Actualiza tu plan para registrar más colaboradores.</p>
            </div>
          </div>
          <a routerLink="/dashboard/suscripcion" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs transition-all text-center self-start sm:self-auto shadow-md shadow-amber-500/10 active:scale-95 uppercase tracking-wider">
            Ver Planes
          </a>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="mt-4 text-slate-400 font-bold tracking-widest uppercase text-[10px]">Sincronizando nómina...</p>
        </div>

        <!-- Tabla de Empleados -->
        <div *ngIf="!loading()" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th class="px-8 py-6">Colaborador</th>
                  <th class="px-8 py-6">Rol de Acceso</th>
                  <th *ngIf="isSuperAdmin()" class="px-8 py-6">Empresa</th>
                  <th class="px-8 py-6 text-center">Estado</th>
                  <th *ngIf="!isSuperAdmin() && canWrite()" class="px-8 py-6 text-right pr-12">Gestión</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 font-medium">
                <tr *ngFor="let emp of filteredEmployees()" class="hover:bg-slate-50/40 transition-colors group">
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-500 font-black text-sm shadow-inner group-hover:from-erp-primary/10 group-hover:to-erp-primary/5 group-hover:text-erp-primary transition-all">
                        {{ emp.username[0].toUpperCase() }}
                      </div>
                      <div>
                        <p class="text-slate-900 font-black tracking-tight group-hover:text-erp-primary transition-colors">{{ emp.username }}</p>
                        <p class="text-slate-400 text-xs font-medium">{{ emp.correo }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="space-y-1">
                      <span class="text-erp-primary font-black text-[11px] uppercase tracking-wider bg-erp-primary/5 px-2 py-0.5 rounded border border-erp-primary/10">
                        {{ emp.rol?.nombre }}
                      </span>
                      <p class="text-slate-400 text-[10px] font-bold uppercase">{{ emp.rol?.descripcion || 'Sin descripción' }}</p>
                    </div>
                  </td>
                  <td *ngIf="isSuperAdmin()" class="px-8 py-6">
                    <div class="flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                       <span class="text-slate-600 font-black tracking-tight">{{ emp.empresa?.nombre || 'SISTEMA' }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span [class]="emp.estado ? 'px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100' : 'px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100'">
                      {{ emp.estado ? 'Activo' : 'Baja' }}
                    </span>
                  </td>
                  <td *ngIf="!isSuperAdmin() && canWrite()" class="px-8 py-6 text-right pr-12">
                    <div class="flex items-center justify-end gap-3">
                       <button (click)="openEditForm(emp)" title="Editar Empleado"
                               class="p-2.5 text-slate-400 hover:text-erp-primary hover:bg-erp-primary/5 rounded-xl transition-all border border-transparent hover:border-erp-primary/10">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       </button>
                       <button (click)="requestDelete(emp)" title="Dar de baja"
                               class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 3h-6.117" /></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- FORMULARIO DE GESTIÓN (ADMINISTRADOR) -->
      <div *ngIf="showForm()" class="max-w-4xl animate-slide-up mx-auto">
        <div class="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
          
          <div class="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-erp-dark rounded-3xl flex items-center justify-center text-white shadow-xl shadow-erp-dark/20">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ isEditing() ? 'Actualizar Ficha' : 'Nuevo Registro' }}</h3>
                <p class="text-slate-400 text-sm font-medium tracking-tight">Completa los datos del empleado y asigna sus permisos.</p>
              </div>
            </div>
            <button (click)="closeForm()" class="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form (ngSubmit)="saveUser()" #userForm="ngForm" class="p-10">
            <div class="grid md:grid-cols-2 gap-10">
              <div class="space-y-8">
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Nombre de Usuario
                  </label>
                  <input type="text" name="username" [(ngModel)]="model.username" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="Ej: dlopez">
                </div>
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Correo Corporativo
                  </label>
                  <input type="email" name="correo" [(ngModel)]="model.correo" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="daniel.lopez@empresa.com">
                </div>
              </div>

              <div class="space-y-8">
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Contraseña {{ isEditing() ? '(Solo si desea cambiarla)' : '' }}
                  </label>
                  <input type="password" name="password" [(ngModel)]="model.password" [required]="!isEditing()"
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="********">
                </div>
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Rol en el Sistema
                  </label>
                  <select name="rolId" [(ngModel)]="model.rolId" required
                          class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 cursor-pointer shadow-sm">
                    <option [value]="0" disabled>Selecciona una categoría...</option>
                    <option *ngFor="let r of rolesAvailable()" [value]="r.id">{{ r.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
               <button type="button" (click)="closeForm()" class="px-8 py-4 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition-all">Descartar</button>
               <button type="submit" [disabled]="!userForm.valid || saving()"
                       class="px-12 py-4 bg-erp-dark text-white rounded-2xl font-black shadow-xl shadow-erp-dark/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3">
                 <span *ngIf="saving()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 {{ isEditing() ? 'Guardar Cambios' : 'Confirmar Registro' }}
               </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL DE CONFIRMACIÓN DE BAJA -->
      <div *ngIf="showConfirmModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-erp-dark/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
           <div class="p-8 text-center space-y-6">
              <div class="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900">¿Confirmar baja de empleado?</h3>
                <p class="text-slate-500 font-medium px-4">
                  Estás a punto de dar de baja a <span class="text-slate-800 font-black">"{{ employeeToManage()?.username }}"</span>. 
                  Este usuario perderá acceso inmediato al sistema.
                </p>
              </div>
              <div class="flex flex-col gap-3 pt-4">
                <button (click)="confirmDelete()" [disabled]="saving()"
                        class="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                  <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Confirmar Baja
                </button>
                <button (click)="cancelDelete()" [disabled]="saving()"
                        class="w-full py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all">
                  Cancelar
                </button>
              </div>
           </div>
        </div>
      </div>

      <!-- Notificaciones (Toasts) -->
      <div *ngIf="message()" 
           [class]="messageType() === 'success' ? 'fixed bottom-10 right-10 p-5 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-50' : 'fixed bottom-10 right-10 p-5 bg-red-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-50'">
        <div [class]="messageType() === 'success' ? 'w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center' : 'w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center'">
           <svg *ngIf="messageType() === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
           <svg *ngIf="messageType() === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        </div>
        <span class="font-black text-sm pr-4">{{ message() }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class EmpleadosComponent implements OnInit {
  private userService = inject(UserService);
  private rolService = inject(RolService);
  public capabilitiesService = inject(SuscripcionCapabilitiesService);
  private authService = inject(AuthService);

  allEmployees = signal<UserMe[]>([]);
  filteredEmployees = signal<UserMe[]>([]);
  rolesAvailable = signal<Rol[]>([]);
  
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);
  isEditing = signal(false);
  
  // Confirmación de Baja
  showConfirmModal = signal(false);
  employeeToManage = signal<UserMe | null>(null);
  
  searchQuery = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  currentUserRole = signal<string>('');

  // Conteo de empleados actuales (excluyendo administradores)
  public employeeCount = computed(() => {
    return this.allEmployees().filter(e => 
      e.rol?.nombre !== 'ADMIN' && e.rol?.nombre !== 'ADMINISTRADOR'
    ).length;
  });

  // Límite de empleados permitidos por plan
  public maxEmployeesAllowed = computed(() => {
    return this.capabilitiesService.getMaxEmployees();
  });

  // Límite alcanzado
  public isLimitReached = computed(() => {
    if (this.isSuperAdmin()) return false;
    return this.capabilitiesService.isLimitReached(this.employeeCount());
  });

  model = {
    id: 0,
    username: '',
    correo: '',
    password: '',
    rolId: 0
  };

  async ngOnInit() {
    await this.loadProfile();
    await this.loadData();
  }

  async loadProfile() {
    try {
      const me = await this.userService.getMyProfile();
      this.currentUserRole.set(me.rol.nombre);
    } catch (error) {
      console.error('Error profile', error);
    }
  }

  isSuperAdmin(): boolean {
    return this.currentUserRole() === 'SUPERADMIN';
  }

  canWrite(): boolean {
    return this.authService.hasPermission('PERM_USER_WRITE');
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [users, roles] = await Promise.all([
        this.userService.getUsers(),
        this.isSuperAdmin() ? Promise.resolve([]) : this.rolService.getRoles()
      ]);
      this.allEmployees.set(users);
      this.filteredEmployees.set(users);
      this.rolesAvailable.set(roles);
    } catch (error) {
      this.showMessage('Error al sincronizar con el servidor', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  filterEmployees() {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      this.filteredEmployees.set(this.allEmployees());
      return;
    }
    const filtered = this.allEmployees().filter(e => 
      e.empresa?.nombre?.toLowerCase().includes(q) || 
      e.username.toLowerCase().includes(q) ||
      e.correo.toLowerCase().includes(q)
    );
    this.filteredEmployees.set(filtered);
  }

  openCreateForm() {
    if (this.isLimitReached()) {
      this.showMessage('Has alcanzado el límite de usuarios de tu plan actual', 'error');
      return;
    }
    this.isEditing.set(false);
    this.model = { id: 0, username: '', correo: '', password: '', rolId: 0 };
    this.showForm.set(true);
  }

  openEditForm(emp: UserMe) {
    this.isEditing.set(true);
    this.model = {
      id: emp.id,
      username: emp.username,
      correo: emp.correo,
      password: '',
      rolId: emp.rol.id
    };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  async saveUser() {
    if (!this.isEditing() && this.isLimitReached()) {
      this.showMessage('Has alcanzado el límite de usuarios de tu plan actual', 'error');
      return;
    }
    this.saving.set(true);
    const payload: any = {
      username: this.model.username,
      correo: this.model.correo,
      rol: { id: Number(this.model.rolId) }
    };
    if (this.model.password) {
      payload.password = this.model.password;
    }

    try {
      if (this.isEditing()) {
        await this.userService.updateUser(this.model.id, payload);
        this.showMessage('Información actualizada correctamente', 'success');
      } else {
        await this.userService.createUser(payload);
        this.showMessage('Colaborador registrado con éxito', 'success');
      }
      this.closeForm();
      await this.loadData();
    } catch (error: any) {
      this.showMessage('No se pudo guardar los cambios', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  // Lógica de Baja Personalizada
  requestDelete(emp: UserMe) {
    this.employeeToManage.set(emp);
    this.showConfirmModal.set(true);
  }

  cancelDelete() {
    this.showConfirmModal.set(false);
    this.employeeToManage.set(null);
  }

  async confirmDelete() {
    const emp = this.employeeToManage();
    if (!emp) return;

    this.saving.set(true);
    try {
      await this.userService.deleteUser(emp.id);
      this.showMessage('Colaborador dado de baja con éxito', 'success');
      this.showConfirmModal.set(false);
      this.employeeToManage.set(null);
      await this.loadData();
    } catch (error: any) {
      this.showMessage('Error al procesar la baja del empleado', 'error');
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
