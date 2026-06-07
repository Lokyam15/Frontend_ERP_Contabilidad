import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../core/producto.service';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';
import { InventoryService, MovimientoInventario } from '../core/inventory.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Inventario</h2>
          <p class="text-slate-500 font-medium">Gestión del Catálogo de Productos y Servicios del ERP.</p>
        </div>
        
        <!-- Filtro de empresa para SUPERADMIN -->
        <div *ngIf="isSuperAdmin() && empresas().length > 0" class="flex flex-col gap-1.5 min-w-[240px]">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Filtrar por Empresa</label>
          <select [value]="selectedEmpresaId() || 0" (change)="onEmpresaChange($event)" 
                  class="px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary">
            <option [value]="0">Seleccione una empresa...</option>
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
          <h4 class="font-black text-sm text-slate-800">Error</h4>
          <p class="text-xs text-slate-600 mt-0.5">{{ errorMessage() }}</p>
        </div>
        <button (click)="errorMessage.set(null)" class="ml-auto text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
      </div>

      <!-- Navegación de Pestañas -->
      <div *ngIf="canViewKardexTab()" class="border-b border-slate-200">
        <div class="flex gap-8 overflow-x-auto pb-1">
          <button (click)="activeTab.set('CATALOGO')"
                  [class]="activeTab() === 'CATALOGO' ? 
                            'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 
                            'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0 border-b-4 border-transparent'">
            Catálogo de Productos
          </button>
          <button (click)="activeTab.set('KARDEX')"
                  [class]="activeTab() === 'KARDEX' ? 
                            'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-lg tracking-tight transition-all shrink-0' : 
                            'text-slate-400 hover:text-slate-600 pb-4 font-bold text-lg tracking-tight transition-all shrink-0 border-b-4 border-transparent'">
            Historial de Kardex
          </button>
        </div>
      </div>

      <!-- SUPERADMIN sin empresa seleccionada -->
      <div *ngIf="isSuperAdmin() && !selectedEmpresaId()" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h4 class="text-lg font-black text-slate-800">Seleccione una Empresa</h4>
        <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">Para ver y gestionar el catálogo de inventario, por favor seleccione una empresa del menú superior derecho.</p>
      </div>

      <!-- CONTENIDO (CUANDO HAY EMPRESA SELECCIONADA O SE ACCEDE COMO ADMIN/CONTADOR/VENDEDOR) -->
      <div *ngIf="!isSuperAdmin() || selectedEmpresaId()" class="space-y-6">
        
        <!-- PESTAÑA CATALOGO -->
        <div *ngIf="activeTab() === 'CATALOGO'" class="space-y-6">
          <!-- Barra de Herramientas (Filtros y Crear) -->
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            
            <!-- Buscador -->
            <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 min-w-[280px] shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" 
                     placeholder="Buscar por código, nombre o descripción..." 
                     class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
            </div>

            <!-- Filtro de Tipo -->
            <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)"
                    class="px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-erp-primary">
              <option value="TODOS">Todos los tipos</option>
              <option value="PRODUCTO">Solo Productos</option>
              <option value="SERVICIO">Solo Servicios</option>
            </select>
          </div>

          <!-- Botón Registrar (Sólo ADMIN o SUPERADMIN) -->
          <button *ngIf="canCreateOrEditOrDelete()" (click)="openCreateModal()"
                  class="w-full sm:w-auto px-6 py-3.5 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Nuevo Artículo / Servicio
          </button>
        </div>

        <!-- CARGANDO DATOS -->
        <div *ngIf="loadingData()" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando catálogo...</p>
        </div>

        <!-- TABLA DE PRODUCTOS (SI NO ESTÁ CARGANDO) -->
        <div *ngIf="!loadingData()">
          
          <div *ngIf="filteredProductos().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">Código</th>
                    <th class="p-6">Nombre</th>
                    <th class="p-6">Tipo</th>
                    <th class="p-6 text-right">Precio Venta</th>
                    <th class="p-6 text-right">Costo Unitario</th>
                    <th class="p-6 text-right">Stock Actual</th>
                    <th class="p-6">Unidad</th>
                    <th class="p-6">Estado</th>
                    <th class="p-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let prod of filteredProductos()" 
                      [ngClass]="{ 'cursor-pointer hover:bg-slate-50/50': canViewDetail() }"
                      class="transition-colors"
                      (click)="onRowClick(prod)">
                    
                    <!-- Código -->
                    <td class="p-6 font-mono text-slate-500">
                      {{ prod.codigo }}
                    </td>
                    
                    <!-- Nombre -->
                    <td class="p-6 text-slate-900 font-extrabold">
                      {{ prod.nombre }}
                    </td>
                    
                    <!-- Tipo -->
                    <td class="p-6">
                      <span [class]="prod.tipo === 'PRODUCTO' ? 
                                    'px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase border border-blue-100' : 
                                    'px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-black uppercase border border-purple-100'">
                        {{ prod.tipo }}
                      </span>
                    </td>
                    
                    <!-- Precio Venta -->
                    <td class="p-6 text-right text-slate-900 font-mono">
                      {{ prod.precioVenta | currency:'USD' }}
                    </td>
                    
                    <!-- Costo Unitario -->
                    <td class="p-6 text-right text-slate-500 font-mono">
                      {{ prod.costoUnitario | currency:'USD' }}
                    </td>
                    
                    <!-- Stock -->
                    <td class="p-6 text-right font-mono">
                      <span *ngIf="prod.tipo === 'PRODUCTO'"
                            [class]="prod.stockActual <= 0 ? 'text-red-500 font-black' : 'text-slate-800'">
                        {{ prod.stockActual }}
                      </span>
                      <span *ngIf="prod.tipo === 'SERVICIO'" class="text-slate-400">
                        -
                      </span>
                    </td>
                    
                    <!-- Unidad Medida -->
                    <td class="p-6 text-slate-500 font-medium">
                      {{ prod.tipo === 'PRODUCTO' ? (prod.unidadMedida || 'U') : 'N/A' }}
                    </td>
                    
                    <!-- Estado -->
                    <td class="p-6">
                      <span [class]="prod.estado ? 
                                    'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 
                                    'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                        {{ prod.estado ? 'Activo' : 'De baja' }}
                      </span>
                    </td>

                    <!-- Acciones -->
                    <td class="p-6 text-right space-x-2" (click)="$event.stopPropagation()">
                      <button *ngIf="canViewDetail()" (click)="viewDetail(prod)" title="Ver detalle"
                              class="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-xl transition-all inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button *ngIf="canViewKardexTab() && prod.tipo === 'PRODUCTO'" (click)="verKardexProducto(prod)" title="Ver Kardex"
                              class="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-xl transition-all inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button *ngIf="canCreateOrEditOrDelete()" (click)="openEditModal(prod)" title="Editar"
                              class="p-2 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200/50 rounded-xl transition-all inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button *ngIf="canCreateOrEditOrDelete() && prod.estado" (click)="confirmDelete(prod)" title="Dar de baja"
                              class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State Catálogo -->
          <div *ngIf="filteredProductos().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No se encontraron productos</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No hay registros cargados que coincidan con la búsqueda. Intente registrar un nuevo artículo.</p>
          </div>

        </div>

      </div>

      <!-- PESTAÑA HISTORIAL DE KARDEX -->
      <div *ngIf="activeTab() === 'KARDEX'" class="space-y-6 animate-fade-in">
        
        <!-- Barra de Herramientas Kardex (Buscador y Registrar) -->
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <!-- Buscador -->
          <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 min-w-[320px] w-full sm:w-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" [ngModel]="kardexSearchQuery()" (ngModelChange)="kardexSearchQuery.set($event)" 
                   placeholder="Buscar por producto, tipo o glosa..." 
                   class="w-full text-sm font-medium text-slate-700 outline-none bg-transparent placeholder-slate-400" />
          </div>

          <!-- Botón Registrar Movimiento Manual (Sólo ADMIN o SUPERADMIN) -->
          <button *ngIf="canRegistrarMovimiento()" (click)="openMovimientoModal()"
                  class="w-full sm:w-auto px-6 py-3.5 bg-erp-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-erp-primary/95 transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Registrar Movimiento
          </button>
        </div>

        <!-- CARGANDO DATOS KARDEX -->
        <div *ngIf="loadingMovimientos()" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando Kardex...</p>
        </div>

        <!-- TABLA DE HISTORIAL DE KARDEX (SI NO ESTÁ CARGANDO) -->
        <div *ngIf="!loadingMovimientos()">
          
          <div *ngIf="filteredMovimientos().length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                    <th class="p-6">Fecha</th>
                    <th class="p-6">Tipo</th>
                    <th class="p-6">Producto</th>
                    <th class="p-6 text-right">Cantidad</th>
                    <th class="p-6 text-right">Costo Unitario</th>
                    <th class="p-6">Documento Origen</th>
                    <th class="p-6">ID Origen</th>
                    <th class="p-6 text-right">Kardex Producto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                  <tr *ngFor="let mov of filteredMovimientos()" class="hover:bg-slate-50/50 transition-colors">
                    
                    <!-- Fecha -->
                    <td class="p-6 text-slate-500 font-medium">
                      {{ mov.fecha | date:'dd MMM yyyy HH:mm' }}
                    </td>
                    
                    <!-- Tipo -->
                    <td class="p-6">
                      <span [ngClass]="{
                        'bg-emerald-50 text-emerald-600 border border-emerald-100': mov.tipo === 'ENTRADA',
                        'bg-rose-50 text-rose-600 border border-rose-100': mov.tipo === 'SALIDA',
                        'bg-amber-50 text-amber-600 border border-amber-100': mov.tipo === 'AJUSTE'
                      }" class="px-2.5 py-1 rounded-lg text-xs font-black uppercase">
                        {{ mov.tipo }}
                      </span>
                    </td>
                    
                    <!-- Producto -->
                    <td class="p-6">
                      <div class="flex flex-col">
                        <span class="text-slate-900 font-extrabold">{{ mov.producto.nombre }}</span>
                        <span class="text-xs text-slate-400 font-mono">{{ mov.producto.codigo }}</span>
                      </div>
                    </td>
                    
                    <!-- Cantidad -->
                    <td class="p-6 text-right font-mono text-slate-900">
                      {{ mov.cantidad }}
                    </td>
                    
                    <!-- Costo Unitario -->
                    <td class="p-6 text-right font-mono text-slate-500">
                      {{ mov.costoUnitario | currency:'USD' }}
                    </td>
                    
                    <!-- Documento Origen -->
                    <td class="p-6 text-slate-500 font-medium max-w-[180px] truncate" [title]="mov.documentoOrigen || ''">
                      {{ mov.documentoOrigen || '-' }}
                    </td>
                    
                    <!-- Origen ID -->
                    <td class="p-6 text-slate-400 font-mono">
                      {{ mov.origenId || '-' }}
                    </td>

                    <!-- Acción Detalle Producto -->
                    <td class="p-6 text-right">
                      <button (click)="verKardexProducto(mov.producto)" title="Ver Kardex del Producto"
                              class="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-xl transition-all inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State Kardex -->
          <div *ngIf="filteredMovimientos().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h4 class="text-lg font-black text-slate-800">No hay movimientos en el Kardex</h4>
            <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No se registran transacciones de inventario en este periodo para la empresa seleccionada.</p>
          </div>

        </div>

      </div>

    </div>

    <!-- MODAL DE VISUALIZACIÓN DE DETALLE (HU7.4) -->
    <div *ngIf="showDetailModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Detalle Comercial del Artículo</span>
            <h3 class="text-xl font-black text-slate-800 leading-tight mt-0.5">
              {{ loadingDetail() ? 'Cargando detalles...' : (selectedProduct()?.nombre || 'Detalle') }}
            </h3>
          </div>
          <button (click)="closeDetailModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Cargando Detalle -->
        <div *ngIf="loadingDetail()" class="p-12 flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Obteniendo datos de la API...</p>
        </div>

        <!-- Body -->
        <div *ngIf="!loadingDetail() && selectedProduct()" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código del Artículo</span>
              <p class="text-sm font-mono font-bold text-slate-800 mt-1">{{ selectedProduct()?.codigo }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
              <div class="mt-1">
                <span [class]="selectedProduct()?.tipo === 'PRODUCTO' ? 
                              'px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100' : 
                              'px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-bold border border-purple-100'">
                  {{ selectedProduct()?.tipo }}
                </span>
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio de Venta</span>
              <p class="text-lg font-mono font-black text-emerald-600 mt-0.5">{{ selectedProduct()?.precioVenta | currency:'USD' }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo Unitario</span>
              <p class="text-lg font-mono font-black text-slate-800 mt-0.5">{{ selectedProduct()?.costoUnitario | currency:'USD' }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Disponible</span>
              <p class="text-sm font-bold text-slate-800 mt-1">
                {{ selectedProduct()?.tipo === 'PRODUCTO' ? selectedProduct()?.stockActual : 'N/A (Servicio)' }}
              </p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad de Medida</span>
              <p class="text-sm font-bold text-slate-800 mt-1">
                {{ selectedProduct()?.tipo === 'PRODUCTO' ? (selectedProduct()?.unidadMedida || 'Unidades (U)') : 'No aplica' }}
              </p>
            </div>
            
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
              <div class="mt-1">
                <span [class]="selectedProduct()?.estado ? 
                              'px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100' : 
                              'px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold border border-slate-200'">
                  {{ selectedProduct()?.estado ? 'ACTIVO' : 'DE BAJA' }}
                </span>
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Alta</span>
              <p class="text-sm font-bold text-slate-800 mt-1">{{ (selectedProduct()?.fechaCreacion | date:'dd MMM yyyy HH:mm') || '-' }}</p>
            </div>

          </div>

          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</span>
            <p class="text-sm text-slate-600 font-medium leading-relaxed mt-2 whitespace-pre-line">
              {{ selectedProduct()?.descripcion || 'Sin descripción comercial provista.' }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button (click)="closeDetailModal()" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl text-sm transition-all shadow-sm">
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE FORMULARIO: CREAR Y EDITAR (HU7.5 / HU7.6) -->
    <div *ngIf="showFormModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ isEditMode() ? 'Catálogo del Inquilino' : 'Nuevo Registro de Catálogo' }}</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">{{ isEditMode() ? 'Editar Artículo' : 'Registrar Nuevo Artículo' }}</h3>
          </div>
          <button (click)="closeFormModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <form (ngSubmit)="saveProduct()" class="p-8 space-y-5">
          
          <!-- Código -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Código del Artículo <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formModel.codigo" name="codigo" required
                   placeholder="Ej: PROD-001" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Nombre -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Artículo <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formModel.nombre" name="nombre" required
                   placeholder="Ej: Laptop Lenovo ThinkPad" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Fila: Tipo y Unidad Medida -->
          <div class="grid grid-cols-2 gap-4">
            
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo</label>
              <select [(ngModel)]="formModel.tipo" name="tipo"
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all">
                <option value="PRODUCTO">PRODUCTO</option>
                <option value="SERVICIO">SERVICIO</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Unidad de Medida</label>
              <input type="text" [(ngModel)]="formModel.unidadMedida" name="unidadMedida"
                     [disabled]="formModel.tipo === 'SERVICIO'"
                     placeholder="Ej: U, Kg, Mts" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400" />
            </div>

          </div>

          <!-- Fila: Costo y Precio -->
          <div class="grid grid-cols-2 gap-4">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Costo Unitario ($)</label>
              <input type="number" [(ngModel)]="formModel.costoUnitario" name="costoUnitario" min="0" step="0.01" required
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Precio Venta ($)</label>
              <input type="number" [(ngModel)]="formModel.precioVenta" name="precioVenta" min="0" step="0.01" required
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

          </div>

          <!-- Stock Inicial (Sólo para crear nuevos PRODUCTOS. Para editar está deshabilitado / no editable) -->
          <div *ngIf="!isEditMode()" class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Stock Inicial</label>
            <input type="number" [(ngModel)]="formModel.stockActual" name="stockActual" min="0"
                   [disabled]="formModel.tipo === 'SERVICIO'"
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400" />
          </div>

          <!-- Descripción -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción Comercial</label>
            <textarea [(ngModel)]="formModel.descripcion" name="descripcion" rows="3"
                      placeholder="Ingrese una descripción opcional del producto..."
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all"></textarea>
          </div>

          <!-- Estado (Sólo visible en Editar) -->
          <div *ngIf="isEditMode()" class="flex items-center gap-3 py-2">
            <input type="checkbox" [(ngModel)]="formModel.estado" name="estado" id="estadoCheckbox"
                   class="w-4 h-4 text-erp-primary bg-slate-100 border-slate-300 rounded focus:ring-erp-primary" />
            <label for="estadoCheckbox" class="text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">Habilitado en el Catálogo</label>
          </div>

          <!-- Botones de Acción Formulario -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeFormModal()" 
                    class="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="formLoading()"
                    class="px-6 py-3.5 bg-erp-primary text-white font-black rounded-xl text-sm flex items-center gap-2 hover:bg-erp-primary/95 transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
              <span *ngIf="formLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Artículo' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE BAJA (HU7.7) -->
    <div *ngIf="showDeleteModal() && productToDelete()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="p-6 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-800">Confirmar Baja del Catálogo</h3>
          <button (click)="closeDeleteModal()" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-4">
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div class="space-y-1">
            <h4 class="font-black text-slate-800 text-sm">¿Dar de baja "{{ productToDelete()?.nombre }}"?</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              El artículo con código <strong>{{ productToDelete()?.codigo }}</strong> dejará de estar visible para facturación y otras operaciones comerciales del inquilino.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="closeDeleteModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Cancelar
          </button>
          <button (click)="executeDelete()" [disabled]="deleteLoading()"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400">
            <span *ngIf="deleteLoading()" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Confirmar Baja
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE KARDEX DETALLADO POR PRODUCTO (HU8.4) -->
    <div *ngIf="showKardexModal() && kardexProducto()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Kardex Físico del Producto</span>
            <h3 class="text-xl font-black text-slate-800 leading-tight mt-0.5">{{ kardexProducto()?.nombre }}</h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">Código: {{ kardexProducto()?.codigo }} | Stock Actual: {{ kardexProducto()?.stockActual }} {{ kardexProducto()?.unidadMedida }}</p>
          </div>
          <button (click)="closeKardexModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Spinner Loading Detail -->
        <div *ngIf="loadingKardexProducto()" class="flex flex-col items-center justify-center py-20 space-y-4">
          <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Consultando movimientos del producto...</p>
        </div>

        <!-- Body (Tabla de Movimientos del Producto) -->
        <div *ngIf="!loadingKardexProducto()" class="p-8 max-h-[480px] overflow-y-auto space-y-4">
          
          <div *ngIf="movimientosProducto().length > 0" class="border border-slate-100 rounded-2xl overflow-hidden animate-fade-in">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider">
                  <th class="p-4">Fecha</th>
                  <th class="p-4">Tipo</th>
                  <th class="p-4 text-right">Cantidad</th>
                  <th class="p-4 text-right">Costo Unitario</th>
                  <th class="p-4">Documento Origen</th>
                  <th class="p-4">ID Origen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 font-bold text-slate-700">
                <tr *ngFor="let m of movimientosProducto()" class="hover:bg-slate-50/30">
                  <td class="p-4 text-slate-500 font-medium">
                    {{ m.fecha | date:'dd MMM yyyy HH:mm' }}
                  </td>
                  <td class="p-4">
                    <span [ngClass]="{
                      'bg-emerald-50 text-emerald-600': m.tipo === 'ENTRADA',
                      'bg-rose-50 text-rose-600': m.tipo === 'SALIDA',
                      'bg-amber-50 text-amber-600': m.tipo === 'AJUSTE'
                    }" class="px-2 py-0.5 rounded text-[10px] font-black uppercase border border-opacity-10"
                    [class.border-emerald-100]="m.tipo === 'ENTRADA'"
                    [class.border-rose-100]="m.tipo === 'SALIDA'"
                    [class.border-amber-100]="m.tipo === 'AJUSTE'">
                      {{ m.tipo }}
                    </span>
                  </td>
                  <td class="p-4 text-right font-mono text-slate-900">
                    {{ m.cantidad }}
                  </td>
                  <td class="p-4 text-right font-mono text-slate-500">
                    {{ m.costoUnitario | currency:'USD' }}
                  </td>
                  <td class="p-4 text-slate-500 font-medium truncate max-w-[150px]" [title]="m.documentoOrigen || ''">
                    {{ m.documentoOrigen || '-' }}
                  </td>
                  <td class="p-4 text-slate-400 font-mono">
                    {{ m.origenId || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="movimientosProducto().length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p class="text-slate-400 font-bold">No se registran movimientos para este artículo.</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button (click)="closeKardexModal()" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl text-sm transition-all shadow-sm">
            Cerrar Kardex
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL REGISTRAR MOVIMIENTO MANUAL (HU8.5) -->
    <div *ngIf="showMovimientoModal()" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Kardex Transaccional</span>
            <h3 class="text-xl font-black text-slate-800 mt-0.5">Registrar Movimiento Manual</h3>
          </div>
          <button (click)="closeMovimientoModal()" class="w-10 h-10 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">✕</button>
        </div>

        <!-- Body Form -->
        <form (ngSubmit)="saveMovimiento()" class="p-8 space-y-5">
          
          <!-- Producto -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Producto <span class="text-red-500">*</span></label>
            <select [(ngModel)]="movimientoForm.producto.id" name="productoId" required
                    class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all">
              <option *ngFor="let p of productos()" [value]="p.id" [hidden]="p.tipo !== 'PRODUCTO' || !p.estado">
                {{ p.nombre }} ({{ p.codigo }})
              </option>
            </select>
          </div>

          <!-- Fila: Tipo Movimiento y Cantidad -->
          <div class="grid grid-cols-2 gap-4">
            
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo Movimiento <span class="text-red-500">*</span></label>
              <select [(ngModel)]="movimientoForm.tipo" name="tipoMov" required
                      class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all">
                <option value="ENTRADA">ENTRADA (Ingreso)</option>
                <option value="SALIDA">SALIDA (Egreso)</option>
                <option value="AJUSTE">AJUSTE (Ajuste)</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Cantidad <span class="text-red-500">*</span></label>
              <input type="number" [(ngModel)]="movimientoForm.cantidad" name="cantidad" min="0.01" step="0.01" required
                     placeholder="Ej: 10" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

          </div>

          <!-- Fila: Costo Unitario y ID Origen -->
          <div class="grid grid-cols-2 gap-4">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Costo Unitario ($)</label>
              <input type="number" [(ngModel)]="movimientoForm.costoUnitario" name="costoUnitario" min="0" step="0.01"
                     placeholder="Ej: 15.50" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">ID Origen (Opcional)</label>
              <input type="number" [(ngModel)]="movimientoForm.origenId" name="origenId" min="1"
                     placeholder="Ej: 101" 
                     class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
            </div>

          </div>

          <!-- Documento Origen (Glosa / Observación) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Documento de Origen / Glosa</label>
            <input type="text" [(ngModel)]="movimientoForm.documentoOrigen" name="documentoOrigen"
                   placeholder="Ej: Ajuste de inventario físico anual" 
                   class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-erp-primary focus:bg-white transition-all" />
          </div>

          <!-- Botones de Acción Formulario -->
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" (click)="closeMovimientoModal()" 
                    class="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="movimientoFormLoading()"
                    class="px-6 py-3.5 bg-erp-primary text-white font-black rounded-xl text-sm flex items-center gap-2 hover:bg-erp-primary/95 transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
              <span *ngIf="movimientoFormLoading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Registrar Movimiento
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InventarioComponent implements OnInit {
  private productoService = inject(ProductoService);
  private empresaService = inject(EmpresaService);
  private userService = inject(UserService);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);

  // Estados generales de perfil y rol
  isSuperAdmin = signal(false);
  userRole = signal<string>('');
  empresas = signal<Empresa[]>([]);
  selectedEmpresaId = signal<number | null>(null);

  // Cargando datos
  loadingData = signal(true);

  // Filtros
  searchQuery = signal('');
  typeFilter = signal<'TODOS' | 'PRODUCTO' | 'SERVICIO'>('TODOS');

  // Datos
  productos = signal<Producto[]>([]);

  // Modal Detalle
  showDetailModal = signal(false);
  selectedProduct = signal<Producto | null>(null);
  loadingDetail = signal(false);

  // Modal Formulario (Crear/Editar)
  showFormModal = signal(false);
  isEditMode = signal(false);
  formLoading = signal(false);
  formModel: Producto = this.getEmptyFormModel();

  // Modal Confirmación Baja
  showDeleteModal = signal(false);
  productToDelete = signal<Producto | null>(null);
  deleteLoading = signal(false);

  // Feedback Visual
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Catálogo computado filtrado
  filteredProductos = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    let data = this.productos();

    // 1. Filtrar por tipo
    if (type !== 'TODOS') {
      data = data.filter(p => p.tipo === type);
    }

    // 2. Filtrar por query de búsqueda
    if (query) {
      data = data.filter(p => 
        p.codigo.toLowerCase().includes(query) ||
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query))
      );
    }

    return data;
  });

  // Control de Pestaña Activa
  activeTab = signal<'CATALOGO' | 'KARDEX'>('CATALOGO');

  // Historial de Kardex
  movimientos = signal<MovimientoInventario[]>([]);
  loadingMovimientos = signal(false);
  kardexSearchQuery = signal('');

  // Modal Detalle Kardex por Producto
  showKardexModal = signal(false);
  kardexProducto = signal<Producto | null>(null);
  movimientosProducto = signal<MovimientoInventario[]>([]);
  loadingKardexProducto = signal(false);

  // Modal Registrar Movimiento Manual
  showMovimientoModal = signal(false);
  movimientoFormLoading = signal(false);
  movimientoForm = this.getEmptyMovimientoForm();

  // Historial de Kardex computado filtrado
  filteredMovimientos = computed(() => {
    const query = this.kardexSearchQuery().toLowerCase().trim();
    let data = this.movimientos();

    if (query) {
      data = data.filter(m => 
        (m.producto && m.producto.nombre && m.producto.nombre.toLowerCase().includes(query)) ||
        (m.producto && m.producto.codigo && m.producto.codigo.toLowerCase().includes(query)) ||
        m.tipo.toLowerCase().includes(query) ||
        (m.documentoOrigen && m.documentoOrigen.toLowerCase().includes(query))
      );
    }
    return data;
  });

  async ngOnInit() {
    await this.initPerfil();
    await this.cargarProductos();
    if (this.canViewKardexTab()) {
      await this.cargarMovimientos();
    }
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
      console.error('Error al inicializar perfil en inventario:', error);
    }
  }

  async cargarProductos() {
    const empId = this.selectedEmpresaId();
    if (this.isSuperAdmin() && !empId) {
      this.loadingData.set(false);
      this.productos.set([]);
      return;
    }

    this.loadingData.set(true);
    try {
      // Si es superadmin pasamos empId, si es inquilino regular el backend detecta el tenant del jwt
      const list = await this.productoService.getProductos(this.isSuperAdmin() ? (empId || undefined) : undefined);
      this.productos.set(list);
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      this.errorMessage.set(error?.error || 'No se pudo obtener el catálogo de productos.');
    } finally {
      this.loadingData.set(false);
    }
  }

  onEmpresaChange(event: any) {
    const val = Number(event.target.value);
    this.selectedEmpresaId.set(val > 0 ? val : null);
    this.cargarProductos();
    if (this.canViewKardexTab()) {
      this.cargarMovimientos();
    }
  }

  // Permisos basados en Roles
  canCreateOrEditOrDelete(): boolean {
    return this.authService.hasPermission('PERM_PRODUCTO_WRITE');
  }

  canViewDetail(): boolean {
    return this.authService.hasPermission('PERM_PRODUCTO_READ');
  }

  // Row Click Handler (Para facilitar el Ver Detalle)
  onRowClick(prod: Producto) {
    if (this.canViewDetail()) {
      this.viewDetail(prod);
    }
  }

  // Acciones de Detalle
  async viewDetail(prod: Producto) {
    if (!prod.id) return;
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.showDetailModal.set(true);
    this.loadingDetail.set(true);
    try {
      const detail = await this.productoService.getProducto(prod.id, this.isSuperAdmin() ? (this.selectedEmpresaId() || undefined) : undefined);
      this.selectedProduct.set(detail);
    } catch (error: any) {
      console.error('Error al ver detalle:', error);
      this.errorMessage.set(error?.error || 'No se pudo cargar el detalle del producto.');
      this.closeDetailModal();
    } finally {
      this.loadingDetail.set(false);
    }
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedProduct.set(null);
    this.loadingDetail.set(false);
  }

  // Acciones de Formulario (Crear)
  openCreateModal() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.formModel = this.getEmptyFormModel();
    this.isEditMode.set(false);
    this.showFormModal.set(true);
  }

  // Acciones de Formulario (Editar)
  openEditModal(prod: Producto) {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    // Clonar para evitar cambios inmediatos en la tabla antes de guardar
    this.formModel = { ...prod };
    this.isEditMode.set(true);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.formLoading.set(false);
  }

  async saveProduct() {
    if (!this.formModel.codigo || !this.formModel.nombre) {
      this.errorMessage.set('El código y el nombre del artículo son campos obligatorios.');
      return;
    }

    this.formLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      if (this.isEditMode()) {
        const id = this.formModel.id!;
        if (this.isSuperAdmin() && !this.formModel.idEmpresa) {
          this.formModel.idEmpresa = this.selectedEmpresaId() || undefined;
        }
        await this.productoService.updateProducto(id, this.formModel);
        this.successMessage.set(`El artículo "${this.formModel.nombre}" ha sido actualizado con éxito.`);
      } else {
        // Al crear, forzar que idEmpresa se asigne del seleccionado en Superadmin
        if (this.isSuperAdmin()) {
          this.formModel.idEmpresa = this.selectedEmpresaId() || undefined;
        }
        await this.productoService.createProducto(this.formModel);
        this.successMessage.set(`El artículo "${this.formModel.nombre}" ha sido registrado en el catálogo.`);
      }
      this.closeFormModal();
      await this.cargarProductos();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      this.errorMessage.set(error?.error || 'Ocurrió un error al procesar el guardado del producto.');
    } finally {
      this.formLoading.set(false);
    }
  }

  // Acciones de Baja
  confirmDelete(prod: Producto) {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.productToDelete.set(prod);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
    this.deleteLoading.set(false);
  }

  async executeDelete() {
    const prod = this.productToDelete();
    if (!prod || !prod.id) return;

    this.deleteLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      await this.productoService.deleteProducto(prod.id, this.isSuperAdmin() ? (this.selectedEmpresaId() || undefined) : undefined);
      this.successMessage.set(`El artículo "${prod.nombre}" ha sido dado de baja en el catálogo contable.`);
      this.closeDeleteModal();
      await this.cargarProductos();
    } catch (error: any) {
      console.error('Error al dar de baja el producto:', error);
      this.errorMessage.set(error?.error || 'Ocurrió un error al dar de baja el artículo.');
    } finally {
      this.deleteLoading.set(false);
    }
  }

  // Permisos para Kardex
  canViewKardexTab(): boolean {
    return this.authService.hasPermission('PERM_INVENTARIO_READ');
  }

  canRegistrarMovimiento(): boolean {
    return this.authService.hasPermission('PERM_INVENTARIO_WRITE');
  }

  // Cargar Historial de Kardex
  async cargarMovimientos() {
    const empId = this.selectedEmpresaId();
    if (this.isSuperAdmin() && !empId) {
      this.movimientos.set([]);
      return;
    }

    this.loadingMovimientos.set(true);
    try {
      const list = await this.inventoryService.getMovimientos(this.isSuperAdmin() ? (empId || undefined) : undefined);
      this.movimientos.set(list);
    } catch (error: any) {
      console.error('Error al cargar movimientos:', error);
      this.errorMessage.set(error?.error || 'No se pudo obtener el historial de Kardex.');
    } finally {
      this.loadingMovimientos.set(false);
    }
  }

  // Kardex por Producto
  async verKardexProducto(prod: Producto) {
    if (!prod.id) return;
    this.kardexProducto.set(prod);
    this.showKardexModal.set(true);
    this.loadingKardexProducto.set(true);
    try {
      const list = await this.inventoryService.getMovimientosByProducto(prod.id, this.isSuperAdmin() ? (this.selectedEmpresaId() || undefined) : undefined);
      this.movimientosProducto.set(list);
    } catch (error: any) {
      console.error('Error al ver Kardex del producto:', error);
      this.errorMessage.set(error?.error || 'No se pudo cargar el historial de Kardex del producto.');
      this.closeKardexModal();
    } finally {
      this.loadingKardexProducto.set(false);
    }
  }

  closeKardexModal() {
    this.showKardexModal.set(false);
    this.kardexProducto.set(null);
    this.movimientosProducto.set([]);
  }

  // Registrar Movimiento Manual
  openMovimientoModal() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.movimientoForm = this.getEmptyMovimientoForm();
    
    // Auto-seleccionar primer producto si existe en la lista para evitar ID 0
    const listProductos = this.productos().filter(p => p.tipo === 'PRODUCTO' && p.estado);
    if (listProductos.length > 0) {
      this.movimientoForm.producto.id = listProductos[0].id!;
    }
    
    this.showMovimientoModal.set(true);
  }

  closeMovimientoModal() {
    this.showMovimientoModal.set(false);
    this.movimientoFormLoading.set(false);
  }

  async saveMovimiento() {
    const form = this.movimientoForm;
    if (!form.producto.id) {
      this.errorMessage.set('Debe seleccionar un producto válido.');
      return;
    }
    if (!form.tipo) {
      this.errorMessage.set('Debe seleccionar el tipo de movimiento.');
      return;
    }
    if (form.cantidad <= 0) {
      this.errorMessage.set('La cantidad debe ser mayor a cero.');
      return;
    }

    this.movimientoFormLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Si es superadmin y no se ha asignado idEmpresa en el formulario, asignarle el seleccionado
    if (this.isSuperAdmin()) {
      form.idEmpresa = this.selectedEmpresaId() || undefined;
    }

    try {
      await this.inventoryService.registrarMovimiento(form);
      const prodName = this.productos().find(p => p.id === form.producto.id)?.nombre || 'artículo';
      this.successMessage.set(`Movimiento manual de tipo ${form.tipo} registrado para "${prodName}".`);
      this.closeMovimientoModal();
      
      // Recargar catálogo y movimientos
      await this.cargarProductos();
      await this.cargarMovimientos();
    } catch (error: any) {
      console.error('Error al registrar movimiento:', error);
      this.errorMessage.set(error?.error || 'Ocurrió un error al registrar el movimiento de inventario.');
    } finally {
      this.movimientoFormLoading.set(false);
    }
  }

  private getEmptyMovimientoForm(): any {
    return {
      tipo: 'ENTRADA',
      cantidad: 1,
      costoUnitario: 0,
      documentoOrigen: '',
      origenId: undefined,
      producto: {
        id: 0
      }
    };
  }

  private getEmptyFormModel(): Producto {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: 'PRODUCTO',
      precioVenta: 0,
      costoUnitario: 0,
      stockActual: 0,
      unidadMedida: 'U',
      estado: true
    };
  }
}
