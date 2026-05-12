import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService, Plan, CaracteristicaPlan } from '../core/plan.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8 pb-20">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Catálogo de Planes</h2>
          <p class="text-slate-500 font-medium">Gestiona las ofertas comerciales y límites técnicos de la plataforma.</p>
        </div>
        <button (click)="openModal()" 
                class="px-6 py-3 bg-erp-primary text-white rounded-2xl font-black shadow-lg shadow-erp-primary/20 hover:-translate-y-1 transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Plan
        </button>
      </div>

      <!-- Grid de Planes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let plan of planes()" 
             class="group relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
             [ngClass]="{'opacity-75 grayscale-[0.5]': !plan.estado}">
          
          <!-- Banner Superior -->
          <div class="h-24 p-6 flex items-start justify-between"
               [ngClass]="plan.estado ? 'bg-gradient-to-br from-erp-primary to-blue-600' : 'bg-slate-400'">
            <div>
              <h3 class="text-white font-black text-xl leading-tight">{{ plan.nombre }}</h3>
              <span class="text-[10px] font-black uppercase tracking-widest text-white/70">{{ plan.duracionDias }} DÍAS</span>
            </div>
            <div class="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-[10px] font-black uppercase tracking-tighter">
              {{ plan.estado ? 'Activo' : 'Inactivo' }}
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-8 pt-6 space-y-6">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-slate-800">{{ plan.precio | currency:'USD' }}</span>
              <span class="text-slate-400 text-sm font-medium">/ periodo</span>
            </div>

            <p class="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
              {{ plan.descripcion }}
            </p>

            <!-- Características -->
            <div class="space-y-3 pt-2">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incluye:</p>
              <ul class="space-y-2">
                <li *ngFor="let feat of plan.caracteristicas" class="flex items-center gap-3 text-sm text-slate-600 font-bold">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center"
                       [ngClass]="plan.estado ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="truncate">{{ feat.clave }}: <span class="text-slate-400">{{ feat.valor }}</span></span>
                </li>
              </ul>
            </div>

            <!-- Acciones -->
            <div class="pt-6 flex items-center gap-3 border-t border-slate-50">
              <button (click)="editPlan(plan)" 
                      class="flex-1 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl font-black text-xs hover:bg-slate-100 transition-colors">
                Editar
              </button>
              <button (click)="toggleEstado(plan)" 
                      class="px-4 py-2 rounded-xl font-black text-xs transition-colors"
                      [ngClass]="plan.estado ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'">
                {{ plan.estado ? 'Pausar' : 'Activar' }}
              </button>
              <button (click)="deletePlan(plan)" 
                      class="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Creación/Edición -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
          
          <div class="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-2xl font-black text-slate-800">{{ editingPlan() ? 'Editar Plan' : 'Nuevo Plan de Suscripción' }}</h3>
            <button (click)="closeModal()" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-8 overflow-y-auto space-y-8">
            <!-- Formulario Principal -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Plan</label>
                <input type="text" [(ngModel)]="model.nombre" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary outline-none font-bold text-slate-900" placeholder="Ej: Plan Enterprise">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio (USD)</label>
                <input type="number" [(ngModel)]="model.precio" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary outline-none font-bold text-slate-900">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración (Días)</label>
                <input type="number" [(ngModel)]="model.duracionDias" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary outline-none font-bold text-slate-900">
              </div>
              <div class="flex items-center gap-4 h-full pt-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="model.estado" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-erp-primary"></div>
                  <span class="ml-3 text-sm font-black text-slate-600 uppercase tracking-wider">Plan Activo</span>
                </label>
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</label>
                <textarea [(ngModel)]="model.descripcion" rows="2" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-erp-primary outline-none font-bold text-slate-900" placeholder="¿Qué incluye este plan?"></textarea>
              </div>
            </div>

            <!-- Características Dinámicas -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-black text-slate-700 uppercase tracking-tighter">Características y Límites</h4>
                <button (click)="addFeature()" class="text-xs font-black text-erp-primary hover:underline">+ Agregar Campo</button>
              </div>
              
              <div class="space-y-3">
                <div *ngFor="let feat of model.caracteristicas; let i = index" class="flex gap-3 animate-slide-in">
                  <input type="text" [(ngModel)]="feat.clave" placeholder="Clave (Ej: max_users)"
                         class="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-erp-primary text-slate-900">
                  <input type="text" [(ngModel)]="feat.valor" placeholder="Valor (Ej: 10)"
                         class="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-erp-primary text-slate-900">
                  <button (click)="removeFeature(i)" class="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p *ngIf="model.caracteristicas.length === 0" class="text-center py-4 text-slate-400 text-xs italic">No hay características definidas.</p>
              </div>
            </div>
          </div>

          <div class="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
            <button (click)="closeModal()" class="px-6 py-3 text-slate-500 font-black text-sm hover:text-slate-700">Cancelar</button>
            <button (click)="savePlan()" [disabled]="saving()"
                    class="px-10 py-3 bg-erp-dark text-white rounded-2xl font-black shadow-lg shadow-erp-dark/20 hover:-translate-y-1 transition-all flex items-center gap-2">
              <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ editingPlan() ? 'Guardar Cambios' : 'Crear Plan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación de Eliminación -->
      <div *ngIf="showDeleteModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
          <div class="p-8 text-center space-y-4">
            <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-2xl font-black text-slate-800 tracking-tight">¿Eliminar este plan?</h3>
            <p class="text-slate-500 font-medium">
              Estás a punto de eliminar el plan <span class="text-slate-800 font-black">"{{ planToDelete()?.nombre }}"</span>. 
              Esta acción es irreversible y podría afectar a futuras suscripciones.
            </p>
          </div>
          <div class="p-8 bg-slate-50 flex flex-col gap-3">
            <button (click)="confirmDelete()" [disabled]="saving()"
                    class="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Sí, Eliminar Definitivamente
            </button>
            <button (click)="closeDeleteModal()" 
                    class="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all">
              No, Mantener Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Notificación -->
      <div *ngIf="message()" 
           [class]="messageType() === 'success' ? 'fixed bottom-10 right-10 p-5 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-[200]' : 'fixed bottom-10 right-10 p-5 bg-red-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-slide-up z-[200]'">
        <span class="font-black text-sm">{{ message() }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-slide-in { animation: slideIn 0.2s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class PlanesComponent implements OnInit {
  private planService = inject(PlanService);

  planes = signal<Plan[]>([]);
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingPlan = signal<Plan | null>(null);
  planToDelete = signal<Plan | null>(null);
  saving = signal(false);
  
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  model = {
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionDias: 30,
    estado: true,
    caracteristicas: [] as any[]
  };

  async ngOnInit() {
    await this.loadPlanes();
  }

  async loadPlanes() {
    try {
      const data = await this.planService.getPlanes();
      this.planes.set(data);
    } catch (error) {
      this.showMessage('Error al cargar los planes', 'error');
    }
  }

  openModal() {
    this.editingPlan.set(null);
    this.model = {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracionDias: 30,
      estado: true,
      caracteristicas: []
    };
    this.showModal.set(true);
  }

  editPlan(plan: Plan) {
    this.editingPlan.set(plan);
    this.model = {
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracionDias: plan.duracionDias,
      estado: plan.estado,
      caracteristicas: [...plan.caracteristicas.map(f => ({ ...f }))]
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addFeature() {
    this.model.caracteristicas.push({ clave: '', valor: '' });
  }

  removeFeature(index: number) {
    this.model.caracteristicas.splice(index, 1);
  }

  async savePlan() {
    if (!this.model.nombre || this.model.precio < 0) {
      this.showMessage('Por favor completa los datos básicos', 'error');
      return;
    }

    this.saving.set(true);
    try {
      if (this.editingPlan()) {
        await this.planService.actualizarPlan(this.editingPlan()!.id!, this.model as Plan);
        this.showMessage('Plan actualizado con éxito', 'success');
      } else {
        await this.planService.crearPlan(this.model as Plan);
        this.showMessage('Nuevo plan creado correctamente', 'success');
      }
      this.closeModal();
      await this.loadPlanes();
    } catch (error) {
      this.showMessage('Error al procesar el plan', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleEstado(plan: Plan) {
    try {
      await this.planService.toggleEstado(plan.id!);
      await this.loadPlanes();
      this.showMessage(plan.estado ? 'Plan pausado' : 'Plan activado', 'success');
    } catch (error) {
      this.showMessage('Error al cambiar el estado', 'error');
    }
  }

  async deletePlan(plan: Plan) {
    this.planToDelete.set(plan);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.planToDelete.set(null);
  }

  async confirmDelete() {
    const plan = this.planToDelete();
    if (!plan) return;

    this.saving.set(true);
    try {
      await this.planService.eliminarPlan(plan.id!);
      await this.loadPlanes();
      this.showMessage('Plan eliminado definitivamente', 'success');
      this.closeDeleteModal();
    } catch (error) {
      this.showMessage('No se pudo eliminar el plan (puede tener suscripciones activas)', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }
}
