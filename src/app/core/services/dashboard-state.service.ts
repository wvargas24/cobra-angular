import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectService } from './project.service';
import { Project } from '../models/project';
import { DashboardSummary } from '../models/dashboard';
import { SelectItem } from 'primeng/api';
import { LatLngBounds } from 'leaflet';

// Interfaz para definir la estructura de las opciones de los filtros
interface FilterOptions {
  lineOfActionOptions: SelectItem[];
  statusOptions: SelectItem[];
  typeOptions: SelectItem[];
  subtypeOptions: SelectItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  // --- STATE MANAGEMENT ---
  // BehaviorSubject es ideal aquí porque:
  // 1. Siempre tiene un valor actual que los nuevos suscriptores reciben inmediatamente.
  // 2. Permite emitir nuevos valores a todos los suscriptores.
  // Son la "única fuente de la verdad" para el estado de nuestro dashboard.


  // Subjects privados para mantener el estado interno del servicio
  private readonly _allProjects = new BehaviorSubject<Project[]>([]);
  private readonly _filteredProjects = new BehaviorSubject<Project[]>([]);
  private readonly _summary = new BehaviorSubject<DashboardSummary>({ totalValue: 0, totalExecuted: 0, averagePhysicalProgress: 0, projectCount: 0 });
  private readonly _isLoading = new BehaviorSubject<boolean>(true);
  private readonly _filterOptions = new BehaviorSubject<FilterOptions>({
    lineOfActionOptions: [],
    statusOptions: [],
    typeOptions: [],
    subtypeOptions: []
  });

  // Observables públicos: Los componentes se suscribirán a estos para recibir actualizaciones.
  // El `$` al final es una convención para nombrar observables.
  readonly allProjects$: Observable<Project[]> = this._allProjects.asObservable();
  readonly filteredProjects$: Observable<Project[]> = this._filteredProjects.asObservable();
  readonly summary$: Observable<DashboardSummary> = this._summary.asObservable();
  readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();
  readonly filterOptions$: Observable<FilterOptions> = this._filterOptions.asObservable();


  // Propiedad privada para guardar los límites actuales del mapa
  private _currentMapBounds: LatLngBounds | null = null;

  // Guardaremos los proyectos filtrados por el formulario en un subject separado
  private readonly _formFilteredProjects = new BehaviorSubject<Project[]>([]);

  constructor(private projectService: ProjectService) { }

