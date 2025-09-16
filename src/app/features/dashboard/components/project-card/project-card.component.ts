// src/app/features/dashboard/components/project-card/project-card.component.ts

import { Component, Input } from '@angular/core';
import { Project } from 'src/app/core/models/project';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  @Input() project!: Project;
  projectImageUrl!: string;

  ngOnInit(): void {
    // Si la URL de la miniatura existe, la usamos, de lo contrario usamos la dummy
    this.projectImageUrl = this.project.thumbnail || 'https://picsum.photos/400/300?random=' + this.project.id;
  }

  /**
   * Returns a CSS class based on the project status.
   * @param status The project status string.
   * @returns A CSS class for coloring.
   */
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En ejecución': 'status-executing',
      'Por iniciar': 'status-pending',
      'En modificación': 'status-modification',
      'Cancelado': 'status-cancelled',
    };
    return statusMap[status] || 'status-default'; // Fallback class
  }

  handleImageError(): void {
    this.projectImageUrl = 'https://picsum.photos/400/300?random=' + this.project.id;
  }
}