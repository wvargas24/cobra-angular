import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProjectStateService } from 'src/app/core/services/project-state.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin, Observable, Subject, of } from 'rxjs';
import { startWith, map, takeUntil, debounceTime, filter } from 'rxjs/operators';
import { IndicatorModalComponent } from '../../indicator-modal/indicator-modal.component';

@Component({
  selector: 'app-basic-data',
  templateUrl: './basic-data.component.html',
  styleUrls: ['./basic-data.component.scss']
})
export class BasicDataComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  formStructure: any[] = [];
  groupedFormStructure: any[] = [];
  projectData: any = {};
  ref: DynamicDialogRef | undefined;

  linesOfAction$: Observable<any[]> = of([]);
  types$: Observable<any[]> = of([]);
  subtypes$: Observable<any[]> = of([]);
  supervisors$: Observable<any[]> = of([]);

  private unsubscribe$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private projectStateService: ProjectStateService,
    public dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  // CORREGIDO: Se reordena la secuencia de inicialización
  private loadInitialData(): void {
    forkJoin({
      projectData: this.http.get<any>('assets/demo/data/project-creation-data.json'),
      formStructure: this.http.get<any[]>('assets/demo/data/project-form-structure.json')
    }).pipe(takeUntil(this.unsubscribe$)).subscribe(({ projectData, formStructure }) => {
      this.projectData = projectData;
      this.formStructure = formStructure.filter(field => field.step === 1);
      this.groupFormStructure();
      this.buildForm();
      this.initializeSelects();

      // 1. Cargar el borrador PRIMERO para que los valores estén en el formulario
      this.loadDraftData();

      // 2. Configurar los selectores DESPUÉS para que reaccionen a los valores del borrador
      this.setupCascadingSelects();

      this.listenToFormChanges();
    });
  }

  private groupFormStructure(): void {
    const groups: { [key: string]: any[] } = {};
    this.formStructure.forEach(field => {
      groups[field.section] = groups[field.section] || [];
      groups[field.section].push(field);
    });
    this.groupedFormStructure = Object.keys(groups).map(key => ({ section: key, fields: groups[key] }));
  }

  private buildForm(): void {
    const formControls: { [key: string]: any } = {};
    this.formStructure.forEach(field => {
      if (field.type === 'indicator-selector') {
        formControls[field.name] = this.fb.array([]);
      } else {
        formControls[field.name] = [null, Validators.required];
      }
    });
    this.form = this.fb.group(formControls);
  }

  showIndicatorModal(fieldName: string, indicatorSource: string) {
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    const existingIndicators = indicatorsArray.value.map((i: any) => i.id);
    const availableIndicators = (this.projectData[indicatorSource] || []).filter((i: any) => !existingIndicators.includes(i.id));

    this.ref = this.dialogService.open(IndicatorModalComponent, {
      header: 'Añadir Indicador',
      width: '50vw',
      contentStyle: { "overflow": "auto" },
      data: {
        indicators: availableIndicators
      }
    });

    this.ref.onClose.pipe(filter(result => !!result)).subscribe((indicator) => {
      this.addIndicator(indicator, fieldName);
    });
  }

  // CORREGIDO: Se fuerza el guardado del borrador
  addIndicator(indicator: any, fieldName: string) {
    const indicatorGroup = this.fb.group({
      id: [indicator.id],
      name: [indicator.name],
      unit: [indicator.unit],
      goal: [indicator.goal, Validators.required]
    });
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    indicatorsArray.push(indicatorGroup);

    // Forzar la actualización del estado para guardar los indicadores
    this.projectStateService.updateDraft(this.form.getRawValue());
  }

  // CORREGIDO: Se fuerza el guardado del borrador
  removeIndicator(index: number, fieldName: string) {
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    indicatorsArray.removeAt(index);

    // Forzar la actualización del estado para guardar los indicadores
    this.projectStateService.updateDraft(this.form.getRawValue());
  }

  private initializeSelects(): void {
    this.linesOfAction$ = of(this.projectData.linesOfAction);
    this.supervisors$ = of(this.projectData.supervisors);
  }

  private setupCascadingSelects(): void {
    const lineOfActionControl = this.form.get('lineOfAction');
    const typeControl = this.form.get('type');

    if (lineOfActionControl) {
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

  // CORREGIDO: Lógica de carga de indicadores y patchValue
  private loadDraftData(): void {
    const draft = this.projectStateService.getCurrentDraft();
    if (!draft || Object.keys(draft).length === 0) {
      return;
    }

    // Usa un método sin emisión de eventos para no disparar el listener de guardado
    this.form.patchValue(draft, { emitEvent: false });

    // Carga los indicadores de impacto si existen en el borrador
    if (Array.isArray(draft.impactIndicators)) {
      draft.impactIndicators.forEach((i: any) => {
        const indicatorGroup = this.fb.group({
          id: [i.id],
          name: [i.name],
          unit: [i.unit],
          goal: [i.goal, Validators.required]
        });
        (this.form.get('impactIndicators') as FormArray).push(indicatorGroup, { emitEvent: false });
      });
    }

    // Carga los indicadores de alcance si existen en el borrador
    if (Array.isArray(draft.reachIndicators)) {
      draft.reachIndicators.forEach((i: any) => {
        const indicatorGroup = this.fb.group({
          id: [i.id],
          name: [i.name],
          unit: [i.unit],
          goal: [i.goal, Validators.required]
        });
        (this.form.get('reachIndicators') as FormArray).push(indicatorGroup, { emitEvent: false });
      });
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
    if (this.ref) {
      this.ref.close();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
