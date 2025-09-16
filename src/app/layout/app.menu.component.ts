import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                routerLink: ['/dashboard']
            },
            {
                label: 'Convenios',
                icon: 'pi pi-file-o',
                items: [
                    {
                        label: 'Crear Convenio',
                        icon: 'pi pi-plus',
                        routerLink: ['/convenios/crear']
                    },
                    {
                        label: 'Consultar Convenios',
                        icon: 'pi pi-search',
                        routerLink: ['/convenios/consultar']
                    }
                ]
            },
            {
                label: 'Contratos',
                icon: 'pi pi-file-edit',
                items: [
                    {
                        label: 'Crear Contrato',
                        icon: 'pi pi-plus',
                        routerLink: ['/contratos/crear']
                    },
                    {
                        label: 'Consultar Contratos',
                        icon: 'pi pi-search',
                        routerLink: ['/contratos/consultar']
                    }
                ]
            },
            {
                label: 'Proyectos',
                icon: 'pi pi-box',
                items: [
                    {
                        label: 'Crear Proyecto',
                        icon: 'pi pi-plus',
                        routerLink: ['/projects/new']
                    },
                    {
                        label: 'Consultar Proyectos',
                        icon: 'pi pi-search',
                        routerLink: ['/proyectos/consultar']
                    }
                ]
            },
            {
                label: 'Analítica de Datos',
                icon: 'pi pi-chart-bar',
                items: [
                    {
                        label: 'Reportes',
                        icon: 'pi pi-chart-line',
                        routerLink: ['/analitica/reportes']
                    },
                    {
                        label: 'Tableros de control',
                        icon: 'pi pi-chart-pie',
                        routerLink: ['/analitica/tableros']
                    }
                ]
            },
            {
                label: 'Datos de Entidades y Organizaciones',
                icon: 'pi pi-building',
                routerLink: ['/entidades']
            },
            {
                label: 'Asistente IA',
                icon: 'pi pi-android',
                routerLink: ['/ai-assistant']
            },
            {
                label: 'Administración',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Gestionar Cuentas',
                        icon: 'pi pi-users',
                        routerLink: ['/administracion/cuentas']
                    },
                    {
                        label: 'Gestionar Usuario',
                        icon: 'pi pi-user-edit',
                        routerLink: ['/administracion/usuarios/gestionar']
                    },
                    {
                        label: 'Ingresar Usuario',
                        icon: 'pi pi-user-plus',
                        routerLink: ['/administracion/usuarios/ingresar']
                    }
                ]
            }
        ];
    }
}
