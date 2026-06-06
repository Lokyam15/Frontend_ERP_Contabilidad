import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { UserService, UserMe } from '../core/user.service';
import { SuscripcionService, Suscripcion } from '../core/suscripcion.service';
import { SuscripcionCapabilitiesService } from '../core/suscripcion-capabilities.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen bg-slate-50 flex overflow-hidden">
      
      <!-- Barra lateral para Escritorio (Pantallas grandes >= lg) -->
      <aside class="hidden lg:flex w-64 h-full bg-erp-dark text-white flex-col shrink-0">
        <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
      </aside>

      <!-- Cajón de barra lateral para Móvil (Pantallas pequeñas < lg) -->
      <div class="lg:hidden">
        <!-- Fondo oscuro con desenfoque al abrir el menú móvil -->
        <div *ngIf="isMobileMenuOpen()" 
             class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
             (click)="closeMobileMenu()">
        </div>
        
        <!-- Contenedor deslizable del menú lateral -->
        <aside [class.translate-x-0]="isMobileMenuOpen()" 
               [class.-translate-x-full]="!isMobileMenuOpen()"
               class="fixed top-0 bottom-0 left-0 z-50 w-64 h-full bg-erp-dark text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl">
          <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
        </aside>
      </div>

      <!-- Contenedor Derecho Principal -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <!-- Header Superior Fijo y Responsivo -->
        <header class="h-20 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div class="flex items-center gap-3">
            <!-- Botón Hamburguesa para abrir el menú en Móvil/Tablet -->
            <button (click)="openMobileMenu()" 
                    title="Abrir Menú"
                    class="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h2 class="text-lg sm:text-xl font-black text-slate-800 tracking-tight truncate max-w-[140px] sm:max-w-none">
               {{ headerTitle() }}
            </h2>
          </div>
          
          <div class="flex items-center gap-4 sm:gap-6" *ngIf="userProfile()">
                  <!-- Indicador de Suscripción / CTA (SaaS) -->
             <ng-container *ngIf="!isSuperAdmin()">
               <div *ngIf="subLoading()" class="h-10 w-32 bg-slate-100 animate-pulse rounded-xl hidden sm:block"></div>
               
               <div *ngIf="!subLoading()">
                 <a routerLink="/dashboard/suscripcion" 
                    [class]="activeSub() ? 
                             'px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 uppercase tracking-wider' : 
                             'px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 uppercase tracking-wider'">
                   
                   <!-- Icono si tiene plan -->
                   <svg *ngIf="activeSub()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                   </svg>
                   
                   <!-- Icono si no tiene plan -->
                   <svg *ngIf="!activeSub()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                   
                   <span>{{ activeSub() ? 'Plan ' + activeSub()?.plan?.nombre : 'Activar Plan' }}</span>
                 </a>
               </div>
             </ng-container>

             <div class="flex items-center gap-2 sm:gap-3">
               <div class="text-right hidden md:block">
                 <p class="text-sm font-black text-slate-800 leading-none mb-1">{{ userProfile()?.info?.nombre || userProfile()?.username }}</p>
                 <p class="text-[10px] font-bold text-slate-400 capitalize">{{ userProfile()?.rol?.nombre }}</p>
               </div>
               <div class="w-9 h-9 sm:w-10 h-10 bg-gradient-to-br from-erp-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-erp-primary/20 text-sm sm:text-base shrink-0">
                 {{ (userProfile()?.username || 'U')[0].toUpperCase() }}
               </div>
             </div>
             
             <!-- Botón Cerrar Sesión en Cabecera (Siempre visible y responsivo) -->
             <button (click)="logout()" title="Cerrar Sesión"
                     class="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-200 flex items-center justify-center shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
          </div>
        </header>

        <!-- Área de Contenido Scrollable con restricción horizontal para evitar cortes -->
        <main class="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50 relative" style="scrollbar-gutter: stable;">
           <div class="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div>

    </div>

    <!-- Plantilla compartida para el contenido de la barra lateral (Desktop & Mobile) -->
    <ng-template #sidebarContent>
      <!-- Cabecera de la Barra Lateral -->
      <div class="p-6 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-erp-primary rounded-lg flex items-center justify-center font-black cursor-pointer" 
               routerLink="/dashboard" 
               (click)="closeMobileMenu()">E</div>
          <span class="font-bold tracking-tight cursor-pointer" 
                routerLink="/dashboard" 
                (click)="closeMobileMenu()">ERP <span class="text-erp-primary">Contable</span></span>
        </div>
        <!-- Botón para cerrar cajón móvil -->
        <button (click)="closeMobileMenu()" 
                class="lg:hidden p-1.5 hover:bg-white/10 rounded-xl text-erp-secondary hover:text-white transition-colors"
                title="Cerrar Menú">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Navegación con Scrollbar Individual -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <div class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest">Menú Principal</div>
        
        <a routerLink="/dashboard" routerLinkActive="bg-erp-primary/10 text-erp-primary" [routerLinkActiveOptions]="{exact: true}"
           (click)="closeMobileMenu()"
           class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Resumen
        </a>

        <!-- Sección exclusiva para SUPERADMIN -->
        <ng-container *ngIf="isSuperAdmin()">
          <a routerLink="/dashboard/empresas" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Gestión Empresas
          </a>
          <a routerLink="/dashboard/roles" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Roles
          </a>
          <a routerLink="/dashboard/permisos" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Permisos
          </a>
          <a routerLink="/dashboard/empleados" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Empleados
          </a>
          <a routerLink="/dashboard/planes" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Planes
          </a>
          <a routerLink="/dashboard/contabilidad" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Contabilidad
          </a>
          <a routerLink="/dashboard/inventario" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventario
          </a>
          <!-- Operaciones -->
          <div class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest mt-4">Operaciones</div>
          <a routerLink="/dashboard/ventas" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Ventas
          </a>
          <a routerLink="/dashboard/compras" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.45 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Compras
          </a>
          <a routerLink="/dashboard/cartera" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cartera
          </a>
          <a routerLink="/dashboard/reportes" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Reportes
          </a>
        </ng-container>

        <!-- Sección para ADMINISTRADOR de empresa -->
        <ng-container *ngIf="!isSuperAdmin()">
          <a *ngIf="hasAccess('mi-empresa')" routerLink="/dashboard/mi-empresa" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Mi Empresa
          </a>
          <a *ngIf="hasAccess('suscripcion')" routerLink="/dashboard/suscripcion" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Mi Suscripción
          </a>

          <a *ngIf="hasAccess('panel-control')" routerLink="/dashboard/panel-control" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Panel de Control
          </a>

          <a *ngIf="hasAccess('configuraciones')" routerLink="/dashboard/configuraciones" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuraciones
          </a>

          <a *ngIf="hasAccess('roles-permisos')" routerLink="/dashboard/roles-permisos" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
            Roles y Permisos
          </a>

          <a *ngIf="hasAccess('empleados')" routerLink="/dashboard/empleados" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Empleados
          </a>

          <a *ngIf="hasAccess('contabilidad')" routerLink="/dashboard/contabilidad" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Contabilidad
          </a>
          <a *ngIf="hasAccess('inventario')" routerLink="/dashboard/inventario" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventario
          </a>
          <!-- Operaciones -->
          <div *ngIf="hasAccess('ventas') || hasAccess('compras') || hasAccess('cartera')" class="px-4 py-2 text-xs font-bold text-erp-secondary uppercase tracking-widest mt-4">Operaciones</div>
          <a *ngIf="hasAccess('ventas')" routerLink="/dashboard/ventas" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Ventas
          </a>
          <a *ngIf="hasAccess('compras')" routerLink="/dashboard/compras" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4v5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Compras
          </a>
          <a *ngIf="hasAccess('cartera')" routerLink="/dashboard/cartera" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cartera
          </a>

          <!-- Reportes -->
          <a *ngIf="hasAccess('reportes')" routerLink="/dashboard/reportes" routerLinkActive="bg-erp-primary/10 text-erp-primary"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 p-3 rounded-xl font-medium transition-all cursor-pointer text-erp-secondary hover:text-white hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Reportes
          </a>
        </ng-container>
      </nav>

      <!-- Pie de página (Perfil y Cerrar Sesión) con botón rojo visible -->
      <div class="p-4 border-t border-white/10 shrink-0 bg-slate-950/20">
        <a routerLink="/dashboard/perfil" routerLinkActive="bg-white/10 text-white" 
           (click)="closeMobileMenu()"
           class="w-full flex items-center gap-3 p-3 text-white/70 hover:bg-white/5 rounded-xl font-medium transition-all cursor-pointer mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Mi Perfil
        </a>
        <button (click)="logout(); closeMobileMenu()" 
                class="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-bold transition-all border border-red-500/20 hover:border-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar Sesión
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    
    /* Scrollbar estilizada para el sidebar */
    nav::-webkit-scrollbar { width: 4px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    
    /* Scrollbar estilizada para el contenido principal */
    main::-webkit-scrollbar { width: 8px; }
    main::-webkit-scrollbar-track { background: transparent; }
    main::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    main::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private suscripcionService = inject(SuscripcionService);
  private capabilitiesService = inject(SuscripcionCapabilitiesService);
  private themeService = inject(ThemeService);
  
  public userProfile = signal<UserMe | null>(null);
  public isMobileMenuOpen = signal(false);
  public activeSub = this.suscripcionService.activeSub;
  public subLoading = signal(true);

  hasAccess(moduleKey: string): boolean {
    return this.capabilitiesService.hasAccessToModule(moduleKey);
  }

  async ngOnInit() {
    try {
      // Cargar los colores específicos de la empresa
      await this.themeService.loadTheme();
      
      const profile = await this.userService.getMyProfile();
      this.userProfile.set(profile);
      if (profile && profile.rol?.nombre !== 'SUPERADMIN') {
        await this.cargarSuscripcion();
      } else {
        this.subLoading.set(false);
      }
    } catch (error) {
      console.error('Error al cargar perfil en Layout', error);
      this.subLoading.set(false);
    }
  }

  async cargarSuscripcion() {
    this.subLoading.set(true);
    try {
      await this.suscripcionService.getSuscripcionActiva();
    } catch (error) {
      // already set to null in SuscripcionService
    } finally {
      this.subLoading.set(false);
    }
  }

  openMobileMenu() {
    this.isMobileMenuOpen.set(true);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  isSuperAdmin(): boolean {
    return this.userProfile()?.rol?.nombre === 'SUPERADMIN';
  }

  canViewCartera(): boolean {
    const role = this.userProfile()?.rol?.nombre;
    return ['SUPERADMIN', 'SUPERADMINISTRADOR', 'ADMIN', 'ADMINISTRADOR', 'CONTADOR', 'AUXILIAR CONTABLE', 'COBRADOR', 'ENCARGADO DE PAGOS'].includes(role || '');
  }

  headerTitle(): string {
    return this.isSuperAdmin() ? 'Panel Global' : 'Gestión Empresarial';
  }

  logout() {
    this.auth.logout();
  }
}
