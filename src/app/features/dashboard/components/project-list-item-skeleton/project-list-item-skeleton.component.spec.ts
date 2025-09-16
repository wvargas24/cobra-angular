import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListItemSkeletonComponent } from './project-list-item-skeleton.component';

describe('ProjectListItemSkeletonComponent', () => {
  let component: ProjectListItemSkeletonComponent;
  let fixture: ComponentFixture<ProjectListItemSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListItemSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectListItemSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
