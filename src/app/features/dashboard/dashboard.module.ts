// src/app/features/dashboard/dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { ProjectCardSkeletonComponent } from './components/project-card-skeleton/project-card-skeleton.component';
import { ProjectGridComponent } from './components/project-grid/project-grid.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectListItemSkeletonComponent } from './components/project-list-item-skeleton/project-list-item-skeleton.component';
import { ProjectSplitComponent } from './components/project-split/project-split.component';
import { ProjectMapComponent } from './components/project-map/project-map.component';
import { AiAssistantModule } from '../ai-assistant/ai-assistant.module'
import { TextFormatPipe } from 'src/app/shared/pipes/text-format.pipe';
import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';
import { DashboardFiltersComponent } from './components/dashboard-filters/dashboard-filters.component';
import { DashboardSummaryComponent } from './components/dashboard-summary/dashboard-summary.component';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { SliderModule } from 'primeng/slider';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { DataViewModule } from 'primeng/dataview';

@NgModule({
  declarations: [
    DashboardComponent,
    ProjectCardComponent,
    ProjectCardSkeletonComponent,
    ProjectGridComponent,
    ProjectListComponent,
    ProjectListItemSkeletonComponent,
    ProjectSplitComponent,
    ProjectMapComponent,
    TextFormatPipe,
    DashboardChartsComponent,
    DashboardFiltersComponent,
    DashboardSummaryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    CardModule,
    ProgressBarModule,
    PaginatorModule,
    TagModule,
    TableModule,
    AiAssistantModule,
    SliderModule,
    AccordionModule,
    ChartModule,
    ProgressSpinnerModule,
    SkeletonModule,
    DataViewModule
  ],
  exports: [
    TextFormatPipe
  ]
})
export class DashboardModule { }