import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { EmpresaService, Empresa } from '../core/empresa.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-erp-dark text-white flex flex-col shrink-0">
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <div class="w-8 h-8 bg-erp-primary rounded-lg flex items-center justify-center font-black">E</div>
          <span class="font-bold tracking-tight">ERP <span class="text-erp-primary">Contable</span></span>
        </div>
        
        <nav class="flex-1 p-4 space-y-2">
          <div class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest">General</div>
          <a class="flex items-center gap-3 p-3 bg-erp-primary/10 text-erp-primary rounded-xl font-medium cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </a>
          <a class="flex items-center gap-3 p-3 text-erp-secondary hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all cursor-pointer">
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

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto h-screen">
        <!-- Header -->
        <header class="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-slate-800">Bienvenido, {{ auth.session()?.username }}</h2>
            <span *ngIf="empresa()" class="bg-erp-primary/10 text-erp-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               {{ empresa()?.nombre }}
            </span>
          </div>
          <div class="flex items-center gap-4">
             <div class="text-right hidden sm:block">
               <p class="text-sm font-bold text-slate-800">{{ auth.session()?.username }}</p>
               <p class="text-xs text-slate-500 capitalize">{{ auth.session()?.roleName || 'Usuario' }}</p>
             </div>
             <div class="w-10 h-10 bg-gradient-to-br from-erp-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-erp-primary/20">
               {{ (auth.session()?.username || 'U')[0].toUpperCase() }}
             </div>
          </div>
        </header>

        <!-- Dashboard Body -->
        <div class="p-8">
          
          <!-- Loading State -->
          <div *ngIf="loading()" class="flex items-center justify-center h-64">
            <div class="w-8 h-8 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
          </div>

          <!-- Content State -->
          <div *ngIf="!loading() && empresa()" class="animate-fade-in space-y-8">
            
            <!-- Company Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Razón Social</p>
                 <h3 class="text-lg font-bold text-slate-900 leading-tight">{{ empresa()?.razonSocial }}</h3>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">NIT / Identificación</p>
                 <h3 class="text-lg font-bold text-slate-900 leading-tight">{{ empresa()?.nit }}</h3>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Teléfono</p>
                 <h3 class="text-lg font-bold text-slate-900 leading-tight">{{ empresa()?.telefono }}</h3>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estado</p>
                 <div class="flex items-center gap-2 text-erp-accent">
                   <span class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-erp-accent opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-erp-accent"></span>
                   </span>
                   <h3 class="text-lg font-bold leading-tight">Activo</h3>
                 </div>
              </div>
            </div>

            <!-- Detailed Info Section -->
            <div class="grid lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h4 class="font-bold text-slate-800">Información de Contacto</h4>
                  <button class="text-erp-primary text-sm font-bold hover:underline">Editar datos</button>
                </div>
                <div class="p-8 grid md:grid-cols-2 gap-8">
                  <div class="space-y-4">
                    <div>
                      <label class="text-xs text-slate-400 font-bold uppercase tracking-wider">Dirección Fiscal</label>
                      <p class="text-slate-700 font-medium mt-1">{{ empresa()?.direccion }}</p>
                    </div>
                    <div>
                      <label class="text-xs text-slate-400 font-bold uppercase tracking-wider">Correo Corporativo</label>
                      <p class="text-slate-700 font-medium mt-1">{{ empresa()?.correo }}</p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <label class="text-xs text-slate-400 font-bold uppercase tracking-wider">Fecha de Alta</label>
                      <p class="text-slate-700 font-medium mt-1">08 Mayo 2026</p>
                    </div>
                    <div>
                      <label class="text-xs text-slate-400 font-bold uppercase tracking-wider">Suscripción</label>
                      <span class="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg uppercase">Plan Premium</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="bg-erp-dark rounded-3xl p-8 text-white flex flex-col justify-between">
                <div>
                  <h4 class="text-xl font-bold mb-2">Acciones Rápidas</h4>
                  <p class="text-erp-secondary text-sm mb-6">Gestiona tu contabilidad hoy mismo.</p>
                  <div class="space-y-3">
                    <button class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left flex items-center justify-between group transition-all">
                      <span class="font-bold text-sm">Nuevo Ingreso</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-erp-primary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <button class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left flex items-center justify-between group transition-all">
                      <span class="font-bold text-sm">Generar Balance</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-erp-primary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17v-2m3 2v-4m3 2v-6m0 10H4.5" /></svg>
                    </button>
                  </div>
                </div>
                <div class="mt-8 pt-8 border-t border-white/5 text-center">
                  <p class="text-xs text-erp-secondary">¿Necesitas ayuda técnica?</p>
                  <a href="#" class="text-xs font-bold text-erp-primary hover:underline">Contactar Soporte</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out forwards;
    }
    :host { display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  public auth = inject(AuthService);
  private empresaService = inject(EmpresaService);
  
  public empresa = signal<Empresa | null>(null);
  public loading = signal(true);

  async ngOnInit() {
    const id = this.auth.empresaId();
    if (id) {
      try {
        const data = await this.empresaService.getEmpresaById(id);
        this.empresa.set(data);
      } catch (error) {
        console.error('Error cargando datos de la empresa', error);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }
}
