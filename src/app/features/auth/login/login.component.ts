import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
    templateUrl: './login.component.html',
})
export class LoginComponent {

    email: string = '';
    password: string = '';
    idRolSelected: number = 1;

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService // Inyectamos el servicio
    ) { }

    onLogin() {
        if (!this.email || !this.password) {
            this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, ingrese email y contraseña.' });
            return;
        }

        this.authService.login(this.email, this.password, this.idRolSelected).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Fallo el Login', detail: err.message });
            }
        });
    }

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }
}
