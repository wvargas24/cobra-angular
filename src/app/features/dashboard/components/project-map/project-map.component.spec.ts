import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMapComponent } from './project-map.component';

describe('ProjectMapComponent', () => {
  let component: ProjectMapComponent;
  let fixture: ComponentFixture<ProjectMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
