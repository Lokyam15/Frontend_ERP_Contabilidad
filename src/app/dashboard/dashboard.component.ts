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
    <div class="min-h-screen bg-slate-50 flex">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-erp-dark text-white flex flex-col shrink-0">
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <div class="w-8 h-8 bg-erp-primary rounded-lg flex items-center justify-center font-black cursor-pointer" routerLink="/dashboard">E</div>
          <span class="font-bold tracking-tight cursor-pointer" routerLink="/dashboard">ERP <span class="text-erp-primary">Contable</span></span>
        </div>
        
        <nav class="flex-1 p-4 space-y-2">
          <div class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest">Menú Principal</div>
          
          <a routerLink="/dashboard" routerLinkActive="bg-erp-primary/10 text-erp-primary" [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Resumen
          </a>

          <!-- Sección exclusiva para SUPERADMIN -->
          <a *ngIf="isSuperAdmin()" routerLink="/dashboard/empresas" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Gestión Empresas
          </a>

          <!-- Sección para ADMINISTRADOR de empresa -->
          <a *ngIf="!isSuperAdmin()" routerLink="/dashboard/mi-empresa" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Mi Empresa
          </a>

          <!-- Sección para otros roles -->
          <a *ngIf="!isSuperAdmin()" class="flex items-center gap-3 p-3 text-erp-secondary hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Contabilidad
          </a>
        </nav>

        <div class="p-4 border-t border-white/10">
          <button (click)="logout()" class="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col overflow-y-auto h-screen relative">
        
        <!-- Top Header -->
        <header class="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
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

        <!-- Dynamic Content -->
        <div class="p-8 max-w-7xl mx-auto w-full">
           <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `,
  styles: [`
    :host { display: block; }
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
