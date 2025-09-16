import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProjectsRoutingModule } from './projects-routing.module';
import { CreateProjectComponent } from './create-project/create-project.component';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

// Importa los nuevos componentes con nombres descriptivos
import { BasicDataComponent } from './steps/basic-data/basic-data.component';
import { ProjectLocationComponent } from './steps/project-location/project-location.component';
import { TimelineComponent } from './steps/timeline/timeline.component';
import { AgreementAssociationComponent } from './steps/agreement-association/agreement-association.component';

@NgModule({
  declarations: [
    CreateProjectComponent,
    BasicDataComponent,
    ProjectLocationComponent,
    TimelineComponent,
    AgreementAssociationComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    StepsModule,
    ButtonModule,
    ToastModule
  ]
})
export class ProjectsModule { }