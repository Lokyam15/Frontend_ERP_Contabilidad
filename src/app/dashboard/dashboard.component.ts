import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { UserService, UserMe } from '../core/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen bg-slate-50 flex overflow-hidden">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-erp-dark text-white flex flex-col shrink-0">
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <div class="w-8 h-8 bg-erp-primary rounded-lg flex items-center justify-center font-black cursor-pointer" routerLink="/dashboard">E</div>
          <span class="font-bold tracking-tight cursor-pointer" routerLink="/dashboard">ERP <span class="text-erp-primary">Contable</span></span>
        </div>
        
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <div class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest">Menú Principal</div>
          
          <a routerLink="/dashboard" routerLinkActive="bg-erp-primary/10 text-erp-primary" [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Resumen
          </a>

          <!-- Sección exclusiva para SUPERADMIN -->
          <ng-container *ngIf="isSuperAdmin()">
            <a routerLink="/dashboard/empresas" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Gestión Empresas
            </a>
            <a routerLink="/dashboard/roles" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Roles
            </a>
            <a routerLink="/dashboard/permisos" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Permisos
            </a>
            <a routerLink="/dashboard/empleados" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Empleados
            </a>
          </ng-container>

          <!-- Sección para ADMINISTRADOR de empresa -->
          <ng-container *ngIf="!isSuperAdmin()">
            <a routerLink="/dashboard/mi-empresa" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Mi Empresa
            </a>

            <a routerLink="/dashboard/configuraciones" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Configuraciones
            </a>

            <a routerLink="/dashboard/roles-permisos" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
              Roles y Permisos
            </a>

            <a routerLink="/dashboard/empleados" routerLinkActive="bg-erp-primary/10 text-erp-primary"
               class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Empleados
            </a>

            <a class="flex items-center gap-3 p-3 text-erp-secondary hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Contabilidad
            </a>
          </ng-container>
        </nav>

        <div class="p-4 border-t border-white/10">
          <button (click)="logout()" class="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Contenedor Derecho -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <!-- Header Superior Fijo -->
        <header class="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0 z-20">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-slate-800">
               {{ headerTitle() }}
            </h2>
          </div>
          <div class="flex items-center gap-4" *ngIf="userProfile()">
             <div class="text-right hidden sm:block">
               <p class="text-sm font-bold text-slate-800">{{ userProfile()?.info?.nombre || userProfile()?.username }}</p>
               <p class="text-xs text-slate-500 capitalize">{{ userProfile()?.rol?.nombre }}</p>
             </div>
             <div class="w-10 h-10 bg-gradient-to-br from-erp-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
               {{ (userProfile()?.username || 'U')[0].toUpperCase() }}
             </div>
          </div>
        </header>

        <!-- Área de Contenido Scrollable -->
        <main class="flex-1 overflow-y-auto bg-slate-50 relative" style="scrollbar-gutter: stable;">
           <div class="p-8 max-w-7xl mx-auto w-full">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    
    /* Scrollbar estilizada para el sidebar */
    nav::-webkit-scrollbar { width: 4px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    
    /* Scrollbar estilizada para el contenido principal */
    main::-webkit-scrollbar { width: 8px; }
    main::-webkit-scrollbar-track { background: transparent; }
    main::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    main::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  
  public userProfile = signal<UserMe | null>(null);

  async ngOnInit() {
    try {
      const profile = await this.userService.getMyProfile();
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Error al cargar perfil en Layout', error);
    }
  }

  isSuperAdmin(): boolean {
    return this.userProfile()?.rol?.nombre === 'SUPERADMIN';
  }

  headerTitle(): string {
    return this.isSuperAdmin() ? 'Panel Global' : 'Gestión Empresarial';
  }

  logout() {
    this.auth.logout();
  }
}
