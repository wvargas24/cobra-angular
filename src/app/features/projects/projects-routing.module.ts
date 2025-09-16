import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProjectComponent } from './create-project/create-project.component';
import { BasicDataComponent } from './steps/basic-data/basic-data.component';
import { ProjectLocationComponent } from './steps/project-location/project-location.component';
import { TimelineComponent } from './steps/timeline/timeline.component';
import { AgreementAssociationComponent } from './steps/agreement-association/agreement-association.component';

const routes: Routes = [
  {
    path: 'new',
    component: CreateProjectComponent,
    children: [
      { path: 'basic-data', component: BasicDataComponent },
      { path: 'project-location', component: ProjectLocationComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'agreement-association', component: AgreementAssociationComponent },
      { path: '', redirectTo: 'basic-data', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'new', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }