import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog } from '../core/audit-log.service';
import { AuthService } from '../core/auth.service';
import { EmpresaService, Empresa } from '../core/empresa.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Bitácora de Auditoría / Logs</h2>
          <p class="text-slate-500 font-medium">Historial de accesos, operaciones y configuraciones en el sistema.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span class="text-xs font-bold text-slate-600 uppercase tracking-widest">En Tiempo Real</span>
        </div>
      </div>

      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Logs</p>
            <h3 class="text-2xl font-black text-slate-800 leading-none">{{ totalLogsCount() }}</h3>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Éxitos</p>
            <h3 class="text-2xl font-black text-slate-800 leading-none">{{ successCount() }}</h3>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Errores</p>
            <h3 class="text-2xl font-black text-slate-800 leading-none">{{ errorCount() }}</h3>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Usuarios Únicos</p>
            <h3 class="text-2xl font-black text-slate-800 leading-none">{{ uniqueUsersCount() }}</h3>
          </div>
        </div>

      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <form (ngSubmit)="applyFilters()" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          
          <!-- Búsqueda General -->
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Búsqueda General</label>
            <div class="relative">
              <input type="text" [(ngModel)]="searchQueryTemp" name="searchQueryTemp"
                     class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700" 
                     placeholder="Buscar por usuario, descripción, IP, entidad...">
              <div class="absolute left-3 top-3 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Filtro por Módulo -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</label>
            <select [(ngModel)]="selectedModuloTemp" name="selectedModuloTemp"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
              <option value="">Todos los Módulos</option>
              <option *ngFor="let m of modulos" [value]="m">{{ m }}</option>
            </select>
          </div>

          <!-- Filtro por Acción -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</label>
            <select [(ngModel)]="selectedAccionTemp" name="selectedAccionTemp"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
              <option value="">Todas las Acciones</option>
              <option *ngFor="let a of acciones" [value]="a">{{ a }}</option>
            </select>
          </div>

          <!-- Filtro por Resultado -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</label>
            <select [(ngModel)]="selectedResultadoTemp" name="selectedResultadoTemp"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
              <option value="">Todos los Resultados</option>
              <option value="EXITO">Éxito</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <!-- Filtro por Empresa (Solo Superadmin) -->
          <div *ngIf="isSuperAdmin()" class="space-y-1.5 md:col-span-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</label>
            <select [(ngModel)]="selectedEmpresaIdTemp" name="selectedEmpresaIdTemp"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
              <option [value]="null">Todas las Empresas</option>
              <option *ngFor="let emp of empresas()" [value]="emp.id">{{ emp.nombre }} (NIT: {{ emp.nit }})</option>
            </select>
          </div>

          <!-- Fecha Desde -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</label>
            <input type="date" [(ngModel)]="fechaInicioTemp" name="fechaInicioTemp"
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
          </div>

          <!-- Fecha Hasta -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</label>
            <input type="date" [(ngModel)]="fechaFinTemp" name="fechaFinTemp"
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700">
          </div>

          <!-- Botones de Acción (Buscar y Limpiar) -->
          <div class="flex items-end gap-2 md:col-span-1">
            <button type="submit" 
                    class="flex-1 py-2.5 bg-erp-primary hover:bg-opacity-90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-erp-primary/10 hover:shadow-erp-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
            <button type="button" (click)="resetFilters()" 
                    class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 3h-6.117" />
              </svg>
              Limpiar
            </button>
          </div>

        </div>
      </form>

      <!-- Tabla / Lista de Logs -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col items-center justify-center h-80">
          <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="mt-4 text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando bitácora...</p>
        </div>

        <!-- Tabla -->
        <div *ngIf="!loading() && filteredLogs().length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                <th class="px-6 py-4">Fecha y Hora</th>
                <th *ngIf="isSuperAdmin()" class="px-6 py-4">Empresa</th>
                <th class="px-6 py-4">Usuario</th>
                <th class="px-6 py-4">Módulo</th>
                <th class="px-6 py-4">Acción</th>
                <th class="px-6 py-4">Descripción</th>
                <th class="px-6 py-4 text-center">Estado</th>
                <th class="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-medium text-sm">
              <tr *ngFor="let log of filteredLogs()" class="hover:bg-slate-50/30 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold text-xs">
                  {{ formatFecha(log.fechaHora) }}
                </td>
                <td *ngIf="isSuperAdmin()" class="px-6 py-4 whitespace-nowrap text-slate-600 font-bold text-xs">
                  {{ getEmpresaNombre(log.empresaId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-black text-[10px] flex items-center justify-center">
                      {{ (log.usuarioNombre || 'A')[0].toUpperCase() }}
                    </div>
                    <span class="text-slate-800 font-bold truncate max-w-[120px]" [title]="log.usuarioNombre">
                      {{ log.usuarioNombre }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getModuloClass(log.modulo)">
                    {{ log.modulo }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-bold text-xs uppercase text-slate-600">
                  {{ log.accion }}
                </td>
                <td class="px-6 py-4 max-w-xs truncate text-xs text-slate-500" [title]="log.descripcion">
                  {{ log.descripcion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span [class]="log.resultado === 'EXITO' ? 
                                 'px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black rounded-lg' : 
                                 'px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black rounded-lg'">
                    {{ log.resultado === 'EXITO' ? 'ÉXITO' : 'ERROR' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button (click)="openDetailModal(log)" 
                          class="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-erp-primary hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                    Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && filteredLogs().length === 0" class="flex flex-col items-center justify-center py-20 bg-white">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-black text-slate-800">No se encontraron registros</h3>
          <p class="text-slate-400 text-sm font-medium">Prueba a cambiar los filtros de búsqueda.</p>
        </div>

      </div>

      <!-- MODAL DE DETALLE -->
      <div *ngIf="selectedLog()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-up">
          
          <!-- Cabecera del Modal -->
          <div class="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div [class]="selectedLog()?.resultado === 'EXITO' ? 'w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center' : 'w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center'">
                <svg *ngIf="selectedLog()?.resultado === 'EXITO'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg *ngIf="selectedLog()?.resultado !== 'EXITO'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-800">Detalles del Registro de Auditoría</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">ID Log: #{{ selectedLog()?.id }}</p>
              </div>
            </div>
            <button (click)="closeDetailModal()" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del Modal Scrollable -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            
            <!-- Datos Básicos Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fecha y Hora</span>
                <span class="text-sm font-bold text-slate-700">{{ formatFecha(selectedLog()?.fechaHora) }}</span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Usuario ejecutor</span>
                <span class="text-sm font-bold text-slate-700">{{ selectedLog()?.usuarioNombre }} (ID: {{ selectedLog()?.usuarioId || 'Sistema' }})</span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dirección IP</span>
                <span class="text-sm font-bold text-slate-700">{{ selectedLog()?.ipAddress || 'Desconocida' }}</span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Módulo / Sección</span>
                <span [class]="getModuloClass(selectedLog()?.modulo) + ' inline-block mt-0.5'">{{ selectedLog()?.modulo }}</span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Acción</span>
                <span class="text-sm font-black text-slate-700 uppercase">{{ selectedLog()?.accion }}</span>
              </div>
              <div *ngIf="selectedLog()?.entidadAfectada">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entidad Afectada</span>
                <span class="text-sm font-bold text-slate-700">{{ selectedLog()?.entidadAfectada }} (ID: {{ selectedLog()?.entidadId || 'N/A' }})</span>
              </div>
            </div>

            <!-- Descripción -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Detalle de la Acción</label>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-semibold text-sm text-slate-600 leading-relaxed">
                {{ selectedLog()?.descripcion }}
              </div>
            </div>

            <!-- Error Details if any -->
            <div *ngIf="selectedLog()?.resultado === 'ERROR'" class="space-y-1.5">
              <label class="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Detalles del Error</label>
              <div class="p-4 bg-rose-50 rounded-2xl border border-rose-100 font-mono text-xs text-rose-700 overflow-x-auto whitespace-pre-wrap">
                {{ selectedLog()?.detallesError }}
              </div>
            </div>

            <!-- Valores Modificados / Cambios (JSON format) -->
            <div *ngIf="hasChanges()" class="space-y-4">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Valores Modificados</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div class="space-y-1.5">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Valores Anteriores (Antes)</span>
                  <pre class="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-60 text-slate-600 custom-scrollbar">{{ parseAndPrettify(selectedLog()?.valoresAnteriores) }}</pre>
                </div>

                <div class="space-y-1.5">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Valores Nuevos (Después)</span>
                  <pre class="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-60 text-slate-600 custom-scrollbar">{{ parseAndPrettify(selectedLog()?.valoresNuevos) }}</pre>
                </div>

              </div>
            </div>

            <!-- User Agent -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Navegador / Dispositivo (User Agent)</label>
              <div class="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono text-slate-500 break-all">
                {{ selectedLog()?.userAgent || 'Desconocido' }}
              </div>
            </div>

          </div>

          <!-- Pie del Modal -->
          <div class="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-end">
            <button (click)="closeDetailModal()" class="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all">
              Cerrar
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class AuditoriaComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  private authService = inject(AuthService);
  private empresaService = inject(EmpresaService);

  logs = signal<AuditLog[]>([]);
  empresas = signal<Empresa[]>([]);
  loading = signal(false);

  selectedLog = signal<AuditLog | null>(null);

  // Filtros Activos (para el computado, reactivos)
  searchQuery = signal('');
  selectedModulo = signal('');
  selectedAccion = signal('');
  selectedResultado = signal('');
  selectedEmpresaId = signal<number | null>(null);
  fechaInicio = signal('');
  fechaFin = signal('');

  // Filtros Temporales (vinculados al formulario/inputs)
  searchQueryTemp = '';
  selectedModuloTemp = '';
  selectedAccionTemp = '';
  selectedResultadoTemp = '';
  selectedEmpresaIdTemp: number | null = null;
  fechaInicioTemp = '';
  fechaFinTemp = '';

  // Opciones de filtros
  modulos: string[] = ['ACCESOS', 'CONFIGURACION', 'VENTAS', 'COMPRAS', 'CARTERA', 'CONTABILIDAD', 'INVENTARIO', 'SUSCRIPCION', 'ROLES_PERMISOS', 'EMPLEADOS'];
  acciones: string[] = ['LOGIN', 'LOGOUT', 'CREAR', 'EDITAR', 'ELIMINAR', 'ANULAR', 'ACTUALIZAR', 'CONSULTAR'];

  // Map para resolver nombres de empresas
  private companyMap = new Map<number, string>();

  isSuperAdmin = computed(() => this.authService.session()?.roleName === 'SUPERADMIN');

  async ngOnInit() {
    this.loading.set(true);
    try {
      if (this.isSuperAdmin()) {
        const list = await this.empresaService.getAllEmpresas();
        this.empresas.set(list);
        for (const emp of list) {
          this.companyMap.set(emp.id, emp.nombre);
        }
      }
      await this.loadLogs();
    } catch (error) {
      console.error('Error al inicializar componente de auditoría', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadLogs() {
    try {
      const list = await this.auditLogService.getLogs();
      this.logs.set(list);
    } catch (error) {
      console.error('Error al consultar logs de auditoría', error);
    }
  }

  // Filtrado computado reactivo
  filteredLogs = computed(() => {
    let list = this.logs();
    const query = this.searchQuery().toLowerCase().trim();
    const mod = this.selectedModulo();
    const acc = this.selectedAccion();
    const res = this.selectedResultado();
    const fIni = this.fechaInicio();
    const fFin = this.fechaFin();
    const empId = this.selectedEmpresaId();

    if (this.isSuperAdmin() && empId !== null && empId !== undefined) {
      const parsedEmpId = Number(empId);
      if (!isNaN(parsedEmpId) && parsedEmpId !== 0) {
        list = list.filter(log => log.empresaId === parsedEmpId);
      }
    }

    if (mod) {
      list = list.filter(log => log.modulo === mod);
    }

    if (acc) {
      list = list.filter(log => log.accion === acc);
    }

    if (res) {
      list = list.filter(log => log.resultado === res);
    }

    if (fIni) {
      const start = new Date(fIni);
      start.setHours(0, 0, 0, 0);
      list = list.filter(log => log.fechaHora ? new Date(log.fechaHora) >= start : false);
    }

    if (fFin) {
      const end = new Date(fFin);
      end.setHours(23, 59, 59, 999);
      list = list.filter(log => log.fechaHora ? new Date(log.fechaHora) <= end : false);
    }

    if (query) {
      list = list.filter(log => 
        (log.usuarioNombre && log.usuarioNombre.toLowerCase().includes(query)) ||
        (log.descripcion && log.descripcion.toLowerCase().includes(query)) ||
        (log.ipAddress && log.ipAddress.includes(query)) ||
        (log.modulo && log.modulo.toLowerCase().includes(query)) ||
        (log.accion && log.accion.toLowerCase().includes(query)) ||
        (log.entidadAfectada && log.entidadAfectada.toLowerCase().includes(query)) ||
        (log.entidadId && log.entidadId.toString().includes(query)) ||
        (log.detallesError && log.detallesError.toLowerCase().includes(query))
      );
    }

    return list;
  });

  // Estadísticas computadas
  totalLogsCount = computed(() => this.filteredLogs().length);
  successCount = computed(() => this.filteredLogs().filter(l => l.resultado === 'EXITO').length);
  errorCount = computed(() => this.filteredLogs().filter(l => l.resultado === 'ERROR').length);
  uniqueUsersCount = computed(() => {
    const users = new Set(this.filteredLogs().map(l => l.usuarioNombre || 'Anónimo'));
    return users.size;
  });

  applyFilters() {
    this.searchQuery.set(this.searchQueryTemp);
    this.selectedModulo.set(this.selectedModuloTemp);
    this.selectedAccion.set(this.selectedAccionTemp);
    this.selectedResultado.set(this.selectedResultadoTemp);
    this.selectedEmpresaId.set(this.selectedEmpresaIdTemp);
    this.fechaInicio.set(this.fechaInicioTemp);
    this.fechaFin.set(this.fechaFinTemp);
  }

  resetFilters() {
    // Limpiar temporales
    this.searchQueryTemp = '';
    this.selectedModuloTemp = '';
    this.selectedAccionTemp = '';
    this.selectedResultadoTemp = '';
    this.selectedEmpresaIdTemp = null;
    this.fechaInicioTemp = '';
    this.fechaFinTemp = '';

    // Limpiar señales activas
    this.searchQuery.set('');
    this.selectedModulo.set('');
    this.selectedAccion.set('');
    this.selectedResultado.set('');
    this.selectedEmpresaId.set(null);
    this.fechaInicio.set('');
    this.fechaFin.set('');
  }

  formatFecha(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }

  getEmpresaNombre(id: number | undefined): string {
    if (id === undefined || id === null) return 'Global';
    return this.companyMap.get(id) || `Empresa #${id}`;
  }

  getModuloClass(modulo: string | undefined): string {
    if (!modulo) return 'px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-xs font-bold';
    
    let base = 'px-2 py-0.5 rounded text-xs font-bold border ';
    switch(modulo.toUpperCase()) {
      case 'ACCESOS':
        return base + 'bg-purple-50 text-purple-700 border-purple-100';
      case 'CONFIGURACION':
        return base + 'bg-slate-50 text-slate-700 border-slate-200';
      case 'VENTAS':
        return base + 'bg-blue-50 text-blue-700 border-blue-100';
      case 'COMPRAS':
        return base + 'bg-amber-50 text-amber-700 border-amber-100';
      case 'CARTERA':
        return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CONTABILIDAD':
        return base + 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'INVENTARIO':
        return base + 'bg-teal-50 text-teal-700 border-teal-100';
      default:
        return base + 'bg-slate-50 text-slate-600 border-slate-100';
    }
  }

  openDetailModal(log: AuditLog) {
    this.selectedLog.set(log);
  }

  closeDetailModal() {
    this.selectedLog.set(null);
  }

  hasChanges(): boolean {
    const log = this.selectedLog();
    return !!(log?.valoresAnteriores || log?.valoresNuevos);
  }

  parseAndPrettify(val: string | undefined): string {
    if (!val) return 'Ninguno';
    try {
      const obj = JSON.parse(val);
      return JSON.stringify(obj, null, 2);
    } catch(e) {
      return val;
    }
  }
}
