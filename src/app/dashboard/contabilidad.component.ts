import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContabilidadService, AsientoContable, CuentaContable, DetalleAsiento } from '../core/contabilidad.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';
import { PeriodoContableService, PeriodoContable } from '../core/periodo-contable.service';
import { CentroCostoService, CentroCosto } from '../core/centro-costo.service';
import { AuthService } from '../core/auth.service';

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
          <p class="text-slate-500 font-medium">Visualiza y gestiona los asientos y cuentas contables de tu empresa.</p>
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
        <div class="flex gap-8 overflow-x-auto pb-1">
          <button (click)="changeTab('asientos')"
                  [class]="activeTab() === 'asientos' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0'">
            Libro Diario
          </button>
          <button (click)="changeTab('cuentas')"
                  [class]="activeTab() === 'cuentas' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0'">
            Plan de Cuentas
          </button>
 
          <button *ngIf="canViewPeriodos()" (click)="changeTab('periodos')"
                  [class]="activeTab() === 'periodos' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0'">
            Períodos Contables
          </button>
          <button *ngIf="canViewCentrosCosto()" (click)="changeTab('centros-costo')"
                  [class]="activeTab() === 'centros-costo' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0'">
            Centros de Costo
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
        
        <!-- PESTAÑA: ASIENTOS (LIBRO DIARIO) -->
        <div *ngIf="activeTab() === 'asientos'" class="space-y-6 animate-fade-in">
          
          <!-- Barra de Herramientas (Buscador y Crear) -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <!-- Filtro de Búsqueda -->
            <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[300px] w-full sm:w-auto shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" [ngModel]="searchQueryAsiento()" (ngModelChange)="searchQueryAsiento.set($event)" 
                     placeholder="Buscar por número, glosa, origen o ID..." 
                     class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
            </div>

            <!-- Botón Nuevo Asiento (Visible para roles autorizados) -->
            <button *ngIf="canManageAsientos()" (click)="openCrearAsiento()"
                    class="w-full sm:w-auto px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Nuevo Asiento
            </button>
          </div>

          <!-- Tabla de Asientos -->
          <div *ngIf="filteredAsientos().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">ID</th>
                    <th class="p-6">Nro Asiento</th>
                    <th class="p-6">Fecha</th>
                    <th class="p-6">Glosa / Descripción</th>
                    <th class="p-6">Origen</th>
                    <th class="p-6">Creador</th>
                    <th class="p-6">Período</th>
                    <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                    <th class="p-6">Estado</th>
                    <th class="p-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let asiento of filteredAsientos()" class="hover:bg-slate-50/50 transition-colors">
                    <td class="p-6 text-slate-400 font-mono">#{{ asiento.id }}</td>
                    <td class="p-6 text-slate-800 font-mono">{{ asiento.nroAsiento || 'Borrador' }}</td>
                    <td class="p-6 text-slate-800">{{ asiento.fecha | date:'dd MMM yyyy' }}</td>
                    <td class="p-6 text-slate-800 max-w-xs truncate" [title]="asiento.glosa">{{ asiento.glosa }}</td>
                    <td class="p-6">
                      <span *ngIf="asiento.origenDocumento" class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/50">
                        {{ asiento.origenDocumento }} {{ asiento.origenId ? '#' + asiento.origenId : '' }}
                      </span>
                      <span *ngIf="!asiento.origenDocumento" class="text-slate-400 italic text-xs">Manual</span>
                    </td>
                    <td class="p-6 text-slate-600 text-xs">{{ asiento.usuario?.username || asiento.usuario?.correo || 'Sistema' }}</td>
                    <td class="p-6 text-slate-600 font-mono text-xs">
                      {{ asiento.periodoContable ? (asiento.periodoContable?.fechaInicio | date:'yyyy-MM') : 'N/A' }}
                    </td>
                    <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(asiento.idEmpresa || 0) }}</td>
                    <td class="p-6">
                      <span [class]="asiento.estado === 'APROBADO' ? 
                                    'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 
                                    asiento.estado === 'ANULADO' ?
                                    'px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-black uppercase border border-rose-100' :
                                    'px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200'">
                        {{ asiento.estado || 'BORRADOR' }}
                      </span>
                    </td>
                    <td class="p-6 text-right space-x-1.5 whitespace-nowrap">
                      <!-- Ver Detalle -->
                      <button (click)="openDetalleAsiento(asiento.id!)" title="Ver Detalle"
                              class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span>Ver</span>
                      </button>
                      
                      <!-- Editar (Solo borradores, roles con permisos) -->
                      <button *ngIf="asiento.estado === 'BORRADOR' && canManageAsientos()" (click)="openEditarAsiento(asiento)" title="Editar Borrador"
                              class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        <span>Editar</span>
                      </button>

                      <!-- Aprobar (Solo borradores, roles con permisos) -->
                      <button *ngIf="asiento.estado === 'BORRADOR' && canApproveOrAnulAsientos()" (click)="confirmarAprobar(asiento)" title="Aprobar Asiento"
                              class="px-2.5 py-1.5 bg-emerald-55/40 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        <span>Aprobar</span>
                      </button>

                      <!-- Anular (Excepto anulados, roles con permisos) -->
                      <button *ngIf="asiento.estado !== 'ANULADO' && canApproveOrAnulAsientos()" (click)="confirmarAnular(asiento)" title="Anular Asiento"
                              class="px-2.5 py-1.5 bg-rose-55/40 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        <span>Anular</span>
                      </button>
                    </td>
                  </tr>
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
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No se encontraron asientos registrados en esta vista. Intenta crear uno o cambiar de empresa.</p>
          </div>
        </div>

        <!-- PESTAÑA: PLAN DE CUENTAS -->
        <div *ngIf="activeTab() === 'cuentas'" class="space-y-6 animate-fade-in">
          
          <!-- SUPERADMIN sin empresa seleccionada -->
          <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para gestionar el plan de cuentas, por favor seleccione una empresa en la esquina superior derecha.</p>
          </div>

          <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">
            
            <!-- Barra de Herramientas (Buscador y Crear) -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <!-- Filtro de Búsqueda -->
              <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[300px] w-full sm:w-auto shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" [ngModel]="searchQueryCuenta()" (ngModelChange)="searchQueryCuenta.set($event)" 
                       placeholder="Buscar cuenta por código o nombre..." 
                       class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
              </div>

              <!-- Botón Nueva Cuenta (Visible para roles autorizados) -->
              <button *ngIf="canManageCuentas()" (click)="openCrearCuenta()"
                      class="w-full sm:w-auto px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Nueva Cuenta
              </button>
            </div>

            <!-- Tabla de Cuentas -->
            <div *ngIf="filteredCuentas().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                      <th class="p-6">Código Contable</th>
                      <th class="p-6">Nombre de Cuenta</th>
                      <th class="p-6">Tipo</th>
                      <th class="p-6 text-center">Nivel</th>
                      <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                      <th class="p-6">Estado</th>
                      <th *ngIf="canManageCuentas()" class="p-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                    <tr *ngFor="let cuenta of filteredCuentas()" class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-6 font-mono text-slate-800" [style.padding-left.px]="((cuenta.nivel || 1) - 1) * 24 + 24">
                        <span *ngIf="cuenta.nivel && cuenta.nivel > 1" class="text-slate-300 mr-2">└─</span>
                        {{ cuenta.codigo }}
                      </td>
                      <td class="p-6 text-slate-900">{{ cuenta.nombre }}</td>
                      <td class="p-6">
                        <span [class]="getTipoBadgeClass(cuenta.tipo || '')">
                          {{ cuenta.tipo }}
                        </span>
                      </td>
                      <td class="p-6 text-center font-mono text-slate-500">{{ cuenta.nivel }}</td>
                      <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(cuenta.idEmpresa || 0) }}</td>
                      <td class="p-6">
                        <span [class]="cuenta.estado ? 'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                          {{ cuenta.estado ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td *ngIf="canManageCuentas()" class="p-6 text-right space-x-1.5 whitespace-nowrap">
                        <button (click)="openCrearCuenta(cuenta)" title="Agregar Subcuenta"
                                class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                          <span>Subcuenta</span>
                        </button>
                        <button (click)="openEditarCuenta(cuenta)" title="Editar"
                                class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          <span>Editar</span>
                        </button>
                        <button *ngIf="cuenta.estado" (click)="confirmarEliminarCuenta(cuenta)" title="Desactivar"
                                class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <span>Desactivar</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Empty State Cuentas -->
            <div *ngIf="filteredCuentas().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h4 class="text-lg font-black text-slate-800">No se encontraron cuentas</h4>
              <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No se encontró ninguna cuenta contable configurada en esta vista.</p>
            </div>

          </div>

        </div>



        <!-- PESTAÑA: PERÍODOS CONTABLES -->
        <div *ngIf="activeTab() === 'periodos'" class="space-y-6 animate-fade-in">
          
          <!-- SUPERADMIN sin empresa seleccionada -->
          <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para gestionar los períodos contables, por favor seleccione una empresa en la esquina superior derecha.</p>
          </div>

          <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">
            
            <!-- Barra de Herramientas (Buscador y Crear) -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <!-- Buscador -->
              <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[300px] w-full sm:w-auto shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" [ngModel]="searchQueryPeriodo()" (ngModelChange)="searchQueryPeriodo.set($event)" 
                       placeholder="Buscar por fecha o estado..." 
                       class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
              </div>

              <!-- Botón Aperturar Período (Visible para roles autorizados) -->
              <button (click)="openPeriodoModal()"
                      class="w-full sm:w-auto px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Nuevo Período
              </button>
            </div>

            <!-- CARGANDO DATOS PERIODOS -->
            <div *ngIf="loadingPeriodos()" class="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
              <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
              <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando períodos...</p>
            </div>

            <!-- TABLA DE PERIODOS CONTABLES (SI NO ESTÁ CARGANDO) -->
            <div *ngIf="!loadingPeriodos()">
              
              <div *ngIf="filteredPeriodos().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-6">ID</th>
                        <th class="p-6">Fecha Inicio</th>
                        <th class="p-6">Fecha Fin</th>
                        <th class="p-6">Estado</th>
                        <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                        <th class="p-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                      <tr *ngFor="let p of filteredPeriodos()" class="hover:bg-slate-50/50 transition-colors">
                        <td class="p-6 text-slate-400 font-mono">#{{ p.id }}</td>
                        <td class="p-6 text-slate-800">{{ p.fechaInicio | date:'dd MMM yyyy' }}</td>
                        <td class="p-6 text-slate-800">{{ p.fechaFin | date:'dd MMM yyyy' }}</td>
                        <td class="p-6">
                          <span [class]="p.estado === 'ABIERTO' ? 
                                        'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 
                                        'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                            {{ p.estado }}
                          </span>
                        </td>
                        <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(p.idEmpresa || 0) }}</td>
                        <td class="p-6 text-right">
                          <button *ngIf="p.estado === 'ABIERTO'" (click)="confirmarCerrarPeriodo(p)" title="Cerrar Período"
                                  class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-black">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span>Cerrar Período</span>
                          </button>
                          <span *ngIf="p.estado === 'CERRADO'" class="text-xs text-slate-400 italic font-medium p-2">Sin acciones</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Empty State Periodos -->
              <div *ngIf="filteredPeriodos().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h4 class="text-lg font-black text-slate-800">No se encontraron períodos</h4>
                <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen períodos contables registrados para esta empresa inquilina.</p>
              </div>
            </div>
          </div>

        </div>

        <!-- PESTAÑA: CENTROS DE COSTO -->
        <div *ngIf="activeTab() === 'centros-costo'" class="space-y-6 animate-fade-in">
          
          <!-- SUPERADMIN sin empresa seleccionada -->
          <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para gestionar los centros de costo, por favor seleccione una empresa en la esquina superior derecha.</p>
          </div>

          <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">
            
            <!-- Barra de Herramientas (Buscador y Crear) -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <!-- Buscador -->
              <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[300px] w-full sm:w-auto shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" [ngModel]="searchQueryCentroCosto()" (ngModelChange)="searchQueryCentroCosto.set($event)" 
                       placeholder="Buscar por código, nombre o descripción..." 
                       class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
              </div>

              <!-- Botón Nuevo Centro de Costo (Visible para roles autorizados) -->
              <button *ngIf="canManageCentrosCosto()" (click)="openCrearCentroCosto()"
                      class="w-full sm:w-auto px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Nuevo Centro de Costo
              </button>
            </div>

            <!-- CARGANDO DATOS -->
            <div *ngIf="loadingCentrosCosto()" class="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
              <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
              <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando centros de costo...</p>
            </div>

            <!-- TABLA (SI NO ESTÁ CARGANDO) -->
            <div *ngIf="!loadingCentrosCosto()">
              
              <div *ngIf="filteredCentrosCosto().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-6">ID</th>
                        <th class="p-6">Código</th>
                        <th class="p-6">Nombre</th>
                        <th class="p-6">Descripción</th>
                        <th class="p-6">Estado</th>
                        <th *ngIf="isSuperAdmin()" class="p-6">Empresa</th>
                        <th *ngIf="canManageCentrosCosto()" class="p-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                      <tr *ngFor="let cc of filteredCentrosCosto()" class="hover:bg-slate-50/50 transition-colors">
                        <td class="p-6 text-slate-400 font-mono">#{{ cc.id }}</td>
                        <td class="p-6 font-mono text-slate-800">{{ cc.codigo }}</td>
                        <td class="p-6 text-slate-900">{{ cc.nombre }}</td>
                        <td class="p-6 text-slate-500 font-medium max-w-xs truncate">{{ cc.descripcion || '-' }}</td>
                        <td class="p-6">
                          <span [class]="cc.estado ? 
                                        'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 
                                        'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                            {{ cc.estado ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <td *ngIf="isSuperAdmin()" class="p-6 text-slate-600">{{ getEmpresaNombre(cc.idEmpresa || 0) }}</td>
                        <td *ngIf="canManageCentrosCosto()" class="p-6 text-right space-x-2">
                          <button (click)="openEditarCentroCosto(cc)" title="Editar"
                                  class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-black">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            <span>Editar</span>
                          </button>
                          <button *ngIf="cc.estado" (click)="confirmarEliminarCentroCosto(cc)" title="Dar de Baja"
                                  class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-black">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span>Dar de Baja</span>
                          </button>
                          <span *ngIf="!cc.estado" class="text-xs text-slate-400 italic font-medium p-2">Inactivo</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="filteredCentrosCosto().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h4 class="text-lg font-black text-slate-800">No se encontraron centros de costo</h4>
                <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen centros de costo registrados o que coincidan con la búsqueda.</p>
              </div>

            </div>

          </div>

        </div>

    <!-- MODAL DE APERTURA DE PERÍODO -->
    <div *ngIf="showPeriodoModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Configuración Contable</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">Aperturar Período Contable</h3>
          </div>
          <button (click)="closePeriodoModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="savePeriodo()" class="p-8 space-y-5">
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Defina el rango de fechas para iniciar el registro de transacciones de este período.
          </p>

          <div class="grid grid-cols-2 gap-4">
            <!-- Fecha Inicio -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Fecha Inicio <span class="text-red-500">*</span></label>
              <input type="date" [(ngModel)]="periodoForm.fechaInicio" name="fechaInicio" required
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <!-- Fecha Fin -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Fecha Fin <span class="text-red-500">*</span></label>
              <input type="date" [(ngModel)]="periodoForm.fechaFin" name="fechaFin" required
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closePeriodoModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="periodoFormLoading()"
                    class="px-6 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
              <span *ngIf="periodoFormLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Aperturar Período</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE CIERRE -->
    <div *ngIf="showCerrarModal() && periodoToCerrar()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Confirmar Cierre Definitivo</h3>
          <button (click)="closeCerrarModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Desea cerrar el período contable #{{ periodoToCerrar()?.id }}?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Rango: <strong>{{ periodoToCerrar()?.fechaInicio | date:'dd MMM yyyy' }}</strong> al <strong>{{ periodoToCerrar()?.fechaFin | date:'dd MMM yyyy' }}</strong>.
            </p>
            <p class="text-xs text-rose-600 font-bold leading-relaxed mt-2">
              Esta acción es irreversible y no permitirá registrar nuevos asientos contables en este rango de fechas.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeCerrarModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="ejecutarCierre()" [disabled]="cerrarLoading()"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="cerrarLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Confirmar Cierre
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CREAR / EDITAR CENTRO DE COSTO -->
    <div *ngIf="showCentroCostoModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Configuración Contable</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">{{ isEditCentroCostoMode() ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo' }}</h3>
          </div>
          <button (click)="closeCentroCostoModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="saveCentroCosto()" class="p-8 space-y-5">
          
          <!-- Código -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Código <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="centroCostoForm.codigo" name="codigo" required
                   placeholder="Ej: CC-ADM" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Nombre -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="centroCostoForm.nombre" name="nombre" required
                   placeholder="Ej: Administración y Finanzas" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Descripción -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</label>
            <textarea [(ngModel)]="centroCostoForm.descripcion" name="descripcion" rows="3"
                      placeholder="Describa el propósito de este centro de costo..." 
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all resize-none"></textarea>
          </div>

          <!-- Estado (Sólo al editar) -->
          <div *ngIf="isEditCentroCostoMode()" class="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input type="checkbox" [(ngModel)]="centroCostoForm.estado" name="estado" id="cc_estado"
                   class="w-5 h-5 rounded text-erp-primary focus:ring-erp-primary border-slate-300 transition-all" />
            <label for="cc_estado" class="text-sm font-bold text-slate-700 cursor-pointer">Centro de costo activo</label>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeCentroCostoModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="centroCostoFormLoading()"
                    class="px-6 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
              <span *ngIf="centroCostoFormLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ELIMINAR / DAR DE BAJA -->
    <div *ngIf="showDeleteCentroCostoModal() && centroCostoToDelete()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Confirmar Baja</h3>
          <button (click)="closeDeleteCentroCostoModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Dar de baja "{{ centroCostoToDelete()?.nombre }}"?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas dar de baja este centro de costo? Esta acción dejará de mostrarlo como activo en el sistema.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeDeleteCentroCostoModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="ejecutarEliminarCentroCosto()" [disabled]="deleteCentroCostoLoading()"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="deleteCentroCostoLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Confirmar Baja
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CREAR / EDITAR CUENTA CONTABLE -->
    <div *ngIf="showCuentaModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Plan de Cuentas</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">{{ isEditCuentaMode() ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable' }}</h3>
          </div>
          <button (click)="closeCuentaModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="saveCuenta()" class="p-8 space-y-5">
          
          <!-- Cuenta Padre -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Cuenta Padre (Opcional)</label>
            <select [ngModel]="cuentaForm.cuentaPadre?.id || ''" (ngModelChange)="onCuentaPadreChange($event)" name="cuentaPadre" [disabled]="isEditCuentaMode()"
                    class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">-- Ninguna (Cuenta Principal) --</option>
              <option *ngFor="let c of cuentas()" [value]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
            </select>
            <p *ngIf="cuentaForm.cuentaPadre" class="text-xs text-indigo-600 font-bold">
              Subcuenta de nivel {{ cuentaForm.nivel }}. Heredará el tipo del padre.
            </p>
          </div>

          <!-- Tipo de Cuenta -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo de Cuenta <span class="text-red-500">*</span></label>
            <select [(ngModel)]="cuentaForm.tipo" name="tipo" [disabled]="cuentaForm.cuentaPadre != null"
                    class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">-- Seleccione Tipo --</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="PASIVO">PASIVO</option>
              <option value="PATRIMONIO">PATRIMONIO</option>
              <option value="INGRESO">INGRESO</option>
              <option value="GASTO">GASTO</option>
            </select>
          </div>

          <!-- Código -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Código Contable <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="cuentaForm.codigo" name="codigo" required
                   placeholder="Ej: 1.1.01.01" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Nombre -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre de la Cuenta <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="cuentaForm.nombre" name="nombre" required
                   placeholder="Ej: Caja Chica Moneda Nacional" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Estado (Sólo al editar) -->
          <div *ngIf="isEditCuentaMode()" class="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input type="checkbox" [(ngModel)]="cuentaForm.estado" name="estado" id="cuenta_estado"
                   class="w-5 h-5 rounded text-erp-primary focus:ring-erp-primary border-slate-300 transition-all" />
            <label for="cuenta_estado" class="text-sm font-bold text-slate-700 cursor-pointer">Cuenta contable activa</label>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeCuentaModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="cuentaFormLoading()"
                    class="px-6 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
              <span *ngIf="cuentaFormLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE DESACTIVACIÓN DE CUENTA -->
    <div *ngIf="showDeleteCuentaModal() && cuentaToDelete()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Desactivar Cuenta</h3>
          <button (click)="closeDeleteCuentaModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Desactivar la cuenta "{{ cuentaToDelete()?.codigo }} - {{ cuentaToDelete()?.nombre }}"?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas desactivar esta cuenta contable? Si tiene subcuentas activas, la operación podría ser rechazada por el sistema.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeDeleteCuentaModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="ejecutarEliminarCuenta()" [disabled]="deleteCuentaLoading()"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="deleteCuentaLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Confirmar Desactivación
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CREAR / EDITAR ASIENTO CONTABLE -->
    <div *ngIf="showAsientoFormModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Libro Diario</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">{{ isEditAsientoMode() ? 'Editar Asiento Contable' : 'Nuevo Asiento Contable' }}</h3>
          </div>
          <button (click)="closeAsientoFormModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="saveAsiento()" class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Fecha -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Fecha <span class="text-red-500">*</span></label>
              <input type="date" [(ngModel)]="asientoForm.fecha" name="fecha" required 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <!-- Glosa -->
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Glosa / Descripción <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="asientoForm.glosa" name="glosa" required placeholder="Ej: Pago de alquiler oficina central" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Estado Inicial -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Estado Inicial</label>
              <select [(ngModel)]="asientoForm.estado" name="estado" [disabled]="isEditAsientoMode()"
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400">
                <option value="BORRADOR">BORRADOR</option>
                <option value="APROBADO">APROBADO (Requiere cuadre)</option>
              </select>
            </div>
          </div>

          <!-- Líneas de Detalle -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Líneas de Asiento (Partida Doble)</span>
              <button type="button" (click)="agregarLinea()" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black transition-all inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                <span>Añadir Línea</span>
              </button>
            </div>

            <div class="overflow-x-auto max-h-[300px] border border-slate-200 rounded-2xl">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-200">
                    <th class="p-3 w-[40%]">Cuenta Contable <span class="text-red-500">*</span></th>
                    <th class="p-3 w-[20%] text-right">Debe</th>
                    <th class="p-3 w-[20%] text-right">Haber</th>
                    <th class="p-3 w-[15%]">Centro de Costo</th>
                    <th class="p-3 w-[5%] text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                  <tr *ngFor="let det of asientoForm.detalles; let i = index">
                    <!-- Cuenta Contable -->
                    <td class="p-2">
                      <select [(ngModel)]="det.cuentaContable.id" [name]="'cuenta_' + i" required
                              class="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-erp-primary">
                        <option [value]="null">-- Seleccionar Cuenta --</option>
                        <option *ngFor="let c of cuentas()" [value]="c.id" [disabled]="!c.estado">
                          {{ c.codigo }} - {{ c.nombre }}
                        </option>
                      </select>
                    </td>
                    <!-- Debe -->
                    <td class="p-2">
                      <input type="number" [(ngModel)]="det.debe" [name]="'debe_' + i" step="0.01" min="0" (ngModelChange)="det.haber = 0"
                             class="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-right text-slate-700 outline-none focus:ring-1 focus:ring-erp-primary" />
                    </td>
                    <!-- Haber -->
                    <td class="p-2">
                      <input type="number" [(ngModel)]="det.haber" [name]="'haber_' + i" step="0.01" min="0" (ngModelChange)="det.debe = 0"
                             class="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-right text-slate-700 outline-none focus:ring-1 focus:ring-erp-primary" />
                    </td>
                    <!-- Centro de Costo -->
                    <td class="p-2">
                      <select [ngModel]="det.centroCosto?.id || null" (ngModelChange)="det.centroCosto = $event ? { id: +$event } : null" [name]="'cc_' + i"
                              class="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-erp-primary">
                        <option [value]="null">-- Ninguno --</option>
                        <option *ngFor="let cc of centrosCosto()" [value]="cc.id" [disabled]="!cc.estado">
                          {{ cc.codigo }} - {{ cc.nombre }}
                        </option>
                      </select>
                    </td>
                    <!-- Eliminar -->
                    <td class="p-2 text-center">
                      <button type="button" (click)="eliminarLinea(i)" [disabled]="asientoForm.detalles.length <= 2"
                              class="p-1.5 text-rose-500 hover:text-rose-700 disabled:text-slate-200 transition-colors">
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Alerta de Cuadre / Balance -->
          <div class="p-4 rounded-2xl flex items-center justify-between text-xs"
               [ngClass]="calcularTotalesForm().cuadrado ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" [ngClass]="calcularTotalesForm().cuadrado ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"></span>
              <span class="font-black uppercase tracking-wider">
                {{ calcularTotalesForm().cuadrado ? 'Asiento Balanceado' : 'Asiento Descuadrado' }}
              </span>
            </div>
            <div class="flex gap-6 font-mono font-black">
              <span>Total Debe: {{ calcularTotalesForm().debe | currency:'USD' }}</span>
              <span>Total Haber: {{ calcularTotalesForm().haber | currency:'USD' }}</span>
              <span *ngIf="!calcularTotalesForm().cuadrado" class="text-rose-600">Diferencia: {{ calcularTotalesForm().diferencia | currency:'USD' }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeAsientoFormModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="asientoFormLoading() || !calcularTotalesForm().cuadrado"
                    class="px-6 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
              <span *ngIf="asientoFormLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Guardar Asiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE VISUALIZACIÓN DE DETALLES DEL ASIENTO -->
    <div *ngIf="showAsientoDetailModal() && selectedAsiento()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Detalle de Asiento Oficial</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">
              {{ selectedAsiento()?.nroAsiento || 'Borrador (Sin número)' }}
            </h3>
          </div>
          <button (click)="closeAsientoDetailModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-6">
          <!-- Cabecera Rápida -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider block">Fecha</span>
              <span class="text-slate-800 font-black">{{ selectedAsiento()?.fecha | date:'dd MMM yyyy' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider block">Estado</span>
              <span [class]="'inline-block mt-0.5 ' + (selectedAsiento()?.estado === 'APROBADO' ? 'px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg font-black uppercase border border-emerald-100' : selectedAsiento()?.estado === 'ANULADO' ? 'px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg font-black uppercase border border-rose-100' : 'px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg font-bold border border-slate-200')">
                {{ selectedAsiento()?.estado }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider block">Origen</span>
              <span class="text-slate-800 font-black">{{ selectedAsiento()?.origenDocumento || 'Manual' }} {{ selectedAsiento()?.origenId ? '#' + selectedAsiento()?.origenId : '' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider block">Período</span>
              <span class="text-slate-800 font-black">
                {{ selectedAsiento()?.periodoContable ? (selectedAsiento()?.periodoContable?.fechaInicio | date:'yyyy-MM') : 'N/A' }}
              </span>
            </div>
          </div>

          <!-- Glosa -->
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Glosa / Descripción</span>
            <p class="text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">{{ selectedAsiento()?.glosa }}</p>
          </div>

          <!-- Líneas -->
          <div class="space-y-2">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest block">Líneas de Partida Doble</span>
            <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50/30 text-slate-400 font-bold border-b border-slate-200">
                    <th class="p-3">Código</th>
                    <th class="p-3">Cuenta Contable</th>
                    <th class="p-3">Centro de Costo</th>
                    <th class="p-3 text-right">Debe</th>
                    <th class="p-3 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-slate-700 font-bold">
                  <tr *ngFor="let det of selectedAsiento()?.detalles">
                    <td class="p-3 font-mono text-slate-400">{{ (det.cuentaContable || det.cuenta)?.codigo }}</td>
                    <td class="p-3 text-slate-800">{{ (det.cuentaContable || det.cuenta)?.nombre }}</td>
                    <td class="p-3 text-slate-500 font-mono">{{ det.centroCosto ? det.centroCosto.codigo + ' - ' + det.centroCosto.nombre : '-' }}</td>
                    <td class="p-3 text-right font-mono text-slate-900">{{ det.debe > 0 ? (det.debe | currency:'USD') : '-' }}</td>
                    <td class="p-3 text-right font-mono text-slate-900">{{ det.haber > 0 ? (det.haber | currency:'USD') : '-' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-slate-50/30 font-black text-slate-900 border-t border-slate-200">
                    <td colspan="3" class="p-3 text-right uppercase tracking-wider text-slate-400 text-[10px]">Total Balanceado</td>
                    <td class="p-3 text-right font-mono">{{ sumDebe(selectedAsiento()?.detalles || []) | currency:'USD' }}</td>
                    <td class="p-3 text-right font-mono">{{ sumHaber(selectedAsiento()?.detalles || []) | currency:'USD' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Auditoría Creador -->
          <div *ngIf="selectedAsiento()?.usuario" class="text-right text-[10px] text-slate-400 font-bold">
            Creado por: {{ selectedAsiento()?.usuario?.username || selectedAsiento()?.usuario?.correo || 'Sistema' }}
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button (click)="closeAsientoDetailModal()" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE APROBACIÓN DE ASIENTO -->
    <div *ngIf="showAprobarAsientoModal() && asientoToAprobar()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Aprobar Asiento</h3>
          <button (click)="closeAprobarModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Confirmar aprobación del Asiento?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas aprobar este asiento? Se validará la partida doble y se generará su número de correlativo oficial. Esta acción no se puede deshacer de forma directa.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeAprobarModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="ejecutarAprobar()" [disabled]="aprobarLoading()"
                  class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="aprobarLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Aprobar Asiento
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ANULACIÓN DE ASIENTO -->
    <div *ngIf="showAnularAsientoModal() && asientoToAnular()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Anular Asiento</h3>
          <button (click)="closeAnularModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Anular Asiento contable?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas anular este asiento contable? Esta acción dependerá de que el período contable correspondiente se encuentre abierto. El asiento quedará registrado con el estado ANULADO.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeAnularModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="ejecutarAnular()" [disabled]="anularLoading()"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="anularLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Anular Asiento
          </button>
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
    @keyframes scale-up {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-up {
      animation: scale-up 0.2s ease-out forwards;
    }
  `]
})
export class ContabilidadComponent implements OnInit {
  private contabilidadService = inject(ContabilidadService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);
  private periodoContableService = inject(PeriodoContableService);
  private centroCostoService = inject(CentroCostoService);
  private authService = inject(AuthService);

  // Estados generales
  loadingData = signal(true);
  activeTab = signal<'asientos' | 'cuentas' | 'periodos' | 'centros-costo'>('asientos');
  isSuperAdmin = signal(false);
  userRole = signal<string>('');
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId = signal<number | null>(null);

  // Estados de datos
  asientos = signal<AsientoContable[]>([]);
  cuentas = signal<CuentaContable[]>([]);
  periodos = signal<PeriodoContable[]>([]);
  loadingPeriodos = signal(false);
  searchQueryPeriodo = signal('');

  // Centros de Costo
  centrosCosto = signal<CentroCosto[]>([]);
  loadingCentrosCosto = signal(false);
  searchQueryCentroCosto = signal('');

  showCentroCostoModal = signal(false);
  centroCostoFormLoading = signal(false);
  isEditCentroCostoMode = signal(false);
  centroCostoForm = this.getEmptyCentroCostoForm();

  showDeleteCentroCostoModal = signal(false);
  centroCostoToDelete = signal<CentroCosto | null>(null);
  deleteCentroCostoLoading = signal(false);

  private getEmptyCentroCostoForm() {
    return {
      id: undefined as number | undefined,
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: true,
      idEmpresa: undefined as number | undefined
    };
  }


  // Modales Periodo
  showPeriodoModal = signal(false);
  periodoFormLoading = signal(false);
  periodoForm = this.getEmptyPeriodoForm();

  showCerrarModal = signal(false);
  periodoToCerrar = signal<PeriodoContable | null>(null);
  cerrarLoading = signal(false);

  private getEmptyPeriodoForm() {
    return {
      fechaInicio: '',
      fechaFin: '',
      estado: 'ABIERTO' as 'ABIERTO' | 'CERRADO',
      idEmpresa: undefined as number | undefined
    };
  }

  // Modales Cuenta
  showCuentaModal = signal(false);
  cuentaFormLoading = signal(false);
  isEditCuentaMode = signal(false);
  cuentaForm = this.getEmptyCuentaForm();

  showDeleteCuentaModal = signal(false);
  cuentaToDelete = signal<CuentaContable | null>(null);
  deleteCuentaLoading = signal(false);

  private getEmptyCuentaForm() {
    return {
      id: undefined as number | undefined,
      codigo: '',
      nombre: '',
      tipo: '' as string,
      nivel: 1,
      estado: true,
      idEmpresa: undefined as number | undefined,
      cuentaPadre: null as CuentaContable | null
    };
  }
  
  // Modales y Estados de Asientos (HU12)
  showAsientoFormModal = signal(false);
  showAsientoDetailModal = signal(false);
  showAprobarAsientoModal = signal(false);
  showAnularAsientoModal = signal(false);
  asientoFormLoading = signal(false);
  asientoDetailLoading = signal(false);
  isEditAsientoMode = signal(false);
  selectedAsiento = signal<AsientoContable | null>(null);
  asientoToAprobar = signal<AsientoContable | null>(null);
  asientoToAnular = signal<AsientoContable | null>(null);
  aprobarLoading = signal(false);
  anularLoading = signal(false);
  asientoForm = this.getEmptyAsientoForm();

  private getEmptyAsientoForm() {
    return {
      id: undefined as number | undefined,
      nroAsiento: '',
      fecha: new Date().toISOString().substring(0, 10),
      glosa: '',
      estado: 'BORRADOR' as 'BORRADOR' | 'APROBADO',
      idEmpresa: undefined as number | undefined,
      detalles: [
        { id: undefined as number | undefined, cuentaContable: { id: null as number | null }, debe: 0, haber: 0, centroCosto: null as { id: number | null } | null },
        { id: undefined as number | undefined, cuentaContable: { id: null as number | null }, debe: 0, haber: 0, centroCosto: null as { id: number | null } | null }
      ]
    };
  }

  // Detalle expandido de asientos (IDs de asientos expandidos)
  expandedAsientos = new Set<number>();

  // Estados de sincronización
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
      a.id?.toString().includes(query) ||
      a.glosa.toLowerCase().includes(query) ||
      (a.nroAsiento && a.nroAsiento.toLowerCase().includes(query)) ||
      (a.origenDocumento && a.origenDocumento.toLowerCase().includes(query)) ||
      (a.origenId && a.origenId.toString().includes(query))
    );
  });

  // Cómputo filtrado de Plan de Cuentas
  filteredCuentas = computed(() => {
    const query = this.searchQueryCuenta().toLowerCase().trim();
    const data = this.cuentas();
    
    // Ordenar cuentas jerárquicamente por código contable
    const sorted = [...data].sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }));
    
    if (!query) return sorted;
    return sorted.filter(c => 
      c.codigo.toLowerCase().includes(query) ||
      c.nombre.toLowerCase().includes(query) ||
      (c.tipo && c.tipo.toLowerCase().includes(query))
    );
  });



  filteredPeriodos = computed(() => {
    const query = this.searchQueryPeriodo().toLowerCase().trim();
    const data = this.periodos();
    if (!query) return data;
    return data.filter(p => 
      p.id?.toString().includes(query) ||
      p.fechaInicio.toLowerCase().includes(query) ||
      p.fechaFin.toLowerCase().includes(query) ||
      (p.estado && p.estado.toLowerCase().includes(query))
    );
  });

  filteredCentrosCosto = computed(() => {
    const query = this.searchQueryCentroCosto().toLowerCase().trim();
    const data = this.centrosCosto();
    if (!query) return data;
    return data.filter(cc => 
      cc.id?.toString().includes(query) ||
      cc.codigo.toLowerCase().includes(query) ||
      cc.nombre.toLowerCase().includes(query) ||
      (cc.descripcion && cc.descripcion.toLowerCase().includes(query))
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
      this.userRole.set(profile.rol?.nombre || '');

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
      
      // Llamadas concurrentes para asientos, cuentas y periodos
      const promises: Promise<any>[] = [
        this.contabilidadService.getAsientos(empId),
        this.contabilidadService.getCuentas(empId)
      ];

      if (this.canViewPeriodos()) {
        promises.push(this.cargarPeriodosSilent(empId));
      }

      if (this.canViewCentrosCosto()) {
        promises.push(this.cargarCentrosCostoSilent(empId));
      }

      const [listAsientos, listCuentas] = await Promise.all(promises);
      
      this.asientos.set(listAsientos || []);
      this.cuentas.set(listCuentas || []);
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

  async changeTab(tab: 'asientos' | 'cuentas' | 'periodos' | 'centros-costo') {
    this.activeTab.set(tab);
    if (tab === 'periodos') {
      await this.cargarPeriodos(this.selectedEmpresaId() || undefined);
    } else if (tab === 'centros-costo') {
      await this.cargarCentrosCosto(this.selectedEmpresaId() || undefined);
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

  // Permisos de periodos
  canViewPeriodos(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_READ');
  }

  // Carga de periodos
  async cargarPeriodos(empId?: number) {
    if (this.isSuperAdmin() && !empId) {
      this.periodos.set([]);
      return;
    }
    this.loadingPeriodos.set(true);
    try {
      const list = await this.periodoContableService.getPeriodos(empId);
      this.periodos.set(list);
    } catch (error: any) {
      console.error('Error al cargar periodos:', error);
      this.syncErrorMessage.set(error?.error || 'No se pudo obtener la lista de períodos contables.');
    } finally {
      this.loadingPeriodos.set(false);
    }
  }

  async cargarPeriodosSilent(empId?: number) {
    if (this.isSuperAdmin() && !empId) {
      this.periodos.set([]);
      return;
    }
    try {
      const list = await this.periodoContableService.getPeriodos(empId);
      this.periodos.set(list);
    } catch (error) {
      console.error('Error al cargar periodos silent:', error);
    }
  }

  // Apertura de Periodo
  openPeriodoModal() {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.periodoForm = this.getEmptyPeriodoForm();
    this.showPeriodoModal.set(true);
  }

  closePeriodoModal() {
    this.showPeriodoModal.set(false);
    this.periodoFormLoading.set(false);
  }

  async savePeriodo() {
    const form = this.periodoForm;
    if (!form.fechaInicio || !form.fechaFin) {
      this.syncErrorMessage.set('Debe ingresar la fecha de inicio y de fin.');
      return;
    }
    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      this.syncErrorMessage.set('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    this.periodoFormLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    if (this.isSuperAdmin()) {
      form.idEmpresa = this.selectedEmpresaId() || undefined;
      if (!form.idEmpresa) {
        this.syncErrorMessage.set('Como SUPERADMIN, debe seleccionar una empresa antes de crear un período.');
        this.periodoFormLoading.set(false);
        return;
      }
    }

    try {
      await this.periodoContableService.aperturarPeriodo(form);
      this.syncSuccessMessage.set('Nuevo período contable aperturado con éxito.');
      this.closePeriodoModal();
      await this.cargarPeriodos(this.selectedEmpresaId() || undefined);
    } catch (error: any) {
      console.error('Error al aperturar periodo:', error);
      this.syncErrorMessage.set(error?.error || 'Ocurrió un error al aperturar el período contable.');
    } finally {
      this.periodoFormLoading.set(false);
    }
  }

  // Cierre de Periodo
  confirmarCerrarPeriodo(periodo: PeriodoContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.periodoToCerrar.set(periodo);
    this.showCerrarModal.set(true);
  }

  closeCerrarModal() {
    this.showCerrarModal.set(false);
    this.periodoToCerrar.set(null);
    this.cerrarLoading.set(false);
  }

  async ejecutarCierre() {
    const p = this.periodoToCerrar();
    if (!p || !p.id) return;

    this.cerrarLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    try {
      await this.periodoContableService.cerrarPeriodo(p.id);
      this.syncSuccessMessage.set('El período contable ha sido cerrado de forma definitiva.');
      this.closeCerrarModal();
      await this.cargarPeriodos(this.selectedEmpresaId() || undefined);
    } catch (error: any) {
      console.error('Error al cerrar periodo:', error);
      this.syncErrorMessage.set(error?.error || 'Ocurrió un error al cerrar el período contable.');
      this.closeCerrarModal();
    } finally {
      this.cerrarLoading.set(false);
    }
  }
  // Permisos de centros de costo
  canViewCentrosCosto(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_READ');
  }

  canManageCentrosCosto(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_WRITE');
  }

  // Carga de centros de costo
  async cargarCentrosCosto(empId?: number) {
    if (this.isSuperAdmin() && !empId) {
      this.centrosCosto.set([]);
      return;
    }
    this.loadingCentrosCosto.set(true);
    try {
      const list = await this.centroCostoService.getCentrosCosto(empId);
      this.centrosCosto.set(list || []);
    } catch (error: any) {
      console.error('Error al cargar centros de costo:', error);
      this.syncErrorMessage.set(error?.error || 'No se pudo obtener la lista de centros de costo.');
    } finally {
      this.loadingCentrosCosto.set(false);
    }
  }

  async cargarCentrosCostoSilent(empId?: number) {
    if (this.isSuperAdmin() && !empId) {
      this.centrosCosto.set([]);
      return;
    }
    try {
      const list = await this.centroCostoService.getCentrosCosto(empId);
      this.centrosCosto.set(list || []);
    } catch (error) {
      console.error('Error al cargar centros de costo silent:', error);
    }
  }

  // Acciones Formulario
  openCrearCentroCosto() {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditCentroCostoMode.set(false);
    this.centroCostoForm = this.getEmptyCentroCostoForm();
    this.showCentroCostoModal.set(true);
  }

  openEditarCentroCosto(cc: CentroCosto) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditCentroCostoMode.set(true);
    this.centroCostoForm = {
      id: cc.id,
      codigo: cc.codigo,
      nombre: cc.nombre,
      descripcion: cc.descripcion || '',
      estado: cc.estado ?? true,
      idEmpresa: cc.idEmpresa
    };
    this.showCentroCostoModal.set(true);
  }

  closeCentroCostoModal() {
    this.showCentroCostoModal.set(false);
    this.centroCostoFormLoading.set(false);
  }

  async saveCentroCosto() {
    const form = this.centroCostoForm;
    if (!form.codigo || !form.nombre) {
      this.syncErrorMessage.set('Debe ingresar el código y el nombre del centro de costo.');
      return;
    }

    this.centroCostoFormLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    if (this.isSuperAdmin()) {
      form.idEmpresa = this.selectedEmpresaId() || undefined;
      if (!form.idEmpresa) {
        this.syncErrorMessage.set('Como SUPERADMIN, debe seleccionar una empresa antes de guardar.');
        this.centroCostoFormLoading.set(false);
        return;
      }
    }

    try {
      if (this.isEditCentroCostoMode() && form.id) {
        await this.centroCostoService.actualizarCentroCosto(form.id, form);
        this.syncSuccessMessage.set('Centro de costo actualizado con éxito.');
      } else {
        await this.centroCostoService.crearCentroCosto(form);
        this.syncSuccessMessage.set('Centro de costo creado con éxito.');
      }
      this.closeCentroCostoModal();
      await this.cargarCentrosCosto(this.selectedEmpresaId() || undefined);
    } catch (error: any) {
      console.error('Error al guardar centro de costo:', error);
      this.syncErrorMessage.set(error?.error || 'Ocurrió un error al guardar el centro de costo.');
    } finally {
      this.centroCostoFormLoading.set(false);
    }
  }

  // Acciones Eliminar
  confirmarEliminarCentroCosto(cc: CentroCosto) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.centroCostoToDelete.set(cc);
    this.showDeleteCentroCostoModal.set(true);
  }

  closeDeleteCentroCostoModal() {
    this.showDeleteCentroCostoModal.set(false);
    this.centroCostoToDelete.set(null);
    this.deleteCentroCostoLoading.set(false);
  }

  async ejecutarEliminarCentroCosto() {
    const cc = this.centroCostoToDelete();
    if (!cc || !cc.id) return;

    this.deleteCentroCostoLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    try {
      await this.centroCostoService.eliminarCentroCosto(cc.id);
      this.syncSuccessMessage.set('El centro de costo ha sido dado de baja con éxito.');
      this.closeDeleteCentroCostoModal();
      await this.cargarCentrosCosto(this.selectedEmpresaId() || undefined);
    } catch (error: any) {
      console.error('Error al eliminar centro de costo:', error);
      this.syncErrorMessage.set(error?.error || 'Ocurrió un error al dar de baja el centro de costo.');
      this.closeDeleteCentroCostoModal();
    } finally {
      this.deleteCentroCostoLoading.set(false);
    }
  }

  // Permisos y CRUD de Plan de Cuentas (HU11)
  canManageCuentas(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_WRITE');
  }

  openCrearCuenta(padre?: CuentaContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditCuentaMode.set(false);
    this.cuentaForm = this.getEmptyCuentaForm();
    if (padre) {
      this.cuentaForm.cuentaPadre = padre;
      this.cuentaForm.tipo = padre.tipo || '';
      this.cuentaForm.nivel = (padre.nivel || 1) + 1;
    }
    this.showCuentaModal.set(true);
  }

  onCuentaPadreChange(idVal: any) {
    const id = idVal ? +idVal : null;
    if (!id) {
      this.cuentaForm.cuentaPadre = null;
      this.cuentaForm.nivel = 1;
      this.cuentaForm.tipo = '';
    } else {
      const padre = this.cuentas().find(c => c.id === id);
      if (padre) {
        this.cuentaForm.cuentaPadre = padre;
        this.cuentaForm.tipo = padre.tipo || '';
        this.cuentaForm.nivel = (padre.nivel || 1) + 1;
      }
    }
  }

  openEditarCuenta(cuenta: CuentaContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditCuentaMode.set(true);
    this.cuentaForm = {
      id: cuenta.id,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo || '',
      nivel: cuenta.nivel || 1,
      estado: cuenta.estado ?? true,
      idEmpresa: cuenta.idEmpresa,
      cuentaPadre: cuenta.cuentaPadre || null
    };
    this.showCuentaModal.set(true);
  }

  closeCuentaModal() {
    this.showCuentaModal.set(false);
    this.cuentaFormLoading.set(false);
  }

  async saveCuenta() {
    const form = this.cuentaForm;
    if (!form.codigo || !form.nombre) {
      this.syncErrorMessage.set('Debe ingresar el código y el nombre de la cuenta contable.');
      return;
    }
    if (!form.cuentaPadre && !form.tipo) {
      this.syncErrorMessage.set('Debe seleccionar el tipo de cuenta para cuentas principales.');
      return;
    }

    this.cuentaFormLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    if (this.isSuperAdmin()) {
      form.idEmpresa = this.selectedEmpresaId() || undefined;
      if (!form.idEmpresa) {
        this.syncErrorMessage.set('Como SUPERADMIN, debe seleccionar una empresa antes de guardar.');
        this.cuentaFormLoading.set(false);
        return;
      }
    }

    try {
      if (this.isEditCuentaMode() && form.id) {
        await this.contabilidadService.actualizarCuenta(form.id, form);
        this.syncSuccessMessage.set('Cuenta contable actualizada con éxito.');
      } else {
        await this.contabilidadService.crearCuenta(form);
        this.syncSuccessMessage.set('Cuenta contable registrada con éxito.');
      }
      this.closeCuentaModal();
      await this.cargarInformacion(); // Recarga cuentas, asientos, etc.
    } catch (error: any) {
      console.error('Error al guardar cuenta contable:', error);
      this.syncErrorMessage.set(error?.error || 'Ocurrió un error al guardar la cuenta contable.');
    } finally {
      this.cuentaFormLoading.set(false);
    }
  }

  confirmarEliminarCuenta(cuenta: CuentaContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.cuentaToDelete.set(cuenta);
    this.showDeleteCuentaModal.set(true);
  }

  closeDeleteCuentaModal() {
    this.showDeleteCuentaModal.set(false);
    this.cuentaToDelete.set(null);
    this.deleteCuentaLoading.set(false);
  }

  async ejecutarEliminarCuenta() {
    const cuenta = this.cuentaToDelete();
    if (!cuenta || !cuenta.id) return;

    this.deleteCuentaLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    try {
      await this.contabilidadService.eliminarCuenta(cuenta.id);
      this.syncSuccessMessage.set('La cuenta contable ha sido desactivada con éxito.');
      this.closeDeleteCuentaModal();
      await this.cargarInformacion();
    } finally {
      this.deleteCuentaLoading.set(false);
    }
  }

  // Permisos de Asientos (HU12)
  canManageAsientos(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_WRITE');
  }

  canApproveOrAnulAsientos(): boolean {
    return this.authService.hasPermission('PERM_CONTABILIDAD_WRITE');
  }

  // Métodos del Formulario de Asientos
  agregarLinea() {
    this.asientoForm.detalles.push({
      id: undefined as number | undefined,
      cuentaContable: { id: null as number | null },
      debe: 0,
      haber: 0,
      centroCosto: null as { id: number | null } | null
    });
  }

  eliminarLinea(index: number) {
    if (this.asientoForm.detalles.length > 2) {
      this.asientoForm.detalles.splice(index, 1);
    }
  }

  calcularTotalesForm() {
    let debe = 0;
    let haber = 0;
    for (const d of this.asientoForm.detalles) {
      debe += +d.debe || 0;
      haber += +d.haber || 0;
    }
    const diferencia = Math.abs(debe - haber);
    return {
      debe,
      haber,
      diferencia,
      cuadrado: Math.round(diferencia * 100) === 0
    };
  }

  // Modal handlers
  openCrearAsiento() {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditAsientoMode.set(false);
    this.asientoForm = this.getEmptyAsientoForm();
    this.showAsientoFormModal.set(true);
  }

  async openEditarAsiento(asiento: AsientoContable) {
    if (!asiento.id) return;
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.isEditAsientoMode.set(true);
    this.asientoFormLoading.set(true);
    try {
      const fullAsiento = await this.contabilidadService.getAsientoById(asiento.id);
      this.asientoForm = {
        id: fullAsiento.id,
        nroAsiento: fullAsiento.nroAsiento || '',
        fecha: fullAsiento.fecha,
        glosa: fullAsiento.glosa,
        estado: fullAsiento.estado === 'APROBADO' ? 'APROBADO' : 'BORRADOR',
        idEmpresa: fullAsiento.idEmpresa,
        detalles: fullAsiento.detalles.map(d => ({
          id: d.id,
          cuentaContable: { id: (d.cuentaContable || d.cuenta)?.id || null },
          debe: d.debe,
          haber: d.haber,
          centroCosto: d.centroCosto ? { id: d.centroCosto.id || null } : null
        }))
      };
      this.showAsientoFormModal.set(true);
    } catch (err: any) {
      console.error('Error al cargar asiento para edición:', err);
      this.syncErrorMessage.set(err?.error || 'No se pudo cargar el asiento contable.');
    } finally {
      this.asientoFormLoading.set(false);
    }
  }

  async openDetalleAsiento(id: number) {
    this.asientoDetailLoading.set(true);
    this.selectedAsiento.set(null);
    try {
      const res = await this.contabilidadService.getAsientoById(id);
      this.selectedAsiento.set(res);
      this.showAsientoDetailModal.set(true);
    } catch (err: any) {
      console.error('Error al cargar detalle del asiento:', err);
      this.syncErrorMessage.set(err?.error || 'No se pudo cargar el detalle del asiento.');
    } finally {
      this.asientoDetailLoading.set(false);
    }
  }

  closeAsientoFormModal() {
    this.showAsientoFormModal.set(false);
    this.asientoFormLoading.set(false);
  }

  closeAsientoDetailModal() {
    this.showAsientoDetailModal.set(false);
    this.selectedAsiento.set(null);
  }

  async saveAsiento() {
    const form = this.asientoForm;
    if (!form.fecha || !form.glosa) {
      this.syncErrorMessage.set('Debe ingresar la fecha y la glosa del asiento.');
      return;
    }
    
    // Validar líneas mínimas y cuentas
    if (form.detalles.length < 2) {
      this.syncErrorMessage.set('Un asiento contable debe poseer al menos 2 líneas de detalle.');
      return;
    }
    for (let i = 0; i < form.detalles.length; i++) {
      const line = form.detalles[i];
      if (!line.cuentaContable.id) {
        this.syncErrorMessage.set(`La línea #${i+1} debe especificar una cuenta contable.`);
        return;
      }
      if ((+line.debe || 0) < 0 || (+line.haber || 0) < 0) {
        this.syncErrorMessage.set(`Los importes de la línea #${i+1} no pueden ser negativos.`);
        return;
      }
    }

    // Validar partida doble
    const { debe, haber, cuadrado } = this.calcularTotalesForm();
    if (!cuadrado) {
      this.syncErrorMessage.set(`El asiento contable está descuadrado (Debe: ${debe.toFixed(2)}, Haber: ${haber.toFixed(2)}).`);
      return;
    }

    this.asientoFormLoading.set(true);
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);

    // Mapear idEmpresa si es superadmin
    if (this.isSuperAdmin()) {
      form.idEmpresa = this.selectedEmpresaId() || undefined;
      if (!form.idEmpresa) {
        this.syncErrorMessage.set('Como SUPERADMIN, debe seleccionar una empresa antes de guardar.');
        this.asientoFormLoading.set(false);
        return;
      }
    }

    // Adaptar payload para enviar al backend
    const payload: AsientoContable = {
      id: form.id,
      nroAsiento: form.nroAsiento || undefined,
      fecha: form.fecha,
      glosa: form.glosa,
      estado: form.estado,
      idEmpresa: form.idEmpresa,
      detalles: form.detalles.map(d => ({
        id: d.id,
        cuentaContable: { id: d.cuentaContable.id! } as any as CuentaContable,
        debe: d.debe,
        haber: d.haber,
        centroCosto: d.centroCosto && d.centroCosto.id ? ({ id: d.centroCosto.id } as any as CentroCosto) : null
      }))
    };

    try {
      if (this.isEditAsientoMode() && form.id) {
        await this.contabilidadService.actualizarAsiento(form.id, payload);
        this.syncSuccessMessage.set('Asiento contable actualizado con éxito.');
      } else {
        await this.contabilidadService.crearAsiento(payload);
        this.syncSuccessMessage.set('Asiento contable registrado con éxito.');
      }
      this.closeAsientoFormModal();
      await this.cargarInformacion();
    } catch (error: any) {
      console.error('Error al guardar asiento contable:', error);
      const detail = error?.error || error?.message || 'Error desconocido';
      this.syncErrorMessage.set(detail);
    } finally {
      this.asientoFormLoading.set(false);
    }
  }

  // Aprobar Asiento
  confirmarAprobar(asiento: AsientoContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.asientoToAprobar.set(asiento);
    this.showAprobarAsientoModal.set(true);
  }

  closeAprobarModal() {
    this.showAprobarAsientoModal.set(false);
    this.asientoToAprobar.set(null);
    this.aprobarLoading.set(false);
  }

  async ejecutarAprobar() {
    const a = this.asientoToAprobar();
    if (!a || !a.id) return;
    this.aprobarLoading.set(true);
    try {
      await this.contabilidadService.aprobarAsiento(a.id);
      this.syncSuccessMessage.set(`Asiento contable aprobado con éxito.`);
      this.closeAprobarModal();
      await this.cargarInformacion();
    } catch (error: any) {
      console.error('Error al aprobar asiento:', error);
      this.syncErrorMessage.set(error?.error || 'No se pudo aprobar el asiento.');
      this.closeAprobarModal();
    } finally {
      this.aprobarLoading.set(false);
    }
  }

  // Anular Asiento
  confirmarAnular(asiento: AsientoContable) {
    this.syncSuccessMessage.set(null);
    this.syncErrorMessage.set(null);
    this.asientoToAnular.set(asiento);
    this.showAnularAsientoModal.set(true);
  }

  closeAnularModal() {
    this.showAnularAsientoModal.set(false);
    this.asientoToAnular.set(null);
    this.anularLoading.set(false);
  }

  async ejecutarAnular() {
    const a = this.asientoToAnular();
    if (!a || !a.id) return;
    this.anularLoading.set(true);
    try {
      await this.contabilidadService.anularAsiento(a.id);
      this.syncSuccessMessage.set(`Asiento contable anulado con éxito.`);
      this.closeAnularModal();
      await this.cargarInformacion();
    } catch (error: any) {
      console.error('Error al anular asiento:', error);
      this.syncErrorMessage.set(error?.error || 'No se pudo anular el asiento. Verifique si el período está cerrado.');
      this.closeAnularModal();
    } finally {
      this.anularLoading.set(false);
    }
  }

  // Clase CSS según el tipo de cuenta
  getTipoBadgeClass(tipo?: string): string {
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
