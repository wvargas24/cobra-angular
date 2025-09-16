// src/app/features/dashboard/components/project-list/project-list.component.ts

import { Component, Input } from '@angular/core';
import { Project } from 'src/app/core/models/project';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  @Input() projects: Project[] = [];

  // --- LÓGICA DE ORDENAMIENTO REINTRODUCIDA ---
  sortOptions: SelectItem[];
  sortField: string = 'name'; // Ordenar por nombre por defecto
  sortOrder: number = 1;      // 1 = ascendente (A-Z)

  // Para que el dropdown muestre el valor por defecto, usamos [(ngModel)]
  // La clave del valor ('name') debe coincidir con una de las opciones de sortOptions.
  selectedSortOption: string = 'name';

  constructor() {
    this.sortOptions = [
      { label: 'Nombre (A-Z)', value: 'name' }, // Coincide con el valor por defecto
      { label: 'Nombre (Z-A)', value: '!name' },
      { label: 'Presupuesto (Mayor a Menor)', value: '!value' },
      { label: 'Presupuesto (Menor a Mayor)', value: 'value' }
    ];
  }

  /**
   * Se dispara cuando el usuario cambia la opción del dropdown de ordenamiento.
   */
  onSortChange(event: any): void {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  getProjectImageUrl(project: Project): string {
    return project.thumbnail || `https://picsum.photos/400/300?random=${project.id}`;
  }

  handleImageError(event: Event, project: Project): void {
    (event.target as HTMLImageElement).src = `https://picsum.photos/400/300?random=${project.id}`;
  }

  getStatusSeverity(state: string): string {
    const statusMap: { [key: string]: string } = {
      'en ejecución': 'success',
      'por iniciar': 'warning',
      'en modificación': 'info',
      'finalizado': 'primary',
      'cancelado': 'danger',
    };
    return statusMap[state?.toLowerCase()] || 'secondary';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En ejecución': 'status-executing',
      'Por iniciar': 'status-pending',
      'En modificación': 'status-modification',
      'Cancelado': 'status-cancelled',
    };
    return statusMap[status] || 'status-default'; // Fallback class
  }
}