  /**
   * Carga los proyectos iniciales desde el backend y establece el estado inicial.
   */
  public loadInitialProjects(): void {
    this._isLoading.next(true);
    this.projectService.getProjects().subscribe(
      (data: Project[]) => {
        this._allProjects.next(data);
        //this._filteredProjects.next(data); // Inicialmente, los proyectos filtrados son todos los proyectos
        this._formFilteredProjects.next(data);
        // Y como no hay filtro de mapa, los proyectos finales también son todos.
        this._filteredProjects.next(data);
        this.extractFilterOptions(data);
        this.calculateSummary(data);
        this._isLoading.next(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        // En caso de error, reseteamos los estados a valores vacíos/default
        this._allProjects.next([]);
        this._filteredProjects.next([]);
        this.calculateSummary([]);
        this._isLoading.next(false);
      }
    );
  }

  /**
   * Aplica un conjunto de filtros a la lista completa de proyectos.
   * @param filters - Objeto con los valores del formulario de filtros.
   * @param activeProjectFilter - El filtro de botón activo ('all', 'myProjects', 'favorites').
   */
  public applyFilters(filters: any, activeProjectFilter: 'all' | 'myProjects' | 'favorites'): void {
    // Obtenemos la lista completa de proyectos para filtrar siempre sobre el original.
    const allProjects = this._allProjects.getValue();

    if (!allProjects) {
      this._filteredProjects.next([]);
      this.calculateSummary([]);
      return;
    }

    let tempProjects = allProjects.filter(project => {
      // Filtro por término de búsqueda (name, lineOfAction, state)
      const matchesSearch =
        !filters.searchTerm ||
        (project.name && project.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (project.lineOfAction && project.lineOfAction.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (project.state && project.state.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Filtro por Línea de Acción
      const matchesLineOfAction =
        !filters.selectedLineOfAction ||
        (project.lineOfAction === filters.selectedLineOfAction);

      // Filtro por Estado
      const matchesStatus =
        !filters.selectedStatus ||
        (project.state === filters.selectedStatus);

      // Filtros por rango de presupuesto
      const matchesBudgetRange =
        !filters.budgetRange ||
        typeof project.value !== 'number' || // <-- ¡AÑADIDO! Pasa si el valor no es un número.
        (project.value >= filters.budgetRange[0] && project.value <= filters.budgetRange[1]);

      // Filtro por rango de avance
      const matchesProgressRange =
        !filters.progressRange ||
        typeof project.progress !== 'number' || // <-- ¡AÑADIDO! Pasa si el avance no es un número.
        (project.progress >= filters.progressRange[0] && project.progress <= filters.progressRange[1]);

      // Filtro por tipo
      const matchesType =
        !filters.selectedType ||
        (project.type && project.type.trim() === filters.selectedType);

      // Filtro por subtipo
      const matchesSubtype =
        !filters.selectedSubtype ||
        (project.subtype === filters.selectedSubtype);

      return matchesSearch && matchesLineOfAction && matchesStatus && matchesBudgetRange && matchesProgressRange && matchesType && matchesSubtype;
    });

    // Aplicar el filtro de botones (Todos, Mis Proyectos, Favoritos)
    if (activeProjectFilter === 'myProjects') {
      tempProjects = tempProjects.filter(project => project.myProject);
    } else if (activeProjectFilter === 'favorites') {
      tempProjects = tempProjects.filter(project => project.favorite);
    }

    // Emitimos los nuevos valores a todos los suscriptores
    // this._filteredProjects.next(tempProjects);
    this._formFilteredProjects.next(tempProjects);
    this.applyMapFilter(this._currentMapBounds);
    this.calculateSummary(tempProjects);
  }

  public applyMapFilter(bounds: LatLngBounds | null): void {
    // Guardamos los bounds para poder re-aplicarlos si los filtros del formulario cambian
    this._currentMapBounds = bounds;

    // Empezamos con la lista de proyectos ya filtrada por el formulario
    const projectsToFilter = this._formFilteredProjects.getValue();

    // Si no hay bounds (al inicio o si el mapa no está visible), mostramos todos los proyectos del formulario
    if (!bounds) {
      this._filteredProjects.next(projectsToFilter);
      this.calculateSummary(projectsToFilter); // Recalculamos resumen
      return;
    }

    // Aplicamos el filtro espacial
    const mapFiltered = projectsToFilter.filter(p => {
      // Si el proyecto no tiene coordenadas, no lo podemos mostrar en el mapa, así que lo excluimos.
      if (p.latitude == null || p.longitude == null) {
        return true; // <-- ¡ESTE ES EL CAMBIO CLAVE! (antes era 'false')
      }
      // La magia de Leaflet: .contains() verifica si un punto está dentro de los límites
      return bounds.contains([p.latitude, p.longitude]);
    });

    // Emitimos el resultado final y recalculamos el resumen
    this._filteredProjects.next(mapFiltered);
    this.calculateSummary(mapFiltered);
  }

  /**
   * Procesa la lista de proyectos filtrados para generar los datos y opciones de los gráficos.
   * @param filteredProjects - La lista de proyectos ya filtrados.
   * @returns Un objeto que contiene los datos y opciones para cada gráfico.
   */
  public prepareChartData(filteredProjects: Project[]): { [key: string]: any } {
    // --- Gráfico 1: Proyectos por Línea de Acción (Pie Chart) ---
    const lineOfActionCounts = new Map<string, number>();
    filteredProjects.forEach(project => {
      const line = this.toTitleCase(project.lineOfAction);
      lineOfActionCounts.set(line, (lineOfActionCounts.get(line) || 0) + 1);
    });

    const chartData1 = {
      labels: Array.from(lineOfActionCounts.keys()),
      datasets: [{
        data: Array.from(lineOfActionCounts.values()),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#7E57C2'],
        hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#E57373', '#9575CD']
      }]
    };
    const chartOptions1 = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } }
    };

    // --- Gráfico 2: Proyectos por Estado (Bar Chart) ---
    const statusCounts = new Map<string, number>();
    filteredProjects.forEach(project => {
      const status = this.toTitleCase(project.state);
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const chartData2 = {
      labels: Array.from(statusCounts.keys()),
      datasets: [{
        label: 'Number of Projects',
        data: Array.from(statusCounts.values()),
        backgroundColor: '#42A5F5'
      }]
    };
    const chartOptions2 = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };

    // --- Gráfico 3: Avance Físico Global (Doughnut Chart) ---
    const totalProgress = filteredProjects.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = filteredProjects.length > 0 ? Math.round(totalProgress / filteredProjects.length) : 0;
    const remainingProgress = 100 - averageProgress;

    const chartData3 = {
      labels: ['Progress', 'Remaining'],
      datasets: [{
        data: [averageProgress, remainingProgress],
        backgroundColor: ['#66BB6A', '#e9ecef'],
      }]
    };

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart: any) => {
        // Lógica del plugin para dibujar texto en el centro
        if (chart.data.datasets[0].data.length === 0 || isNaN(chart.data.datasets[0].data[0])) return;
        const { ctx, width, height } = chart.chartArea;
        ctx.restore();
        const fontSize = (height / 114).toFixed(2);
        ctx.font = `bold ${fontSize}em sans-serif`;
        ctx.textBaseline = 'middle';
        const text = `${averageProgress}%`;
        const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
        const textY = height / 2 + chart.top;
        ctx.fillStyle = textColor;
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    };

    const chartOptions3 = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '80%',
      rotation: 270,
      circumference: 180,
      plugins: {
        legend: { display: false },
        centerText: centerTextPlugin
      }
    };

    return { chartData1, chartOptions1, chartData2, chartOptions2, chartData3, chartOptions3 };
  }

