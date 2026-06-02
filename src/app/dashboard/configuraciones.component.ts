import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService, Configuracion } from '../core/configuracion.service';
import { ContabilidadService, CuentaContable } from '../core/contabilidad.service';
import { UserService } from '../core/user.service';
import { EmpresaService, Empresa } from '../core/empresa.service';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Configuraciones</h2>
          <p class="text-slate-500 font-medium">Parámetros fiscales, monetarios y asignación de cuentas contables automáticas.</p>
        </div>
      </div>

      <!-- Navegación de Pestañas -->
      <div class="border-b border-slate-200">
        <div class="flex gap-8">
          <button type="button" (click)="activeTab.set('fiscal')"
                  [class]="activeTab() === 'fiscal' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-base tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-base tracking-tight transition-all'">
            Parámetros Fiscales
          </button>
          <button type="button" (click)="activeTab.set('cuentas')"
                  [class]="activeTab() === 'cuentas' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-base tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-base tracking-tight transition-all'">
            Cuentas Automáticas
          </button>
          <button type="button" *ngIf="isSuperAdmin()" (click)="activeTab.set('all-configs')"
                  [class]="activeTab() === 'all-configs' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-base tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-base tracking-tight transition-all'">
            Todas las Configuraciones (SuperAdmin)
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
        <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando configuración...</p>
      </div>

      <!-- Formulario Principal -->
      <div *ngIf="!loading() && activeTab() !== 'all-configs'" class="max-w-4xl animate-fade-in">
        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          <div class="p-8 border-b border-slate-50 bg-slate-50/30">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-erp-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-erp-dark/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-800 tracking-tight">
                  {{ activeTab() === 'fiscal' ? 'Panel de Parámetros' : 'Asignación de Cuentas Contables' }}
                </h3>
                <p class="text-slate-400 text-sm font-medium">
                  {{ activeTab() === 'fiscal' ? 'Define los valores impositivos y la moneda base de la empresa.' : 'Mapea las cuentas de tu plan de cuentas para la generación automática de asientos contables.' }}
                </p>
              </div>
            </div>
          </div>

          <form (ngSubmit)="saveConfig()" #configForm="ngForm" class="p-8 space-y-8">
            
            <!-- Pestaña Fiscal -->
            <div [class.hidden]="activeTab() !== 'fiscal'" class="grid md:grid-cols-2 gap-8">
              
              <!-- Sección Fiscal -->
              <div class="space-y-6">
                <h4 class="text-xs font-black text-erp-primary uppercase tracking-widest border-b border-erp-primary/10 pb-2">Impuestos de Ley</h4>
                
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">IVA (%)</label>
                  <div class="relative">
                    <input type="number" name="iva" [(ngModel)]="model.iva" required min="0" max="100" step="0.01"
                           class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800"
                           placeholder="Ej. 13.0">
                    <span class="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">IT (%)</label>
                  <div class="relative">
                    <input type="number" name="it" [(ngModel)]="model.it" required min="0" max="100" step="0.01"
                           class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800"
                           placeholder="Ej. 3.0">
                    <span class="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <!-- Sección Monetaria -->
              <div class="space-y-6">
                <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Configuración Monetaria</h4>
                
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Moneda Base</label>
                  <select name="moneda" [(ngModel)]="model.moneda" required
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option value="Bolivianos">Bolivianos (Bs.)</option>
                    <option value="Dólares">Dólares ($)</option>
                    <option value="Euros">Euros (€)</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Tipo de Cambio</label>
                  <input type="number" name="tipoCambio" [(ngModel)]="model.tipoCambio" required step="0.01"
                         class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. 6.96">
                </div>
              </div>

            </div>

            <!-- Pestaña Cuentas Automáticas -->
            <div [class.hidden]="activeTab() !== 'cuentas'" class="space-y-6">
              <h4 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Mapeo del Plan de Cuentas</h4>
              
              <!-- Alerta de Cuentas Vacías -->
              <div *ngIf="cuentas().length === 0" class="p-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="space-y-1">
                  <h5 class="font-black text-sm text-slate-800">Plan de Cuentas Vacío</h5>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Antes de poder configurar el mapeo, debes registrar las cuentas contables de tu empresa en la sección 
                    <strong>Contabilidad > Plan de Cuentas</strong>. Una vez creadas, aparecerán disponibles en este panel.
                  </p>
                </div>
              </div>

              <div *ngIf="cuentas().length > 0" class="grid md:grid-cols-2 gap-6 animate-fade-in">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta de Caja (Efectivo)</label>
                  <select name="idCuentaCaja" [(ngModel)]="model.idCuentaCaja"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Clientes (Cobros)</label>
                  <select name="idCuentaClientes" [(ngModel)]="model.idCuentaClientes"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Proveedores (Pagos)</label>
                  <select name="idCuentaProveedores" [(ngModel)]="model.idCuentaProveedores"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Ventas (Ingresos)</label>
                  <select name="idCuentaVentas" [(ngModel)]="model.idCuentaVentas"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Compras (Gastos/Activos)</label>
                  <select name="idCuentaCompras" [(ngModel)]="model.idCuentaCompras"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta IVA Débito Fiscal</label>
                  <select name="idCuentaIvaDebito" [(ngModel)]="model.idCuentaIvaDebito"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta IVA Crédito Fiscal</label>
                  <select name="idCuentaIvaCredito" [(ngModel)]="model.idCuentaIvaCredito"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta IT Gasto (Impuesto Transacciones)</label>
                  <select name="idCuentaItGasto" [(ngModel)]="model.idCuentaItGasto"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta IT Pasivo (Impuesto por Pagar)</label>
                  <select name="idCuentaItPasivo" [(ngModel)]="model.idCuentaItPasivo"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Inventario (Mercaderías)</label>
                  <select name="idCuentaInventario" [(ngModel)]="model.idCuentaInventario"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Cuenta Costo de Ventas (Egreso)</label>
                  <select name="idCuentaCostoVentas" [(ngModel)]="model.idCuentaCostoVentas"
                          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-erp-primary focus:bg-white focus:ring-2 focus:ring-erp-primary/20 outline-none transition-all font-bold text-slate-800">
                    <option [ngValue]="null">-- Seleccionar cuenta --</option>
                    <option *ngFor="let c of cuentas()" [ngValue]="c.id">{{ c.codigo }} - {{ c.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div class="pt-6 border-t border-slate-100">
              <div class="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p class="font-bold text-slate-800">Estado de la Configuración</p>
                  <p class="text-xs text-slate-500 font-medium">Define si estos parámetros están vigentes para el sistema.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="estado" [(ngModel)]="model.estado" class="sr-only peer">
                  <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-end gap-4 pt-4">
              <button type="button" (click)="resetForm()" [disabled]="saving()"
                      class="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">
                Restablecer
              </button>
              <button type="submit" [disabled]="!configForm.valid || saving()"
                      class="px-10 py-3 bg-erp-primary text-white rounded-xl font-black shadow-lg shadow-erp-primary/30 hover:shadow-erp-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3">
                <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isUpdating() ? 'Actualizar Configuración' : 'Guardar Configuración' }}
              </button>
            </div>

          </form>
        </div>

        <!-- Feedback Visual -->
        <div *ngIf="message()" 
             [class]="messageType() === 'success' ? 'mt-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-slide-up' : 'mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-slide-up'">
          <svg *ngIf="messageType() === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          <svg *ngIf="messageType() === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
          <span class="font-bold">{{ message() }}</span>
        </div>
      </div>

      <!-- Pestaña SUPERADMIN: Todas las Configuraciones -->
      <div *ngIf="!loading() && activeTab() === 'all-configs' && isSuperAdmin()" class="animate-fade-in space-y-6">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                  <th class="p-6">ID Config</th>
                  <th class="p-6">Empresa</th>
                  <th class="p-6">IVA (%)</th>
                  <th class="p-6">IT (%)</th>
                  <th class="p-6">Moneda</th>
                  <th class="p-6">Tipo Cambio</th>
                  <th class="p-6">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                <tr *ngFor="let config of allConfigs()" class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-6 text-slate-400 font-mono">#{{ config.id }}</td>
                  <td class="p-6 text-slate-800">{{ getEmpresaNombre(config.idEmpresa) }}</td>
                  <td class="p-6 text-slate-800 font-mono">{{ config.iva }}%</td>
                  <td class="p-6 text-slate-800 font-mono">{{ config.it }}%</td>
                  <td class="p-6 text-slate-800">{{ config.moneda }}</td>
                  <td class="p-6 text-slate-800 font-mono">{{ config.tipoCambio }}</td>
                  <td class="p-6">
                    <span [class]="config.estado ? 'px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase border border-emerald-100' : 'px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200'">
                      {{ config.estado ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="allConfigs().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 class="text-lg font-black text-slate-800">No se encontraron configuraciones</h4>
          <p class="text-slate-400 font-medium text-sm mt-1 max-w-sm">No existen configuraciones activas o guardadas de empresas en este momento.</p>
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
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ConfiguracionesComponent implements OnInit {
  private configService = inject(ConfiguracionService);
  private contabilidadService = inject(ContabilidadService);
  private userService = inject(UserService);
  private empresaService = inject(EmpresaService);

  loading = signal(false);
  saving = signal(false);
  isUpdating = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  activeTab = signal<'fiscal' | 'cuentas' | 'all-configs'>('fiscal');

  isSuperAdmin = signal(false);
  cuentas = signal<CuentaContable[]>([]);
  allConfigs = signal<Configuracion[]>([]);
  empresas = signal<Empresa[]>([]);

  model: Configuracion = this.getEmptyModel();

  async ngOnInit() {
    this.loading.set(true);
    await this.initPerfil();
    await this.loadConfig();
    await this.loadCuentas();
    this.loading.set(false);
  }

  async initPerfil() {
    try {
      const profile = await this.userService.getMyProfile();
      const superAdmin = profile.rol?.nombre === 'SUPERADMIN';
      this.isSuperAdmin.set(superAdmin);
      if (superAdmin) {
        const emps = await this.empresaService.getAllEmpresas();
        this.empresas.set(emps);
        const configs = await this.configService.getAllConfiguraciones();
        this.allConfigs.set(configs || []);
      }
    } catch (error) {
      console.error('Error al cargar perfil en configuraciones:', error);
    }
  }

  async loadCuentas() {
    try {
      const list = await this.contabilidadService.getCuentas();
      // Filtrar por cuentas activas y ordenar por código
      const activeCuentas = (list || []).filter(c => c.estado);
      const sorted = [...activeCuentas].sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }));
      this.cuentas.set(sorted);
    } catch (error) {
      console.error('Error al cargar plan de cuentas:', error);
    }
  }

  async loadConfig() {
    try {
      const data = await this.configService.getConfiguracion();
      if (data) {
        this.model = { ...data };
        this.isUpdating.set(true);
      } else {
        this.isUpdating.set(false);
        this.model = this.getEmptyModel();
      }
    } catch (error) {
      console.log('No existe configuración previa o error al cargar:', error);
      this.isUpdating.set(false);
      this.model = this.getEmptyModel();
    }
  }

  async saveConfig() {
    this.saving.set(true);
    this.message.set('');
    
    try {
      if (this.isUpdating()) {
        await this.configService.actualizarConfiguracion(this.model);
        this.showMessage('Configuración actualizada correctamente', 'success');
      } else {
        await this.configService.crearConfiguracion(this.model);
        this.showMessage('Configuración creada con éxito', 'success');
        this.isUpdating.set(true);
      }
    } catch (error: any) {
      this.showMessage('Error al guardar la configuración: ' + (error.error?.message || error.message), 'error');
    } finally {
      this.saving.set(false);
    }
  }

  resetForm() {
    this.loadConfig();
    this.showMessage('Valores restablecidos', 'success');
  }

  getEmpresaNombre(idEmpresa?: number): string {
    if (!idEmpresa) return 'Sin Empresa';
    const emp = this.empresas().find(e => e.id === idEmpresa);
    return emp ? emp.nombre : `Empresa #${idEmpresa}`;
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }

  private getEmptyModel(): Configuracion {
    return {
      iva: 13.0,
      it: 3.0,
      moneda: 'Bolivianos',
      tipoCambio: 6.96,
      estado: true,
      idCuentaCaja: null,
      idCuentaClientes: null,
      idCuentaProveedores: null,
      idCuentaVentas: null,
      idCuentaCompras: null,
      idCuentaIvaDebito: null,
      idCuentaIvaCredito: null,
      idCuentaItGasto: null,
      idCuentaItPasivo: null,
      idCuentaInventario: null,
      idCuentaCostoVentas: null
    };
  }
}
