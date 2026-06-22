import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserMe } from '../core/user.service';
import { InfoUsuarioService, InfoUsuario } from '../core/info-usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado de Perfil -->
      <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div class="h-48 bg-gradient-to-r from-erp-dark to-slate-800 relative">
          <div class="absolute -bottom-16 left-10 flex items-end gap-6">
            <div class="w-32 h-32 bg-white p-2 rounded-[32px] shadow-2xl">
              <div class="w-full h-full bg-gradient-to-br from-erp-primary to-blue-600 rounded-[24px] flex items-center justify-center text-white text-4xl font-black">
                {{ (userMe()?.username || 'U')[0].toUpperCase() }}
              </div>
            </div>
            <div class="pb-4">
              <h2 class="text-3xl font-black text-slate-900 tracking-tight">{{ info()?.nombre || userMe()?.username }}</h2>
              <p class="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Sesión Activa: {{ userMe()?.rol?.nombre }}
              </p>
            </div>
          </div>
        </div>
        <div class="h-20 bg-white"></div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        
        <!-- Columna Izquierda: Información de Cuenta (No modificable) -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
            <h3 class="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Detalles de Cuenta</h3>
            
            <div class="space-y-4">
              <div class="group">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre de Usuario</label>
                <p class="text-slate-700 font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{{ userMe()?.username }}</p>
              </div>
              
              <div class="group">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correo Electrónico</label>
                <p class="text-slate-700 font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{{ userMe()?.correo }}</p>
              </div>

              <div class="group">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Empresa / Organización</label>
                <p class="text-slate-700 font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 italic">
                  {{ userMe()?.idEmpresa ? 'Empresa Registrada' : 'Gestión Global' }}
                </p>
              </div>
            </div>

            <div class="pt-6">
              <div class="p-4 bg-erp-primary/5 rounded-2xl border border-erp-primary/10">
                <p class="text-[10px] text-erp-primary font-black uppercase mb-1">Seguridad</p>
                <p class="text-xs text-slate-500 font-medium leading-relaxed">
                  Para cambiar tu contraseña o correo, por favor contacta con el administrador del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Información Personal (Modificable) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-2xl font-black text-slate-800 tracking-tight">Información Personal</h3>
                <p class="text-slate-400 font-medium text-sm mt-1">Completa tu perfil para que otros colaboradores puedan identificarte.</p>
              </div>
              <div *ngIf="loadingInfo()" class="w-6 h-6 border-2 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
            </div>

            <form (ngSubmit)="saveProfile()" #profileForm="ngForm" class="space-y-8">
              <div class="grid md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Nombre Completo
                  </label>
                  <input type="text" name="nombre" [(ngModel)]="model.nombre" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="Ej: Juan Perez Garcia">
                </div>
                
                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Documento de Identidad (CI)
                  </label>
                  <input type="text" name="ci" [(ngModel)]="model.ci" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="Ej: 1234567 LP">
                </div>

                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Cargo / Posición
                  </label>
                  <input type="text" name="cargo" [(ngModel)]="model.cargo" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="Ej: Contador General">
                </div>

                <div class="space-y-3">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1 h-3 bg-erp-primary rounded-full"></span>
                    Teléfono de Contacto
                  </label>
                  <input type="text" name="telefono" [(ngModel)]="model.telefono" required
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-sm"
                         placeholder="Ej: 78899001">
                </div>
              </div>

              <div class="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div *ngIf="isNewProfile()" class="flex items-center gap-3 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  <span class="text-xs font-bold uppercase tracking-wider">Aún no has completado tu perfil</span>
                </div>
                <div *ngIf="!isNewProfile()" class="flex items-center gap-3 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                  <span class="text-xs font-bold uppercase tracking-wider">Perfil registrado correctamente</span>
                </div>

                <button type="submit" [disabled]="!profileForm.valid || saving()"
                        class="px-12 py-4 bg-erp-dark text-white rounded-2xl font-black shadow-xl shadow-erp-dark/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3">
                  <span *ngIf="saving()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {{ isNewProfile() ? 'Guardar Perfil' : 'Actualizar Información' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <div *ngIf="message()" 
           [class]="messageType() === 'success' ? 'fixed bottom-10 right-10 p-5 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-50' : 'fixed bottom-10 right-10 p-5 bg-red-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-50'">
        <span class="font-black text-sm pr-4">{{ message() }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PerfilComponent implements OnInit {
  private userService = inject(UserService);
  private infoService = inject(InfoUsuarioService);

  userMe = signal<UserMe | null>(null);
  info = signal<InfoUsuario | null>(null);
  
  loadingInfo = signal(false);
  saving = signal(false);
  isNewProfile = signal(true);
  
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  model = {
    nombre: '',
    ci: '',
    cargo: '',
    telefono: ''
  };

  async ngOnInit() {
    await this.loadInitialData();
  }

  async loadInitialData() {
    try {
      const me = await this.userService.getMyProfile();
      this.userMe.set(me);
      
      // Cargar InfoUsuario personal usando el nuevo endpoint /me
      await this.loadMyProfile();
    } catch (error) {
      console.error('Error loading initial data', error);
      this.showMessage('No se pudo cargar tu información de cuenta', 'error');
    }
  }

  async loadMyProfile() {
    this.loadingInfo.set(true);
    try {
      const profileInfo = await this.infoService.getMyProfileInfo();
      this.fillModel(profileInfo);
    } catch (error: any) {
      if (error.status === 404) {
        // El usuario no tiene perfil personal registrado aún
        this.isNewProfile.set(true);
      } else {
        console.warn('Error al obtener perfil personal', error);
      }
    } finally {
      this.loadingInfo.set(false);
    }
  }

  fillModel(data: InfoUsuario) {
    this.info.set(data);
    this.model = {
      nombre: data.nombre,
      ci: data.ci,
      cargo: data.cargo,
      telefono: data.telefono
    };
    this.isNewProfile.set(false);
  }

  async saveProfile() {
    this.saving.set(true);

    const payload: InfoUsuario = {
      nombre: this.model.nombre,
      ci: this.model.ci,
      cargo: this.model.cargo,
      telefono: this.model.telefono
    };

    try {
      if (this.isNewProfile()) {
        const res = await this.infoService.crearInfo(payload);
        this.fillModel(res);
        this.showMessage('Perfil creado con éxito', 'success');
      } else {
        const res = await this.infoService.updateMyProfileInfo(payload);
        this.fillModel(res);
        this.showMessage('Perfil actualizado', 'success');
      }
    } catch (error: any) {
      this.showMessage('Error al guardar el perfil', 'error');
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
