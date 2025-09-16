import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project';
import { DashboardSummary } from 'src/app/core/models/dashboard';
import { DashboardStateService } from 'src/app/core/services/dashboard-state.service';
import { LatLngBounds } from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- REFERENCIAS Y ESTADO LOCAL DE LA VISTA ---
  @ViewChild('stickyObserver') private stickyHeaderElement!: ElementRef;
  isStickyActive: boolean = false;
  layoutView: 'grid' | 'list' | 'split' | 'map' = this.getInitialLayout();
  projectsSkeletons = new Array(12);

  // --- OBSERVABLES DEL SERVICIO DE ESTADO ---
  // El pipe 'async' en la plantilla se encargará de las suscripciones y desuscripciones.
  filteredProjects$: Observable<Project[]>;
  summary$: Observable<DashboardSummary>;
  isLoading$: Observable<boolean>;
  filterOptions$: Observable<any>;

  // --- PROPIEDADES PARA LOS GRÁFICOS ---
  chartData1: any;
  chartOptions1: any;
  chartData2: any;
  chartOptions2: any;
  chartData3: any;
  chartOptions3: any;

  // --- GESTIÓN INTERNA DE FILTROS ---
  // Guardamos el estado actual de los filtros para poder combinarlos
  private currentFormFilters: any = {};
  public activeProjectFilter: 'all' | 'myProjects' | 'favorites' = 'all';

  // --- SUSCRIPCIONES MANUALES ---
  private projectSubscription!: Subscription;
  private observer!: IntersectionObserver;

  constructor(private dashboardState: DashboardStateService) {
    // Asignamos los observables del servicio a nuestras propiedades
    this.filteredProjects$ = this.dashboardState.filteredProjects$;
    this.summary$ = this.dashboardState.summary$;
    this.isLoading$ = this.dashboardState.isLoading$;
    this.filterOptions$ = this.dashboardState.filterOptions$;
  }

  ngOnInit(): void {
    // Le pedimos al servicio que cargue los datos iniciales.
    this.dashboardState.loadInitialProjects();

    // Nos suscribimos a los proyectos filtrados para actualizar los gráficos cada vez que cambien.
    this.projectSubscription = this.filteredProjects$.subscribe(projects => {
      this.prepareChartData(projects);
    });
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    // Limpiamos las suscripciones y el observer para evitar fugas de memoria.
    if (this.observer) this.observer.disconnect();
    if (this.projectSubscription) this.projectSubscription.unsubscribe();
  }

  onMapViewChanged(bounds: LatLngBounds): void {
    // Simplemente le pasamos los nuevos límites al servicio de estado.
    // El servicio se encargará de toda la lógica de filtrado y actualización.
    this.dashboardState.applyMapFilter(bounds);
  }

  /**
   * Manejador del evento (filtersChanged) del componente hijo DashboardFiltersComponent.
   * @param filters El objeto con los valores del formulario de filtros.
   */
  onFiltersChanged(filters: any): void {
    this.currentFormFilters = filters;
    this.dashboardState.applyFilters(this.currentFormFilters, this.activeProjectFilter);
  }

  /**
   * Cambia el filtro activo de botones (Todos, Mis proyectos, etc.) y vuelve a aplicar los filtros.
   * Este método es llamado por los botones que están en la plantilla de este componente.
   * @param filter El nuevo filtro a activar.
   */
  setActiveProjectFilter(filter: 'all' | 'myProjects' | 'favorites'): void {
    this.activeProjectFilter = filter;
    this.dashboardState.applyFilters(this.currentFormFilters, this.activeProjectFilter);
  }

  private getInitialLayout(): 'grid' | 'list' | 'split' | 'map' {
    try {
      const savedView = localStorage.getItem('dashboardLayoutView');
      // Verificamos que el valor guardado sea uno de los tipos permitidos
      if (savedView === 'grid' || savedView === 'list' || savedView === 'split' || savedView === 'map') {
        return savedView;
      }
    } catch (e) {
      console.error('Error al leer de localStorage', e);
    }

    // Si no hay nada guardado, o el valor es inválido, o hay un error, devolvemos el valor por defecto.
    return 'split';
  }

  /**
   * Actualiza el estado local para cambiar la vista de los proyectos.
   * @param view El tipo de vista a mostrar.
   */
  changeLayout(view: 'grid' | 'list' | 'split' | 'map'): void {
    this.layoutView = view;
    try {
      localStorage.setItem('dashboardLayoutView', view);
    } catch (e) {
      console.error('Error al guardar en localStorage', e);
    }
  }

  /**
   * Prepara los datos para los gráficos llamando al método correspondiente en el servicio de estado.
   * @param projects La lista actual de proyectos filtrados.
   */
  // En DashboardComponent - prepareChartData()
  private prepareChartData(projects: Project[]): void {
    const chartInfo = this.dashboardState.prepareChartData(projects);
    this.chartData1 = chartInfo['chartData1'];
    this.chartOptions1 = chartInfo['chartOptions1'];
    this.chartData2 = chartInfo['chartData2'];
    this.chartOptions2 = chartInfo['chartOptions2'];
    this.chartData3 = chartInfo['chartData3'];
    this.chartOptions3 = chartInfo['chartOptions3'];
  }

  /**
   * Configura el IntersectionObserver para el efecto de la cabecera "sticky".
   */
  private setupIntersectionObserver(): void {
    const options = { root: null, rootMargin: '-1px 0px 0px 0px', threshold: 1.0 };
    this.observer = new IntersectionObserver(([entry]) => {
      this.isStickyActive = entry.intersectionRatio < 1;
    }, options);

    if (this.stickyHeaderElement && this.stickyHeaderElement.nativeElement) {
      this.observer.observe(this.stickyHeaderElement.nativeElement);
    }
  }
}