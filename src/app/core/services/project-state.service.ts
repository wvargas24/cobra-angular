import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectDraft } from '../models/project-draft'; // <-- CAMBIO: Importar la nueva interfaz

@Injectable({
  providedIn: 'root'
})
export class ProjectStateService {
  // CAMBIO: Usar la interfaz ProjectDraft para el estado del borrador
  private projectDraftSubject = new BehaviorSubject<ProjectDraft>({});
  projectDraft$ = this.projectDraftSubject.asObservable();

  private readonly DRAFT_STORAGE_KEY = 'projectDraft';

  constructor() {
    this.loadDraftFromLocalStorage();
  }

  /**
   * Carga el borrador desde localStorage al iniciar el servicio.
   */
  private loadDraftFromLocalStorage() {
    const draftJson = localStorage.getItem(this.DRAFT_STORAGE_KEY);
    if (draftJson) {
      try {
        // El objeto parseado debe ser compatible con ProjectDraft
        const draft: ProjectDraft = JSON.parse(draftJson);
        this.projectDraftSubject.next(draft);
      } catch (e) {
        console.error("Error parsing project draft from localStorage", e);
        localStorage.removeItem(this.DRAFT_STORAGE_KEY);
      }
    }
  }

  /**
   * Actualiza el estado del borrador y lo persiste en localStorage.
   * @param updatedData El objeto de borrador completo.
   */
  updateDraft(updatedData: ProjectDraft) {
    const currentDraft = this.projectDraftSubject.getValue();
    const newDraft = { ...currentDraft, ...updatedData };
    this.projectDraftSubject.next(newDraft);
    localStorage.setItem(this.DRAFT_STORAGE_KEY, JSON.stringify(newDraft));
    console.log('Project draft updated:', newDraft);
  }

  /**
   * Obtiene el valor actual del borrador.
   * @returns El objeto de borrador actual.
   */
  getCurrentDraft(): ProjectDraft {
    return this.projectDraftSubject.getValue();
  }

  /**
   * Limpia el borrador del estado y de localStorage.
   */
  clearDraft() {
    this.projectDraftSubject.next({});
    localStorage.removeItem(this.DRAFT_STORAGE_KEY);
    console.log('Project draft cleared.');
  }
}
