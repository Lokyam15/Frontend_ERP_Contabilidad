import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService, Empresa } from '../core/empresa.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-mi-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8">
      
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Mi Empresa</h2>
          <p class="text-slate-500 font-medium">Consulta y actualiza la información oficial de tu entidad.</p>
        </div>
        <div *ngIf="!isEditing() && empresa()" class="flex gap-3">
          <button (click)="toggleEdit()" class="px-6 py-2.5 bg-erp-primary text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Editar Información
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-10 h-10 border-4 border-erp-primary/30 border-t-erp-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-bold">Cargando datos de la empresa...</p>
      </div>

      <!-- Contenido Principal -->
      <div *ngIf="!loading() && empresa()">
        
        <!-- MODO VISUALIZACIÓN -->
        <div *ngIf="!isEditing()" class="grid lg:grid-cols-3 gap-8">
          
          <!-- Tarjeta de Identidad -->
          <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div class="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
                <div class="w-16 h-16 bg-erp-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-erp-primary/20">
                  {{ empresa()?.nombre?.[0]?.toUpperCase() }}
                </div>
                <div>
                   <h3 class="text-2xl font-black text-slate-900">{{ empresa()?.nombre }}</h3>
                   <p class="text-slate-500 font-medium">{{ empresa()?.razonSocial }}</p>
                </div>
             </div>
             
             <div class="p-8 grid md:grid-cols-2 gap-8">
                <div class="space-y-6">
                   <div>
                      <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">NIT / Identificación</p>
                      <p class="text-lg font-bold text-slate-800">{{ empresa()?.nit }}</p>
                   </div>
                   <div>
                      <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Dirección Fiscal</p>
                      <p class="text-lg font-bold text-slate-800">{{ empresa()?.direccion }}</p>
                   </div>
                </div>
                <div class="space-y-6">
                   <div>
                      <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Correo de Contacto</p>
                      <p class="text-lg font-bold text-slate-800">{{ empresa()?.correo }}</p>
                   </div>
                   <div>
                      <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</p>
                      <p class="text-lg font-bold text-slate-800">{{ empresa()?.telefono }}</p>
                   </div>
                </div>
             </div>
          </div>

          <!-- Estado y Suscripción -->
          <div class="space-y-6">
             <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Estado de Operación</p>
                <div class="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl">
                   <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                   </span>
                   <span class="font-black text-sm uppercase tracking-wider">Empresa Activa</span>
                </div>
             </div>

             <div class="bg-erp-dark p-8 rounded-3xl text-white shadow-xl">
                <h4 class="text-xl font-black mb-2">Suscripción</h4>
                <p class="text-erp-secondary text-sm mb-6">Tu plan actual y vencimiento.</p>
                <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p class="text-xs font-bold text-erp-primary uppercase mb-1">Plan Premium</p>
                   <p class="text-lg font-black">Vence: 08/05/2027</p>
                </div>
             </div>
          </div>
        </div>

        <!-- MODO EDICIÓN -->
        <div *ngIf="isEditing()" class="max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
           <div class="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 class="text-xl font-black text-slate-800">Actualizar Información</h3>
              <p class="text-slate-500 text-sm">Modifica los campos necesarios y presiona guardar.</p>
           </div>
           
           <form (ngSubmit)="saveChanges()" class="p-8 space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                 <div class="space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">Nombre Comercial</label>
                    <input type="text" [(ngModel)]="editData.nombre" name="nombre" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
                 <div class="space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">Razón Social</label>
                    <input type="text" [(ngModel)]="editData.razonSocial" name="razonSocial" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
                 <div class="space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">NIT</label>
                    <input type="text" [(ngModel)]="editData.nit" name="nit" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
                 <div class="space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">Teléfono</label>
                    <input type="text" [(ngModel)]="editData.telefono" name="telefono" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
                 <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">Dirección Fiscal</label>
                    <input type="text" [(ngModel)]="editData.direccion" name="direccion" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
                 <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-500 uppercase ml-1">Correo Electrónico</label>
                    <input type="email" [(ngModel)]="editData.correo" name="correo" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-erp-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800">
                 </div>
              </div>

              <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-50">
                 <button type="button" (click)="toggleEdit()" class="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">
                    Cancelar
                 </button>
                 <button type="submit" [disabled]="saving()" class="px-10 py-3 bg-erp-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-erp-primary/20 flex items-center gap-2">
                    <span *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
                 </button>
              </div>
           </form>
        </div>

      </div>

      <!-- Alerta de Éxito/Error -->
      <div *ngIf="message()" [ngClass]="messageType() === 'success' ? 'bg-emerald-500' : 'bg-rose-500'" class="fixed bottom-8 right-8 p-4 rounded-2xl text-white font-bold shadow-2xl animate-fade-in z-50 flex items-center gap-3">
         <svg *ngIf="messageType() === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>
         <svg *ngIf="messageType() === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
         {{ message() }}
      </div>

    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class MiEmpresaComponent implements OnInit {
  private userService = inject(UserService);
  private empresaService = inject(EmpresaService);
  
  public empresa = signal<Empresa | null>(null);
  public loading = signal(true);
  public isEditing = signal(false);
  public saving = signal(false);
  
  public message = signal<string | null>(null);
  public messageType = signal<'success' | 'error'>('success');
  
  public editData: Partial<Empresa> = {};

  async ngOnInit() {
    this.loadEmpresa();
  }

  async loadEmpresa() {
    this.loading.set(true);
    try {
      const profile = await this.userService.getMyProfile();
      if (profile.idEmpresa) {
        const data = await this.empresaService.getEmpresaById(profile.idEmpresa);
        this.empresa.set(data);
        this.editData = { ...data };
      }
    } catch (error) {
      console.error('Error cargando empresa', error);
      this.showMessage('No se pudo cargar la información de la empresa', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  toggleEdit() {
    if (!this.isEditing() && this.empresa()) {
      this.editData = { ...this.empresa() };
    }
    this.isEditing.set(!this.isEditing());
  }

  async saveChanges() {
    if (!this.empresa()?.id) return;
    
    this.saving.set(true);
    try {
      const updated = await this.empresaService.updateEmpresa(this.empresa()!.id, this.editData);
      this.empresa.set(updated);
      this.isEditing.set(false);
      this.showMessage('¡Información actualizada con éxito!', 'success');
    } catch (error) {
      console.error('Error al guardar cambios', error);
      this.showMessage('Error al intentar actualizar la empresa', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 4000);
  }
}
