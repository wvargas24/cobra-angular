import { Component, Input } from '@angular/core';
import { Project } from 'src/app/core/models/project';

@Component({
  selector: 'app-project-grid',
  templateUrl: './project-grid.component.html',
  styleUrls: ['./project-grid.component.scss']
})
export class ProjectGridComponent {
  @Input() projects: Project[] = [];
  @Input() columnClass: string = 'lg:col-3';

  // Variables para la paginación
  first: number = 0;
  rows: number = 12; // Número de proyectos por página

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}