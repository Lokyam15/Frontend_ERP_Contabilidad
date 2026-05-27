import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, FacturaVenta, DetalleFacturaVenta } from '../core/venta.service';
import { ProductoService, Producto } from '../core/producto.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Ventas</h2>
          <p class="text-slate-500 font-medium">Registro y gestión del historial de facturas de venta de la empresa.</p>
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

      <!-- Banner de Resumen Estadístico (Solo si hay empresa seleccionada) -->
      <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        
        <!-- Total Facturado -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 bg-erp-primary/10 rounded-2xl flex items-center justify-center text-erp-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Facturado</span>
            <p class="text-xl font-mono font-black text-slate-800 mt-0.5">{{ stats().totalFacturado | currency:'BOB':'symbol':'1.2-2' }}</p>
          </div>
        </div>

        <!-- Invoices Emitidas -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facturas Emitidas</span>
            <p class="text-xl font-black text-slate-800 mt-0.5">{{ stats().emitidasCount }}</p>
          </div>
        </div>

        <!-- Invoices Anuladas -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facturas Anuladas</span>
            <p class="text-xl font-black text-slate-800 mt-0.5">{{ stats().anuladasCount }}</p>
          </div>
        </div>

        <!-- Ventas al Crédito -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas al Crédito</span>
            <p class="text-xl font-black text-slate-800 mt-0.5">{{ stats().creditoCount }}</p>
          </div>
        </div>

      </div>

      <!-- Alertas de Éxito / Error -->
      <div *ngIf="successMessage()" class="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Operación Exitosa</h4>
          <p class="text-xs text-slate-650 mt-0.5">{{ successMessage() }}</p>
        </div>
        <button (click)="successMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <div *ngIf="errorMessage()" class="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h4 class="font-black text-sm text-slate-800">Error en Operación</h4>
          <p class="text-xs text-slate-650 mt-0.5">{{ errorMessage() }}</p>
        </div>
        <button (click)="errorMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <!-- SUPERADMIN sin empresa seleccionada -->
      <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
        <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para ver e ingresar facturas de venta, por favor seleccione una empresa en la esquina superior derecha.</p>
      </div>

      <!-- VISTA PRINCIPAL (SI HAY EMPRESA SELECCIONADA) -->
      <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">
        
        <!-- Barra de Herramientas (Buscador y Nueva Venta) -->
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <!-- Buscador -->
          <div class="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 min-w-[320px] w-full sm:w-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" 
                   placeholder="Buscar por nro factura, cliente o NIT..." 
                   class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
          </div>

          <!-- Botón Registrar Venta (Para roles autorizados) -->
          <button (click)="openCreateModal()"
                  class="w-full sm:w-auto px-6 py-4 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-lg shadow-erp-primary/20 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Nueva Venta
          </button>
        </div>

        <!-- Estado de Carga -->
        <div *ngIf="loadingData()" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando facturas de venta...</p>
        </div>

        <!-- Tabla de Facturas de Venta -->
        <div *ngIf="!loadingData() && filteredVentas().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                  <th class="p-6">Factura</th>
                  <th class="p-6">Fecha</th>
                  <th class="p-6">Cliente</th>
                  <th class="p-6 text-right">Subtotal / Desc.</th>
                  <th class="p-6 text-right">Impuestos (IVA / IT)</th>
                  <th class="p-6 text-right">Total / Neto</th>
                  <th class="p-6 text-center">Condición</th>
                  <th class="p-6 text-center">Estado</th>
                  <th class="p-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                <tr *ngFor="let venta of filteredVentas()" class="hover:bg-slate-50/30 transition-colors">
                  <td class="p-6">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-erp-primary/5 text-erp-primary rounded-xl flex items-center justify-center font-mono text-xs">
                        FV
                      </div>
                      <div>
                        <p class="text-slate-800 font-mono tracking-tight font-black">{{ venta.nroFactura }}</p>
                        <p class="text-slate-400 text-xs font-mono">ID: #{{ venta.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-6 text-slate-650">
                    {{ venta.fecha | date:'dd MMM yyyy' }}
                  </td>
                  <td class="p-6">
                    <p class="text-slate-800 font-black tracking-tight leading-tight">{{ venta.clienteNombre }}</p>
                    <p class="text-slate-400 text-xs font-mono">NIT: {{ venta.clienteNit }}</p>
                  </td>
                  <td class="p-6 text-right font-mono">
                    <p class="text-slate-700">{{ (venta.subtotal || 0) | currency:'BOB':'symbol':'1.2-2' }}</p>
                    <p class="text-rose-500 text-xs font-medium">-{{ (venta.descuento || 0) | currency:'BOB':'symbol':'1.2-2' }}</p>
                  </td>
                  <td class="p-6 text-right font-mono text-xs">
                    <p class="text-slate-500">IVA: {{ ((venta.total || 0) * 0.13) | currency:'BOB':'symbol':'1.2-2' }}</p>
                    <p class="text-slate-400 mt-0.5">IT: {{ ((venta.total || 0) * 0.03) | currency:'BOB':'symbol':'1.2-2' }}</p>
                  </td>
                  <td class="p-6 text-right font-mono">
                    <p class="text-slate-900 font-black">{{ (venta.total || 0) | currency:'BOB':'symbol':'1.2-2' }}</p>
                    <p class="text-emerald-600 text-xs font-medium">Neto: {{ ((venta.total || 0) * 0.87) | currency:'BOB':'symbol':'1.2-2' }}</p>
                  </td>
                  <td class="p-6 text-center">
                    <span [class]="venta.esCredito ? 
                                  'px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black uppercase border border-amber-100' : 
                                  'px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase border border-indigo-100'">
                      {{ venta.esCredito ? 'Crédito' : 'Contado' }}
                    </span>
                  </td>
                  <td class="p-6 text-center">
                    <span [class]="venta.estado === 'EMITIDA' ? 
                                  'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 
                                  'px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-black uppercase border border-rose-100'">
                      {{ venta.estado }}
                    </span>
                  </td>
                  <td class="p-6 text-right space-x-1.5 whitespace-nowrap">
                    <!-- Ver Detalle -->
                    <button (click)="openDetailModal(venta)" title="Ver Factura Completa"
                            class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </button>

                    <!-- Anular (Solo si es EMITIDA y rol permitido) -->
                    <button *ngIf="venta.estado === 'EMITIDA' && canAnnul()" (click)="confirmAnnul(venta)" title="Anular Factura"
                            class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all inline-flex items-center gap-1 text-[10px] font-black">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Anular
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estado Vacío -->
        <div *ngIf="!loadingData() && filteredVentas().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <h4 class="text-lg font-black text-slate-800">No se encontraron facturas de venta</h4>
          <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen registros de facturación de venta para los criterios ingresados.</p>
        </div>

      </div>
    </div>

    <!-- MODAL DE DETALLE COMPLETO DE FACTURA -->
    <div *ngIf="showDetailModal() && selectedVenta()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Factura de Venta</span>
            <h3 class="text-2xl font-black text-slate-800 leading-tight mt-0.5">Nro: {{ selectedVenta()?.nroFactura }}</h3>
          </div>
          <button (click)="closeDetailModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-8 max-h-[550px] overflow-y-auto">
          
          <!-- Fila de Metadatos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Razón Social</span>
              <p class="text-sm font-bold text-slate-800 mt-1 leading-tight">{{ selectedVenta()?.clienteNombre }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIT Cliente</span>
              <p class="text-sm font-mono font-bold text-slate-800 mt-1">{{ selectedVenta()?.clienteNit }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Emisión</span>
              <p class="text-sm font-bold text-slate-800 mt-1">{{ selectedVenta()?.fecha | date:'dd MMMM yyyy' }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condición de Pago</span>
              <p class="text-sm font-bold text-slate-800 mt-1">{{ selectedVenta()?.esCredito ? 'Crédito (30 Días)' : 'Contado inmediato' }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Factura</span>
              <div class="mt-1">
                <span [class]="selectedVenta()?.estado === 'EMITIDA' ? 
                              'px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100' : 
                              'px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs font-bold border border-rose-100'">
                  {{ selectedVenta()?.estado }}
                </span>
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Operación</span>
              <p class="text-sm font-mono font-bold text-slate-800 mt-1">#{{ selectedVenta()?.id }}</p>
            </div>

          </div>

          <!-- Detalles / Líneas de Venta -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Detalle de Líneas de Venta</h4>
            
            <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-150 text-slate-400 font-black uppercase tracking-wider">
                    <th class="p-4">Producto / Servicio</th>
                    <th class="p-4 text-center">Código</th>
                    <th class="p-4 text-right">Cantidad</th>
                    <th class="p-4 text-right">Precio Unitario</th>
                    <th class="p-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                  <tr *ngFor="let det of selectedVenta()?.detalles" class="hover:bg-slate-50/50">
                    <td class="p-4 text-slate-800 leading-tight">
                      {{ det.producto.nombre }}
                    </td>
                    <td class="p-4 text-center text-slate-500 font-mono">
                      {{ det.producto.codigo || '-' }}
                    </td>
                    <td class="p-4 text-right font-mono text-slate-900">
                      {{ det.cantidad }}
                    </td>
                    <td class="p-4 text-right font-mono text-slate-500">
                      {{ det.precioUnitario | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                    <td class="p-4 text-right font-mono text-slate-900">
                      {{ det.subtotal | currency:'BOB':'symbol':'1.2-2' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen de Totales y Mapeo Impositivo -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <!-- Glosa impositiva referencial -->
            <div class="bg-indigo-55/5 rounded-2xl p-5 border border-indigo-50 space-y-2 text-xs">
              <h5 class="font-black text-indigo-800 uppercase tracking-widest">Información Impositiva / Contable</h5>
              <p class="text-slate-550 leading-relaxed font-medium">
                Esta factura genera de forma automática un asiento contable en el libro diario.
              </p>
              <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-slate-600">
                <span>Débito IVA (13%):</span>
                <span class="text-right font-bold">{{ ((selectedVenta()?.total || 0) * 0.13) | currency:'BOB':'symbol':'1.2-2' }}</span>
                <span>Impuesto IT (3%):</span>
                <span class="text-right font-bold">{{ ((selectedVenta()?.total || 0) * 0.03) | currency:'BOB':'symbol':'1.2-2' }}</span>
                <span>Ingreso Neto (87%):</span>
                <span class="text-right font-black text-indigo-700">{{ ((selectedVenta()?.total || 0) * 0.87) | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>
            </div>

            <!-- Resumen numérico de la factura -->
            <div class="flex flex-col justify-center space-y-2.5 font-mono text-sm pr-4">
              <div class="flex justify-between text-slate-500 font-bold">
                <span>Subtotal Neto:</span>
                <span>{{ (selectedVenta()?.subtotal || 0) | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-rose-500 font-bold">
                <span>Descuento Comercial:</span>
                <span>-{{ (selectedVenta()?.descuento || 0) | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>
              <hr class="border-slate-100" />
              <div class="flex justify-between text-slate-900 text-base font-black">
                <span>Importe Total:</span>
                <span class="text-erp-primary">{{ (selectedVenta()?.total || 0) | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button (click)="closeDetailModal()" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-350 text-slate-750 font-black rounded-xl text-sm transition-all shadow-sm">
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL DE FORMULARIO: REGISTRAR NUEVA VENTA (EMISIÓN) -->
    <div *ngIf="showFormModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Facturación de Ventas</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">Emitir y Registrar Factura de Venta</h3>
          </div>
          <button (click)="closeFormModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body Form -->
        <form (ngSubmit)="saveVenta()" class="p-8 space-y-6">
          
          <!-- Sección Datos del Cliente y Factura -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            
            <!-- Nit Cliente -->
            <div class="flex flex-col gap-1.5 col-span-1">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                NIT Cliente <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="formModel.clienteNit" name="clienteNit" required
                     placeholder="Ej: 1029384756" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <!-- Razón Social -->
            <div class="flex flex-col gap-1.5 col-span-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                Cliente / Razón Social <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="formModel.clienteNombre" name="clienteNombre" required
                     placeholder="Ej: Daniel López Rojas" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <!-- Condición de Pago -->
            <div class="flex flex-col gap-1.5 col-span-1">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Condición de Pago</label>
              <select [(ngModel)]="formModel.esCredito" name="esCredito"
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all">
                <option [ngValue]="false">Contado</option>
                <option [ngValue]="true">Crédito (30 días)</option>
              </select>
            </div>

          </div>

          <!-- Sección Detalle de Factura (Líneas Dinámicas) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-3 bg-erp-primary rounded-full"></span>
                Detalle de Venta
              </h4>
              
              <!-- Botón Agregar Línea -->
              <button type="button" (click)="addLineItem()"
                      class="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-erp-primary border border-slate-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Línea
              </button>
            </div>

            <!-- Contenedor de Líneas -->
            <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-inner max-h-[220px] overflow-y-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-150 text-slate-400 font-black uppercase tracking-wider sticky top-0">
                    <th class="p-3 pl-4">Producto / Servicio <span class="text-red-500">*</span></th>
                    <th class="p-3 text-right w-28">Cantidad <span class="text-red-500">*</span></th>
                    <th class="p-3 text-right w-36">Precio Unitario ($) <span class="text-red-500">*</span></th>
                    <th class="p-3 text-right w-36">Subtotal</th>
                    <th class="p-3 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                  <tr *ngFor="let item of formModel.detalles; let idx = index" class="hover:bg-slate-50/30">
                    <!-- Selector de Producto -->
                    <td class="p-2 pl-4">
                      <select [(ngModel)]="item.producto.id" (change)="onProductChange(idx)" name="prod-{{idx}}" required
                              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-erp-primary focus:bg-white text-xs font-bold text-slate-700">
                        <option [value]="0" disabled>Selecciona un artículo...</option>
                        <option *ngFor="let p of activeCatalogProducts()" [value]="p.id">
                          {{ p.nombre }} ({{ p.codigo }}) {{ p.tipo === 'PRODUCTO' ? '[Stock: ' + p.stockActual + ']' : '[Servicio]' }}
                        </option>
                      </select>
                    </td>
                    
                    <!-- Cantidad -->
                    <td class="p-2">
                      <input type="number" [(ngModel)]="item.cantidad" (input)="recalculateTotals()" name="qty-{{idx}}" min="0.01" step="0.01" required
                             class="w-full px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-erp-primary focus:bg-white text-xs font-mono font-bold" />
                    </td>

                    <!-- Precio Unitario -->
                    <td class="p-2">
                      <input type="number" [(ngModel)]="item.precioUnitario" (input)="recalculateTotals()" name="price-{{idx}}" min="0" step="0.01" required
                             class="w-full px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-erp-primary focus:bg-white text-xs font-mono font-bold" />
                    </td>

                    <!-- Subtotal de la línea -->
                    <td class="p-2 text-right font-mono text-slate-800 pr-4">
                      {{ (item.cantidad * item.precioUnitario) | currency:'BOB':'symbol':'1.2-2' }}
                    </td>

                    <!-- Eliminar línea -->
                    <td class="p-2 text-center">
                      <button type="button" (click)="removeLineItem(idx)"
                              class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mensaje de Advertencia si no hay líneas -->
            <div *ngIf="formModel.detalles.length === 0" class="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs font-medium text-slate-500">
              No ha agregado ninguna línea de detalle a la factura de venta. Use el botón "Agregar Línea" de arriba.
            </div>
          </div>

          <!-- Totales y Descuento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <!-- Notas aclaratorias -->
            <div class="text-xs text-slate-500 leading-relaxed font-medium space-y-1">
              <p class="font-bold text-slate-500">Reglas comerciales:</p>
              <p>• Los totales impositivos y contables se calculan del neto final facturado.</p>
              <p>• Al emitir la factura se realiza el egreso de inventarios (Kardex) de los productos y se genera un asiento de partida doble.</p>
            </div>

            <!-- Sección Numérica de Totales -->
            <div class="flex flex-col justify-end space-y-3 font-mono text-sm max-w-sm ml-auto w-full pr-4">
              
              <!-- Subtotal calculado -->
              <div class="flex justify-between items-center text-slate-500 font-bold">
                <span>Subtotal Detalle:</span>
                <span class="font-mono">{{ calculatedSubtotal() | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>

              <!-- Descuento comercial input -->
              <div class="flex justify-between items-center text-slate-650 font-bold">
                <span class="flex items-center gap-1">Descuento ($):</span>
                <input type="number" [(ngModel)]="formModel.descuento" (input)="recalculateTotals()" name="descuento" min="0" step="0.01"
                       class="w-32 px-3 py-1.5 text-right bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-erp-primary focus:bg-white text-xs font-mono font-bold" />
              </div>

              <hr class="border-slate-100" />
              
              <!-- Total Factura final -->
              <div class="flex justify-between items-center text-slate-900 text-base font-black">
                <span>Total Factura:</span>
                <span class="text-erp-primary font-bold">{{ calculatedTotal() | currency:'BOB':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Botones de Acción Formulario -->
          <div class="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeFormModal()" 
                    class="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black rounded-xl text-sm transition-all">
              Descartar
            </button>
            <button type="submit" [disabled]="formLoading() || !isFormValid()"
                    class="px-8 py-3.5 bg-erp-primary text-white font-black rounded-xl text-sm flex items-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md shadow-erp-primary/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-95">
              <span *ngIf="formLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Emitir y Registrar Factura
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ANULACIÓN (PERMITIDO POR ROL) -->
    <div *ngIf="showConfirmModal() && ventaToAnnul()" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-erp-dark/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
         <div class="p-8 text-center space-y-6">
            
            <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-rose-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div class="space-y-2">
              <h3 class="text-xl font-black text-slate-900">¿Anular factura de venta?</h3>
              <p class="text-slate-500 text-sm font-medium leading-relaxed px-4">
                Estás seguro de que deseas anular la factura de venta <span class="text-slate-800 font-bold font-mono">"{{ ventaToAnnul()?.nroFactura }}"</span>.
                Esta acción revertirá los efectos operativos y contables asociados según la configuración del sistema.
              </p>
            </div>
            
            <div class="flex flex-col gap-3 pt-4">
              <button (click)="executeAnnul()" [disabled]="formLoading()"
                      class="w-full py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
                <span *ngIf="formLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Confirmar Anulación
              </button>
              <button (click)="closeAnnulModal()" [disabled]="formLoading()"
                      class="w-full py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all">
                Cancelar
              </button>
            </div>

         </div>
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
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private productoService = inject(ProductoService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);

  // Estados de perfil y rol
  isSuperAdmin = signal(false);
  userRole = signal<string>('');
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId = signal<number | null>(null);

  // Carga e historial
  loadingData = signal(true);
  searchQuery = signal('');
  ventas = signal<FacturaVenta[]>([]);

  // Catálogo de productos para el formulario de emisión
  catalogProducts = signal<Producto[]>([]);

  // Modales
  showDetailModal = signal(false);
  selectedVenta = signal<FacturaVenta | null>(null);

  showFormModal = signal(false);
  formLoading = signal(false);
  formModel: FacturaVenta = this.getEmptyFormModel();

  showConfirmModal = signal(false);
  ventaToAnnul = signal<FacturaVenta | null>(null);

  // Mensajes de feedback
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Filtros computados de facturas
  filteredVentas = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.ventas();

    if (!query) return list;

    return list.filter(v => 
      v.nroFactura?.toLowerCase().includes(query) ||
      v.clienteNombre.toLowerCase().includes(query) ||
      v.clienteNit.toLowerCase().includes(query) ||
      v.id?.toString().includes(query)
    );
  });

  // Estadísticas del listado filtrado
  stats = computed(() => {
    const list = this.filteredVentas();
    let totalFacturado = 0;
    let emitidasCount = 0;
    let anuladasCount = 0;
    let creditoCount = 0;

    list.forEach(v => {
      if (v.estado === 'EMITIDA') {
        totalFacturado += v.total || 0;
        emitidasCount++;
      } else if (v.estado === 'ANULADA') {
        anuladasCount++;
      }
      if (v.esCredito) {
        creditoCount++;
      }
    });

    return {
      totalFacturado,
      emitidasCount,
      anuladasCount,
      creditoCount
    };
  });

  // Productos del catálogo disponibles (activos)
  activeCatalogProducts = computed(() => {
    return this.catalogProducts().filter(p => p.estado);
  });

  // Totales dinámicos en el formulario de creación
  calculatedSubtotal = computed(() => {
    return this.formModel.detalles.reduce((acc, curr) => acc + (curr.cantidad * curr.precioUnitario), 0);
  });

  calculatedTotal = computed(() => {
    const discount = this.formModel.descuento || 0;
    return Math.max(0, this.calculatedSubtotal() - discount);
  });

  async ngOnInit() {
    await this.initPerfil();
    await this.cargarVentas();
    await this.cargarCatalogProducts();
  }

  async initPerfil() {
    try {
      const profile = await this.userService.getMyProfile();
      this.userRole.set(profile.rol?.nombre || '');
      const superAdmin = this.userRole() === 'SUPERADMIN';
      this.isSuperAdmin.set(superAdmin);

      if (superAdmin) {
        const list = await this.empresaService.getAllEmpresas();
        this.empresas.set(list);
      } else {
        this.selectedEmpresaId.set(profile.idEmpresa || null);
      }
    } catch (error) {
      console.error('Error al inicializar perfil en ventas:', error);
    }
  }

  async cargarVentas() {
    const empId = this.selectedEmpresaId();
    if (this.isSuperAdmin() && !empId) {
      this.loadingData.set(false);
      this.ventas.set([]);
      return;
    }

    this.loadingData.set(true);
    try {
      const list = await this.ventaService.getVentas(
        this.isSuperAdmin() ? (empId || undefined) : undefined
      );
      // Ordenar por ID descendente para ver las últimas primero
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
      this.ventas.set(list);
    } catch (error: any) {
      console.error('Error al cargar ventas:', error);
      this.errorMessage.set(error?.error || 'No se pudo obtener el historial de ventas.');
    } finally {
      this.loadingData.set(false);
    }
  }

  async cargarCatalogProducts() {
    const empId = this.selectedEmpresaId();
    if (this.isSuperAdmin() && !empId) {
      this.catalogProducts.set([]);
      return;
    }

    try {
      const list = await this.productoService.getProductos(
        this.isSuperAdmin() ? (empId || undefined) : undefined
      );
      this.catalogProducts.set(list);
    } catch (error) {
      console.error('Error al cargar catálogo de productos:', error);
    }
  }

  onEmpresaChange(event: any) {
    const val = Number(event.target.value);
    this.selectedEmpresaId.set(val > 0 ? val : null);
    this.cargarVentas();
    this.cargarCatalogProducts();
  }

  // Permisos basados en Roles
  canAnnul(): boolean {
    const role = this.userRole();
    return role === 'SUPERADMIN' || role === 'ADMIN' || role === 'CONTADOR';
  }

  // Modales Detalle
  openDetailModal(venta: FacturaVenta) {
    this.selectedVenta.set(venta);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedVenta.set(null);
  }

  // Modales Registro Venta (Formulario)
  openCreateModal() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.formModel = this.getEmptyFormModel();
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.formLoading.set(false);
  }

  // Manejo de detalles dinámicos en formulario
  addLineItem() {
    const details = [...this.formModel.detalles];
    details.push({
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
      producto: {
        id: 0
      }
    });
    this.formModel.detalles = details;
    this.recalculateTotals();
  }

  removeLineItem(idx: number) {
    const details = [...this.formModel.detalles];
    details.splice(idx, 1);
    this.formModel.detalles = details;
    this.recalculateTotals();
  }

  onProductChange(idx: number) {
    const details = [...this.formModel.detalles];
    const item = details[idx];
    const prodId = Number(item.producto.id);
    
    const prod = this.catalogProducts().find(p => p.id === prodId);
    if (prod) {
      item.precioUnitario = prod.precioVenta;
      item.producto.codigo = prod.codigo;
      item.producto.nombre = prod.nombre;
    }
    
    this.formModel.detalles = details;
    this.recalculateTotals();
  }

  recalculateTotals() {
    // Forzar actualización de cómputos recalculando
    this.formModel.detalles.forEach(item => {
      item.subtotal = item.cantidad * item.precioUnitario;
    });
    this.formModel.subtotal = this.calculatedSubtotal();
    this.formModel.total = this.calculatedTotal();
  }

  isFormValid(): boolean {
    const model = this.formModel;
    if (!model.clienteNombre || !model.clienteNombre.trim()) return false;
    if (!model.clienteNit || !model.clienteNit.trim()) return false;
    if (model.detalles.length === 0) return false;
    
    // Validar cada línea
    for (const item of model.detalles) {
      if (!item.producto.id || item.producto.id === 0) return false;
      if (item.cantidad <= 0) return false;
      if (item.precioUnitario < 0) return false;
    }

    if (this.calculatedTotal() <= 0) return false;

    return true;
  }

  async saveVenta() {
    if (!this.isFormValid()) {
      this.errorMessage.set('Existen campos obligatorios sin completar o con valores inválidos.');
      return;
    }

    this.formLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Si es superadmin, asignar la empresa seleccionada al payload
    if (this.isSuperAdmin()) {
      this.formModel.idEmpresa = this.selectedEmpresaId() || undefined;
    }

    // Setear subtotales reales al enviar
    this.recalculateTotals();

    try {
      const registrada = await this.ventaService.registrarVenta(this.formModel);
      this.successMessage.set(
        `Factura de venta emitida y registrada correctamente. Nro Factura: ${registrada.nroFactura}`
      );
      this.closeFormModal();
      await this.cargarVentas();
    } catch (error: any) {
      console.error('Error al registrar venta:', error);
      this.errorMessage.set(
        error?.error || 'Ocurrió un error al registrar la factura de venta en el servidor.'
      );
    } finally {
      this.formLoading.set(false);
    }
  }

  // Modales Confirmación Anulación
  confirmAnnul(venta: FacturaVenta) {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.ventaToAnnul.set(venta);
    this.showConfirmModal.set(true);
  }

  closeAnnulModal() {
    this.showConfirmModal.set(false);
    this.ventaToAnnul.set(null);
    this.formLoading.set(false);
  }

  async executeAnnul() {
    const v = this.ventaToAnnul();
    if (!v || !v.id) return;

    this.formLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      await this.ventaService.anularVenta(v.id);
      this.successMessage.set(`La factura de venta Nro: "${v.nroFactura}" ha sido anulada con éxito.`);
      this.closeAnnulModal();
      await this.cargarVentas();
    } catch (error: any) {
      console.error('Error al anular venta:', error);
      this.errorMessage.set(
        error?.error || 'Ocurrió un error al intentar anular la factura en el servidor.'
      );
    } finally {
      this.formLoading.set(false);
    }
  }

  private getEmptyFormModel(): FacturaVenta {
    return {
      clienteNombre: '',
      clienteNit: '',
      esCredito: false,
      descuento: 0,
      detalles: []
    };
  }
}
