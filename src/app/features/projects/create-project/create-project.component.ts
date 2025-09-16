import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router'; // <-- Importamos el Router

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  providers: [MessageService]
})
export class CreateProjectComponent implements OnInit {
  items!: MenuItem[];
  activeIndex: number = 0;

  constructor(private router: Router, public messageService: MessageService) { }

  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Datos básicos',
        routerLink: 'basic-data'
      },
      {
        label: 'Ubicar proyecto',
        routerLink: 'project-location'
      },
      {
        label: 'Cronograma',
        routerLink: 'timeline'
      },
      {
        label: 'Asociación de convenio',
        routerLink: 'agreement-association'
      },
    ];
  }

  // Lógica para los botones de navegación
  isFirstStep(): boolean {
    return this.activeIndex === 0;
  }

  isLastStep(): boolean {
    return this.activeIndex === this.items.length - 1;
  }

  // Usamos el Router para navegar
  nextPage() {
    if (this.activeIndex < this.items.length - 1) {
      this.router.navigate([this.items[this.activeIndex + 1].routerLink], { relativeTo: this.router.routerState.root });
    }
  }

  prevPage() {
    if (this.activeIndex > 0) {
      this.router.navigate([this.items[this.activeIndex - 1].routerLink], { relativeTo: this.router.routerState.root });
    }
  }

  finishWizard() {
    // Lógica para enviar el formulario final
    console.log('Wizard completed!');
  }

  saveDraft() {
    console.log('Guardando borrador...');
  }

  clearDraft() {
    console.log('Reiniciando borrador...');
  }
}