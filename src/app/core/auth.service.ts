import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface UserSession {
  username: string;
  correo: string;
  empresaId: number | null;
  roleName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _session = signal<UserSession | null>(this.decodeToken(localStorage.getItem('token')));
  
  public isAuthenticated = computed(() => !!this._token());
  public session = computed(() => this._session());
  public empresaId = computed(() => this._session()?.empresaId);

  constructor(private http: HttpClient, private router: Router) {}

  async login(correo: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string }>(`${this.baseUrl}/login`, { correo, password })
      );
      
      if (response && response.token) {
        this.setSession(response.token);
      }
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  private setSession(token: string) {
    localStorage.setItem('token', token);
    this._token.set(token);
    this._session.set(this.decodeToken(token));
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string | null): UserSession | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      // Mapeo de claims del backend (JwtService.java)
      return {
        username: payload.username || payload.sub,
        correo: payload.sub,
        empresaId: payload.empresaId ? Number(payload.empresaId) : null,
        roleName: payload.roleName
      };
    } catch (e) {
      return null;
    }
  }
}
