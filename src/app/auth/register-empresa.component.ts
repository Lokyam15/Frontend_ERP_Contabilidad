import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-register-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-erp-dark flex items-center justify-center p-4 py-12">
      <div class="max-w-4xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        <!-- Sidebar Info -->
        <div class="md:w-1/3 bg-gradient-to-br from-erp-primary to-blue-900 p-10 text-white flex flex-col justify-center">
          <div class="mb-8">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-3xl font-extrabold mb-4">Registro de Empresa</h2>
            <p class="text-blue-100 leading-relaxed">Únete a la plataforma contable más avanzada. Gestiona tu empresa con precisión y profesionalismo.</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm text-blue-100">
              <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
              Control de suscripción
            </div>
            <div class="flex items-center gap-3 text-sm text-blue-100">
              <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
              Usuarios ilimitados
            </div>
            <div class="flex items-center gap-3 text-sm text-blue-100">
              <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
              Reportes financieros
            </div>
          </div>
        </div>

        <!-- Form Area -->
        <div class="md:w-2/3 p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <header class="mb-10">
            <h3 class="text-2xl font-bold text-white mb-2">Comienza ahora</h3>
            <p class="text-erp-secondary text-sm">Completa los datos de tu empresa y crea tu usuario administrador.</p>
          </header>

          <form (ngSubmit)="onSubmit()" class="space-y-8">
            
            <!-- Sección Empresa -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 text-erp-primary border-b border-white/5 pb-2">
                <span class="text-xs font-black uppercase tracking-widest">1. Datos de la Empresa</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Nombre de Empresa</label>
                  <input [(ngModel)]="form.empresaNombre" name="empresaNombre" type="text" required placeholder="Ej. Mi Empresa S.A." class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Razón Social</label>
                  <input [(ngModel)]="form.empresaRazonSocial" name="empresaRazonSocial" type="text" required placeholder="Nombre legal completo" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">NIT</label>
                  <input [(ngModel)]="form.empresaNit" name="empresaNit" type="text" required placeholder="Número de identificación" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Teléfono Empresa</label>
                  <input [(ngModel)]="form.empresaTelefono" name="empresaTelefono" type="text" placeholder="Fijo o móvil" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Correo Empresa</label>
                  <input [(ngModel)]="form.empresaCorreo" name="empresaCorreo" type="email" required placeholder="contacto@empresa.com" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Dirección</label>
                  <input [(ngModel)]="form.empresaDireccion" name="empresaDireccion" type="text" placeholder="Calle, ciudad..." class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            <!-- Sección Administrador -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 text-erp-primary border-b border-white/5 pb-2">
                <span class="text-xs font-black uppercase tracking-widest">2. Cuenta de Administrador</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Username</label>
                  <input [(ngModel)]="form.usuarioUsername" name="usuarioUsername" type="text" required placeholder="admin" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Correo Login</label>
                  <input [(ngModel)]="form.usuarioCorreo" name="usuarioCorreo" type="email" required placeholder="admin@empresa.com" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Contraseña</label>
                  <input [(ngModel)]="form.usuarioPassword" name="usuarioPassword" type="password" required placeholder="••••••••" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            <!-- Sección Personal -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 text-erp-primary border-b border-white/5 pb-2">
                <span class="text-xs font-black uppercase tracking-widest">3. Información del Responsable</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Nombre Completo</label>
                  <input [(ngModel)]="form.infoNombre" name="infoNombre" type="text" required placeholder="Nombre completo" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Cargo</label>
                  <input [(ngModel)]="form.infoCargo" name="infoCargo" type="text" placeholder="Director, Contador..." class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">CI</label>
                  <input [(ngModel)]="form.infoCi" name="infoCi" type="text" placeholder="Cédula de identidad" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Teléfono Personal</label>
                  <input [(ngModel)]="form.infoTelefono" name="infoTelefono" type="text" placeholder="70012345" class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-3 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            <div class="pt-4 space-y-4">
              <button type="submit" [disabled]="loading" class="w-full bg-erp-primary hover:bg-erp-primary-hover text-white font-black py-4 rounded-xl shadow-xl shadow-erp-primary/20 transition-all active:scale-95 disabled:opacity-50">
                {{ loading ? 'Registrando...' : 'Finalizar Registro' }}
              </button>
              <p class="text-center text-sm text-erp-secondary">
                ¿Ya tienes cuenta? <a routerLink="/login" class="text-erp-primary font-bold hover:underline">Inicia sesión aquí</a>
              </p>
            </div>

            <div *ngIf="mensaje" [ngClass]="mensajeClase" class="p-4 rounded-xl text-center text-sm font-bold">
              {{ mensaje }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  `]
})
export class RegisterEmpresaComponent {
  loading = false;
  mensaje = '';
  mensajeClase = '';

  form = {
    empresaNombre: '',
    empresaRazonSocial: '',
    empresaNit: '',
    empresaDireccion: '',
    empresaTelefono: '',
    empresaCorreo: '',
    usuarioUsername: '',
    usuarioCorreo: '',
    usuarioPassword: '',
    infoNombre: '',
    infoCi: '',
    infoCargo: '',
    infoTelefono: ''
  };

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  async onSubmit() {
    this.loading = true;
    this.mensaje = '';
    try {
      await this.api.registerEmpresa(this.form);
      this.mensaje = '¡Registro exitoso! Ya puedes iniciar sesión.';
      this.mensajeClase = 'bg-erp-accent/10 text-erp-accent border border-erp-accent/20';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (e: any) {
      this.mensaje = 'Error al registrar la empresa. Verifica que el correo/username no existan.';
      this.mensajeClase = 'bg-red-500/10 text-red-500 border border-red-500/20';
    } finally {
      this.loading = false;
    }
  }
}
