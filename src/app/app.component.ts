import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { LayoutService, AppConfig } from './layout/service/app.layout.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private layoutService: LayoutService) { }

    ngOnInit(): void {
        this.primengConfig.ripple = true;

        const config: AppConfig = {
            ripple: true,                      //toggles ripple on and off
            menuMode: 'slim',                 //layout mode of the menu, valid values are "static", "overlay", "slim", "horizontal", "drawer" and "reveal"
            colorScheme: 'light',               //color scheme of the template, valid values are "light" and "dark"
            theme: 'purple',                    //default component theme for PrimeNG
            scale: 14                           //size of the body font size to scale the whole application
        };
        this.layoutService.config.set(config);
    }

}