  /**
   * Calcula los valores de resumen (totales y promedios) basados en una lista de proyectos.
   * @param projects - La lista de proyectos (usualmente filtrada) sobre la cual calcular.
   */
  // En dashboard-state.service.ts

  private calculateSummary(projects: Project[]): void {
    if (!projects || projects.length === 0) {
      this._summary.next({ totalValue: 0, totalExecuted: 0, averagePhysicalProgress: 0, projectCount: 0 });
      return;
    }

    // Usamos "Number(p.valor) || 0" para convertir el valor a número.
    // Si el valor es null, undefined, o no se puede convertir, se convierte en 0.
    // Esto previene cualquier posibilidad de obtener NaN en nuestras sumas.

    const totalValue = projects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    const totalExecuted = projects.reduce((sum, p) => sum + (Number(p.numvalejecobra) || 0), 0);
    const totalProgress = projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0);

    const averagePhysicalProgress = Math.round(totalProgress / projects.length);
    const projectCount = projects.length;

    this._summary.next({
      totalValue,
      totalExecuted,
      averagePhysicalProgress,
      projectCount
    });
  }

  /**
   * Extrae opciones únicas para los dropdowns de filtro a partir de la lista completa de proyectos.
   * @param projects - La lista completa de todos los proyectos.
   */
  private extractFilterOptions(projects: Project[]): void {
    const uniqueLines = new Set<string>();
    const uniqueStatus = new Set<string>();
    const uniqueTypes = new Set<string>();
    const uniqueSubtypes = new Set<string>();

    projects.forEach(project => {
      if (project.lineOfAction) uniqueLines.add(project.lineOfAction);
      if (project.state) uniqueStatus.add(project.state);
      if (project.type) uniqueTypes.add(project.type.trim()); // Limpiamos espacios
      if (project.subtype) uniqueSubtypes.add(project.subtype);
    });

    this._filterOptions.next({
      lineOfActionOptions: Array.from(uniqueLines).map(item => ({ label: this.toTitleCase(item), value: item })),
      statusOptions: Array.from(uniqueStatus).map(item => ({ label: this.toTitleCase(item), value: item })),
      typeOptions: Array.from(uniqueTypes).map(item => ({ label: this.toTitleCase(item), value: item })),
      subtypeOptions: Array.from(uniqueSubtypes).map(item => ({ label: this.toTitleCase(item), value: item }))
    });
  }

  /**
   * Convierte una cadena de texto a formato "Title Case".
   * @param str - La cadena a convertir.
   */
  private toTitleCase(str: string): string {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }
}