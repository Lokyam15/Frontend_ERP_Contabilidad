import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../core/theme.service';
import { SuscripcionService, Suscripcion } from '../core/suscripcion.service';
import { RouterModule } from '@angular/router';
import { ConfiguracionService } from '../core/configuracion.service';

@Component({
  selector: 'app-panel-control',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col gap-1.5">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
        <p class="text-slate-500 font-medium">Personaliza el branding visual y gestiona las preferencias globales de tu empresa.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- COLUMNA 1 & 2: CONFIGURACIÓN DE BRANDING -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Card de Personalización de Colores -->
          <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div class="w-10 h-10 bg-erp-primary/10 text-erp-primary rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-800">Personalización de Colores (Branding)</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Define los colores globales de tu ERP</p>
              </div>
            </div>

            <!-- Selectores de Color -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <!-- Color Primario -->
              <div class="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span class="text-sm font-bold text-slate-700">Color Primario</span>
                <p class="text-xs text-slate-400 text-center font-medium">Usado en botones de acción principal, enlaces destacados y menús activos.</p>
                <div class="flex items-center gap-3 mt-2">
                  <input type="color" [(ngModel)]="tempPrimary" (change)="onColorChange()"
                         class="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer outline-none bg-transparent" />
                  <input type="text" [(ngModel)]="tempPrimary" (input)="onColorChange()"
                         class="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase outline-none focus:border-erp-primary" />
                </div>
              </div>

              <!-- Color Secundario -->
              <div class="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span class="text-sm font-bold text-slate-700">Color Secundario</span>
                <p class="text-xs text-slate-400 text-center font-medium">Usado en botones secundarios, bordes sutiles y textos complementarios.</p>
                <div class="flex items-center gap-3 mt-2">
                  <input type="color" [(ngModel)]="tempSecondary" (change)="onColorChange()"
                         class="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer outline-none bg-transparent" />
                  <input type="text" [(ngModel)]="tempSecondary" (input)="onColorChange()"
                         class="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase outline-none focus:border-erp-primary" />
                </div>
              </div>
            </div>

            <!-- Botones de Acción de Tema -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button (click)="resetTheme()" 
                      class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-xs transition-all active:scale-95">
                Restablecer por Defecto
              </button>
              <button (click)="saveTheme()" 
                      class="px-6 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white font-black rounded-xl text-xs transition-all shadow-md shadow-erp-primary/20 active:scale-95">
                Guardar Configuración Visual
              </button>
            </div>
            
            <div *ngIf="saveSuccess()" class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl text-center animate-fade-in">
              ¡Colores aplicados y guardados en tu sesión local con éxito!
            </div>
          </div>

          <!-- Card de Previsualización en Vivo -->
          <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div class="w-10 h-10 bg-erp-primary/10 text-erp-primary rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-800">Previsualización de Componentes</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Comprueba los cambios visuales en vivo</p>
              </div>
            </div>

            <!-- Área de Componentes de Muestra -->
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
              
              <!-- Botones y enlaces -->
              <div class="space-y-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Botones y Estados de Acción</span>
                <div class="flex flex-wrap gap-4 items-center">
                  <button class="px-5 py-2.5 bg-erp-primary hover:bg-erp-primary-hover text-white text-xs font-black rounded-xl transition-all shadow-md shadow-erp-primary/20">
                    Botón Primario
                  </button>
                  <button class="px-5 py-2.5 bg-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-300 transition-all">
                    Botón Secundario
                  </button>
                  <span class="text-erp-primary font-bold text-xs cursor-pointer hover:underline">Enlace Dinámico</span>
                </div>
              </div>

              <!-- Formularios y foco -->
              <div class="space-y-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Inputs del Sistema</span>
                <div class="max-w-xs">
                  <input type="text" readonly value="Input con borde activo/foco"
                         class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none ring-2 ring-erp-primary/20 border-erp-primary" />
                </div>
              </div>

              <!-- Badges de Estado -->
              <div class="space-y-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Insignias y Etiquetas de Estado</span>
                <div class="flex gap-3">
                  <span class="px-3 py-1 bg-erp-primary/10 text-erp-primary rounded-full text-[10px] font-black uppercase">
                    Elemento Activo
                  </span>
                  <span class="px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-bold">
                    Opcional
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- COLUMNA 3: INFORMACIÓN DE SAAS / SUSCRIPCIÓN -->
        <div class="space-y-8">
          
          <!-- Card de Plan Actual -->
          <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-800">Suscripción SaaS</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Control de Plan</p>
              </div>
            </div>

            <!-- Cargando -->
            <div *ngIf="subLoading()" class="flex flex-col items-center py-8 space-y-2">
              <div class="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <span class="text-xs text-slate-400 font-bold uppercase">Verificando...</span>
            </div>

            <!-- Con Suscripción Activa -->
            <div *ngIf="!subLoading() && activeSub()" class="space-y-6 animate-fade-in">
              <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Plan Contratado</span>
                  <span class="text-lg font-black text-slate-800">{{ activeSub()?.plan?.nombre }}</span>
                </div>
                <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase">ACTIVA</span>
              </div>

              <div class="space-y-3.5 text-xs font-bold text-slate-600 font-medium">
                <div class="flex justify-between">
                  <span class="text-slate-400">Vence:</span>
                  <span class="text-slate-800 font-mono">{{ activeSub()?.fechaFin | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Monto:</span>
                  <span class="text-slate-800 font-mono">{{ activeSub()?.montoPagado | currency:'USD' }} / mes</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Renovación:</span>
                  <span class="text-slate-800 uppercase text-[10px] tracking-wide">{{ activeSub()?.tipoRenovacion }}</span>
                </div>
              </div>

              <a routerLink="/dashboard/suscripcion" 
                 class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl flex items-center justify-center transition-all">
                Ver Detalles e Historial
              </a>
            </div>

            <!-- Sin Suscripción Activa -->
            <div *ngIf="!subLoading() && !activeSub()" class="space-y-5 animate-fade-in">
              <div class="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center">
                <span class="text-xs font-black text-amber-800 block">Suscripción Inactiva</span>
                <p class="text-xs text-amber-700 mt-1 font-medium">Actualmente no cuentas con ningún plan activo de software en esta cuenta.</p>
              </div>

              <a routerLink="/dashboard/suscripcion" 
                 class="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 active:scale-95 uppercase tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Contratar Plan
              </a>
            </div>
          </div>

          <!-- Card Explicativo sobre el Backend -->
          <div class="bg-indigo-50/20 p-6 rounded-[24px] border border-indigo-100/50 space-y-3">
            <h4 class="text-sm font-black text-indigo-900 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Soporte de Persistencia
            </h4>
            <p class="text-xs text-slate-500 font-medium leading-relaxed">
              Las personalizaciones visuales aplicadas se almacenan localmente. Para soportar el guardado permanente por empresa, el backend de Spring Boot requiere agregar columnas de branding (color_primario, color_secundario) en la entidad Configuracion.
            </p>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PanelControlComponent implements OnInit {
  private themeService = inject(ThemeService);
  private suscripcionService = inject(SuscripcionService);
  private configuracionService = inject(ConfiguracionService);

  tempPrimary = '';
  tempSecondary = '';
  saveSuccess = signal(false);

  // Suscripción
  activeSub = this.suscripcionService.activeSub;
  subLoading = signal(true);

  ngOnInit() {
    this.tempPrimary = this.themeService.primaryColor();
    this.tempSecondary = this.themeService.secondaryColor();
    this.cargarSuscripcion();
  }

  onColorChange() {
    // Aplicar temporalmente en vivo para previsualización instantánea
    document.documentElement.style.setProperty('--primary', this.tempPrimary);
    document.documentElement.style.setProperty('--secondary', this.tempSecondary);
  }

  async saveTheme() {
    try {
      try {
        const config = await this.configuracionService.getConfiguracion();
        config.colorPrimario = this.tempPrimary;
        config.colorSecundario = this.tempSecondary;
        await this.configuracionService.actualizarConfiguracion(config);
      } catch (err: any) {
        if (err.status === 404) {
          // Si no existe la configuración, creamos una por defecto
          const newConfig = {
            iva: 13,
            it: 3,
            moneda: 'Bs',
            tipoCambio: 6.96,
            estado: true,
            colorPrimario: this.tempPrimary,
            colorSecundario: this.tempSecondary
          };
          await this.configuracionService.crearConfiguracion(newConfig);
        } else {
          throw err;
        }
      }
      this.themeService.setTheme(this.tempPrimary, this.tempSecondary);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 4000);
    } catch (error) {
      console.error('Error al guardar tema en backend', error);
    }
  }

  async resetTheme() {
    try {
      try {
        const config = await this.configuracionService.getConfiguracion();
        config.colorPrimario = '#4F46E5'; // default
        config.colorSecundario = '#94A3B8';
        await this.configuracionService.actualizarConfiguracion(config);
      } catch (err) {
        // Ignorar si no existe, solo restablecer localmente
      }
      this.themeService.resetTheme();
      this.tempPrimary = this.themeService.primaryColor();
      this.tempSecondary = this.themeService.secondaryColor();
    } catch (error) {
      console.error('Error al restablecer tema en backend', error);
    }
  }

  async cargarSuscripcion() {
    this.subLoading.set(true);
    try {
      await this.suscripcionService.getSuscripcionActiva();
    } catch (error) {
      // already handled by SuscripcionService
    } finally {
      this.subLoading.set(false);
    }
  }
}
