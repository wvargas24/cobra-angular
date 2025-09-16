// src/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
// CAMBIO 1: Se importa el operador 'map' de RxJS para transformar la respuesta.
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/app/environments/environment';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private API_URL = `${environment.API_URL}`;
    private usersApiUrl = `${environment.API_URL}/users`;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.validateAndLoadUser();
    }

    private validateAndLoadUser() {
        const token = localStorage.getItem('token');
        if (token) {
            this.validateToken(token).subscribe({
                next: (user) => {
                    this.currentUserSubject.next(user);
                },
                error: (error) => {
                    this.logout();
                }
            });
        }
    }

    private validateToken(token: string): Observable<User> {
        // Asumimos que hay un endpoint en el backend para validar tokens
        // Si no existe, podemos simular la validación del token localmente
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
            const user: User = {
                cuentaId: decodedToken.sub,
                name: decodedToken.username,
                email: decodedToken.email,
                role: decodedToken.rol,
                rol: decodedToken.rol,
                usuId: decodedToken.usuId
            };
            return new Observable(observer => {
                observer.next(user);
                observer.complete();
            });
        } else {
            return throwError(() => new Error('Token expired'));
        }
    }

    private loadUserFromStorage() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp > currentTime) {
                    const user: User = {
                        _id: decodedToken.sub,
                        name: decodedToken.name,
                        email: decodedToken.email,
                        role: decodedToken.role
                    };
                    this.currentUserSubject.next(user);
                } else {
                    this.logout();
                }
            } catch (e) {
                this.logout();
            }
        }
    }

    login(usuario: string, contrasena: string, idRolSelected: number): Observable<AuthResponse> {
        const httpOptions = {
            responseType: 'text' as 'json'
        };

        return this.http.post<any>(`${this.API_URL}/login`, { usuario, contrasena, idRolSelected }, httpOptions).pipe(
            map((responseText: string) => {
                const prefixToRemove = 'Authenticated succesfull: Ikont ';

                const token = responseText.startsWith(prefixToRemove)
                    ? responseText.substring(prefixToRemove.length)
                    : responseText;

                return { token: token.trim() };
            }),

            tap(response => {
                const decodedToken: any = jwtDecode(response.token);
                const user: User = {
                    cuentaId: decodedToken.sub,
                    name: decodedToken.username,
                    email: decodedToken.email,
                    role: decodedToken.rol,
                    rol: decodedToken.rol,
                    usuId: decodedToken.usuId
                };
                localStorage.setItem('token', response.token);
                localStorage.setItem('usuId', decodedToken.usuId);
                this.currentUserSubject.next(user);
            }),
            catchError(this.handleError)
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuId');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getMyProfile(): Observable<User> {
        return this.http.get<User>(`${this.usersApiUrl}/me`);
    }

    updateMyProfile(profileData: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.usersApiUrl}/me`, profileData).pipe(
            tap(updatedUser => {
                const currentUser = this.currentUserSubject.value;
                if (currentUser) {
                    const refreshedUser = { ...currentUser, ...updatedUser };
                    this.currentUserSubject.next(refreshedUser);
                }
            })
        );
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    private handleError(error: any) {
        console.error('An error occurred:', error);
        const backendErrorMessage = error.error?.message || 'Error desconocido. Intente de nuevo.';
        return throwError(() => new Error(backendErrorMessage));
    }
}