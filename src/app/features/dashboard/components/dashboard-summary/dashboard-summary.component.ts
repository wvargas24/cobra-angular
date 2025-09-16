import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DashboardSummary } from 'src/app/core/models/dashboard';

@Component({
  selector: 'app-dashboard-summary',
  templateUrl: './dashboard-summary.component.html',
  styleUrls: ['./dashboard-summary.component.scss'],
  /**
   * ChangeDetectionStrategy.OnPush es una optimización de rendimiento.
   * Le dice a Angular que este componente solo necesita ser re-renderizado cuando
   * sus propiedades @Input() cambian. Es ideal para componentes presentacionales.
   */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSummaryComponent {

  /**
   * @Input() summary: Recibe el objeto con los datos del resumen.
   * Lo inicializamos como null para manejar el estado mientras los datos se cargan.
   */
  @Input() summary: DashboardSummary | null = null;

  constructor() { }

}