import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-erp-dark text-white font-sans selection:bg-erp-primary/30">
      
      <!-- Navbar -->
      <nav class="fixed top-0 w-full z-50 bg-erp-dark/80 backdrop-blur-md border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-erp-primary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-xl font-bold tracking-tight text-white">ERP <span class="text-erp-primary">Contable</span></span>
            </div>
            
            <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-erp-secondary">
              <a href="#inicio" class="hover:text-white transition-colors">Inicio</a>
              <a href="#beneficios" class="hover:text-white transition-colors">Beneficios</a>
              <a href="#como-funciona" class="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#contacto" class="hover:text-white transition-colors">Contacto</a>
            </div>

            <div class="flex items-center gap-4">
              <a routerLink="/login" class="text-sm font-semibold hover:text-erp-primary transition-colors">Iniciar sesión</a>
              <a routerLink="/register" class="bg-erp-primary hover:bg-erp-primary-hover text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-erp-primary/20 active:scale-95">
                Registrarse
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section id="inicio" class="pt-32 pb-20 px-4">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8 animate-fade-in">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-erp-primary/10 border border-erp-primary/20 text-erp-primary text-xs font-bold uppercase tracking-wider">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-erp-primary opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-erp-primary"></span>
              </span>
              SaaS Empresarial de Confianza
            </div>
            <h1 class="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
              Gestiona la contabilidad de tu empresa con <span class="text-erp-primary">mayor control y precisión</span>
            </h1>
            <p class="text-lg text-erp-secondary max-w-xl leading-relaxed">
              Simplifica tus procesos financieros con reportes en tiempo real, gestión centralizada de cuentas y control total de usuarios. La herramienta definitiva para la administración contable moderna.
            </p>
            <div class="flex flex-wrap gap-4 pt-4">
              <a routerLink="/register" class="bg-erp-primary hover:bg-erp-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-erp-primary/30 flex items-center gap-2 group active:scale-95">
                Comenzar ahora
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a href="#beneficios" class="px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2">
                Ver beneficios
              </a>
            </div>
          </div>
          <div class="relative lg:block">
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-erp-primary/20 blur-[100px] rounded-full"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-erp-accent/10 blur-[100px] rounded-full"></div>
            <div class="relative bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
              <div class="h-8 bg-slate-800 flex items-center px-4 gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div class="p-4">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" alt="Dashboard" class="rounded-lg shadow-inner grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section id="beneficios" class="py-24 bg-white/5 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 relative z-10">
          <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl font-bold uppercase tracking-tight text-erp-primary">Beneficios Exclusivos</h2>
            <p class="text-4xl lg:text-5xl font-extrabold text-white">Todo lo que necesitas para crecer</p>
          </div>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Benefit 1 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-erp-primary/10 rounded-xl flex items-center justify-center text-erp-primary mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Ingresos y Egresos</h3>
              <p class="text-erp-secondary leading-relaxed">Control total de tus flujos de caja con categorización automática y seguimiento detallado.</p>
            </div>
            
            <!-- Benefit 2 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-erp-accent/10 rounded-xl flex items-center justify-center text-erp-accent mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Reportes Profesionales</h3>
              <p class="text-erp-secondary leading-relaxed">Genera estados financieros, balances y libros diarios con un solo clic y formatos oficiales.</p>
            </div>

            <!-- Benefit 3 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Gestión Centralizada</h3>
              <p class="text-erp-secondary leading-relaxed">Administra múltiples sucursales o unidades de negocio desde una única plataforma segura.</p>
            </div>

            <!-- Benefit 4 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Seguridad Total</h3>
              <p class="text-erp-secondary leading-relaxed">Control de acceso basado en roles y encriptación de datos de nivel bancario para tu tranquilidad.</p>
            </div>

            <!-- Benefit 5 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Modelo Suscripción</h3>
              <p class="text-erp-secondary leading-relaxed">Paga solo por lo que necesitas con planes escalables que se adaptan al tamaño de tu empresa.</p>
            </div>

            <!-- Benefit 6 -->
            <div class="p-8 rounded-2xl bg-erp-dark border border-white/10 hover:border-erp-primary/50 transition-all group">
              <div class="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Alta Velocidad</h3>
              <p class="text-erp-secondary leading-relaxed">Plataforma optimizada para una navegación fluida y procesamiento de datos masivo sin esperas.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section id="como-funciona" class="py-24 px-4">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-extrabold text-white">Tres pasos para modernizar tu gestión</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-12 text-white">
            <div class="text-center space-y-6">
              <div class="w-20 h-20 bg-erp-primary/20 rounded-full flex items-center justify-center text-erp-primary text-3xl font-black mx-auto border-4 border-erp-primary shadow-lg shadow-erp-primary/20">1</div>
              <h3 class="text-2xl font-bold">Registra tu empresa</h3>
              <p class="text-erp-secondary leading-relaxed">Completa el formulario de suscripción y obtén acceso inmediato a tu panel administrativo.</p>
            </div>
            <div class="text-center space-y-6">
              <div class="w-20 h-20 bg-erp-accent/20 rounded-full flex items-center justify-center text-erp-accent text-3xl font-black mx-auto border-4 border-erp-accent shadow-lg shadow-erp-accent/20">2</div>
              <h3 class="text-2xl font-bold">Configura usuarios</h3>
              <p class="text-erp-secondary leading-relaxed">Asigna roles y permisos específicos para tu equipo contable y administrativo.</p>
            </div>
            <div class="text-center space-y-6">
              <div class="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-3xl font-black mx-auto border-4 border-blue-500 shadow-lg shadow-blue-500/20">3</div>
              <h3 class="text-2xl font-bold">Administra y Crece</h3>
              <p class="text-erp-secondary leading-relaxed">Comienza a registrar operaciones y visualiza el estado real de tu empresa en segundos.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 px-4">
        <div class="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-erp-primary to-blue-800 p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h2 class="text-4xl md:text-5xl font-extrabold text-white">Empieza hoy a modernizar la gestión contable de tu empresa</h2>
          <p class="text-xl text-blue-100 max-w-2xl mx-auto font-medium">Únete a cientos de empresas que ya optimizaron sus finanzas con nosotros.</p>
          <a routerLink="/register" class="inline-block bg-white text-erp-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl active:scale-95">
            Registrarse ahora
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer id="contacto" class="py-12 border-t border-white/10 mt-20">
        <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-erp-primary rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-xl font-bold tracking-tight text-white">ERP <span class="text-erp-primary">Contable</span></span>
            </div>
            <p class="text-erp-secondary text-sm leading-relaxed">
              La plataforma líder en administración financiera para pequeñas y medianas empresas.
            </p>
          </div>
          <div>
            <h4 class="font-bold text-white mb-6 uppercase text-sm tracking-widest">Sistema</h4>
            <ul class="space-y-4 text-erp-secondary text-sm">
              <li><a href="#inicio" class="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#beneficios" class="hover:text-white transition-colors">Beneficios</a></li>
              <li><a href="#como-funciona" class="hover:text-white transition-colors">Cómo funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-white mb-6 uppercase text-sm tracking-widest">Soporte</h4>
            <ul class="space-y-4 text-erp-secondary text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Centro de ayuda</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Seguridad</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-white mb-6 uppercase text-sm tracking-widest">Legal</h4>
            <ul class="space-y-4 text-erp-secondary text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Términos de servicio</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-white/5 text-center text-erp-secondary text-xs uppercase tracking-widest">
          © 2026 ERP Contable OSS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 1s ease-out forwards;
    }
    :host {
      display: block;
    }
  `]
})
export class LandingPageComponent {}
