import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuscripcionService, Suscripcion } from '../core/suscripcion.service';
import { PlanService, Plan } from '../core/plan.service';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado Dinámico -->
      <div class="flex flex-col gap-2">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Mi Suscripción</h2>
        <p class="text-slate-500 font-medium">
          {{ activa() ? 'Detalles de tu plan contratado actualmente.' : 'Selecciona el plan que mejor se adapte a tu empresa.' }}
        </p>
      </div>

      <!-- Estado: CARGANDO -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 border-4 border-erp-primary/20 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Verificando suscripción...</p>
      </div>

      <!-- Estado A: TIENE SUSCRIPCIÓN ACTIVA -->
      <div *ngIf="!loading() && activa()" class="animate-slide-up">
        <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-1 border-b border-slate-50 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          
          <div class="p-10 grid md:grid-cols-3 gap-12">
            <!-- Info Principal -->
            <div class="md:col-span-2 space-y-8">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ activa()?.plan?.nombre }}</h3>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">ACTIVO</span>
                  </div>
                  <p class="text-slate-500 font-medium mt-1">{{ activa()?.plan?.descripcion }}</p>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-8">
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vigencia del Plan</p>
                  <div class="flex flex-col">
                    <span class="text-slate-700 font-bold">Inicia: {{ activa()?.fechaInicio | date:'dd MMM, yyyy' }}</span>
                    <span class="text-slate-900 font-black">Vence: {{ activa()?.fechaFin | date:'dd MMM, yyyy' }}</span>
                  </div>
                </div>
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión y Renovación</p>
                  <div class="flex flex-col">
                    <span class="text-slate-900 font-black text-xl">{{ activa()?.montoPagado | currency:'USD' }}</span>
                    <span class="text-slate-500 font-bold text-xs uppercase tracking-tighter">Renovación {{ activa()?.tipoRenovacion }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-sm font-black text-slate-700 uppercase tracking-widest">Beneficios Incluidos</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div *ngFor="let feat of activa()?.plan?.caracteristicas" class="flex items-center gap-3 p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                    <span class="text-sm text-slate-600 font-bold">{{ feat.clave }}: <span class="text-slate-400">{{ feat.valor }}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna lateral / Soporte -->
            <div class="bg-slate-50 rounded-[32px] p-8 space-y-6">
              <h4 class="text-lg font-black text-slate-800">¿Necesitas ayuda?</h4>
              <p class="text-sm text-slate-500 font-medium leading-relaxed">
                Tu suscripción se renovará automáticamente. Si deseas cambiar de plan o cancelar, contacta con nuestro equipo de soporte.
              </p>
              <button class="w-full py-4 bg-erp-dark text-white rounded-2xl font-black shadow-lg shadow-erp-dark/20 hover:-translate-y-1 transition-all">
                Contactar Soporte
              </button>
              <div class="pt-6 border-t border-slate-200">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID de Suscripción</p>
                <code class="text-xs text-slate-400 font-mono">#SUS-000{{ activa()?.id }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado B: NO TIENE SUSCRIPCIÓN (MOSTRAR PLANES) -->
      <div *ngIf="!loading() && !activa()" class="animate-fade-in space-y-10">
        <div class="p-10 bg-amber-50 rounded-[40px] border-2 border-dashed border-amber-200 text-center space-y-4">
          <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-2xl font-black text-amber-900">Aún no tienes un plan activo</h3>
          <p class="text-amber-700 font-medium max-w-lg mx-auto">
            Para comenzar a utilizar todas las herramientas del ERP, selecciona uno de los planes a continuación.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let plan of planes()" class="group relative bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div class="p-8 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-black text-slate-800">{{ plan.nombre }}</h3>
                <div class="w-12 h-12 bg-erp-primary/10 text-erp-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-black text-slate-900 tracking-tight">{{ plan.precio | currency:'USD' }}</span>
                <span class="text-slate-400 font-bold">/ mes</span>
              </div>

              <p class="text-slate-500 font-medium text-sm leading-relaxed">{{ plan.descripcion }}</p>

              <div class="space-y-4 pt-4">
                <div *ngFor="let feat of plan.caracteristicas" class="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-erp-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  {{ feat.clave }}: {{ feat.valor }}
                </div>
              </div>

              <button class="w-full py-4 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/30 hover:bg-erp-dark transition-colors mt-4">
                Suscribirme ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Errores -->
      <div *ngIf="error()" class="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold text-center">
        {{ error() }}
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SuscripcionComponent implements OnInit {
  private suscripcionService = inject(SuscripcionService);
  private planService = inject(PlanService);

  loading = signal(true);
  activa = signal<Suscripcion | null>(null);
  planes = signal<Plan[]>([]);
  error = signal('');

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    this.error.set('');
    
    try {
      // 1. Intentar obtener suscripción activa
      const sub = await this.suscripcionService.getSuscripcionActiva();
      this.activa.set(sub);
    } catch (err: any) {
      // Si devuelve 404, significa que no tiene suscripción activa
      if (err.status === 404) {
        this.activa.set(null);
        await this.loadPlanesDisponibles();
      } else {
        this.error.set('Error al conectar con el servidor de suscripciones.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async loadPlanesDisponibles() {
    try {
      const allPlanes = await this.planService.getPlanes();
      // Mostrar solo planes activos
      this.planes.set(allPlanes.filter(p => p.estado));
    } catch (err) {
      this.error.set('No se pudieron cargar los planes disponibles.');
    }
  }
}
