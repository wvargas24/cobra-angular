
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ProjectsRoutingModule } from './projects-routing.module';
import { CreateProjectComponent } from './components/create-project/create-project.component';

// PrimeNG Modules
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

// Step Components
import { BasicDataComponent } from './components/steps/basic-data/basic-data.component';
import { ProjectLocationComponent } from './components/steps/project-location/project-location.component';

@NgModule({
  declarations: [
    CreateProjectComponent,
    BasicDataComponent,
    ProjectLocationComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    ButtonModule,
    CardModule,
    ToastModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    TableModule,
    StepperModule,
  ]
})
export class ProjectsModule { }
