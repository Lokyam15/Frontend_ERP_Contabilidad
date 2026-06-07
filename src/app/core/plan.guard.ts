import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SuscripcionCapabilitiesService } from './suscripcion-capabilities.service';
import { SuscripcionService } from './suscripcion.service';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

export const planGuard: CanActivateFn = async (route, state) => {
  const capabilities = inject(SuscripcionCapabilitiesService);
  const suscripcionService = inject(SuscripcionService);
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Determine the module name from the route path (e.g. 'inventario', 'contabilidad', etc.)
  const moduleKey = route.routeConfig?.path;
  if (!moduleKey) {
    return true;
  }

  try {
    // 1. Get profile to check role
    const profile = await userService.getMyProfile();
    const isSuperAdmin = profile.rol?.nombre === 'SUPERADMIN';
    const isAdmin = profile.rol?.nombre === 'ADMIN';

    if (isSuperAdmin) {
      return true;
    }

    // 2. Fetch the active subscription if it is not already loaded in the service
    if (!capabilities.activeSub()) {
      try {
        await suscripcionService.getSuscripcionActiva();
      } catch (err) {
        // If it throws an error (like 404), the activeSub will remain null
      }
    }

    // 3. Check access for this module by subscription plan
    if (!capabilities.hasAccessToModule(moduleKey)) {
      return router.createUrlTree(['/dashboard/suscripcion'], { queryParams: { restricted: 'true' } });
    }

    // 4. Admin bypasses role permission checks
    if (isAdmin) {
      return true;
    }

    // 5. Check custom role permissions
    const modulePermissions: { [key: string]: string } = {
      'mi-empresa': 'PERM_EMPRESA_READ',
      'panel-control': 'PERM_PANEL_CONTROL_READ',
      'configuraciones': 'PERM_CONFIG_READ',
      'roles-permisos': 'PERM_ROL_READ',
      'empleados': 'PERM_USER_READ',
      'contabilidad': 'PERM_CONTABILIDAD_READ',
      'inventario': 'PERM_PRODUCTO_READ',
      'ventas': 'PERM_OPERACIONES_READ',
      'compras': 'PERM_OPERACIONES_READ',
      'cartera': 'PERM_OPERACIONES_READ',
      'reportes': 'PERM_REPORTES_READ',
      'suscripcion': 'PERM_SUSCRIPCION_READ'
    };

    const requiredPerm = modulePermissions[moduleKey.toLowerCase().trim()];
    if (requiredPerm && !authService.hasPermission(requiredPerm)) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  } catch (error) {
    console.error('Error in planGuard:', error);
    return router.createUrlTree(['/dashboard']);
  }
};
