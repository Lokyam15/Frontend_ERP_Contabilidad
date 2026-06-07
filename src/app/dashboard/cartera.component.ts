import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteraService, CuentaPorCobrar, CuentaPorPagar } from '../core/cartera.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-cartera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Cartera y Cobros/Pagos</h2>
          <p class="text-slate-500 font-medium">Gestión de saldos, registro de cobros a clientes y pagos a proveedores.</p>
        </div>
        
        <!-- Filtro de empresa para SUPERADMIN -->
        <div *ngIf="isSuperAdmin() && empresas().length > 0" class="flex flex-col gap-1.5 min-w-[240px]">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Filtrar por Empresa</label>
          <select [value]="selectedEmpresaId() || 0" (change)="onEmpresaChange($event)" 
                  class="px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary">
            <option [value]="0" disabled>Selecciona una empresa...</option>
            <option *ngFor="let emp of empresas()" [value]="emp.id">{{ emp.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Alertas de Éxito / Error -->
      <div *ngIf="successMessage()" class="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Operación Exitosa</h4>
          <p class="text-xs text-slate-600 mt-0.5">{{ successMessage() }}</p>
        </div>
        <button (click)="successMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <div *ngIf="errorMessage()" class="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Error en Operación</h4>
          <p class="text-xs text-slate-600 mt-0.5">{{ errorMessage() }}</p>
        </div>
        <button (click)="errorMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <!-- SUPERADMIN sin empresa seleccionada -->
      <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center animate-fade-in">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
        <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para ver e ingresar gestiones de cartera, por favor seleccione una empresa en la esquina superior derecha.</p>
      </div>

      <!-- VISTA PRINCIPAL (SI HAY EMPRESA SELECCIONADA) -->
      <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">

        <!-- Acceso No Autorizado por Rol -->
        <div *ngIf="!canViewCobrarTab() && !canViewPagarTab()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center animate-fade-in">
          <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-100 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 class="text-lg font-black text-slate-800">Acceso Restringido</h4>
          <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Su perfil actual no tiene permisos configurados para ver la cartera de cobros a clientes ni pagos a proveedores.</p>
        </div>

        <!-- Bloque Principal de Cartera (Solo si tiene permisos) -->
        <ng-container *ngIf="canViewCobrarTab() || canViewPagarTab()">
        
          <!-- Pestañas (Tabs) -->
        <div class="flex border-b border-slate-200">
          <button *ngIf="canViewCobrarTab()" (click)="setActiveTab('cobrar')" 
                  [class]="activeTab() === 'cobrar' ? 'border-b-2 border-erp-primary text-erp-primary' : 'text-slate-500 hover:text-slate-700 border-transparent'" 
                  class="py-4 px-6 font-black text-sm transition-all focus:outline-none flex items-center gap-2 border-b-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cuentas por Cobrar (Clientes)
          </button>
          <button *ngIf="canViewPagarTab()" (click)="setActiveTab('pagar')" 
                  [class]="activeTab() === 'pagar' ? 'border-b-2 border-erp-primary text-erp-primary' : 'text-slate-500 hover:text-slate-700 border-transparent'" 
                  class="py-4 px-6 font-black text-sm transition-all focus:outline-none flex items-center gap-2 border-b-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cuentas por Pagar (Proveedores)
          </button>
        </div>

        <!-- Banner de Resumen Estadístico (Cobrar) -->
        <div *ngIf="activeTab() === 'cobrar'" class="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          
          <!-- Total Cartera -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-erp-primary/10 rounded-2xl flex items-center justify-center text-erp-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total en Ventas</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ cobrarStats().totalMonto | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Recaudado -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Recaudado</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ cobrarStats().totalCobrado | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Saldo Pendiente -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo por Cobrar</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ cobrarStats().totalSaldo | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Cuentas pendientes count -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuentas con Saldo</span>
              <p class="text-xl font-black text-slate-800 mt-0.5">{{ cobrarStats().pendientesCount }}</p>
            </div>
          </div>

        </div>

        <!-- Banner de Resumen Estadístico (Pagar) -->
        <div *ngIf="activeTab() === 'pagar'" class="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          
          <!-- Total Deuda -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-erp-primary/10 rounded-2xl flex items-center justify-center text-erp-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total en Compras</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ pagarStats().totalMonto | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Pagado -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Pagado</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ pagarStats().totalPagado | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Saldo Pendiente -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo por Pagar</span>
              <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ pagarStats().totalSaldo | currency:'BOB':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <!-- Cuentas pendientes count -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuentas con Saldo</span>
              <p class="text-xl font-black text-slate-800 mt-0.5">{{ pagarStats().pendientesCount }}</p>
            </div>
          </div>

        </div>

        <!-- Barra de Búsqueda -->
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[320px] w-full sm:w-auto shadow-sm animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" 
                   placeholder="Buscar por factura, cliente, proveedor o NIT..." 
                   class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
          </div>
          <button (click)="cargarCartera()" [disabled]="loadingData()"
                  class="w-full sm:w-auto px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 disabled:opacity-55">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
            </svg>
            Actualizar Datos
          </button>
        </div>

        <!-- Estado de Carga -->
        <div *ngIf="loadingData()" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando información de cartera...</p>
        </div>

        <!-- TABLA DE CUENTAS POR COBRAR (TAB = COBRAR) -->
        <div *ngIf="!loadingData() && activeTab() === 'cobrar'" class="animate-fade-in">
          <div *ngIf="filteredCuentasCobrar().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">Factura</th>
                    <th class="p-6">Fecha Emisión</th>
                    <th class="p-6">Cliente</th>
                    <th class="p-6 text-right">Monto Facturado</th>
                    <th class="p-6 text-right">Saldo Pendiente</th>
                    <th class="p-6">Vencimiento</th>
                    <th class="p-6 text-center">Estado</th>
                    <th class="p-6 text-right" *ngIf="canRegisterCobro()">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let cc of filteredCuentasCobrar()" class="hover:bg-slate-50/30 transition-colors">
                    <td class="p-6">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-erp-primary/5 text-erp-primary rounded-xl flex items-center justify-center font-mono text-xs font-black">
                          CC
                        </div>
                        <div>
                          <p class="text-slate-800 font-mono tracking-tight font-black">{{ cc.facturaVenta?.nroFactura || 'S/N' }}</p>
                          <p class="text-slate-400 text-xs font-mono">ID: #{{ cc.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-6 text-slate-600">
                      {{ cc.facturaVenta?.fecha | date:'dd MMM yyyy' }}
                    </td>
                    <td class="p-6">
                      <p class="text-slate-800 font-black tracking-tight leading-tight">{{ cc.facturaVenta?.clienteNombre }}</p>
                      <p class="text-slate-400 text-xs font-mono">NIT: {{ cc.facturaVenta?.clienteNit }}</p>
                    </td>
                    <td class="p-6 text-right font-mono text-slate-500">
                      {{ cc.montoTotal | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                    <td class="p-6 text-right font-mono font-black" [class.text-amber-600]="cc.saldo > 0 && cc.estado !== 'VENCIDO'" [class.text-rose-600]="cc.estado === 'VENCIDO'" [class.text-emerald-600]="cc.saldo === 0">
                      {{ cc.saldo | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                    <td class="p-6" [class.text-rose-600]="cc.estado === 'VENCIDO'">
                      {{ cc.fechaVencimiento | date:'dd MMM yyyy' }}
                    </td>
                    <td class="p-6 text-center">
                      <span [class]="getEstadoClass(cc.estado)">
                        {{ cc.estado }}
                      </span>
                    </td>
                    <td class="p-6 text-right" *ngIf="canRegisterCobro()">
                      <button *ngIf="cc.saldo > 0 && cc.estado !== 'ANULADA'" (click)="openTransactionModal('cobro', cc)"
                              class="px-4 py-2 bg-erp-primary hover:bg-erp-primary/95 text-white border border-erp-primary/20 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-black shadow-md shadow-erp-primary/10 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Cobrar
                      </button>
                      <span *ngIf="cc.saldo === 0 || cc.estado === 'ANULADA'" class="text-slate-400 text-xs font-bold italic">
                        Sin saldo pendiente
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Estado Vacío Cobrar -->
          <div *ngIf="filteredCuentasCobrar().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No se encontraron cuentas por cobrar</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen registros de cobros pendientes para los criterios de búsqueda.</p>
          </div>
        </div>

        <!-- TABLA DE CUENTAS POR PAGAR (TAB = PAGAR) -->
        <div *ngIf="!loadingData() && activeTab() === 'pagar'" class="animate-fade-in">
          <div *ngIf="filteredCuentasPagar().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">Factura</th>
                    <th class="p-6">Fecha Registro</th>
                    <th class="p-6">Proveedor</th>
                    <th class="p-6 text-right">Monto Comprado</th>
                    <th class="p-6 text-right">Saldo Pendiente</th>
                    <th class="p-6">Vencimiento</th>
                    <th class="p-6 text-center">Estado</th>
                    <th class="p-6 text-right" *ngIf="canRegisterPago()">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let cp of filteredCuentasPagar()" class="hover:bg-slate-50/30 transition-colors">
                    <td class="p-6">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-erp-primary/5 text-erp-primary rounded-xl flex items-center justify-center font-mono text-xs font-black">
                          CP
                        </div>
                        <div>
                          <p class="text-slate-800 font-mono tracking-tight font-black">{{ cp.facturaCompra?.nroFactura || 'S/N' }}</p>
                          <p class="text-slate-400 text-xs font-mono">ID: #{{ cp.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-6 text-slate-600">
                      {{ cp.facturaCompra?.fecha | date:'dd MMM yyyy' }}
                    </td>
                    <td class="p-6">
                      <p class="text-slate-800 font-black tracking-tight leading-tight">{{ cp.facturaCompra?.proveedorNombre }}</p>
                      <p class="text-slate-400 text-xs font-mono">NIT: {{ cp.facturaCompra?.proveedorNit }}</p>
                    </td>
                    <td class="p-6 text-right font-mono text-slate-500">
                      {{ cp.montoTotal | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                    <td class="p-6 text-right font-mono font-black" [class.text-amber-600]="cp.saldo > 0 && cp.estado !== 'VENCIDO'" [class.text-rose-600]="cp.estado === 'VENCIDO'" [class.text-emerald-600]="cp.saldo === 0">
                      {{ cp.saldo | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                    <td class="p-6" [class.text-rose-600]="cp.estado === 'VENCIDO'">
                      {{ cp.fechaVencimiento | date:'dd MMM yyyy' }}
                    </td>
                    <td class="p-6 text-center">
                      <span [class]="getEstadoClass(cp.estado)">
                        {{ cp.estado }}
                      </span>
                    </td>
                    <td class="p-6 text-right" *ngIf="canRegisterPago()">
                      <button *ngIf="cp.saldo > 0 && cp.estado !== 'ANULADA'" (click)="openTransactionModal('pago', cp)"
                              class="px-4 py-2 bg-erp-primary hover:bg-erp-primary/95 text-white border border-erp-primary/20 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-black shadow-md shadow-erp-primary/10 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Pagar
                      </button>
                      <span *ngIf="cp.saldo === 0 || cp.estado === 'ANULADA'" class="text-slate-400 text-xs font-bold italic">
                        Sin saldo pendiente
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Estado Vacío Pagar -->
          <div *ngIf="filteredCuentasPagar().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No se encontraron cuentas por pagar</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen registros de pagos pendientes para los criterios de búsqueda.</p>
          </div>
        </div>
      </ng-container>

      </div>
    </div>

    <!-- MODAL DE TRANSACCIÓN: REGISTRAR COBRO / PAGO -->
    <div *ngIf="showTransactionModal() && selectedAccount()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Transacción de Cartera</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">
              {{ transactionType() === 'cobro' ? 'Registrar Cobro a Cliente' : 'Registrar Pago a Proveedor' }}
            </h3>
          </div>
          <button (click)="closeTransactionModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="saveTransaction()" class="p-8 space-y-6">
          
          <!-- Datos Resumen -->
          <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs text-slate-600">
            <div class="flex justify-between">
              <span class="font-bold">Factura Relacionada:</span>
              <span class="font-mono font-black text-slate-800">
                {{ transactionType() === 'cobro' ? selectedAccount()?.facturaVenta?.nroFactura : selectedAccount()?.facturaCompra?.nroFactura }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold">{{ transactionType() === 'cobro' ? 'Cliente' : 'Proveedor' }}:</span>
              <span class="font-black text-slate-800 truncate max-w-[200px]" [title]="transactionType() === 'cobro' ? selectedAccount()?.facturaVenta?.clienteNombre : selectedAccount()?.facturaCompra?.proveedorNombre">
                {{ transactionType() === 'cobro' ? selectedAccount()?.facturaVenta?.clienteNombre : selectedAccount()?.facturaCompra?.proveedorNombre }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold">Total Factura:</span>
              <span class="font-mono font-bold text-slate-800">{{ selectedAccount()?.montoTotal | currency:'BOB':'symbol':'1.2-2' }}</span>
            </div>
            <hr class="border-slate-200/60" />
            <div class="flex justify-between text-slate-900 font-bold text-sm">
              <span>Saldo Actual Pendiente:</span>
              <span class="font-mono font-black text-erp-primary">{{ selectedAccount()?.saldo | currency:'BOB':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <!-- Input del Monto -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Monto a Registrar ($) <span class="text-red-500">*</span></span>
              <button type="button" (click)="setFullAmount()" class="text-erp-primary hover:underline text-[10px] font-black uppercase">
                {{ transactionType() === 'cobro' ? 'Cobrar Todo' : 'Pagar Todo' }}
              </button>
            </label>
            <div class="relative">
              <input type="number" [ngModel]="transactionMonto()" (ngModelChange)="transactionMonto.set($event)" name="amount" required min="0.01" [max]="selectedAccount()?.saldo" step="0.01"
                     placeholder="Ej: 150.00" 
                     class="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all font-mono" />
            </div>
          </div>

          <!-- Live Calculadora de Saldo Restante -->
          <div class="bg-indigo-50/30 p-4 rounded-xl border border-indigo-50/50 space-y-2 text-xs font-mono text-slate-600">
            <div class="flex justify-between">
              <span>Saldo Actual:</span>
              <span>{{ selectedAccount()?.saldo | currency:'BOB':'symbol':'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-rose-500 font-bold">
              <span>(-) Monto Transacción:</span>
              <span>-{{ (transactionMonto() || 0) | currency:'BOB':'symbol':'1.2-2' }}</span>
            </div>
            <hr class="border-indigo-100" />
            <div class="flex justify-between text-indigo-800 font-black">
              <span>Nuevo Saldo Restante:</span>
              <span>{{ remainingBalance() | currency:'BOB':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <!-- Advertencias de asiento contable -->
          <p class="text-[10px] font-semibold text-slate-500 leading-relaxed">
            * Nota: Esta operación registrará la transacción en el sistema y generará un asiento contable automático en el libro diario para reflejar la entrada/salida de fondos y amortización de saldo.
          </p>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" (click)="closeTransactionModal()" 
                    class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-xs transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="transactionLoading() || !isTransactionValid()"
                    class="px-6 py-3 bg-erp-primary text-white font-black rounded-xl text-xs flex items-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md shadow-erp-primary/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-95">
              <span *ngIf="transactionLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Confirmar Transacción
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class CarteraComponent implements OnInit {
  private carteraService = inject(CarteraService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Estados de perfil y rol
  isSuperAdmin = signal(false);
  userRole = signal<string>('');
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId = signal<number | null>(null);

  // Carga e historial
  loadingData = signal(true);
  searchQuery = signal('');
  activeTab = signal<'cobrar' | 'pagar'>('cobrar');

  // Listas de cuentas
  cuentasCobrar = signal<CuentaPorCobrar[]>([]);
  cuentasPagar = signal<CuentaPorPagar[]>([]);

  // Modales y Formulario
  showTransactionModal = signal(false);
  transactionType = signal<'cobro' | 'pago'>('cobro');
  selectedAccount = signal<any | null>(null);
  transactionMonto = signal<number | null>(null);
  transactionLoading = signal(false);

  // Mensajes de feedback
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Filtros computados de Cuentas por Cobrar
  filteredCuentasCobrar = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.cuentasCobrar();

    if (!query) return list;

    return list.filter(cc => 
      cc.facturaVenta?.nroFactura?.toLowerCase().includes(query) ||
      cc.facturaVenta?.clienteNombre?.toLowerCase().includes(query) ||
      cc.facturaVenta?.clienteNit?.toLowerCase().includes(query) ||
      cc.id?.toString().includes(query) ||
      cc.estado?.toLowerCase().includes(query)
    );
  });

  // Filtros computados de Cuentas por Pagar
  filteredCuentasPagar = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.cuentasPagar();

    if (!query) return list;

    return list.filter(cp => 
      cp.facturaCompra?.nroFactura?.toLowerCase().includes(query) ||
      cp.facturaCompra?.proveedorNombre?.toLowerCase().includes(query) ||
      cp.facturaCompra?.proveedorNit?.toLowerCase().includes(query) ||
      cp.id?.toString().includes(query) ||
      cp.estado?.toLowerCase().includes(query)
    );
  });

  // Estadísticas del listado de Cuentas por Cobrar
  cobrarStats = computed(() => {
    const list = this.cuentasCobrar();
    let totalMonto = 0;
    let totalSaldo = 0;
    let totalCobrado = 0;
    let pendientesCount = 0;

    list.forEach(cc => {
      if (cc.estado !== 'ANULADA') {
        totalMonto += cc.montoTotal || 0;
        totalSaldo += cc.saldo || 0;
        if (cc.saldo > 0) {
          pendientesCount++;
        }
      }
    });

    totalCobrado = Math.max(0, totalMonto - totalSaldo);
    return { totalMonto, totalSaldo, totalCobrado, pendientesCount };
  });

  // Estadísticas del listado de Cuentas por Pagar
  pagarStats = computed(() => {
    const list = this.cuentasPagar();
    let totalMonto = 0;
    let totalSaldo = 0;
    let totalPagado = 0;
    let pendientesCount = 0;

    list.forEach(cp => {
      if (cp.estado !== 'ANULADA') {
        totalMonto += cp.montoTotal || 0;
        totalSaldo += cp.saldo || 0;
        if (cp.saldo > 0) {
          pendientesCount++;
        }
      }
    });

    totalPagado = Math.max(0, totalMonto - totalSaldo);
    return { totalMonto, totalSaldo, totalPagado, pendientesCount };
  });

  // Computado del cálculo de saldo restante
  remainingBalance = computed(() => {
    const acc = this.selectedAccount();
    if (!acc) return 0;
    const currentBalance = acc.saldo || 0;
    const amount = this.transactionMonto() || 0;
    return Math.max(0, currentBalance - amount);
  });

  // Computado de validación de la transacción
  isTransactionValid = computed(() => {
    const acc = this.selectedAccount();
    if (!acc) return false;
    const amount = this.transactionMonto();
    if (amount === null || amount === undefined || amount <= 0) return false;
    return amount <= acc.saldo;
  });

  async ngOnInit() {
    await this.initPerfil();
    await this.cargarCartera();
  }

  async initPerfil() {
    try {
      const profile = await this.userService.getMyProfile();
      const role = profile.rol?.nombre || '';
      this.userRole.set(role);
      const superAdmin = role === 'SUPERADMIN';
      this.isSuperAdmin.set(superAdmin);

      // Definir la pestaña activa según permisos
      if (!this.canViewCobrarTab() && this.canViewPagarTab()) {
        this.activeTab.set('pagar');
      } else {
        this.activeTab.set('cobrar');
      }

      if (superAdmin) {
        const list = await this.empresaService.getAllEmpresas();
        this.empresas.set(list);
      } else {
        this.selectedEmpresaId.set(profile.idEmpresa || null);
      }
    } catch (error) {
      console.error('Error al inicializar perfil en cartera:', error);
    }
  }

  async cargarCartera() {
    const empId = this.selectedEmpresaId();
    if (this.isSuperAdmin() && !empId) {
      this.loadingData.set(false);
      this.cuentasCobrar.set([]);
      this.cuentasPagar.set([]);
      return;
    }

    this.loadingData.set(true);
    try {
      const loadCobrar = this.canViewCobrarTab();
      const loadPagar = this.canViewPagarTab();

      const promises: Promise<any>[] = [];

      if (loadCobrar) {
        promises.push(
          this.carteraService.getCuentasPorCobrar(this.isSuperAdmin() ? (empId || undefined) : undefined)
            .then(list => {
              list.sort((a, b) => b.id - a.id);
              this.cuentasCobrar.set(list);
            })
        );
      } else {
        this.cuentasCobrar.set([]);
      }

      if (loadPagar) {
        promises.push(
          this.carteraService.getCuentasPorPagar(this.isSuperAdmin() ? (empId || undefined) : undefined)
            .then(list => {
              list.sort((a, b) => b.id - a.id);
              this.cuentasPagar.set(list);
            })
        );
      } else {
        this.cuentasPagar.set([]);
      }

      await Promise.all(promises);
    } catch (error: any) {
      console.error('Error al cargar cartera:', error);
      this.errorMessage.set(error?.error || 'No se pudo obtener la información de la cartera.');
    } finally {
      this.loadingData.set(false);
    }
  }

  onEmpresaChange(event: any) {
    const val = Number(event.target.value);
    this.selectedEmpresaId.set(val > 0 ? val : null);
    this.cargarCartera();
  }

  setActiveTab(tab: 'cobrar' | 'pagar') {
    this.activeTab.set(tab);
    this.searchQuery.set('');
  }

  // Permisos de Tabs
  canViewCobrarTab(): boolean {
    return this.authService.hasPermission('PERM_OPERACIONES_READ');
  }

  canViewPagarTab(): boolean {
    return this.authService.hasPermission('PERM_OPERACIONES_READ');
  }

  // Permisos de Registro de Transacción
  canRegisterCobro(): boolean {
    return this.authService.hasPermission('PERM_OPERACIONES_WRITE');
  }

  // Permisos de Registro de Transacción
  canRegisterPago(): boolean {
    return this.authService.hasPermission('PERM_OPERACIONES_WRITE');
  }

  // Estilos de Badges de Estado
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PAGADO':
        return 'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100';
      case 'PENDIENTE':
        return 'px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black uppercase border border-amber-100';
      case 'VENCIDO':
        return 'px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-black uppercase border border-rose-100';
      case 'ANULADA':
      default:
        return 'px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-black uppercase border border-slate-100';
    }
  }

  // Modales
  openTransactionModal(type: 'cobro' | 'pago', account: any) {
    this.transactionType.set(type);
    this.selectedAccount.set(account);
    this.transactionMonto.set(null);
    this.showTransactionModal.set(true);
  }

  closeTransactionModal() {
    this.showTransactionModal.set(false);
    this.selectedAccount.set(null);
    this.transactionMonto.set(null);
  }

  setFullAmount() {
    const acc = this.selectedAccount();
    if (acc) {
      this.transactionMonto.set(acc.saldo);
    }
  }

  async saveTransaction() {
    if (!this.isTransactionValid()) return;
    this.transactionLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const acc = this.selectedAccount();
    const monto = this.transactionMonto() || 0;

    try {
      if (this.transactionType() === 'cobro') {
        await this.carteraService.registrarCobro(acc.id, monto);
        this.successMessage.set(`Cobro por ${monto.toFixed(2)} registrado exitosamente para la factura ${acc.facturaVenta?.nroFactura || 'de venta'}.`);
      } else {
        await this.carteraService.registrarPago(acc.id, monto);
        this.successMessage.set(`Pago por ${monto.toFixed(2)} registrado exitosamente para la factura ${acc.facturaCompra?.nroFactura || 'de compra'}.`);
      }
      this.closeTransactionModal();
      await this.cargarCartera();
    } catch (error: any) {
      console.error('Error al registrar transacción:', error);
      this.errorMessage.set(error?.error || 'No se pudo registrar el cobro/pago. Verifique los fondos y el estado de la cuenta.');
    } finally {
      this.transactionLoading.set(false);
    }
  }
}
