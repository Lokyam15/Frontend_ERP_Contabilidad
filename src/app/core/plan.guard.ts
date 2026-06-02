import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SuscripcionCapabilitiesService } from './suscripcion-capabilities.service';
import { SuscripcionService } from './suscripcion.service';
import { UserService } from './user.service';

export const planGuard: CanActivateFn = async (route, state) => {
  const capabilities = inject(SuscripcionCapabilitiesService);
  const suscripcionService = inject(SuscripcionService);
  const userService = inject(UserService);
  const router = inject(Router);

  // Determine the module name from the route path (e.g. 'inventario', 'contabilidad', etc.)
  const moduleKey = route.routeConfig?.path;
  if (!moduleKey) {
    return true;
  }

  try {
    // 1. Get profile to check role
    const profile = await userService.getMyProfile();
    if (profile.rol?.nombre === 'SUPERADMIN') {
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

    // 3. Check access for this module
    if (capabilities.hasAccessToModule(moduleKey)) {
      return true;
    }

    // Redirect to subscription page if access is denied
    return router.createUrlTree(['/dashboard/suscripcion'], { queryParams: { restricted: 'true' } });
  } catch (error) {
    console.error('Error in planGuard:', error);
    return router.createUrlTree(['/dashboard']);
  }
};
