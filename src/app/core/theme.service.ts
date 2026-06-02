import { Injectable, signal, inject, Injector } from '@angular/core';
import { AuthService } from './auth.service';
import { ConfiguracionService } from './configuracion.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultPrimary = '#4F46E5';
  private defaultSecondary = '#94A3B8';
  private injector = inject(Injector);

  primaryColor = signal(this.defaultPrimary);
  secondaryColor = signal(this.defaultSecondary);

  constructor() {
    this.loadTheme();
  }

  async loadTheme() {
    try {
      const authService = this.injector.get(AuthService);
      const session = authService.session();

      // If not logged in, or is superadmin, or no company is linked, reset to defaults
      if (!authService.isAuthenticated() || session?.roleName === 'SUPERADMIN' || !session?.empresaId) {
        this.applyTheme(this.defaultPrimary, this.defaultSecondary);
        return;
      }

      const configService = this.injector.get(ConfiguracionService);
      const config = await configService.getConfiguracion();

      const primary = config.colorPrimario || this.defaultPrimary;
      const secondary = config.colorSecundario || this.defaultSecondary;
      this.applyTheme(primary, secondary);
    } catch (error) {
      // Fallback in case of database error or missing config
      this.applyTheme(this.defaultPrimary, this.defaultSecondary);
    }
  }

  setTheme(primary: string, secondary: string) {
    this.applyTheme(primary, secondary);
  }

  resetTheme() {
    this.applyTheme(this.defaultPrimary, this.defaultSecondary);
  }

  private applyTheme(primary: string, secondary: string) {
    this.primaryColor.set(primary);
    this.secondaryColor.set(secondary);

    const hover = this.adjustBrightness(primary, -15);

    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-hover', hover);
    document.documentElement.style.setProperty('--secondary', secondary);
  }

  private adjustBrightness(hex: string, percent: number): string {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = (R > 0) ? R : 0;
    G = (G > 0) ? G : 0;
    B = (B > 0) ? B : 0;

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }
}
