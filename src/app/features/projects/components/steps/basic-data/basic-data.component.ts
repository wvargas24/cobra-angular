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
      this.setupCascadingSelects();
      this.loadDraftData();
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

  // MODIFICADO: Acepta el nombre del campo (fieldName) y el origen de los indicadores (indicatorSource)
  showIndicatorModal(fieldName: string, indicatorSource: string) {
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    const existingIndicators = indicatorsArray.value.map((i: any) => i.id);

    // Usa el indicatorSource para obtener la lista correcta de indicadores del projectData
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
      // Pasa el fieldName a addIndicator para que sepa a qué array añadirlo
      this.addIndicator(indicator, fieldName);
    });
  }

  // MODIFICADO: Acepta el fieldName para saber en qué FormArray trabajar
  addIndicator(indicator: any, fieldName: string) {
    const indicatorGroup = this.fb.group({
      id: [indicator.id],
      name: [indicator.name],
      unit: [indicator.unit],
      goal: [indicator.goal, Validators.required]
    });
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    indicatorsArray.push(indicatorGroup);
  }

  // MODIFICADO: Acepta el fieldName para saber de qué FormArray eliminar
  removeIndicator(index: number, fieldName: string) {
    const indicatorsArray = this.form.get(fieldName) as FormArray;
    indicatorsArray.removeAt(index);
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

  // MODIFICADO: Carga los datos de los borradores en las secciones correctas
  private loadDraftData(): void {
    const draft = this.projectStateService.getCurrentDraft();
    if (!draft) {
      return;
    }

    // Carga los indicadores de impacto si existen en el borrador
    if (Array.isArray(draft.indicators)) {
      draft.indicators.forEach((i: any) => this.addIndicator(i, 'impactIndicators'));
    }

    // Carga los indicadores de alcance si existen en el borrador
    if (Array.isArray(draft.indicators)) {
      draft.indicators.forEach((i: any) => this.addIndicator(i, 'reachIndicators'));
    }

    // Carga el resto del formulario, excluyendo las propiedades de los indicadores
    const { indicators, ...restOfDraft } = draft;
    this.form.patchValue(restOfDraft, { emitEvent: false });
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
