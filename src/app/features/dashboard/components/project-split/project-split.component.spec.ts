import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSplitComponent } from './project-split.component';

describe('ProjectSplitComponent', () => {
  let component: ProjectSplitComponent;
  let fixture: ComponentFixture<ProjectSplitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSplitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
