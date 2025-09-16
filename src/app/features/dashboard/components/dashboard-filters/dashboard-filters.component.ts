import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// La interfaz para las opciones de los filtros sigue siendo útil
export interface FilterOptions {
  lineOfActionOptions: SelectItem[];
  statusOptions: SelectItem[];
  typeOptions: SelectItem[];
  subtypeOptions: SelectItem[];
}

@Component({
  selector: 'app-dashboard-filters',
  templateUrl: './dashboard-filters.component.html',
  styleUrls: ['./dashboard-filters.component.scss']
})
export class DashboardFiltersComponent implements OnInit, OnDestroy {
  @Input() options: FilterOptions | null = null;
  @Output() filtersChanged = new EventEmitter<any>();

  showAdvancedFilters: boolean = false;

  filterForm: FormGroup = new FormGroup({
    searchTerm: new FormControl(''),
    selectedLineOfAction: new FormControl(null),
    selectedStatus: new FormControl(null),
    budgetRange: new FormControl([0, 100000000]),
    progressRange: new FormControl([0, 100]),
    selectedType: new FormControl(null),
    selectedSubtype: new FormControl(null),
  });

  private filterSubscription!: Subscription;

  constructor() { }

  ngOnInit(): void {
    // La suscripción a los cambios del formulario para emitir los valores sigue igual.
    this.filterSubscription = this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(values => {
        this.filtersChanged.emit(values);
      });
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      selectedLineOfAction: null,
      selectedStatus: null,
      budgetRange: [0, 100000000],
      progressRange: [0, 100],
      selectedType: null,
      selectedSubtype: null,
    });
  }
}