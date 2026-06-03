import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Librerías de exportación y visualización
import * as XLSX from 'xlsx';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const vfs = (pdfFonts as any)?.pdfMake?.vfs || (pdfFonts as any)?.vfs || (window as any).pdfMake?.vfs || (pdfMake as any).vfs;
if (vfs) {
  (pdfMake as any).vfs = vfs;
}

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
Chart.register(...registerables);

// Servicios locales
import { ReportesService, ReporteCriterios, ReporteQbeQuery } from '../core/reportes.service';
import { SuscripcionCapabilitiesService } from '../core/suscripcion-capabilities.service';
import { UserService } from '../core/user.service';
import { ProductoService, Producto } from '../core/producto.service';
import { ContabilidadService } from '../core/contabilidad.service';
import { CriteriosModalComponent } from './criterios-modal.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CriteriosModalComponent, BaseChartDirective],
  template: `
    <div class="animate-fade-in space-y-6 pb-20">
      
      <!-- Encabezado Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Centro de Reportes</h2>
          <p class="text-slate-500 font-medium">Consulte, analice y exporte información comercial, de cartera y contable de su empresa.</p>
        </div>
      </div>

      <!-- Contenedor Principal en Rejilla (Sidebar + Detalle) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <!-- BARRA LATERAL: Selección de Módulo -->
        <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 lg:col-span-1">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Módulos Disponibles</span>
          
          <div class="space-y-1">
            <button *ngFor="let tab of tabs" 
                    (click)="selectTab(tab.id)"
                    [class]="activeTab() === tab.id ? 
                             'w-full flex items-center justify-between p-3.5 bg-erp-primary/10 text-erp-primary font-black rounded-2xl text-sm transition-all text-left' : 
                             'w-full flex items-center justify-between p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-2xl text-sm transition-all text-left'">
              <div class="flex items-center gap-3">
                <span [innerHTML]="tab.icon"></span>
                <span>{{ tab.label }}</span>
              </div>
              <span *ngIf="isTabLocked(tab.id)" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md">
                🔒 Lock
              </span>
            </button>
          </div>
        </div>

        <!-- DETALLE / CONTENIDO: Reportes -->
        <div class="lg:col-span-3 space-y-6">
          
          <!-- Si el módulo seleccionado está BLOQUEADO por Plan SaaS -->
          <div *ngIf="isTabLocked(activeTab())" class="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm text-center space-y-5 animate-scale-up">
            <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-black text-slate-800">Módulo Restringido</h3>
              <p class="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Su plan de suscripción actual no incluye el módulo de <span class="font-bold text-slate-700 capitalize">{{ activeTab() }}</span>.
                Mejore su plan para desbloquear todas las herramientas de visualización y reportabilidad comercial.
              </p>
            </div>
            <button (click)="goToSubscription()" 
                    class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95">
              Mejorar Mi Suscripción
            </button>
          </div>

          <!-- Si el módulo está HABILITADO -->
          <div *ngIf="!isTabLocked(activeTab())" class="space-y-6">
            
            <!-- Barra de control del reporte (Tipo de reporte + botones de criterios) -->
            <div *ngIf="activeTab() !== 'qbe'" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <!-- Selector de Tipo: Analítico vs Gerencial -->
              <div class="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button (click)="setTipoReporte('analitico')"
                        [class]="tipoReporte() === 'analitico' ? 
                                 'flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 font-black rounded-lg text-xs shadow-sm transition-all' : 
                                 'flex-1 sm:flex-none px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-lg text-xs transition-all'">
                  Analítico (Detallado)
                </button>
                <button (click)="setTipoReporte('gerencial')"
                        [class]="tipoReporte() === 'gerencial' ? 
                                 'flex-1 sm:flex-none px-4 py-2 bg-white text-slate-800 font-black rounded-lg text-xs shadow-sm transition-all' : 
                                 'flex-1 sm:flex-none px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-lg text-xs transition-all'">
                  Gerencial (Dashboard)
                </button>
              </div>

              <!-- Acciones de Filtro y Exportación -->
              <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button (click)="openFiltrosModal()" 
                        class="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Configurar Filtros
                </button>
                
                <button *ngIf="tipoReporte() === 'analitico' && hasData()" (click)="exportarExcelDirecto()"
                        class="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm">
                  Excel
                </button>
                
                <button *ngIf="hasData()" (click)="exportarPdfDirecto()"
                        class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm">
                  PDF
                </button>
              </div>
            </div>

            <!-- BADGE BOX: Filtros Aplicados Activos -->
            <div *ngIf="activeTab() !== 'qbe' && hasFiltrosActivos()" class="bg-indigo-50/30 border border-indigo-100/50 p-3.5 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
              <span class="font-black text-indigo-700 uppercase tracking-wider text-[10px]">Filtros Activos:</span>
              
              <span *ngIf="appliedCriterios.fechaDesde || appliedCriterios.fechaHasta" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold font-mono">
                📅 Rango: {{ appliedCriterios.fechaDesde || 'Inicio' }} al {{ appliedCriterios.fechaHasta || 'Fin' }}
              </span>
              
              <span *ngIf="appliedCriterios.clienteNombre" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold">
                👤 Cliente: {{ appliedCriterios.clienteNombre }}
              </span>

              <span *ngIf="appliedCriterios.proveedorNombre" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold">
                👤 Proveedor: {{ appliedCriterios.proveedorNombre }}
              </span>

              <span *ngIf="appliedCriterios.productoId" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold">
                📦 Producto ID: {{ appliedCriterios.productoId }}
              </span>

              <span *ngIf="appliedCriterios.estado" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold uppercase">
                ⚙️ Estado: {{ appliedCriterios.estado }}
              </span>
            </div>

            <!-- RESULTADO DEL REPORTE -->
            <div class="space-y-6">

              <!-- Carga de datos -->
              <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div class="w-10 h-10 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Generando información...</p>
              </div>

              <!-- Si no hay datos y no se ha generado nada -->
              <div *ngIf="!loading() && !hasData() && activeTab() !== 'qbe'" class="bg-white p-12 rounded-3xl border border-slate-100 border-dashed text-center space-y-3">
                <div class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 00-4-4H3m18 6v-2a4 4 0 00-4-4h-2m-4 12a3 3 0 100-6 3 3 0 000 6zm-7-6a3 3 0 11-6 0 3 3 0 016 0zm7-3a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h4 class="text-base font-black text-slate-800">Configure los criterios de visualización</h4>
                <p class="text-slate-400 text-xs font-semibold max-w-xs mx-auto">Haga clic en el botón "Configurar Filtros" superior para elegir los parámetros y generar el reporte.</p>
              </div>

              <!-- VISTAS REPORTE ANALÍTICO (TABLAS) -->
              <div *ngIf="!loading() && hasData() && tipoReporte() === 'analitico' && activeTab() !== 'qbe'" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-scale-up">
                
                <!-- Reporte Ventas Analítico -->
                <div *ngIf="activeTab() === 'ventas'" class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-5 pl-6">Factura</th>
                        <th class="p-5">Fecha</th>
                        <th class="p-5">Cliente</th>
                        <th class="p-5 text-right">Subtotal</th>
                        <th class="p-5 text-right">Descuento</th>
                        <th class="p-5 text-right">Total Factura</th>
                        <th class="p-5 text-center">Condición</th>
                        <th class="p-5 text-center pr-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      <tr *ngFor="let item of dataRows" class="hover:bg-slate-50/20">
                        <td class="p-5 pl-6 font-mono font-black text-slate-800">{{ item.nroFactura }}</td>
                        <td class="p-5 text-slate-500 font-semibold">{{ item.fecha }}</td>
                        <td class="p-5">{{ item.clienteNombre }} <span class="block text-[10px] text-slate-400 font-mono mt-0.5">NIT: {{ item.clienteNit }}</span></td>
                        <td class="p-5 text-right font-mono">{{ item.subtotal | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-rose-500">-{{ item.descuento | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono font-black text-slate-900">{{ item.total | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-center">
                          <span [class]="item.esCredito ? 'px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] uppercase font-black' : 'px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] uppercase font-black'">
                            {{ item.esCredito ? 'Crédito' : 'Contado' }}
                          </span>
                        </td>
                        <td class="p-5 text-center pr-6">
                          <span [class]="item.estado === 'EMITIDA' ? 'px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] uppercase font-black' : 'px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[10px] uppercase font-black'">
                            {{ item.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <!-- Footer Totales -->
                    <tfoot class="bg-slate-50/50 border-t border-slate-100 text-xs font-black text-slate-800">
                      <tr>
                        <td colspan="3" class="p-5 text-slate-500">TOTAL FACTURADO (EMITIDAS)</td>
                        <td class="p-5 text-right font-mono">{{ getSum('subtotal') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-rose-500">-{{ getSum('descuento') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-erp-primary text-sm">{{ getSum('total') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td colspan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Reporte Compras Analítico -->
                <div *ngIf="activeTab() === 'compras'" class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-5 pl-6">Factura</th>
                        <th class="p-5">Fecha</th>
                        <th class="p-5">Proveedor</th>
                        <th class="p-5 text-right">Subtotal</th>
                        <th class="p-5 text-right">Descuento</th>
                        <th class="p-5 text-right">Total Compra</th>
                        <th class="p-5 text-center pr-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      <tr *ngFor="let item of dataRows" class="hover:bg-slate-50/20">
                        <td class="p-5 pl-6 font-mono font-black text-slate-800">{{ item.nroFactura }}</td>
                        <td class="p-5 text-slate-500 font-semibold">{{ item.fecha }}</td>
                        <td class="p-5">{{ item.proveedorNombre }} <span class="block text-[10px] text-slate-400 font-mono mt-0.5">NIT: {{ item.proveedorNit }}</span></td>
                        <td class="p-5 text-right font-mono">{{ item.subtotal | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-rose-500">-{{ item.descuento | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono font-black text-slate-900">{{ item.total | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-center pr-6">
                          <span [class]="item.estado === 'REGISTRADA' || item.estado === 'EMITIDA' ? 'px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] uppercase font-black' : 'px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[10px] uppercase font-black'">
                            {{ item.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="bg-slate-50/50 border-t border-slate-100 text-xs font-black text-slate-800">
                      <tr>
                        <td colspan="3" class="p-5 text-slate-500">TOTAL COMPRADO (REGISTRADAS)</td>
                        <td class="p-5 text-right font-mono">{{ getSum('subtotal') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-rose-500">-{{ getSum('descuento') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono text-erp-primary text-sm">{{ getSum('total') | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Reporte Inventario Analítico (Kardex) -->
                <div *ngIf="activeTab() === 'inventario'" class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-5 pl-6">Fecha Movimiento</th>
                        <th class="p-5">Tipo</th>
                        <th class="p-5 text-right">Cantidad</th>
                        <th class="p-5">Documento Origen</th>
                        <th class="p-5 text-center">Referencia ID</th>
                        <th class="p-5 text-right pr-6">Saldo Físico</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      <tr *ngFor="let item of dataRows" class="hover:bg-slate-50/20">
                        <td class="p-5 pl-6 text-slate-500 font-semibold">{{ item.fecha | date:'dd MMM yyyy HH:mm' }}</td>
                        <td class="p-5">
                          <span [class]="item.tipo === 'ENTRADA' ? 'px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] uppercase font-black' : 'px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] uppercase font-black'">
                            {{ item.tipo }}
                          </span>
                        </td>
                        <td class="p-5 text-right font-mono" [class]="item.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'">
                          {{ item.tipo === 'ENTRADA' ? '+' : '-' }}{{ item.cantidad }}
                        </td>
                        <td class="p-5 text-slate-600">{{ item.documentoOrigen }}</td>
                        <td class="p-5 text-center font-mono text-slate-400">#{{ item.origenId }}</td>
                        <td class="p-5 text-right font-mono font-black text-slate-900 pr-6">{{ item.saldoAcumulado }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Reporte Cartera Analítico -->
                <div *ngIf="activeTab() === 'cartera'" class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-5 pl-6">ID Cuenta</th>
                        <th class="p-5">Factura Relac.</th>
                        <th class="p-5 text-right">Monto Total</th>
                        <th class="p-5 text-right">Saldo Pendiente</th>
                        <th class="p-5">Fecha Vencimiento</th>
                        <th class="p-5 text-center pr-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      <tr *ngFor="let item of dataRows" class="hover:bg-slate-50/20">
                        <td class="p-5 pl-6 font-mono text-slate-400">#{{ item.id }}</td>
                        <td class="p-5 font-mono font-black text-slate-800">{{ item.facturaVenta?.nroFactura || item.facturaCompra?.nroFactura || 'S/N' }}</td>
                        <td class="p-5 text-right font-mono text-slate-600">{{ item.montoTotal | currency:'BOB':'symbol':'1.2-2' }}</td>
                        <td class="p-5 text-right font-mono font-black" [class]="item.saldo > 0 ? 'text-amber-600' : 'text-emerald-600'">
                          {{ item.saldo | currency:'BOB':'symbol':'1.2-2' }}
                        </td>
                        <td class="p-5 text-slate-500 font-semibold">{{ item.fechaVencimiento }}</td>
                        <td class="p-5 text-center pr-6">
                          <span [class]="item.estado === 'PENDIENTE' ? 'px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] uppercase font-black' : 
                                         item.estado === 'PAGADO' ? 'px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] uppercase font-black' : 
                                         'px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] uppercase font-black'">
                            {{ item.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Reporte Contabilidad Analítico -->
                <div *ngIf="activeTab() === 'contabilidad'" class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th class="p-5 pl-6">Asiento</th>
                        <th class="p-5">Fecha</th>
                        <th class="p-5">Glosa / Cuenta</th>
                        <th class="p-5 text-right">Debe</th>
                        <th class="p-5 text-right">Haber</th>
                        <th class="p-5 text-center pr-6">Origen</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-xs text-slate-700">
                      <!-- Renderizado agrupado por Asiento -->
                      <ng-container *ngFor="let ast of dataRows">
                        <!-- Cabecera del Asiento -->
                        <tr class="bg-slate-50/30 font-black border-y border-slate-100">
                          <td class="p-4 pl-6 font-mono text-slate-900 text-sm" colspan="2">{{ ast.nroAsiento }}</td>
                          <td class="p-4 text-slate-800">{{ ast.glosa }}</td>
                          <td colspan="2"></td>
                          <td class="p-4 text-center pr-6 text-[10px] text-slate-400 font-mono uppercase">{{ ast.origenDocumento || 'MANUAL' }}</td>
                        </tr>
                        <!-- Detalles de Cuentas -->
                        <tr *ngFor="let det of ast.detalles" class="hover:bg-slate-50/10 font-bold border-b border-slate-50">
                          <td colspan="2"></td>
                          <td class="p-3 pl-8 text-slate-600">
                            {{ det.cuentaContable?.codigo }} - {{ det.cuentaContable?.nombre }}
                          </td>
                          <td class="p-3 text-right font-mono text-slate-800">
                            {{ det.debe > 0 ? (det.debe | currency:'BOB':'symbol':'1.2-2') : '' }}
                          </td>
                          <td class="p-3 text-right font-mono text-slate-800">
                            {{ det.haber > 0 ? (det.haber | currency:'BOB':'symbol':'1.2-2') : '' }}
                          </td>
                          <td class="pr-6"></td>
                        </tr>
                      </ng-container>
                    </tbody>
                  </table>
                </div>

              </div>

              <!-- VISTAS REPORTE GERENCIAL (KPIs + GRÁFICOS) -->
              <div *ngIf="!loading() && hasData() && tipoReporte() === 'gerencial' && activeTab() !== 'qbe'" class="space-y-6 animate-fade-in">
                
                <!-- KPIs de Ventas y Compras -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <!-- KPI 1 -->
                  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-10 h-10 bg-erp-primary/10 text-erp-primary rounded-xl flex items-center justify-center">
                      $
                    </div>
                    <div>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Transado</span>
                      <p class="text-base font-black text-slate-800 font-mono mt-0.5">{{ gerencialData.kpis?.totalMonto | currency:'BOB':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <!-- KPI 2 -->
                  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-10 h-10 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center">
                      %
                    </div>
                    <div>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Descuentos</span>
                      <p class="text-base font-black text-slate-800 font-mono mt-0.5">{{ gerencialData.kpis?.descuentosTotal | currency:'BOB':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <!-- KPI 3 -->
                  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center">
                      📈
                    </div>
                    <div>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        {{ activeTab() === 'ventas' ? 'Rentabilidad Bruta Est.' : 'Ahorro por Descuento' }}
                      </span>
                      <p class="text-base font-black text-emerald-700 font-mono mt-0.5">+{{ gerencialData.kpis?.rentabilidadEst || '0.00%' }}</p>
                    </div>
                  </div>

                  <!-- KPI 4 -->
                  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Operaciones Realizadas</span>
                      <p class="text-base font-black text-slate-800 font-mono mt-0.5">{{ gerencialData.kpis?.conteoRegistros }} registros</p>
                    </div>
                  </div>
                </div>

                <!-- Gráficos Gerenciales -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <!-- Tendencia Temporal -->
                  <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 class="text-sm font-black text-slate-800 mb-4 tracking-tight">Tendencia del Periodo (Monto Acumulado)</h4>
                    <div class="h-64 flex items-center justify-center">
                      <canvas baseChart 
                              [data]="lineChartData" 
                              [options]="chartOptions"
                              [type]="'line'">
                      </canvas>
                    </div>
                  </div>

                  <!-- Distribución de Participación (Top Ventas o Proveedores) -->
                  <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 class="text-sm font-black text-slate-800 mb-4 tracking-tight">Distribución de Participación por Cliente/Proveedor</h4>
                    <div class="h-64 flex items-center justify-center">
                      <canvas baseChart 
                              [data]="barChartData" 
                              [options]="chartOptions"
                              [type]="'bar'">
                      </canvas>
                    </div>
                  </div>

                </div>

              </div>

              <!-- VISTA CONSTRUCTOR QBE (DINÁMICO) -->
              <div *ngIf="activeTab() === 'qbe'" class="space-y-6">
                
                <!-- Constructor Panel -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div class="flex items-center gap-2 border-b pb-4">
                    <div class="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <h3 class="text-base font-black text-slate-800">Constructor de Consulta QBE</h3>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- 1. Origen de datos -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-black text-slate-400 uppercase tracking-widest">1. Origen de Datos</label>
                      <select [(ngModel)]="qbeQuery.origen" (change)="onQbeOrigenChange()"
                              class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary">
                        <option value="VENTAS">Ventas / Facturas de Venta</option>
                        <option value="COMPRAS">Compras / Facturas de Compra</option>
                        <option value="INVENTARIO">Inventario / Movimientos</option>
                      </select>
                    </div>

                    <!-- 2. Columnas a proyectar -->
                    <div class="flex flex-col gap-1.5 md:col-span-2">
                      <label class="text-xs font-black text-slate-400 uppercase tracking-widest">2. Columnas a Mostrar en Tabla</label>
                      <div class="flex flex-wrap gap-2 pt-1">
                        <button *ngFor="let col of qbeColumns[qbeQuery.origen]"
                                type="button" (click)="toggleQbeColumna(col.field)"
                                [class]="isQbeColumnaSelect(col.field) ? 
                                         'px-3 py-1.5 bg-erp-primary/10 border border-erp-primary text-erp-primary rounded-lg text-xs font-bold transition-all active:scale-95' : 
                                         'px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-all active:scale-95'">
                          {{ col.label }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 3. Reglas de Filtrado -->
                  <div class="space-y-3 pt-4 border-t">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-black text-slate-400 uppercase tracking-widest">3. Condiciones de Filtrado (Filtros)</label>
                      <button type="button" (click)="addQbeFiltro()"
                              class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-erp-primary rounded-lg text-xs font-black transition-all flex items-center gap-1">
                        + Agregar Filtro
                      </button>
                    </div>

                    <div *ngIf="qbeQuery.filtros.length === 0" class="text-center py-6 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs">
                      No hay filtros aplicados. La consulta traerá todos los registros.
                    </div>

                    <div class="space-y-2">
                      <div *ngFor="let filter of qbeQuery.filtros; let idx = index" class="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150 animate-fade-in">
                        <!-- Campo -->
                        <select [(ngModel)]="filter.campo"
                                class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none">
                          <option *ngFor="let col of qbeColumns[qbeQuery.origen]" [value]="col.field">{{ col.label }}</option>
                        </select>
                        
                        <!-- Operador -->
                        <select [(ngModel)]="filter.operador"
                                class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none">
                          <option value="EQUAL">Es Igual A</option>
                          <option value="LIKE">Contiene</option>
                          <option value="GREATER_THAN">Mayor Que</option>
                          <option value="LESS_THAN">Menor Que</option>
                        </select>

                        <!-- Valor -->
                        <input type="text" [(ngModel)]="filter.valor" placeholder="Valor de coincidencia..."
                               class="flex-1 min-w-[120px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-erp-primary" />
                        
                        <!-- Eliminar regla -->
                        <button type="button" (click)="removeQbeFiltro(idx)" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Footer del constructor -->
                  <div class="pt-4 border-t flex justify-end gap-3">
                    <button *ngIf="qbeResult.length > 0" (click)="exportarQbeExcel()"
                            class="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1">
                      Descargar Excel
                    </button>
                    
                    <button (click)="ejecutarQbeQuery()"
                            class="px-5 py-2.5 bg-erp-primary hover:bg-erp-primary-hover text-white font-black rounded-xl text-xs transition-all shadow-md shadow-erp-primary/20 active:scale-95 flex items-center gap-2">
                      Ejecutar Consulta QBE
                    </button>
                  </div>
                </div>

                <!-- Resultados QBE -->
                <div *ngIf="qbeResult.length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-scale-up">
                  <div class="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                    <span class="text-xs font-black text-slate-500 uppercase tracking-wider">Registros Obtenidos: {{ qbeResult.length }}</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                          <th *ngFor="let col of qbeQuery.columnas" class="p-4 first:pl-6">{{ getQbeColLabel(col) }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                        <tr *ngFor="let row of qbeResult" class="hover:bg-slate-50/10">
                          <td *ngFor="let col of qbeQuery.columnas" class="p-4 first:pl-6">
                            <!-- Si es booleano o especial le damos formato -->
                            <ng-container *ngIf="col === 'esCredito' || col === 'credito'">
                              <span [class]="row[col] ? 'px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black' : 'px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black'">
                                {{ row[col] ? 'Crédito' : 'Contado' }}
                              </span>
                            </ng-container>
                            <ng-container *ngIf="col !== 'esCredito' && col !== 'credito'">
                              {{ row[col] }}
                            </ng-container>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div *ngIf="qbeRan() && qbeResult.length === 0" class="bg-white p-12 rounded-3xl border border-slate-100 border-dashed text-center space-y-3">
                  <h4 class="text-base font-black text-slate-800">No se encontraron coincidencias</h4>
                  <p class="text-slate-400 text-xs font-medium max-w-xs mx-auto">Pruebe modificando los operadores o reduciendo los filtros en el constructor.</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- MODAL DE CRITERIOS -->
    <app-criterios-modal [open]="filtrosModalOpen()"
                         [modulo]="activeTab()"
                         [carteraTipo]="carteraTipo()"
                         (onClose)="closeFiltrosModal()"
                         (onApply)="applyFiltros($event)">
    </app-criterios-modal>
  `,
  styles: [`
    :host { display: block; }
    .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private capabilitiesService = inject(SuscripcionCapabilitiesService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Tabs de configuración lateral
  public tabs = [
    { id: 'ventas', label: 'Ventas Comerciales', icon: '💸' },
    { id: 'compras', label: 'Compras & Costos', icon: '🛒' },
    { id: 'inventario', label: 'Inventario (Kardex)', icon: '📦' },
    { id: 'cartera', label: 'Cartera (Saldos)', icon: '💼' },
    { id: 'contabilidad', label: 'Libro Diario Contable', icon: '📖' },
    { id: 'qbe', label: 'Constructor QBE', icon: '🛠️' }
  ];

  public activeTab = signal<string>('ventas');
  public tipoReporte = signal<'analitico' | 'gerencial'>('analitico');
  
  // Modales y cargas
  public filtrosModalOpen = signal(false);
  public loading = signal(false);

  // Criterios Aplicados en el reporte actual
  public appliedCriterios: ReporteCriterios = {};
  public carteraTipo = signal<'COBRAR' | 'PAGAR'>('COBRAR');

  // Datos del reporte (Filas planas de tablas)
  public dataRows: any[] = [];
  
  // Datos del reporte gerencial
  public gerencialData: any = {};

  // Parámetros QBE
  public qbeQuery: ReporteQbeQuery = {
    origen: 'VENTAS',
    columnas: ['fecha', 'nroFactura', 'clienteNombre', 'total'],
    filtros: []
  };
  public qbeResult: any[] = [];
  public qbeRan = signal(false);

  // Columnas disponibles en QBE por origen
  public qbeColumns: Record<string, { field: string; label: string }[]> = {
    VENTAS: [
      { field: 'id', label: 'ID Factura' },
      { field: 'nroFactura', label: 'Nro Factura' },
      { field: 'fecha', label: 'Fecha' },
      { field: 'clienteNombre', label: 'Nombre Cliente' },
      { field: 'clienteNit', label: 'NIT Cliente' },
      { field: 'subtotal', label: 'Subtotal' },
      { field: 'descuento', label: 'Descuento' },
      { field: 'total', label: 'Total Facturado' },
      { field: 'esCredito', label: 'Es Crédito' },
      { field: 'estado', label: 'Estado' }
    ],
    COMPRAS: [
      { field: 'id', label: 'ID Factura' },
      { field: 'nroFactura', label: 'Nro Factura' },
      { field: 'fecha', label: 'Fecha' },
      { field: 'proveedorNombre', label: 'Nombre Proveedor' },
      { field: 'proveedorNit', label: 'NIT Proveedor' },
      { field: 'subtotal', label: 'Subtotal' },
      { field: 'descuento', label: 'Descuento' },
      { field: 'total', label: 'Total Compra' },
      { field: 'estado', label: 'Estado' }
    ],
    INVENTARIO: [
      { field: 'id', label: 'ID Movimiento' },
      { field: 'fecha', label: 'Fecha' },
      { field: 'tipo', label: 'Tipo (ENTRADA/SALIDA)' },
      { field: 'cantidad', label: 'Cantidad' },
      { field: 'documentoOrigen', label: 'Documento Origen' },
      { field: 'origenId', label: 'Origen ID' }
    ]
  };

  // Configuración de Gráficos (Chart.js)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  ngOnInit() {
    // Al iniciar, inicializar filtros
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.appliedCriterios = {
      fechaDesde: this.formatDate(primerDia),
      fechaHasta: this.formatDate(hoy),
      estado: 'TODOS'
    };
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Verifica si el módulo está bloqueado en base a capacidades SaaS
  isTabLocked(tabId: string): boolean {
    if (tabId === 'qbe') return false; // El constructor QBE es visible
    return !this.capabilitiesService.hasAccessToModule(tabId);
  }

  goToSubscription() {
    this.router.navigate(['/dashboard/suscripcion']);
  }

  selectTab(tabId: string) {
    this.activeTab.set(tabId);
    this.dataRows = [];
    this.gerencialData = {};
    this.qbeResult = [];
    this.qbeRan.set(false);
    
    if (tabId === 'cartera') {
      this.carteraTipo.set('COBRAR');
    }
  }

  setTipoReporte(tipo: 'analitico' | 'gerencial') {
    this.tipoReporte.set(tipo);
    this.dataRows = [];
    this.gerencialData = {};
  }

  openFiltrosModal() {
    this.filtrosModalOpen.set(true);
  }

  closeFiltrosModal() {
    this.filtrosModalOpen.set(false);
  }

  hasFiltrosActivos(): boolean {
    return Object.keys(this.appliedCriterios).length > 0;
  }

  hasData(): boolean {
    return this.dataRows.length > 0 || Object.keys(this.gerencialData).length > 0;
  }

  getSum(field: string): number {
    return this.dataRows
      .filter(row => row.estado !== 'ANULADA')
      .reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  }

  // Criterios Aplicados desde el Modal
  async applyFiltros(event: { criterios: any; salida: 'pantalla' | 'pdf' | 'excel' }) {
    this.closeFiltrosModal();
    this.appliedCriterios = event.criterios;
    
    if (event.salida === 'pantalla') {
      await this.cargarReporte();
    } else if (event.salida === 'excel') {
      await this.generarExcel(event.criterios);
    } else if (event.salida === 'pdf') {
      await this.generarPdf(event.criterios);
    }
  }

  // Carga el reporte según el tab activo
  async cargarReporte() {
    this.loading.set(true);
    try {
      if (this.tipoReporte() === 'analitico') {
        await this.cargarAnalitico();
      } else {
        await this.cargarGerencial();
      }
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      // Fallback de demostración si la API aún no está disponible
      this.generarMockData();
    } finally {
      this.loading.set(false);
    }
  }

  async cargarAnalitico() {
    const tab = this.activeTab();
    if (tab === 'ventas') {
      this.dataRows = await this.reportesService.getVentasAnalitico(this.appliedCriterios);
    } else if (tab === 'compras') {
      this.dataRows = await this.reportesService.getComprasAnalitico(this.appliedCriterios);
    } else if (tab === 'inventario') {
      if (!this.appliedCriterios.productoId) {
        throw new Error('Debe seleccionar un producto para ver el Kardex');
      }
      this.dataRows = await this.reportesService.getKardex(
        this.appliedCriterios.productoId,
        this.appliedCriterios.fechaDesde,
        this.appliedCriterios.fechaHasta
      );
    } else if (tab === 'cartera') {
      this.dataRows = await this.reportesService.getCarteraSaldos(this.carteraTipo(), this.appliedCriterios);
    } else if (tab === 'contabilidad') {
      this.dataRows = await this.reportesService.getLibroDiario(this.appliedCriterios);
    }
  }

  async cargarGerencial() {
    const tab = this.activeTab();
    if (tab === 'ventas') {
      const res = await this.reportesService.getVentasGerencial(this.appliedCriterios);
      this.gerencialData = res;
      this.setupChartsData(res);
    } else if (tab === 'compras') {
      const res = await this.reportesService.getComprasGerencial(this.appliedCriterios);
      this.gerencialData = res;
      this.setupChartsData(res);
    } else {
      // Otros gerenciales pueden usar fallback
      this.generarMockData();
    }
  }

  // Genera datos Mock si los endpoints del backend no están listos
  generarMockData() {
    console.log('Generando datos Mock para demostración...');
    const tab = this.activeTab();
    const esAnalitico = this.tipoReporte() === 'analitico';

    if (esAnalitico) {
      if (tab === 'ventas') {
        this.dataRows = [
          { id: 101, nroFactura: 'FV-2026-000001', fecha: '2026-05-02', clienteNombre: 'Importadora Comercial S.A.', clienteNit: '10293848', subtotal: 6000, descuento: 500, total: 5500, esCredito: false, estado: 'EMITIDA' },
          { id: 102, nroFactura: 'FV-2026-000002', fecha: '2026-05-15', clienteNombre: 'Ferretería Central', clienteNit: '85746392', subtotal: 3000, descuento: 0, total: 3000, esCredito: true, estado: 'EMITIDA' },
          { id: 103, nroFactura: 'FV-2026-000003', fecha: '2026-05-22', clienteNombre: 'Distribuidora del Oriente', clienteNit: '94857612', subtotal: 12000, descuento: 1000, total: 11000, esCredito: false, estado: 'EMITIDA' },
          { id: 104, nroFactura: 'FV-2026-000004', fecha: '2026-05-28', clienteNombre: 'Juan Perez Gomez', clienteNit: '4857123', subtotal: 1500, descuento: 100, total: 1400, esCredito: false, estado: 'ANULADA' }
        ];
      } else if (tab === 'compras') {
        this.dataRows = [
          { id: 201, nroFactura: 'FC-10293', fecha: '2026-05-01', proveedorNombre: 'Soporte Industrial Boliviano', proveedorNit: '94857102', subtotal: 4500, descuento: 0, total: 4500, estado: 'REGISTRADA' },
          { id: 202, nroFactura: 'FC-48572', fecha: '2026-05-10', proveedorNombre: 'Importaciones y Logística SRL', proveedorNit: '10293847', subtotal: 8000, descuento: 200, total: 7800, estado: 'REGISTRADA' },
          { id: 203, nroFactura: 'FC-94857', fecha: '2026-05-18', proveedorNombre: 'Almacenes del Sur Ltda.', proveedorNit: '74859612', subtotal: 2500, descuento: 0, total: 2500, estado: 'ANULADA' }
        ];
      } else if (tab === 'inventario') {
        this.dataRows = [
          { id: 301, fecha: '2026-05-01T10:00:00', tipo: 'ENTRADA', cantidad: 100, documentoOrigen: 'COMPRA FACTURA FC-10293', origenId: 201, saldoAcumulado: 100 },
          { id: 302, fecha: '2026-05-02T14:30:00', tipo: 'SALIDA', cantidad: 5, documentoOrigen: 'VENTA FACTURA FV-2026-000001', origenId: 101, saldoAcumulado: 95 },
          { id: 303, fecha: '2026-05-15T11:00:00', tipo: 'SALIDA', cantidad: 10, documentoOrigen: 'VENTA FACTURA FV-2026-000002', origenId: 102, saldoAcumulado: 85 }
        ];
      } else if (tab === 'cartera') {
        this.dataRows = [
          { id: 401, facturaVenta: { nroFactura: 'FV-2026-000002' }, montoTotal: 3000, saldo: 1500, fechaVencimiento: '2026-06-15', estado: 'PENDIENTE' },
          { id: 402, facturaVenta: { nroFactura: 'FV-2026-000003' }, montoTotal: 11000, saldo: 0, fechaVencimiento: '2026-06-22', estado: 'PAGADO' }
        ];
      } else if (tab === 'contabilidad') {
        this.dataRows = [
          {
            id: 501, nroAsiento: 'ASE-0001', fecha: '2026-05-02', glosa: 'Venta Factura FV-2026-000001', origenDocumento: 'FACTURA_VENTA',
            detalles: [
              { cuentaContable: { codigo: '1.1.1.01', nombre: 'Caja Moneda Nacional' }, debe: 5500, haber: 0 },
              { cuentaContable: { codigo: '4.1.1.01', nombre: 'Impuesto a las Transacciones' }, debe: 165, haber: 0 },
              { cuentaContable: { codigo: '5.1.1.01', nombre: 'Ingresos por Ventas' }, debe: 0, haber: 4785 },
              { cuentaContable: { codigo: '2.1.3.01', nombre: 'Débito Fiscal IVA' }, debe: 0, haber: 715 },
              { cuentaContable: { codigo: '2.1.4.01', nombre: 'Impuesto a las Transacciones por Pagar' }, debe: 0, haber: 165 }
            ]
          }
        ];
      }
    } else {
      // KPIs y Gráficos Mock
      this.gerencialData = {
        kpis: {
          totalMonto: tab === 'ventas' ? 19500 : 12300,
          descuentosTotal: tab === 'ventas' ? 1500 : 200,
          rentabilidadEst: tab === 'ventas' ? '87.00%' : '78.50%',
          conteoRegistros: tab === 'ventas' ? 3 : 2
        },
        tendencia: [
          { etiqueta: 'Enero', valor: tab === 'ventas' ? 12000 : 8000 },
          { etiqueta: 'Febrero', valor: tab === 'ventas' ? 15000 : 9500 },
          { etiqueta: 'Marzo', valor: tab === 'ventas' ? 18000 : 11000 },
          { etiqueta: 'Abril', valor: tab === 'ventas' ? 14000 : 13000 },
          { etiqueta: 'Mayo', valor: tab === 'ventas' ? 19500 : 12300 }
        ],
        participacion: [
          { nombre: tab === 'ventas' ? 'Importadora S.A.' : 'Proveedor Soporte', valor: tab === 'ventas' ? 8500 : 4500 },
          { nombre: tab === 'ventas' ? 'Ferretería Central' : 'Importaciones SRL', valor: tab === 'ventas' ? 6000 : 7800 },
          { nombre: tab === 'ventas' ? 'Otros Clientes' : 'Almacenes del Sur', valor: tab === 'ventas' ? 5000 : 0 }
        ]
      };
      this.setupChartsData(this.gerencialData);
    }
  }

  // Prepara los datasets de Chart.js
  setupChartsData(res: any) {
    if (!res.tendencia || !res.participacion) return;

    // Tendencia (Gráfico de líneas)
    this.lineChartData = {
      labels: res.tendencia.map((t: any) => t.etiqueta),
      datasets: [
        {
          data: res.tendencia.map((t: any) => t.valor),
          label: this.activeTab() === 'ventas' ? 'Ingresos de Ventas ($)' : 'Egresos de Compras ($)',
          borderColor: '#4F46E5', // erp-primary default
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Participación (Gráfico de barras)
    this.barChartData = {
      labels: res.participacion.map((p: any) => p.nombre),
      datasets: [
        {
          data: res.participacion.map((p: any) => p.valor),
          label: 'Monto Transado ($)',
          backgroundColor: '#94A3B8' // erp-secondary default
        }
      ]
    };
  }

  // EXPORTACIONES DIRECTAS DE LA TABLA PANTALLA

  exportarExcelDirecto() {
    this.exportToExcel(this.dataRows, `Reporte_${this.activeTab()}_Analitico`);
  }

  exportToExcel(data: any[], filename: string) {
    // Limpiamos referencias anidadas para evitar errores de circularidad
    const cleanData = data.map(item => {
      const copy = { ...item };
      // Omitir referencias internas circulares
      if (copy.facturaVenta) copy.facturaVenta = copy.facturaVenta.nroFactura;
      if (copy.facturaCompra) copy.facturaCompra = copy.facturaCompra.nroFactura;
      if (copy.detalles) delete copy.detalles;
      return copy;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    // Auto-ajustar ancho de columnas dinámicamente según el contenido
    if (cleanData.length > 0) {
      const keys = Object.keys(cleanData[0]);
      const colWidths = keys.map(key => {
        const maxLen = cleanData.reduce((max, row) => {
          const val = row[key];
          const strVal = val !== null && val !== undefined ? String(val) : '';
          return Math.max(max, strVal.length);
        }, key.length);
        return { wch: Math.max(maxLen + 3, 10) }; // +3 de padding, mínimo de 10
      });
      worksheet['!cols'] = colWidths;
    } else {
      worksheet['!cols'] = [];
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  exportarPdfDirecto() {
    // Generar PDF usando pdfmake
    const content: any[] = [];
    const tab = this.activeTab();

    // Encabezado del reporte
    const titleLabel = this.tabs.find(t => t.id === tab)?.label || tab;
    content.push({ text: `REPORTE OFICIAL DE ${titleLabel.toUpperCase()}`, style: 'header', alignment: 'center' });
    content.push({ text: `Fecha de Emisión: ${new Date().toLocaleDateString()}`, style: 'subheader', alignment: 'center' });
    content.push({ text: '\n' });

    // Tabla de Criterios
    content.push({ text: 'Criterios de Generación:', style: 'sectionHeader' });
    content.push({
      table: {
        widths: ['*', '*'],
        body: [
          [{ text: 'Filtro', bold: true, fillColor: '#f1f5f9' }, { text: 'Valor Seleccionado', bold: true, fillColor: '#f1f5f9' }],
          ['Periodo desde:', this.appliedCriterios.fechaDesde || 'No especificado'],
          ['Periodo hasta:', this.appliedCriterios.fechaHasta || 'No especificado'],
          ['Estado de Registros:', this.appliedCriterios.estado || 'TODOS']
        ]
      },
      layout: 'lightHorizontalLines'
    });
    content.push({ text: '\n\n' });

    // Tabla de Datos
    content.push({ text: 'Datos Obtenidos:', style: 'sectionHeader' });
    
    if (this.tipoReporte() === 'analitico') {
      const tableHeaders = this.getHeadersForTab(tab);
      const tableBody: any[][] = [
        tableHeaders.map(h => ({
          text: h.label,
          bold: true,
          fillColor: '#4F46E5',
          color: '#ffffff',
          fontSize: 9,
          margin: [4, 4, 4, 4]
        }))
      ];
      
      this.dataRows.forEach(row => {
        const rowData = tableHeaders.map(h => {
          let val = row[h.field];
          if (h.field.includes('.')) {
            const parts = h.field.split('.');
            val = row[parts[0]]?.[parts[1]];
          }
          
          const isNumeric = ['subtotal', 'descuento', 'total', 'montoTotal', 'saldo', 'cantidad', 'saldoAcumulado'].includes(h.field);
          let cellText = '-';
          if (typeof val === 'number') {
            cellText = val.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (['subtotal', 'descuento', 'total', 'montoTotal', 'saldo'].includes(h.field)) {
              cellText = `Bs. ${cellText}`;
            }
          } else if (typeof val === 'boolean') {
            cellText = val ? 'Sí' : 'No';
          } else if (val !== null && val !== undefined) {
            cellText = String(val);
          }
          
          return {
            text: cellText,
            alignment: isNumeric ? 'right' : 'left',
            fontSize: 9,
            margin: [4, 4, 4, 4]
          };
        });
        tableBody.push(rowData);
      });

      // Agregar fila de totales para ventas y compras
      if (tab === 'ventas' || tab === 'compras') {
        const sumSubtotal = this.getSum('subtotal');
        const sumDescuento = this.getSum('descuento');
        const sumTotal = this.getSum('total');
        
        const totalRow = tableHeaders.map(h => {
          let text = '';
          let align = 'left';
          if (h.field === 'clienteNombre' || h.field === 'proveedorNombre') {
            text = 'TOTALES (Emitidas/Registradas):';
            align = 'right';
          } else if (h.field === 'subtotal') {
            text = `Bs. ${sumSubtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            align = 'right';
          } else if (h.field === 'descuento') {
            text = `Bs. ${sumDescuento.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            align = 'right';
          } else if (h.field === 'total') {
            text = `Bs. ${sumTotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            align = 'right';
          }
          return {
            text,
            bold: true,
            alignment: align,
            fontSize: 9,
            fillColor: '#f1f5f9',
            margin: [4, 4, 4, 4]
          };
        });
        tableBody.push(totalRow);
      }

      // Anchos específicos para las columnas
      let colWidths: any = '*';
      if (tab === 'ventas') colWidths = [60, 60, '*', 70, 70, 70];
      else if (tab === 'compras') colWidths = [60, 60, '*', 70, 70, 70];
      else if (tab === 'inventario') colWidths = [100, 80, 80, '*', 80];
      else if (tab === 'cartera') colWidths = [50, '*', 90, 80, 80];
      else colWidths = Array(tableHeaders.length).fill('*');

      content.push({
        table: {
          headerRows: 1,
          widths: colWidths,
          body: tableBody
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1.5 : 0.5,
          vLineWidth: (i: number, node: any) => 0.5,
          hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? '#4F46E5' : '#e2e8f0',
          vLineColor: (i: number, node: any) => '#e2e8f0'
        }
      });
    } else {
      // Gráficos y resumen
      content.push({ text: 'Resumen Financiero Agregado:', style: 'sectionHeader' });
      const kpisMonto = this.gerencialData.kpis?.totalMonto?.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
      const kpisDesc = this.gerencialData.kpis?.descuentosTotal?.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
      
      content.push({
        table: {
          widths: ['*', '*'],
          body: [
            ['Total Transado:', `Bs. ${kpisMonto}`],
            ['Total Descuentos:', `Bs. ${kpisDesc}`],
            [tab === 'ventas' ? 'Rentabilidad Bruta Est.:' : 'Ahorro por Descuento:', this.gerencialData.kpis?.rentabilidadEst || '0.00%'],
            ['Conteo de Transacciones:', `${this.gerencialData.kpis?.conteoRegistros} registros`]
          ]
        },
        layout: 'lightHorizontalLines'
      });
    }

    // Definición del documento pdfmake con orientación horizontal para tablas anchas
    const isLandscape = (tab === 'ventas' || tab === 'compras' || tab === 'inventario') && this.tipoReporte() === 'analitico';
    const docDefinition = {
      content: content,
      pageOrientation: isLandscape ? 'landscape' : 'portrait',
      pageMargins: [40, 50, 40, 50] as [number, number, number, number],
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          fontSize: 9,
          color: '#64748b',
          margin: [0, 15, 0, 0]
        };
      },
      styles: {
        header: { fontSize: 18, bold: true, color: '#4F46E5', margin: [0, 0, 0, 5] as [number, number, number, number] },
        subheader: { fontSize: 10, italic: true, color: '#64748b', margin: [0, 0, 0, 15] as [number, number, number, number] },
        sectionHeader: { fontSize: 12, bold: true, color: '#1e293b', margin: [0, 15, 0, 8] as [number, number, number, number] }
      }
    };

    pdfMake.createPdf(docDefinition).download(`Reporte_${tab}_${this.tipoReporte()}.pdf`);
  }

  getHeadersForTab(tab: string): { field: string; label: string }[] {
    switch (tab) {
      case 'ventas':
        return [
          { field: 'nroFactura', label: 'Factura' },
          { field: 'fecha', label: 'Fecha' },
          { field: 'clienteNombre', label: 'Cliente' },
          { field: 'subtotal', label: 'Subtotal' },
          { field: 'descuento', label: 'Descuento' },
          { field: 'total', label: 'Total' }
        ];
      case 'compras':
        return [
          { field: 'nroFactura', label: 'Factura' },
          { field: 'fecha', label: 'Fecha' },
          { field: 'proveedorNombre', label: 'Proveedor' },
          { field: 'subtotal', label: 'Subtotal' },
          { field: 'descuento', label: 'Descuento' },
          { field: 'total', label: 'Total' }
        ];
      case 'inventario':
        return [
          { field: 'fecha', label: 'Fecha' },
          { field: 'tipo', label: 'Movimiento' },
          { field: 'cantidad', label: 'Cantidad' },
          { field: 'documentoOrigen', label: 'Origen' },
          { field: 'saldoAcumulado', label: 'Saldo Físico' }
        ];
      case 'cartera':
        return [
          { field: 'id', label: 'Cuenta' },
          { field: 'montoTotal', label: 'Monto' },
          { field: 'saldo', label: 'Saldo Pendiente' },
          { field: 'fechaVencimiento', label: 'Vencimiento' },
          { field: 'estado', label: 'Estado' }
        ];
      default:
        return [];
    }
  }

  // EXPORTACIONES DEL MODAL DE CRITERIOS (Para generar archivo directo sin ver en pantalla)
  async generarExcel(criterios: any) {
    this.loading.set(true);
    try {
      let rows: any[] = [];
      const tab = this.activeTab();
      if (tab === 'ventas') rows = await this.reportesService.getVentasAnalitico(criterios);
      else if (tab === 'compras') rows = await this.reportesService.getComprasAnalitico(criterios);
      else if (tab === 'inventario') rows = await this.reportesService.getKardex(criterios.productoId, criterios.fechaDesde, criterios.fechaHasta);
      else if (tab === 'cartera') rows = await this.reportesService.getCarteraSaldos(this.carteraTipo(), criterios);
      else if (tab === 'contabilidad') rows = await this.reportesService.getLibroDiario(criterios);

      if (rows.length === 0) {
        alert('No hay datos para exportar.');
        return;
      }
      this.exportToExcel(rows, `Descarga_${tab}`);
    } catch (e) {
      console.error(e);
      // Fallback
      this.exportToExcel([
        { ID: 1, Info: 'Sin conexión con la API contable. Mostrando registro de prueba.' }
      ], `Descarga_${this.activeTab()}_Prueba`);
    } finally {
      this.loading.set(false);
    }
  }

  async generarPdf(criterios: any) {
    // Si la descarga es para el Libro Diario Oficial (Contabilidad), se genera en el Backend (PDF oficial)
    if (this.activeTab() === 'contabilidad') {
      this.loading.set(true);
      try {
        const blob = await this.reportesService.descargarLibroDiarioPdf(criterios);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Libro_Diario_${criterios.fechaDesde}_${criterios.fechaHasta}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error descargando PDF oficial de contabilidad del backend:', error);
        alert('No se pudo generar el Libro Diario desde el servidor. Verifique la API.');
      } finally {
        this.loading.set(false);
      }
      return;
    }

    // Reportes operativos: generación client-side
    this.loading.set(true);
    try {
      await this.cargarReporte();
      this.exportarPdfDirecto();
    } finally {
      this.loading.set(false);
    }
  }

  // LÓGICA CONSTRUCTOR QBE (DINÁMICO)

  onQbeOrigenChange() {
    this.qbeResult = [];
    this.qbeRan.set(false);
    // Columnas por defecto
    if (this.qbeQuery.origen === 'VENTAS') {
      this.qbeQuery.columnas = ['fecha', 'nroFactura', 'clienteNombre', 'total'];
    } else if (this.qbeQuery.origen === 'COMPRAS') {
      this.qbeQuery.columnas = ['fecha', 'nroFactura', 'proveedorNombre', 'total'];
    } else {
      this.qbeQuery.columnas = ['fecha', 'tipo', 'cantidad', 'documentoOrigen'];
    }
    this.qbeQuery.filtros = [];
  }

  toggleQbeColumna(field: string) {
    const idx = this.qbeQuery.columnas.indexOf(field);
    if (idx > -1) {
      if (this.qbeQuery.columnas.length > 1) {
        this.qbeQuery.columnas.splice(idx, 1);
      }
    } else {
      this.qbeQuery.columnas.push(field);
    }
  }

  isQbeColumnaSelect(field: string): boolean {
    return this.qbeQuery.columnas.includes(field);
  }

  getQbeColLabel(field: string): string {
    const origin = this.qbeQuery.origen;
    const match = this.qbeColumns[origin].find(c => c.field === field);
    return match ? match.label : field;
  }

  addQbeFiltro() {
    const fields = this.qbeColumns[this.qbeQuery.origen];
    this.qbeQuery.filtros.push({
      campo: fields[0]?.field || '',
      operador: 'EQUAL',
      valor: ''
    });
  }

  removeQbeFiltro(idx: number) {
    this.qbeQuery.filtros.splice(idx, 1);
  }

  async ejecutarQbeQuery() {
    this.loading.set(true);
    this.qbeRan.set(true);
    try {
      const res = await this.reportesService.ejecutarQbe(this.qbeQuery);
      this.qbeResult = res;
    } catch (e) {
      console.error('Error al ejecutar QBE:', e);
      // Mock Fallback
      this.generarQbeMock();
    } finally {
      this.loading.set(false);
    }
  }

  generarQbeMock() {
    const origin = this.qbeQuery.origen;
    const cols = this.qbeQuery.columnas;
    
    // Lista de registros simulados completos
    let fullList: any[] = [];
    if (origin === 'VENTAS') {
      fullList = [
        { id: 101, nroFactura: 'FV-2026-000001', fecha: '2026-05-02', clienteNombre: 'Importadora Comercial S.A.', clienteNit: '10293848', subtotal: 6000, descuento: 500, total: 5500, esCredito: false, estado: 'EMITIDA' },
        { id: 102, nroFactura: 'FV-2026-000002', fecha: '2026-05-15', clienteNombre: 'Ferretería Central', clienteNit: '85746392', subtotal: 3000, descuento: 0, total: 3000, esCredito: true, estado: 'EMITIDA' },
        { id: 103, nroFactura: 'FV-2026-000003', fecha: '2026-05-22', clienteNombre: 'Distribuidora del Oriente', clienteNit: '94857612', subtotal: 12000, descuento: 1000, total: 11000, esCredito: false, estado: 'EMITIDA' }
      ];
    } else if (origin === 'COMPRAS') {
      fullList = [
        { id: 201, nroFactura: 'FC-10293', fecha: '2026-05-01', proveedorNombre: 'Soporte Industrial Boliviano', proveedorNit: '94857102', subtotal: 4500, descuento: 0, total: 4500, estado: 'REGISTRADA' },
        { id: 202, nroFactura: 'FC-48572', fecha: '2026-05-10', proveedorNombre: 'Importaciones y Logística SRL', proveedorNit: '10293847', subtotal: 8000, descuento: 200, total: 7800, estado: 'REGISTRADA' }
      ];
    } else {
      fullList = [
        { id: 301, fecha: '2026-05-01', tipo: 'ENTRADA', cantidad: 100, documentoOrigen: 'COMPRA FC-10293', origenId: 201 },
        { id: 302, fecha: '2026-05-02', tipo: 'SALIDA', cantidad: 5, documentoOrigen: 'VENTA FV-2026-000001', origenId: 101 }
      ];
    }

    // Filtrar según filtros del constructor (muy simple mock logic)
    let filtered = [...fullList];
    this.qbeQuery.filtros.forEach(f => {
      const val = f.valor.toLowerCase();
      filtered = filtered.filter(row => {
        const valRow = String(row[f.campo] || '').toLowerCase();
        if (f.operador === 'EQUAL') return valRow === val;
        if (f.operador === 'LIKE') return valRow.includes(val);
        if (f.operador === 'GREATER_THAN') return Number(valRow) > Number(val);
        if (f.operador === 'LESS_THAN') return Number(valRow) < Number(val);
        return true;
      });
    });

    // Proyectar columnas seleccionadas
    this.qbeResult = filtered.map(row => {
      const proj: any = {};
      cols.forEach(col => {
        proj[col] = row[col];
      });
      return proj;
    });
  }

  exportarQbeExcel() {
    this.exportToExcel(this.qbeResult, `Consulta_QBE_${this.qbeQuery.origen}`);
  }
}
