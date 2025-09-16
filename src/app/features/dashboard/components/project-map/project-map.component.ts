import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, ElementRef, NgZone } from '@angular/core';
import { Project } from 'src/app/core/models/project';
import * as L from 'leaflet';
import { LatLngBounds } from 'leaflet';

@Component({
  selector: 'app-project-map',
  templateUrl: './project-map.component.html',
  styleUrls: ['./project-map.component.scss']
})
export class ProjectMapComponent implements AfterViewInit, OnChanges {
  @Input() projects: Project[] = [];
  @Output() viewChanged = new EventEmitter<LatLngBounds>();

  private map!: L.Map;
  private countryLayer!: L.GeoJSON;
  private markersLayer: L.LayerGroup = L.layerGroup();

  private projectIcon = L.icon({
    iconRetinaUrl: 'assets/layout/images/marker-icon-2x-violet.png',
    iconUrl: 'assets/layout/images/marker-icon-violet.png',
    shadowUrl: 'assets/layout/images/marker-shadow.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    shadowSize: [23, 23],
    shadowAnchor: [11, 11],
    popupAnchor: [0, -14],
  });

  constructor(private el: ElementRef, private zone: NgZone) { }

  ngAfterViewInit(): void {
    // Inicialización del mapa después de que la vista esté cargada
    this.initMap();
    this.markersLayer.addTo(this.map); // Agrega la capa de marcadores al mapa
    this.addMarkers(); // Agrega los marcadores iniciales

    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Solo actualizar si la lista de proyectos ha cambiado
    if (changes['projects'] && this.map) {
      this.addMarkers();
    }
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    const mapContainer = this.el.nativeElement.querySelector('#map');
    this.map = L.map(mapContainer, {
      scrollWheelZoom: true // <-- ACTIVAR ZOOM CON RUEDA
    }).setView([4.710989, -74.072092], 6);

    L.tileLayer('https://{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}{r}.png?apikey=5f569286a1de46029457365f26b9319f', {
      attribution: ''
    }).addTo(this.map);

    // Escuchamos los eventos 'zoomend' y 'moveend' que se disparan cuando el usuario termina una acción.
    this.map.on('zoomend moveend', () => {
      // Obtenemos los límites (bounds) actuales del mapa visible
      const bounds = this.map.getBounds();
      // Emitimos el evento hacia el componente padre
      this.viewChanged.emit(bounds);
    });
  }

  private loadGeoJSON(geojsonData: any): void {
    this.countryLayer = L.geoJSON(geojsonData, {
      style: {
        color: "#D9D9D9",
        weight: 1,
        fillColor: "#FFFFFF",
        fillOpacity: 0
      }
    }).addTo(this.map);
  }

  private addMarkers(): void {
    this.markersLayer.clearLayers();
    // No hay necesidad de crear un bounds si no hay proyectos
    if (!this.projects || this.projects.length === 0) {
      return;
    }
    const bounds = L.latLngBounds([]);

    this.projects.forEach(project => {
      if (project.latitude != null && project.longitude != null) {
        const lat = Number(project.latitude);
        const lng = Number(project.longitude);

        // Verificamos que la conversión sea válida antes de crear el marcador
        if (!isNaN(lat) && !isNaN(lng)) {
          const popupContent = `
                <div class="flex flex-column gap-2">
                  <h5 class="m-0">${project.name}</h5>
                  <p class="mt-0 text-900 text-sm font-normal mb-0"><strong>Linea de acción:</strong> ${project.lineOfAction}</p>
                  <p class="mt-0 text-900 text-sm font-normal mb-0"><strong>Estado:</strong> ${project.state}</p>
                  <ul class="list-none p-0 m-0">
                      <li><i class="pi pi-chart-line text-green-500 mr-2"></i> Porcentaje de avance: <strong>${project.progress}%</strong></li>
                      <li><i class="pi pi-dollar text-primary-color mr-2"></i> Presupuestado: <strong>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.value || 0)}</strong></li>
                      <li><i class="pi pi-money-bill text-orange-500 mr-2"></i> Ejecutado: <strong>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.numvalejecobra || 0)}</strong></li>
                  </ul>
                </div>
            `;
          const marker = L.marker([lat, lng], { icon: this.projectIcon }).bindPopup(popupContent);
          this.markersLayer.addLayer(marker);
          bounds.extend(marker.getLatLng());
        }
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: L.point(50, 50) });
    }
  }
}