// src/app/layout/app.topbar.component.ts

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';

// 1. Importamos nuestro AuthService y la interfaz User
import { AuthService } from '../auth/services/auth.service';
import { User } from '../auth/models/user.model';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent implements OnInit, OnDestroy {

    // --- Propiedades del template (no cambian) ---
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('searchinput') searchInput!: ElementRef;
    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
    searchActive: boolean = false;

    // --- Propiedades para el usuario (ahora serán manejadas por el servicio) ---
    user: User | null = null;
    initialsUser: string = '';

    // Propiedad para gestionar la suscripción y evitar fugas de memoria
    private userSubscription: Subscription | undefined;

    // 2. Inyectamos el AuthService en el constructor
    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private authService: AuthService,
        public el: ElementRef
    ) { }


    ngOnInit() {
        // 3. Nos suscribimos al observable del usuario en el AuthService
        //    Este bloque de código se ejecutará cada vez que el estado del usuario cambie (login/logout)
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.user = user;
            if (user) {
                // Si hay un usuario, generamos sus iniciales
                this.initialsUser = this.generateInitials(user.name);
            } else {
                // Si no hay usuario (logout), reseteamos las iniciales
                this.initialsUser = '';
            }
        });
    }

    // 4. Implementamos una función de iniciales mejorada
    generateInitials(name: string): string {
        if (!name) {
            return '';
        }

        const nameParts = name.trim().split(' ');
        if (nameParts.length === 1) {
            // Si solo hay un nombre/palabra, tomamos las 2 primeras letras
            return nameParts[0].substring(0, 2).toUpperCase();
        }

        // Si hay más de una palabra, tomamos la primera letra de las dos primeras palabras
        const firstInitial = nameParts[0].charAt(0);
        const secondInitial = nameParts[1].charAt(0);

        return `${firstInitial}${secondInitial}`.toUpperCase();
    }

    // 5. El logout ahora solo llama al servicio. ¡Mucho más limpio!
    logout() {
        this.authService.logout();
    }

    // 6. ¡Importante! Nos desuscribimos para evitar fugas de memoria cuando el componente se destruye
    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }


    // --- El resto de las funciones del template no necesitan cambios ---

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    onSidebarButtonClick() {
        this.layoutService.showSidebar();
    }

    activateSearch() {
        this.searchActive = true;
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 100);
    }

    deactivateSearch() {
        this.searchActive = false;
    }
}
