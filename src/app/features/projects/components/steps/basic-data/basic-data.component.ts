import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProjectStateService } from 'src/app/core/services/project-state.service';
import { forkJoin, Observable, Subject, of } from 'rxjs';
import { startWith, map, takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-basic-data',
  templateUrl: './basic-data.component.html',
  styleUrls: ['./basic-data.component.scss']
})
export class BasicDataComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  formStructure: any[] = [];
  projectData: any = {};

  // Observables para las listas de opciones de los selectores
  linesOfAction$: Observable<any[]> = of([]);
  types$: Observable<any[]> = of([]);
  subtypes$: Observable<any[]> = of([]);
  supervisors$: Observable<any[]> = of([]);

  private unsubscribe$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private projectStateService: ProjectStateService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin({
      projectData: this.http.get<any>('assets/demo/data/project-creation-data.json'),
      formStructure: this.http.get<any[]>('assets/demo/data/project-form-structure.json')
    }).pipe(takeUntil(this.unsubscribe$)).subscribe(({ projectData, formStructure }) => {
      this.projectData = projectData;
      this.formStructure = formStructure.filter(field => field.step === 1);

      this.buildForm();
      this.initializeSelects();
      this.setupCascadingSelects();
      this.loadDraftData();
      this.listenToFormChanges();
    });
  }

  private buildForm(): void {
    const formControls: { [key: string]: any } = {};
    this.formStructure.forEach(field => {
      formControls[field.name] = [null, Validators.required]; // Inicia con null
    });
    this.form = this.fb.group(formControls);
  }

  private initializeSelects(): void {
    // Carga las listas iniciales directamente desde los datos del proyecto
    this.linesOfAction$ = of(this.projectData.linesOfAction);
    this.supervisors$ = of(this.projectData.supervisors);
  }

  private setupCascadingSelects(): void {
    const lineOfActionControl = this.form.get('lineOfAction');
    const typeControl = this.form.get('type');

    if (lineOfActionControl) {
      // Cuando cambia la línea de acción, actualiza la lista de tipos
      this.types$ = lineOfActionControl.valueChanges.pipe(
        startWith(lineOfActionControl.value),
        map(lineId => {
          if (!lineId) return [];
          const selectedLine = this.projectData.linesOfAction.find((line: any) => line.id === lineId);
          return selectedLine ? selectedLine.types : [];
        })
      );
    }

    if (typeControl) {
      // Cuando cambia el tipo, actualiza la lista de subtipos
      this.subtypes$ = typeControl.valueChanges.pipe(
        startWith(typeControl.value),
        map(typeId => {
          if (!typeId) return [];
          let allTypes: any[] = [];
          this.projectData.linesOfAction.forEach((line: any) => {
            allTypes.push(...(line.types || []));
          });
          const selectedType = allTypes.find((type: any) => type.id === typeId);
          return selectedType ? selectedType.subtypes : [];
        })
      );
    }
  }

  private loadDraftData(): void {
    const draft = this.projectStateService.getCurrentDraft();
    if (draft) {
      this.form.patchValue(draft, { emitEvent: false });
    }
  }

  private listenToFormChanges(): void {
    this.form.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.unsubscribe$)
    ).subscribe(formValue => {
      this.projectStateService.updateDraft(formValue);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
