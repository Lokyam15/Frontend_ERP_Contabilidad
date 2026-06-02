import { Injectable, inject, signal, computed } from '@angular/core';
import { SuscripcionService, Suscripcion } from './suscripcion.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionCapabilitiesService {
  private suscripcionService = inject(SuscripcionService);
  private authService = inject(AuthService);

  // Expose the active subscription signal directly
  public activeSub = this.suscripcionService.activeSub;

  // Check if current user is SUPERADMIN (bypasses plan checks)
  public isSuperAdmin = computed(() => {
    return this.authService.session()?.roleName === 'SUPERADMIN';
  });

  // Get active plan name (case insensitive)
  public planName = computed(() => {
    const sub = this.activeSub();
    return sub?.plan?.nombre ? sub.plan.nombre.trim() : '';
  });

  /**
   * Checks if the company has access to a specific module (contabilidad, inventario, ventas, compras, cartera).
   */
  hasAccessToModule(moduleKey: string): boolean {
    if (this.isSuperAdmin()) {
      return true;
    }

    if (moduleKey.toLowerCase().trim() === 'reportes') {
      return true;
    }

    const sub = this.activeSub();
    if (!sub) {
      // If there is no active subscription, restrict all paid modules
      return false;
    }

    const plan = sub.plan;
    if (plan && plan.caracteristicas) {
      // First, check explicit plan characteristics in the database
      const match = plan.caracteristicas.find(
        c => c.clave.toLowerCase().trim() === moduleKey.toLowerCase().trim()
      );
      if (match) {
        const val = match.valor.toLowerCase().trim();
        return val === 'true' || val === '1' || val === 'yes' || val === 'si';
      }
    }

    // Default fallbacks based on plan name if characteristics are not explicitly defined
    const pName = this.planName().toLowerCase();

    // Premium gets all modules
    if (pName.includes('premium') || pName.includes('enterprise') || pName.includes('empresarial')) {
      return true;
    }

    // Profesional gets all except inventario by default (inventario usually for Premium)
    if (pName.includes('profesional') || pName.includes('pro')) {
      if (moduleKey.toLowerCase().trim() === 'inventario') {
        return false;
      }
      return true;
    }

    // Free/Gratuito gets only Ventas and Compras modules by default
    if (pName.includes('free') || pName.includes('gratis') || pName.includes('gratuito')) {
      return ['ventas', 'compras'].includes(moduleKey.toLowerCase().trim());
    }

    // Default fallback: allow access to keep existing apps working
    return true;
  }

  /**
   * Returns the maximum number of employees allowed (excluding the administrator).
   */
  getMaxEmployees(): number {
    if (this.isSuperAdmin()) {
      return Infinity;
    }

    const sub = this.activeSub();
    if (!sub) {
      return 1; // Limit to 1 employee if no subscription
    }

    const plan = sub.plan;
    if (plan && plan.caracteristicas) {
      // 1. Check direct "max_empleados"
      const maxEmpChar = plan.caracteristicas.find(c =>
        ['max_empleados', 'limite_empleados', 'empleados_max'].includes(c.clave.toLowerCase().trim())
      );
      if (maxEmpChar) {
        const val = parseInt(maxEmpChar.valor.trim(), 10);
        if (!isNaN(val)) return val;
      }

      // 2. Check "max_usuarios" (total users including admin)
      const maxUsersChar = plan.caracteristicas.find(c =>
        ['max_usuarios', 'limite_usuarios', 'usuarios_max'].includes(c.clave.toLowerCase().trim())
      );
      if (maxUsersChar) {
        const val = parseInt(maxUsersChar.valor.trim(), 10);
        if (!isNaN(val)) return Math.max(0, val - 1);
      }
    }

    // Default rules by plan name
    const pName = this.planName().toLowerCase();
    if (pName.includes('premium') || pName.includes('enterprise') || pName.includes('empresarial') || pName.includes('ilimitado')) {
      return Infinity;
    }
    if (pName.includes('profesional') || pName.includes('pro')) {
      return 10;
    }
    if (pName.includes('free') || pName.includes('gratis') || pName.includes('gratuito')) {
      return 1;
    }

    return 1;
  }

  /**
   * Checks if the employee limit has been reached.
   */
  isLimitReached(currentEmployeeCount: number): boolean {
    return currentEmployeeCount >= this.getMaxEmployees();
  }
}
