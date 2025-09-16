import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCardSkeletonComponent } from './project-card-skeleton.component';

describe('ProjectCardSkeletonComponent', () => {
  let component: ProjectCardSkeletonComponent;
  let fixture: ComponentFixture<ProjectCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCardSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
