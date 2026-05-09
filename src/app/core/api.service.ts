import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // API REAL: POST /api/auth/login
  login(payload: any) {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/auth/login`, payload));
  }

  // API REAL: POST /api/auth/register-empresa
  registerEmpresa(payload: any) {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/auth/register-empresa`, payload));
  }
}
