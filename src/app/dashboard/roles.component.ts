import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolService, Rol } from '../core/rol.service';

interface GrupoRoles {
  empresa: string;
  roles: Rol[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in space-y-8">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Roles</h2>
          <p class="text-slate-500 font-medium">Visualización y control de roles configurados por empresa.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
           <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
           <span class="text-xs font-bold text-slate-600 uppercase tracking-widest">Sincronizado con API</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-bold">Consultando roles en el sistema...</p>
      </div>

      <!-- Listado Agrupado por Empresa -->
      <div *ngIf="!loading() && gruposDeRoles().length > 0" class="space-y-10">
        
        <div *ngFor="let grupo of gruposDeRoles()" class="space-y-4">
          <!-- Título de la Empresa -->
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-erp-dark rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             <div>
                <h3 class="text-lg font-black text-slate-800 tracking-tight">{{ grupo.empresa }}</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">{{ grupo.roles.length }} Roles Registrados</p>
             </div>
          </div>

          <!-- Grid de Roles para esta Empresa -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let rol of grupo.roles" 
                 class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <span [class]="rol.estado ? 'px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100' : 'px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100'">
                    {{ rol.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                  <div class="text-slate-200 group-hover:text-erp-primary transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                </div>

                <h4 class="text-lg font-black text-slate-800 mb-1">{{ rol.nombre }}</h4>
                <p class="text-slate-500 text-sm font-medium line-clamp-2 mb-4">{{ rol.descripcion }}</p>
                
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Sistema</span>
                   <span class="text-[10px] font-bold text-slate-400">#{{ rol.id }}</span>
                </div>
              </div>

              <!-- Decoración de fondo -->
              <div class="absolute -bottom-4 -right-4 text-slate-50 group-hover:text-erp-primary/5 transition-colors duration-500">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && gruposDeRoles().length === 0" class="flex flex-col items-center justify-center h-80 bg-white rounded-3xl border border-slate-100 border-dashed">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 class="text-xl font-black text-slate-800">No se encontraron roles</h3>
        <p class="text-slate-400 font-medium">Parece que aún no hay roles registrados en el sistema.</p>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);

  gruposDeRoles = signal<GrupoRoles[]>([]);
  loading = signal(false);

  async ngOnInit() {
    await this.loadRoles();
  }

  async loadRoles() {
    this.loading.set(true);
    try {
      const data = await this.rolService.getRoles();
      
      // Agrupar por nombre de empresa
      const groups = data.reduce((acc: { [key: string]: Rol[] }, rol) => {
        const empresaNombre = rol.empresa?.nombre || 'Global / Sistema';
        if (!acc[empresaNombre]) {
          acc[empresaNombre] = [];
        }
        acc[empresaNombre].push(rol);
        return acc;
      }, {});
      
      // Convertir a array para el template
      const formattedGroups: GrupoRoles[] = Object.keys(groups).map(key => ({
        empresa: key,
        roles: groups[key]
      }));
      
      // Ordenar alfabéticamente por empresa
      formattedGroups.sort((a, b) => a.empresa.localeCompare(b.empresa));
      
      this.gruposDeRoles.set(formattedGroups);
    } catch (error) {
      console.error('Error al cargar roles', error);
    } finally {
      this.loading.set(false);
    }
  }
}
