import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService, Empresa } from '../core/empresa.service';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in space-y-8">
      
      <!-- Encabezado de Sección -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Empresas</h2>
          <p class="text-slate-500 font-medium">Visualización y control de todas las empresas suscritas al sistema.</p>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar
          </button>
          <button class="px-4 py-2 bg-erp-primary text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>
            Nueva Empresa
          </button>
        </div>
      </div>

      <!-- Buscador y Filtros Rápidos -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Buscar por nombre, NIT o correo..." 
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-erp-primary rounded-xl text-sm transition-all outline-none"
          >
        </div>
        <select class="bg-slate-50 border-transparent rounded-xl px-4 py-2 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:border-erp-primary transition-all cursor-pointer">
          <option>Todas las suscripciones</option>
          <option>Activas</option>
          <option>Vencidas</option>
        </select>
      </div>

      <!-- Tabla de Empresas -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-50">
                <th class="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th class="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Identificación (NIT)</th>
                <th class="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th class="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Suscripción</th>
                <th class="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              
              <!-- Loading State -->
              <tr *ngIf="loading()">
                <td colspan="5" class="p-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
                    <p class="text-slate-400 font-bold text-sm">Cargando empresas...</p>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="!loading() && empresas().length === 0">
                <td colspan="5" class="p-20 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h4 class="font-bold text-slate-800">No se encontraron empresas</h4>
                    <p class="text-slate-500 text-sm">Aún no hay empresas registradas en la plataforma.</p>
                  </div>
                </td>
              </tr>

              <!-- Empresa Row -->
              <tr *ngFor="let emp of empresas()" class="hover:bg-slate-50/50 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-lg group-hover:bg-erp-primary group-hover:text-white transition-colors">
                      {{ emp.nombre[0].toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 leading-none mb-1">{{ emp.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ emp.razonSocial }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <span class="text-sm font-bold text-slate-600">{{ emp.nit }}</span>
                </td>
                <td class="p-6">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {{ emp.correo }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {{ emp.telefono }}
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <!-- Badge dinámico de suscripción -->
                  <div *ngIf="emp.suscripcion" [ngClass]="{
                    'bg-emerald-50 text-emerald-600': emp.suscripcion.estado,
                    'bg-rose-50 text-rose-600': !emp.suscripcion.estado
                  }" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <span class="h-1.5 w-1.5 rounded-full" [ngClass]="emp.suscripcion.estado ? 'bg-emerald-600' : 'bg-rose-600'"></span>
                    {{ emp.suscripcion.estado ? 'Activa' : 'Inactiva' }}
                    <span class="opacity-50">•</span>
                    {{ emp.suscripcion.plan }}
                  </div>
                  <div *ngIf="!emp.suscripcion" class="text-xs text-slate-400 italic">Sin suscripción</div>
                </td>
                <td class="p-6 text-center">
                  <button class="p-2 text-slate-400 hover:text-erp-primary hover:bg-erp-primary/10 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

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
export class EmpresaListComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  
  public empresas = signal<Empresa[]>([]);
  public loading = signal(true);

  async ngOnInit() {
    try {
      const data = await this.empresaService.getAllEmpresas();
      this.empresas.set(data);
    } catch (error) {
      console.error('Error cargando lista de empresas', error);
    } finally {
      this.loading.set(false);
    }
  }
}
