import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../core/producto.service';
import { ContabilidadService, CuentaContable } from '../core/contabilidad.service';
import { CentroCostoService, CentroCosto } from '../core/centro-costo.service';

@Component({
  selector: 'app-criterios-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-100 flex flex-col my-8 transform scale-100 transition-transform duration-300">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-6 bg-erp-primary rounded-full"></div>
            <h3 class="text-lg font-black text-slate-800 tracking-tight">
              Criterios del Reporte: {{ getModuloLabel() }}
            </h3>
          </div>
          <button (click)="close()" class="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Body / Form -->
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <!-- Rango de Fechas (Común para todos) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Desde</label>
              <input type="date" [(ngModel)]="criterios.fechaDesde" 
                     class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm transition-all" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Hasta</label>
              <input type="date" [(ngModel)]="criterios.fechaHasta" 
                     class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm transition-all" />
            </div>
          </div>

          <!-- Campos Dinámicos según Módulo -->
          
          <!-- Ventas / Cartera de Cobro -->
          <div *ngIf="modulo === 'ventas' || (modulo === 'cartera' && carteraTipo === 'COBRAR')">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Cliente</label>
            <input type="text" [(ngModel)]="criterios.clienteNombre" placeholder="Buscar cliente..."
                   class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm transition-all" />
          </div>

          <!-- Compras / Cartera de Pago -->
          <div *ngIf="modulo === 'compras' || (modulo === 'cartera' && carteraTipo === 'PAGAR')">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Proveedor</label>
            <input type="text" [(ngModel)]="criterios.proveedorNombre" placeholder="Buscar proveedor..."
                   class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm transition-all" />
          </div>

          <!-- Filtro de Producto (Ventas, Compras, Inventario) -->
          <div *ngIf="modulo === 'ventas' || modulo === 'compras' || modulo === 'inventario'">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Producto / Servicio</label>
            <select [(ngModel)]="criterios.productoId"
                    class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm bg-white transition-all">
              <option [value]="null">-- Todos los productos --</option>
              <option *ngFor="let prod of productos" [value]="prod.id">{{ prod.nombre }} ({{ prod.codigo }})</option>
            </select>
          </div>

          <!-- Filtros de Cartera / Factura: Estado -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado del Registro</label>
            <select [(ngModel)]="criterios.estado"
                    class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm bg-white transition-all">
              <option value="TODOS">Todos</option>
              
              <!-- Estados de Venta/Compra -->
              <ng-container *ngIf="modulo === 'ventas' || modulo === 'compras'">
                <option value="EMITIDA">Emitida</option>
                <option value="ANULADA">Anulada</option>
              </ng-container>

              <!-- Estados de Cartera -->
              <ng-container *ngIf="modulo === 'cartera'">
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado / Cobrado</option>
                <option value="VENCIDO">Vencido</option>
              </ng-container>
              
              <!-- Estados de Contabilidad -->
              <ng-container *ngIf="modulo === 'contabilidad'">
                <option value="APROBADO">Aprobado</option>
                <option value="BORRADOR">Borrador</option>
                <option value="ANULADO">Anulado</option>
              </ng-container>
            </select>
          </div>

          <!-- Filtros Contables: Cuenta y Centro de Costo -->
          <div *ngIf="modulo === 'contabilidad'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cuenta Contable</label>
              <select [(ngModel)]="criterios.cuentaContableId"
                      class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm bg-white transition-all">
                <option [value]="null">-- Todas --</option>
                <option *ngFor="let cta of cuentas" [value]="cta.id">{{ cta.codigo }} - {{ cta.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Centro de Costo</label>
              <select [(ngModel)]="criterios.centroCostoId"
                      class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-erp-primary/20 focus:border-erp-primary text-sm bg-white transition-all">
                <option [value]="null">-- Todos --</option>
                <option *ngFor="let cc of centrosCosto" [value]="cc.id">{{ cc.codigo }} - {{ cc.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Tipo de Salida -->
          <div class="pt-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destino de Salida</label>
            <div class="grid grid-cols-3 gap-3">
              <button type="button" (click)="setTipoSalida('pantalla')"
                      [class]="tipoSalida === 'pantalla' ? 
                               'py-2.5 px-3 bg-erp-primary/10 border-2 border-erp-primary text-erp-primary font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all' : 
                               'py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Pantalla
              </button>
              
              <button type="button" (click)="setTipoSalida('excel')"
                      [class]="tipoSalida === 'excel' ? 
                               'py-2.5 px-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all' : 
                               'py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel
              </button>
              
              <button type="button" (click)="setTipoSalida('pdf')"
                      [class]="tipoSalida === 'pdf' ? 
                               'py-2.5 px-3 bg-rose-50 border-2 border-rose-500 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all' : 
                               'py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Acciones -->
        <div class="px-6 py-4 border-t bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button (click)="close()" class="px-4 py-2 border rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-bold transition-all active:scale-95">
            Cancelar
          </button>
          
          <button (click)="apply()" 
                  class="px-5 py-2 bg-erp-primary hover:bg-erp-primary-hover text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-erp-primary/20 active:scale-95 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            Generar Reporte
          </button>
        </div>

      </div>
    </div>
  `
})
export class CriteriosModalComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() modulo: string = 'ventas';
  @Input() tipoReporte: 'analitico' | 'gerencial' = 'analitico';
  @Input() carteraTipo: 'COBRAR' | 'PAGAR' = 'COBRAR'; // Solo para cartera
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onApply = new EventEmitter<{ criterios: any; salida: 'pantalla' | 'pdf' | 'excel' }>();

  private productoService = inject(ProductoService);
  private contabilidadService = inject(ContabilidadService);
  private centroCostoService = inject(CentroCostoService);

  public productos: Producto[] = [];
  public cuentas: CuentaContable[] = [];
  public centrosCosto: CentroCosto[] = [];
  
  public criterios: any = {
    fechaDesde: '',
    fechaHasta: '',
    clienteNombre: '',
    proveedorNombre: '',
    productoId: null,
    estado: 'TODOS',
    cuentaContableId: null,
    centroCostoId: null
  };

  public tipoSalida: 'pantalla' | 'pdf' | 'excel' = 'pantalla';

  ngOnInit() {
    this.setDefaultDates();
    this.cargarDatosAuxiliares();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modulo'] || changes['open']) {
      if (this.open) {
        this.cargarDatosAuxiliares();
      }
    }
  }

  setDefaultDates() {
    const hoy = new Date();
    // Primer día del mes
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.criterios.fechaDesde = this.formatDate(primerDia);
    this.criterios.fechaHasta = this.formatDate(hoy);
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  setTipoSalida(tipo: 'pantalla' | 'pdf' | 'excel') {
    this.tipoSalida = tipo;
  }

  async cargarDatosAuxiliares() {
    try {
      // Cargar productos si aplica
      if (['ventas', 'compras', 'inventario'].includes(this.modulo) && this.productos.length === 0) {
        this.productos = await this.productoService.getProductos();
      }

      // Cargar cuentas y centros de costo si aplica
      if (this.modulo === 'contabilidad') {
        if (this.cuentas.length === 0) {
          this.cuentas = await this.contabilidadService.getCuentas();
        }
        if (this.centrosCosto.length === 0) {
          this.centrosCosto = await this.centroCostoService.getCentrosCosto();
        }
      }
    } catch (error) {
      console.error('Error cargando auxiliares para filtros:', error);
    }
  }

  getModuloLabel(): string {
    switch (this.modulo) {
      case 'ventas': return 'Ventas';
      case 'compras': return 'Compras';
      case 'inventario': return 'Inventario / Stock';
      case 'cartera': return this.carteraTipo === 'COBRAR' ? 'Cartera (Cuentas por Cobrar)' : 'Cartera (Cuentas por Pagar)';
      case 'contabilidad': return 'Contabilidad / Libro Diario';
      default: return '';
    }
  }

  close() {
    this.onClose.emit();
  }

  apply() {
    // Clonamos los criterios para enviarlos limpios
    const data = JSON.parse(JSON.stringify(this.criterios));
    
    // Si no aplica algún campo lo eliminamos para no enviarlo al backend
    if (this.modulo !== 'ventas' && this.modulo !== 'cartera') delete data.clienteNombre;
    if (this.modulo !== 'compras' && this.modulo !== 'cartera') delete data.proveedorNombre;
    if (!['ventas', 'compras', 'inventario'].includes(this.modulo)) delete data.productoId;
    if (this.modulo !== 'contabilidad') {
      delete data.cuentaContableId;
      delete data.centroCostoId;
    }
    
    this.onApply.emit({ criterios: data, salida: this.tipoSalida });
  }
}
