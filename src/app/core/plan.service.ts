import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
=======
import { environment } from '../../environments/environment';
>>>>>>> sp1
import { firstValueFrom } from 'rxjs';

export interface CaracteristicaPlan {
  id?: number;
  clave: string;
  valor: string;
}

export interface Plan {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
  estado: boolean;
  caracteristicas: CaracteristicaPlan[];
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
<<<<<<< HEAD
  private readonly apiUrl = 'http://localhost:8080/api/planes';
=======
  private readonly apiUrl = `${environment.apiUrl}/planes`;
>>>>>>> sp1

  getPlanes(): Promise<Plan[]> {
    return firstValueFrom(this.http.get<Plan[]>(this.apiUrl));
  }

  getPlanById(id: number): Promise<Plan> {
    return firstValueFrom(this.http.get<Plan>(`${this.apiUrl}/${id}`));
  }

  crearPlan(plan: Plan): Promise<Plan> {
    return firstValueFrom(this.http.post<Plan>(this.apiUrl, plan));
  }

  actualizarPlan(id: number, plan: Plan): Promise<Plan> {
    return firstValueFrom(this.http.put<Plan>(`${this.apiUrl}/${id}`, plan));
  }

  toggleEstado(id: number): Promise<Plan> {
    return firstValueFrom(this.http.patch<Plan>(`${this.apiUrl}/${id}`, {}));
  }

  eliminarPlan(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
