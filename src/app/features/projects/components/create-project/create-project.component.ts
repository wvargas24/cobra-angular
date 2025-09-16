import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ProjectStateService } from 'src/app/core/services/project-state.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent {

  steps: MenuItem[];

  constructor(private projectStateService: ProjectStateService) {
    this.steps = [
      { label: 'Datos Básicos' },
      { label: 'Ubicación' },
      { label: 'Cronograma' },
      { label: 'Presupuesto' },
      { label: 'Documentos' },
      { label: 'Resumen' }
    ];
  }

  saveDraft(): void {
  }

  clearDraft(): void {
    this.projectStateService.clearDraft();
  }
}
