import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Project } from 'src/app/core/models/project';
import { LatLngBounds } from 'leaflet';

@Component({
  selector: 'app-project-split',
  templateUrl: './project-split.component.html',
  styleUrls: ['./project-split.component.scss']
})
export class ProjectSplitComponent implements OnInit {
  @Input() projects: Project[] = [];
  @Output() mapViewChanged = new EventEmitter<LatLngBounds>();

  constructor() { }

  ngOnInit(): void {
  }
}