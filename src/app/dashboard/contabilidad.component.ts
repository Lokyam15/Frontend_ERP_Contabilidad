import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContabilidadService, AsientoContable, CuentaContable, DetalleAsiento } from '../core/contabilidad.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Contabilidad</h2>
          <p class="text-slate-500 font-medium">Sincroniza y visualiza asientos y cuentas contables desde Odoo ERP.</p>
        </div>
        
        <!-- Filtro de empresa para SUPERADMIN -->
        <div *ngIf="isSuperAdmin() && empresas().length > 0" class="flex flex-col gap-1.5 min-w-[240px]">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Filtrar por Empresa</label>
          <select [value]="selectedEmpresaId() || 0" (change)="onEmpresaChange($event)" 
                  class="px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary">
            <option [value]="0">Todas las empresas</option>
            <option *ngFor="let emp of empresas()" [value]="emp.id">{{ emp.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Sección de Sincronización (Card de Acciones) -->
      <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">Integración Odoo</span>
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span class="text-xs font-bold text-slate-400">Activa</span>
          </div>
          <h3 class="text-xl font-black text-slate-800 tracking-tight">Acciones de Sincronización</h3>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Consolida las facturas registradas en Odoo hacia tu libro diario. Las compras y ventas serán mapeadas como asientos contables balanceados.
          </p>
          <p *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="text-xs text-amber-600 font-bold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Selecciona una empresa específica arriba para poder ejecutar la sincronización.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 shrink-0">
          <button 
            [disabled]="syncLoading() !== null || (isSuperAdmin() && !selectedEmpresaId())" 
            (click)="syncCompras()"
            class="px-6 py-4 bg-erp-dark text-white rounded-2xl font-black text-sm flex items-center gap-2.5 hover:bg-opacity-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md">
            <span *ngIf="syncLoading() === 'compras'" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <svg *ngIf="syncLoading() !== 'compras'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Sincronizar Compras
          </button>

          <button 
            [disabled]="syncLoading() !== null || (isSuperAdmin() && !selectedEmpresaId())" 
            (click)="syncVentas()"
            class="px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center gap-2.5 hover:bg-erp-primary-hover disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md">
            <span *ngIf="syncLoading() === 'ventas'" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <svg *ngIf="syncLoading() !== 'ventas'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Sincronizar Ventas
          </button>
        </div>
      </div>

      <!-- Alertas de estado de sincronización -->
      <div *ngIf="syncSuccessMessage()" class="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Sincronización Exitosa</h4>
          <p class="text-xs text-slate-600 mt-0.5">{{ syncSuccessMessage() }}</p>
        </div>
        <button (click)="syncSuccessMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <div *ngIf="syncErrorMessage()" class="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Error en Operación</h4>
          <p class="text-xs text-slate-600 mt-0.5">{{ syncErrorMessage() }}</p>
        </div>
        <button (click)="syncErrorMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <!-- Navegación de Pestañas -->
      <div class="border-b border-slate-200">
        <div class="flex gap-8">
          <button (click)="activeTab.set('asientos')"
                  [class]="activeTab() === 'asientos' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all'">
            Asientos Contables
          </button>
          <button (click)="activeTab.set('cuentas')"
                  [class]="activeTab() === 'cuentas' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all'">
            Plan de Cuentas
          </button>
        </div>
      </div>

      <!-- CARGANDO DATOS -->
      <div *ngIf="loadingData()" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando registros...</p>
      </div>

      <!-- CONTENIDO DE PESTAÑAS (CUANDO NO ESTÁ CARGANDO) -->
      <div *ngIf="!loadingData()">
        
        <!-- PESTAÑA: ASIENTOS -->
        <div *ngIf="activeTab() === 'asientos'" class="space-y-6">
          
          <!-- Filtro de Búsqueda -->
          <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 max-w-md w-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" [ngModel]="searchQueryAsiento()" (ngModelChange)="searchQueryAsiento.set($event)" 
                   placeholder="Buscar por glosa, origen o ID..." 
                   class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
          </div>

          <!-- Tabla de Asientos -->
          <div *ngIf="filteredAsientos().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-55/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">ID</th>
                    <th class="p-6">Fecha</th>
                    <th class="p-6">Glosa / Descripción</th>
                    <th class="p-6">Origen Doc</th>
                    <th class="p-6">Origen ID</th>
                    <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                    <th class="p-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <ng-container *ngFor="let asiento of filteredAsientos()">
                    
                    <!-- Fila Principal del Asiento -->
                    <tr class="hover:bg-slate-50/50 transition-colors cursor-pointer" (click)="toggleAsiento(asiento.id)">
                      <td class="p-6 text-slate-400 font-mono">#{{ asiento.id }}</td>
                      <td class="p-6 text-slate-800">{{ asiento.fecha | date:'dd MMM yyyy HH:mm' }}</td>
                      <td class="p-6 text-slate-800 max-w-xs truncate">{{ asiento.glosa }}</td>
                      <td class="p-6">
                        <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/50">
                          {{ asiento.origenDocumento || 'Manual' }}
                        </span>
                      </td>
                      <td class="p-6 font-mono text-slate-500">{{ asiento.origenId || '-' }}</td>
                      <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(asiento.idEmpresa) }}</td>
                      <td class="p-6 text-right">
                        <button class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black text-xs inline-flex items-center gap-1.5 border border-slate-200/30 transition-all">
                          <span>{{ isExpanded(asiento.id) ? 'Contraer' : 'Detalles' }}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" [class]="isExpanded(asiento.id) ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    <!-- Detalle Expandido del Asiento -->
                    <tr *ngIf="isExpanded(asiento.id)" class="bg-slate-50/60">
                      <td [attr.colspan]="isSuperAdmin() ? 7 : 6" class="p-8">
                        <div class="bg-white rounded-2xl border border-slate-250/60 shadow-sm overflow-hidden max-w-4xl mx-auto">
                          
                          <div class="p-5 border-b border-slate-100 bg-slate-55/30 flex justify-between items-center">
                            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Desglose de Asiento Contable</span>
                            <span class="text-xs font-bold text-slate-500">ID Referencia: #{{ asiento.id }}</span>
                          </div>

                          <table class="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                                <th class="p-4">Código Cuenta</th>
                                <th class="p-4">Nombre Cuenta</th>
                                <th class="p-4">Tipo</th>
                                <th class="p-4 text-right">Debe</th>
                                <th class="p-4 text-right">Haber</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50 text-slate-700 font-bold">
                              <tr *ngFor="let det of asiento.detalles">
                                <td class="p-4 font-mono text-slate-500">{{ det.cuenta.codigo }}</td>
                                <td class="p-4 text-slate-800">{{ det.cuenta.nombre }}</td>
                                <td class="p-4">
                                  <span [class]="getTipoBadgeClass(det.cuenta.tipo) + ' text-[10px]'">
                                    {{ det.cuenta.tipo }}
                                  </span>
                                </td>
                                <td class="p-4 text-right text-slate-900 font-mono">{{ det.debe > 0 ? (det.debe | currency:'USD') : '-' }}</td>
                                <td class="p-4 text-right text-slate-900 font-mono">{{ det.haber > 0 ? (det.haber | currency:'USD') : '-' }}</td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr class="bg-slate-50/60 font-black text-slate-900 border-t border-slate-200">
                                <td colspan="3" class="p-4 text-right uppercase tracking-wider text-slate-400 text-[10px]">Totales Balanceados</td>
                                <td class="p-4 text-right font-mono">{{ sumDebe(asiento.detalles) | currency:'USD' }}</td>
                                <td class="p-4 text-right font-mono">{{ sumHaber(asiento.detalles) | currency:'USD' }}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                    
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State Asientos -->
          <div *ngIf="filteredAsientos().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No hay asientos contables</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No se encontraron asientos registrados en esta vista. Intenta sincronizar o cambiar de empresa.</p>
          </div>

        </div>

        <!-- PESTAÑA: PLAN DE CUENTAS -->
        <div *ngIf="activeTab() === 'cuentas'" class="space-y-6">
          
          <!-- Filtro de Búsqueda -->
          <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 max-w-md w-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" [ngModel]="searchQueryCuenta()" (ngModelChange)="searchQueryCuenta.set($event)" 
                   placeholder="Buscar cuenta por código o nombre..." 
                   class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
          </div>

          <!-- Tabla de Cuentas -->
          <div *ngIf="filteredCuentas().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-55/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">Código Contable</th>
                    <th class="p-6">Nombre de Cuenta</th>
                    <th class="p-6">Tipo</th>
                    <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                    <th class="p-6">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let cuenta of filteredCuentas()" class="hover:bg-slate-50/50 transition-colors">
                    <td class="p-6 font-mono text-slate-800">{{ cuenta.codigo }}</td>
                    <td class="p-6 text-slate-900">{{ cuenta.nombre }}</td>
                    <td class="p-6">
                      <span [class]="getTipoBadgeClass(cuenta.tipo)">
                        {{ cuenta.tipo }}
                      </span>
                    </td>
                    <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(cuenta.idEmpresa) }}</td>
                    <td class="p-6">
                      <span [class]="cuenta.estado ? 'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                        {{ cuenta.estado ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State Cuentas -->
          <div *ngIf="filteredCuentas().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No se encontraron cuentas</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No se encontró ninguna cuenta contable configurada en esta vista.</p>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
  `]
})
export class ContabilidadComponent implements OnInit {
  private contabilidadService = inject(ContabilidadService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);

  // Estados generales
  loadingData = signal(true);
  activeTab = signal<'asientos' | 'cuentas'>('asientos');
  isSuperAdmin = signal(false);
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId = signal<number | null>(null);

  // Estados de datos
  asientos = signal<AsientoContable[]>([]);
  cuentas = signal<CuentaContable[]>([]);
  
  // Detalle expandido de asientos (IDs de asientos expandidos)
  expandedAsientos = new Set<number>();

  // Estados de sincronización
  syncLoading = signal<'compras' | 'ventas' | null>(null);
  syncSuccessMessage = signal<string | null>(null);
  syncErrorMessage = signal<string | null>(null);

  // Búsqueda local
  searchQueryAsiento = signal('');
  searchQueryCuenta = signal('');

  // Cómputo filtrado de Asientos Contables
  filteredAsientos = computed(() => {
    const query = this.searchQueryAsiento().toLowerCase().trim();
    const data = this.asientos();
    if (!query) return data;
    return data.filter(a => 
      a.id.toString().includes(query) ||
      a.glosa.toLowerCase().includes(query) ||
      (a.origenDocumento && a.origenDocumento.toLowerCase().includes(query)) ||
      (a.origenId && a.origenId.toString().includes(query))
    );
  });

  // Cómputo filtrado de Plan de Cuentas
  filteredCuentas = computed(() => {
    const query = this.searchQueryCuenta().toLowerCase().trim();
    const data = this.cuentas();
    if (!query) return data;
    return data.filter(c => 
      c.codigo.toLowerCase().includes(query) ||
      c.nombre.toLowerCase().includes(query) ||
      c.tipo.toLowerCase().includes(query)
    );
  });

  async ngOnInit() {
    await this.initPerfil();
    await this.cargarInformacion();
  }

  async initPerfil() {
    try {
      const profile = await this.userService.getMyProfile();
      const superAdmin = profile.rol?.nombre === 'SUPERADMIN';
      this.isSuperAdmin.set(superAdmin);

      if (superAdmin) {
        // Cargar catálogo de empresas
        const list = await this.empresaService.getAllEmpresas();
        this.empresas.set(list);
      } else {
        // Para admin, se amarra directamente a su propia empresa
        this.selectedEmpresaId.set(profile.idEmpresa || null);
      }
    } catch (error) {
      console.error('Error al inicializar perfil en contabilidad:', error);
    }
  }

  async cargarInformacion() {
    this.loadingData.set(true);
    this.expandedAsientos.clear();
    try {
      const empId = this.selectedEmpresaId() || undefined;
      
      // Llamadas concurrentes para asientos y cuentas
      const [listAsientos, listCuentas] = await Promise.all([
        this.contabilidadService.getAsientos(empId),
        this.contabilidadService.getCuentas(empId)
      ]);
      
      this.asientos.set(listAsientos);
      this.cuentas.set(listCuentas);
    } catch (error) {
      console.error('Error al cargar datos contables:', error);
    } finally {
      this.loadingData.set(false);
    }
  }

  async onEmpresaChange(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.selectedEmpresaId.set(value === 0 ? null : value);
    await this.cargarInformacion();
  }

  // Sincronizar Compras
  async syncCompras() {
    const empId = this.selectedEmpresaId() || undefined;
    if (this.isSuperAdmin() && !empId) {
      this.syncErrorMessage.set('Debe seleccionar una empresa para sincronizar.');
      return;
    }

    this.syncLoading.set('compras');
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    try {
      const res = await this.contabilidadService.sincronizarCompras(empId);
      this.syncSuccessMessage.set(`${res.mensaje}. Asientos creados: ${res.asientosCreados}`);
      // Recargar listados
      await this.cargarInformacion();
    } catch (error: any) {
      console.error('Error al sincronizar compras:', error);
      const detail = error?.error?.error || error?.message || 'Error desconocido';
      this.syncErrorMessage.set(`No se pudo completar la sincronización: ${detail}`);
    } finally {
      this.syncLoading.set(null);
    }
  }

  // Sincronizar Ventas
  async syncVentas() {
    const empId = this.selectedEmpresaId() || undefined;
    if (this.isSuperAdmin() && !empId) {
      this.syncErrorMessage.set('Debe seleccionar una empresa para sincronizar.');
      return;
    }

    this.syncLoading.set('ventas');
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    try {
      const res = await this.contabilidadService.sincronizarVentas(empId);
      this.syncSuccessMessage.set(`${res.mensaje}. Asientos creados: ${res.asientosCreados}`);
      // Recargar listados
      await this.cargarInformacion();
    } catch (error: any) {
      console.error('Error al sincronizar ventas:', error);
      const detail = error?.error?.error || error?.message || 'Error desconocido';
      this.syncErrorMessage.set(`No se pudo completar la sincronización: ${detail}`);
    } finally {
      this.syncLoading.set(null);
    }
  }

  // Manejo de filas expandidas
  toggleAsiento(id: number) {
    if (this.expandedAsientos.has(id)) {
      this.expandedAsientos.delete(id);
    } else {
      this.expandedAsientos.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedAsientos.has(id);
  }

  // Cálculos de sumas
  sumDebe(detalles: DetalleAsiento[]): number {
    return detalles.reduce((acc, curr) => acc + (+curr.debe || 0), 0);
  }

  sumHaber(detalles: DetalleAsiento[]): number {
    return detalles.reduce((acc, curr) => acc + (+curr.haber || 0), 0);
  }

  // Mapear nombre de empresa (para SUPERADMIN)
  getEmpresaNombre(idEmpresa: number): string {
    const emp = this.empresas().find(e => e.id === idEmpresa);
    return emp ? emp.nombre : `Empresa #${idEmpresa}`;
  }

  // Clase CSS según el tipo de cuenta
  getTipoBadgeClass(tipo: string): string {
    const base = 'px-2 py-0.5 rounded-lg text-xs font-black uppercase border ';
    switch (tipo?.toUpperCase()) {
      case 'ACTIVO':
        return base + 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PASIVO':
        return base + 'bg-rose-50 text-rose-700 border-rose-100';
      case 'PATRIMONIO':
        return base + 'bg-purple-50 text-purple-700 border-purple-100';
      case 'INGRESO':
        return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'GASTO':
        return base + 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return base + 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }
}
