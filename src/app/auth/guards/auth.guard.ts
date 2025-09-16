import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const currentUser = this.authService.currentUserValue;

        // A. ¿Hay un usuario autenticado?
        if (currentUser) {
            // --- LÓGICA MEJORADA ---

            // B. Leemos la lista de roles esperados de la ruta.
            const expectedRoles = route.data['expectedRoles'] as Array<string>;

            // C. Si la ruta NO define una lista de roles, significa que cualquier
            //    usuario autenticado puede entrar.
            if (!expectedRoles || expectedRoles.length === 0) {
                return true;
            }

            // D. Si la ruta SÍ define roles, verificamos si el rol del usuario
            //    está en la lista de roles permitidos.
            if (expectedRoles.includes(currentUser.role)) {
                return true; // ¡Acceso permitido!
            } else {
                // El rol del usuario no está en la lista. Acceso denegado.
                console.error(`Acceso denegado. Se requiere uno de los siguientes roles: [${expectedRoles.join(', ')}], pero el usuario tiene el rol: '${currentUser.role}'`);
                this.router.navigate(['/auth/access']);
                return false;
            }
        }

        // E. No hay un usuario autenticado. Redirigir al login.
        console.log('Usuario no autenticado. Redirigiendo al login...');
        this.router.navigate(['/auth/login']);
        return false;
    }
}
