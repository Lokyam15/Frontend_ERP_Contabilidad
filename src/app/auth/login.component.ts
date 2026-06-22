import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-erp-dark flex items-center justify-center p-4">
      <div class="max-w-4xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        <!-- Info Side -->
        <div class="md:w-1/2 bg-gradient-to-br from-erp-primary to-blue-900 p-12 text-white flex flex-col justify-center">
          <h1 class="text-4xl font-black mb-6 text-white">ERP <span class="text-blue-200">Contable</span></h1>
          <p class="text-lg text-blue-100 leading-relaxed mb-8">
            Gestiona y administra todos tus recursos contables desde una plataforma centralizada y eficiente.
          </p>
          <div class="space-y-4">
             <div class="flex items-center gap-3">
               <div class="w-2 h-2 bg-white rounded-full"></div>
               <span class="text-sm font-medium">Seguridad de nivel bancario</span>
             </div>
             <div class="flex items-center gap-3">
               <div class="w-2 h-2 bg-white rounded-full"></div>
               <span class="text-sm font-medium">Reportes en tiempo real</span>
             </div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="md:w-1/2 p-12 flex flex-col justify-center">
          <header class="mb-8">
            <h2 class="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
            <p class="text-erp-secondary text-sm">Ingresa tus credenciales para continuar</p>
          </header>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Correo Electrónico</label>
              <input
                [(ngModel)]="form.correo"
                name="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                [disabled]="loading"
                class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-4 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-erp-secondary uppercase tracking-wider">Contraseña</label>
              <input
                [(ngModel)]="form.password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                [disabled]="loading"
                class="w-full bg-erp-dark/50 border border-white/10 rounded-xl p-4 text-white focus:border-erp-primary focus:ring-1 focus:ring-erp-primary outline-none transition-all disabled:opacity-50"
              />
            </div>

            <button type="submit" [disabled]="loading || !form.correo || !form.password" class="w-full bg-erp-primary hover:bg-erp-primary-hover text-white font-black py-4 rounded-xl shadow-xl shadow-erp-primary/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              <span *ngIf="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
            </button>
            
            <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>

            <p class="text-center text-sm text-erp-secondary pt-4">
              ¿No tienes cuenta? <a routerLink="/register" class="text-erp-primary font-bold hover:underline">Regístrate gratis</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  loading = false;
  error = '';
  form = { correo: '', password: '' };

  async onSubmit() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login(this.form.correo, this.form.password);
      // Cargar el tema de la empresa recién autenticada
      await this.themeService.loadTheme();
      // Redirección explícita al Dashboard tras éxito
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      console.error(e);
      this.error = 'Credenciales incorrectas o error en el servidor.';
    } finally {
      this.loading = false;
    }
  }
}
