import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService, UserMe } from '../core/user.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!loading() && userProfile()" class="animate-fade-in space-y-8">
      
      <!-- Welcome Card -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-3xl font-black text-slate-900 mb-2">¡Hola, {{ userProfile()?.info?.nombre || userProfile()?.username }}!</h1>
          <p class="text-slate-500 font-medium">Bienvenido de nuevo al sistema. Estas son tus estadísticas actuales.</p>
        </div>
        <svg class="absolute -right-8 -bottom-8 w-64 h-64 text-slate-50 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
      </div>

      <!-- Profile Summary Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-erp-primary/10 rounded-xl flex items-center justify-center text-erp-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           </div>
           <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Rol del Sistema</p>
              <h3 class="text-lg font-bold text-slate-900">{{ userProfile()?.rol?.nombre }}</h3>
           </div>
        </div>
        <div *ngIf="userProfile()?.info?.cargo" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
           </div>
           <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargo / Puesto</p>
              <h3 class="text-lg font-bold text-slate-900">{{ userProfile()?.info?.cargo }}</h3>
           </div>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
           </div>
           <div class="overflow-hidden">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Correo Electrónico</p>
              <h3 class="text-lg font-bold text-slate-900 truncate">{{ userProfile()?.correo }}</h3>
           </div>
        </div>
      </div>

      <!-- Detailed Information Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        <div *ngIf="userProfile()?.info" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-50 flex items-center gap-2">
            <div class="w-2 h-6 bg-erp-primary rounded-full"></div>
            <h4 class="font-bold text-slate-800">Detalles del Perfil</h4>
          </div>
          <div class="p-6 space-y-4">
             <div *ngIf="userProfile()?.info?.nombre" class="flex justify-between py-3 border-b border-slate-50">
                <span class="text-sm text-slate-500 font-medium">Nombre Completo</span>
                <span class="text-sm text-slate-900 font-bold">{{ userProfile()?.info?.nombre }}</span>
             </div>
             <div *ngIf="userProfile()?.info?.ci" class="flex justify-between py-3 border-b border-slate-50">
                <span class="text-sm text-slate-500 font-medium">Cédula / ID</span>
                <span class="text-sm text-slate-900 font-bold">{{ userProfile()?.info?.ci }}</span>
             </div>
             <div *ngIf="userProfile()?.info?.telefono" class="flex justify-between py-3">
                <span class="text-sm text-slate-500 font-medium">Teléfono</span>
                <span class="text-sm text-slate-900 font-bold">{{ userProfile()?.info?.telefono }}</span>
             </div>
          </div>
        </div>

        <div *ngIf="empresa()" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-50 flex items-center gap-2">
             <div class="w-2 h-6 bg-erp-accent rounded-full"></div>
             <h4 class="font-bold text-slate-800">Información de la Empresa</h4>
          </div>
          <div class="p-6 space-y-4">
             <div class="flex justify-between py-3 border-b border-slate-50">
                <span class="text-sm text-slate-500 font-medium">Empresa</span>
                <span class="text-sm text-slate-900 font-bold">{{ empresa()?.nombre }}</span>
             </div>
             <div class="flex justify-between py-3 border-b border-slate-50">
                <span class="text-sm text-slate-500 font-medium">NIT</span>
                <span class="text-sm text-slate-900 font-bold">{{ empresa()?.nit }}</span>
             </div>
             <div class="flex justify-between py-3">
                <span class="text-sm text-slate-500 font-medium">Razón Social</span>
                <span class="text-sm text-slate-900 font-bold">{{ empresa()?.razonSocial }}</span>
             </div>
          </div>
        </div>

        <div *ngIf="isSuperAdmin() && !empresa()" class="bg-gradient-to-br from-erp-dark to-slate-800 rounded-3xl p-8 text-white flex flex-col justify-center items-center text-center">
           <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-erp-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
           <h4 class="text-xl font-bold mb-2">Acceso de Super Administrador</h4>
           <p class="text-erp-secondary text-sm">Usted tiene privilegios globales sobre todas las entidades del sistema.</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading()" class="flex items-center justify-center h-64">
      <div class="w-8 h-8 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private userService = inject(UserService);
  private empresaService = inject(EmpresaService);
  
  public userProfile = signal<UserMe | null>(null);
  public empresa = signal<Empresa | null>(null);
  public loading = signal(true);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const profile = await this.userService.getMyProfile();
      this.userProfile.set(profile);

      if (profile.idEmpresa && profile.rol.nombre !== 'SUPERADMIN') {
        try {
          const empData = await this.empresaService.getEmpresaById(profile.idEmpresa);
          this.empresa.set(empData);
        } catch (err) {
          console.warn('Empresa no disponible', err);
        }
      }
    } catch (error) {
      console.error('Error al cargar dashboard home', error);
    } finally {
      this.loading.set(false);
    }
  }

  isSuperAdmin(): boolean {
    return this.userProfile()?.rol?.nombre === 'SUPERADMIN';
  }
}
