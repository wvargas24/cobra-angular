import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-indicator-modal',
  templateUrl: './indicator-modal.component.html',
  styleUrls: ['./indicator-modal.component.scss']
})
export class IndicatorModalComponent implements OnInit {
  form!: FormGroup;
  indicators: any[] = [];

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    // Recibe la lista de indicadores disponibles desde el componente padre
    this.indicators = this.config.data.indicators || [];

    // Construye el formulario reactivo
    this.form = this.fb.group({
      indicator: [null, Validators.required], // El objeto completo del indicador seleccionado
      unit: [{ value: null, disabled: true }], // Campo para mostrar la unidad (deshabilitado)
      goal: [null, [Validators.required, Validators.min(1)]] // La meta a establecer
    });

    // Escucha los cambios en el selector de indicadores
    this.form.get('indicator')?.valueChanges.subscribe(selectedIndicator => {
      if (selectedIndicator) {
        // Actualiza el campo de unidad de medida automáticamente
        this.form.get('unit')?.setValue(selectedIndicator.unit);
      } else {
        this.form.get('unit')?.setValue(null);
      }
    });
  }

  save(): void {
    if (this.form.valid) {
      const selectedIndicator = this.form.get('indicator')?.value;
      const goal = this.form.get('goal')?.value;

      // Prepara el objeto a devolver, combinando los datos del indicador con la nueva meta
      const result = {
        id: selectedIndicator.id,
        name: selectedIndicator.name,
        unit: selectedIndicator.unit,
        goal: goal
      };

      // Cierra el modal y pasa el resultado de vuelta al componente padre
      this.ref.close(result);
    }
  }

  cancel(): void {
    // Cierra el modal sin pasar ningún dato
    this.ref.close();
  }
}
