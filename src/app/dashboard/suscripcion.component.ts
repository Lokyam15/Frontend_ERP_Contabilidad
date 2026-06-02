import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SuscripcionService, Suscripcion } from '../core/suscripcion.service';
import { PlanService, Plan } from '../core/plan.service';
import { UserService } from '../core/user.service';
import { SuscripcionCapabilitiesService } from '../core/suscripcion-capabilities.service';

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

      <!-- Alertas UX de Límite o Módulo Restringido -->
      <div *ngIf="showModuleRestrictedMessage()" class="p-6 bg-indigo-50 border border-indigo-100 rounded-[24px] flex items-center gap-4 animate-fade-in mb-6">
        <div class="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-black text-indigo-900">Módulo Restringido</h4>
          <p class="text-xs text-indigo-700 font-medium font-bold">El módulo al que intentas acceder no está incluido en tu suscripción actual. Selecciona un plan con mayor cobertura a continuación para activarlo.</p>
        </div>
      </div>

      <div *ngIf="activa() && isLimitReached()" class="p-6 bg-amber-50 border border-amber-200 rounded-[24px] flex items-center gap-4 animate-fade-in mb-6">
        <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-black text-amber-900">Plan al límite de capacidad</h4>
          <p class="text-xs text-amber-700 font-medium font-bold">Has registrado {{ allUsersCount() }} colaborador(es) de un máximo de {{ capabilitiesService.getMaxEmployees() }} permitido(s). Mejora tu plan a continuación para registrar más personal.</p>
        </div>
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

            <!-- Columna lateral / Cambio de plan & Soporte -->
            <div class="bg-slate-50 rounded-[32px] p-8 space-y-6">
              <h4 class="text-lg font-black text-slate-800">Acciones del Plan</h4>
              <p class="text-sm text-slate-500 font-medium leading-relaxed">
                ¿Tus requerimientos han cambiado? Puedes mejorar o adaptar tu plan en cualquier momento para obtener más funcionalidades.
              </p>
              
              <button (click)="toggleChangePlan()" 
                      class="w-full py-4 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/30 hover:bg-erp-primary-hover transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                </svg>
                <span>{{ showChangePlan() ? 'Cancelar Cambio' : 'Cambiar de Plan' }}</span>
              </button>

              <button class="w-full py-4 bg-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-300 transition-all text-xs uppercase tracking-wider">
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

      <!-- Estado B / Comparativa de Cambio de Plan -->
      <div *ngIf="(!loading() && !activa()) || showChangePlan()" class="animate-fade-in space-y-10">
        
        <div *ngIf="!activa()" class="p-10 bg-amber-50 rounded-[40px] border-2 border-dashed border-amber-200 text-center space-y-4">
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

        <div *ngIf="activa()" class="border-t border-slate-200 pt-10">
          <h3 class="text-2xl font-black text-slate-800 tracking-tight mb-2">Planes Disponibles para Cambio</h3>
          <p class="text-slate-500 font-medium mb-8">Compara las opciones y haz un upgrade o downgrade según tus necesidades.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let plan of planes()" 
               [class]="plan.id === activa()?.plan?.id ? 
                        'group relative bg-white rounded-[40px] border-2 border-emerald-500 shadow-xl overflow-hidden' : 
                        'group relative bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden'">
            
            <!-- Etiqueta del plan actual o upgrade/downgrade -->
            <div *ngIf="activa()" class="absolute top-4 right-4">
              <span *ngIf="plan.id === activa()?.plan?.id" class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                Plan Actual
              </span>
              <span *ngIf="plan.id !== activa()?.plan?.id && plan.precio > (activa()?.plan?.precio || 0)" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                Upgrade (Mejora)
              </span>
              <span *ngIf="plan.id !== activa()?.plan?.id && plan.precio < (activa()?.plan?.precio || 0)" class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                Downgrade
              </span>
            </div>

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

              <!-- Características resumidas y estructuradas de forma premium -->
              <div class="space-y-4 pt-4 border-t border-slate-50">
                <div class="flex items-center gap-3 text-sm font-black text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ getPlanLimitText(plan.nombre) }}</span>
                </div>

                <div class="space-y-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulos Incluidos</p>
                  <div *ngFor="let mod of getPlanModulesText(plan.nombre)" class="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                    <div [class]="mod.startsWith('Sin') ? 'w-1.5 h-1.5 bg-slate-300 rounded-full' : 'w-1.5 h-1.5 bg-erp-primary rounded-full'"></div>
                    <span [class]="mod.startsWith('Sin') ? 'text-slate-400 line-through' : ''">{{ mod }}</span>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción adaptados -->
              <div class="pt-4">
                <!-- Plan Actual (Inactivo) -->
                <button *ngIf="activa() && plan.id === activa()?.plan?.id" 
                        disabled
                        class="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Plan Activo Actual
                </button>

                <!-- Plan diferente -->
                <button *ngIf="plan.id !== activa()?.plan?.id"
                        (click)="openConfirmChangePlan(plan)" 
                        [disabled]="hiring() !== null"
                        class="w-full py-4 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/30 hover:bg-erp-dark hover:-translate-y-0.5 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2 uppercase text-xs tracking-wider">
                  <span *ngIf="hiring() === plan.id" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{{ activa() ? (plan.precio > (activa()?.plan?.precio || 0) ? 'Adquirir Upgrade' : 'Cambiar a este Plan') : 'Suscribirme ahora' }}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Errores -->
      <div *ngIf="error()" class="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold text-center">
        {{ error() }}
      </div>

      <!-- MODAL DE CONFIRMACIÓN DE CAMBIO DE PLAN -->
      <div *ngIf="showConfirmModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-erp-dark/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
           <div class="p-8 text-center space-y-6">
              <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900">¿Confirmar cambio de plan?</h3>
                <p class="text-slate-500 font-medium px-4">
                  Estás por cambiar tu plan al **{{ selectedPlanToChange()?.nombre }}** ({{ selectedPlanToChange()?.precio | currency:'USD' }}/mes).
                  Se desactivará tu plan actual y se aplicarán los nuevos límites de inmediato.
                </p>
              </div>
              <div class="flex flex-col gap-3 pt-4">
                <button (click)="confirmChangePlan()" [disabled]="hiring() !== null"
                        class="w-full py-4 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/20 hover:bg-erp-primary-hover transition-all flex items-center justify-center gap-3">
                  <span *ngIf="hiring() !== null" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Confirmar Cambio
                </button>
                <button (click)="cancelConfirm()" [disabled]="hiring() !== null"
                        class="w-full py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all">
                  Cancelar
                </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class SuscripcionComponent implements OnInit {
  private suscripcionService = inject(SuscripcionService);
  private planService = inject(PlanService);
  private userService = inject(UserService);
  public capabilitiesService = inject(SuscripcionCapabilitiesService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  activa = this.suscripcionService.activeSub;
  planes = signal<Plan[]>([]);
  error = signal('');
  hiring = signal<number | null>(null);

  // Estados interactivos para cambios de plan (SaaS)
  showChangePlan = signal(false);
  showConfirmModal = signal(false);
  selectedPlanToChange = signal<Plan | null>(null);
  allUsersCount = signal(0);
  showModuleRestrictedMessage = signal(false);

  // Límite alcanzado
  public isLimitReached = computed(() => {
    return this.capabilitiesService.isLimitReached(this.allUsersCount());
  });

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['restricted'] === 'true') {
        this.showModuleRestrictedMessage.set(true);
        // Si fue restringido, le abrimos la vista de planes de forma predeterminada
        this.showChangePlan.set(true);
      }
    });
    await this.loadData();
  }

  toggleChangePlan() {
    this.showChangePlan.set(!this.showChangePlan());
  }

  openConfirmChangePlan(plan: Plan) {
    this.selectedPlanToChange.set(plan);
    this.showConfirmModal.set(true);
  }

  cancelConfirm() {
    this.showConfirmModal.set(false);
    this.selectedPlanToChange.set(null);
  }

  async confirmChangePlan() {
    const plan = this.selectedPlanToChange();
    if (!plan || plan.id === undefined) return;
    this.showConfirmModal.set(false);
    await this.contratarPlan(plan.id);
  }

  async contratarPlan(planId: number | undefined) {
    if (planId === undefined || this.hiring() !== null) return;
    this.hiring.set(planId);
    this.error.set('');
    try {
      await this.suscripcionService.suscribirse({ planId, tipoRenovacion: 'MENSUAL' });
      this.showChangePlan.set(false);
      this.showConfirmModal.set(false);
      await this.loadData();
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.error?.error || 'Error al intentar cambiar el plan de suscripción.');
    } finally {
      this.hiring.set(null);
      this.selectedPlanToChange.set(null);
    }
  }

  async loadData() {
    this.loading.set(true);
    this.error.set('');
    
    try {
      // 1. Obtener conteo de usuarios y planes disponibles en paralelo
      const [users] = await Promise.all([
        this.userService.getUsers().catch(() => []),
        this.loadPlanesDisponibles().catch(() => {})
      ]);

      const employeeCount = users.filter(e => e.rol?.nombre !== 'ADMIN' && e.rol?.nombre !== 'ADMINISTRADOR').length;
      this.allUsersCount.set(employeeCount);

      // 2. Intentar obtener suscripción activa (esto actualizará el signal compartido)
      await this.suscripcionService.getSuscripcionActiva();
    } catch (err: any) {
      // Si devuelve 404, significa que no tiene suscripción activa
      if (err.status === 404) {
        this.suscripcionService.activeSub.set(null);
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

  // Helpers para mostrar capacidades y límites de forma estilizada
  getPlanLimitText(planName: string): string {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('enterprise') || name.includes('empresarial') || name.includes('ilimitado')) {
      return 'Colaboradores Ilimitados';
    }
    if (name.includes('profesional') || name.includes('pro')) {
      return 'Hasta 10 colaboradores';
    }
    if (name.includes('free') || name.includes('gratis') || name.includes('gratuito')) {
      return 'Hasta 1 colaborador (2 usuarios total)';
    }
    return 'Hasta 1 colaborador';
  }

  getPlanModulesText(planName: string): string[] {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('enterprise') || name.includes('empresarial') || name.includes('ilimitado')) {
      return ['Contabilidad Completa', 'Inventario y Stock', 'Facturación y Ventas', 'Compras y Proveedores', 'Cartera y Cobros'];
    }
    if (name.includes('profesional') || name.includes('pro')) {
      return ['Contabilidad Completa', 'Facturación y Ventas', 'Compras y Proveedores', 'Cartera y Cobros', 'Sin módulo Inventario'];
    }
    if (name.includes('free') || name.includes('gratis') || name.includes('gratuito')) {
      return ['Facturación y Ventas', 'Compras y Proveedores', 'Sin Contabilidad', 'Sin Inventario', 'Sin Cartera'];
    }
    return ['Facturación y Ventas', 'Compras y Proveedores'];
  }
}
