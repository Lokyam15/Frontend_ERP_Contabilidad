import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService, Configuracion } from '../core/configuracion.service';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Configuraciones</h2>
          <p class="text-slate-500 font-medium">Parámetros fiscales, monetarios e integraciones de la empresa.</p>
        </div>
      </div>

      <!-- Navegación de Pestañas -->
      <div class="border-b border-slate-200">
        <div class="flex gap-8">
          <button type="button" (click)="activeTab.set('fiscal')"
                  [class]="activeTab() === 'fiscal' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-base tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-base tracking-tight transition-all'">
            Parámetros Fiscales
          </button>
          <button type="button" (click)="activeTab.set('odoo')"
                  [class]="activeTab() === 'odoo' ? 'border-b-4 border-erp-primary text-erp-primary pb-4 font-black text-base tracking-tight transition-all' : 'text-slate-400 hover:text-slate-600 pb-4 font-bold text-base tracking-tight transition-all'">
            Integración Odoo
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-bold">Cargando configuración...</p>
      </div>

      <!-- Formulario Principal -->
      <div *ngIf="!loading()" class="max-w-4xl">
        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          <div class="p-8 border-b border-slate-50 bg-slate-50/30">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-erp-dark rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900">{{ activeTab() === 'fiscal' ? 'Panel de Parámetros' : 'Parámetros de Integración' }}</h3>
                <p class="text-slate-400 text-sm font-medium">{{ activeTab() === 'fiscal' ? 'Define los valores impositivos y la moneda base.' : 'Configura la conexión externa a tu servidor Odoo.' }}</p>
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
                    <input type="number" name="iva" [(ngModel)]="model.iva" required min="0" max="100"
                           class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                           placeholder="Ej. 13.0">
                    <span class="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">IT (%)</label>
                  <div class="relative">
                    <input type="number" name="it" [(ngModel)]="model.it" required min="0" max="100"
                           class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
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
                          class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 appearance-none">
                    <option value="Bolivianos">Bolivianos (Bs.)</option>
                    <option value="Dólares">Dólares ($)</option>
                    <option value="Euros">Euros (€)</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Tipo de Cambio</label>
                  <input type="number" name="tipoCambio" [(ngModel)]="model.tipoCambio" required step="0.01"
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. 6.96">
                </div>
              </div>

            </div>

            <!-- Pestaña Odoo -->
            <div [class.hidden]="activeTab() !== 'odoo'" class="space-y-6">
              <h4 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Conexión con Odoo ERP</h4>
              
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">URL del Servidor Odoo</label>
                  <input type="url" name="odooUrl" [(ngModel)]="model.odooUrl" 
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. http://54.208.229.53:8069">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Nombre Base de Datos</label>
                  <input type="text" name="odooDb" [(ngModel)]="model.odooDb" 
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. ADMIN_ODOO">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Usuario / Correo Administrativo</label>
                  <input type="text" name="odooUser" [(ngModel)]="model.odooUser" 
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. admin@odoo.com">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">Contraseña</label>
                  <div class="relative">
                    <input [type]="showPassword() ? 'text' : 'password'" name="odooPassword" [(ngModel)]="model.odooPassword" 
                           class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800 pr-12"
                           placeholder="••••••••">
                    <button type="button" (click)="showPassword.set(!showPassword())" 
                            class="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700">ID de Compañía en Odoo</label>
                  <input type="number" name="odooCompanyId" [(ngModel)]="model.odooCompanyId" 
                         class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-erp-primary focus:bg-white outline-none transition-all font-bold text-slate-800"
                         placeholder="Ej. 1">
                  <p class="text-[10px] text-slate-400 font-semibold leading-relaxed">Identificador numérico de la empresa en la base de datos de Odoo.</p>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div class="pt-6 border-t border-slate-50">
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
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
    </div>
  `,
  styles: [`
    :host { display: block; }
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

  loading = signal(false);
  saving = signal(false);
  isUpdating = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  activeTab = signal<'fiscal' | 'odoo'>('fiscal');
  showPassword = signal(false);

  model: Configuracion = {
    iva: 13.0,
    it: 3.0,
    moneda: 'Bolivianos',
    tipoCambio: 6.96,
    estado: true,
    odooUrl: '',
    odooDb: '',
    odooUser: '',
    odooPassword: '',
    odooCompanyId: undefined
  };

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    this.loading.set(true);
    try {
      const data = await this.configService.getConfiguracion();
      if (data) {
        this.model = { ...data };
        this.isUpdating.set(true);
      }
    } catch (error) {
      console.log('No existe configuración previa o error al cargar:', error);
      this.isUpdating.set(false);
    } finally {
      this.loading.set(false);
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

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }
}
