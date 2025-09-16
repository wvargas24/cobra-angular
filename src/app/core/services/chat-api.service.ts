// src/app/core/services/chat-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiMessage } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private baseUrl = `${environment.iaEndpoint}`;

  constructor(private http: HttpClient) { }

  /**
   * Genera un nuevo hilo de conversación.
   */
  generateThread(): Observable<any> {
    const url = `${this.baseUrl}/generateThreads`;
    return this.http.post<any>(url, null);
  }

  /**
   * Envía un mensaje a un hilo de conversación.
   * @param data Objeto con el ID del hilo y el contenido del mensaje.
   */
  sendMessageToThread(data: any): Observable<any> {
    const url = `${this.baseUrl}/generateMessages`;
    return this.http.post<any>(url, data);
  }

  /**
   * Obtiene los mensajes de un hilo de conversación.
   * @param threadId El ID del hilo.
   */
  getMessages(threadId: string): Observable<ApiMessage[]> {
    const url = `${this.baseUrl}/getMessages/${threadId}`;
    return this.http.get<{ data: ApiMessage[] }>(url).pipe(
      // Usamos el operador 'map' para extraer el array de la propiedad 'data'
      map(response => response.data),
      catchError(this.handleHttpError)
    );
  }

  /**
   * Elimina un hilo de conversación.
   * @param conversationId El ID de la conversación a eliminar.
   */
  deleteConversation(conversationId: string): Observable<any> {
    const url = `${this.baseUrl}/deleteThreads/${conversationId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = JSON.stringify([]);
    return this.http.delete<any>(url, { headers, body }).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Obtiene el estado de una ejecución.
   * @param threads El ID del hilo.
   */
  getRunStatus(threads: any): Observable<any> {
    const url = `${this.baseUrl}/getRuns/${threads}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Obtiene los pasos de una ejecución.
   * @param threadId El ID del hilo.
   * @param runId El ID de la ejecución.
   */
  getSteps(threadId: string, runId: string): Observable<any> {
    const url = `${this.baseUrl}/threads/${threadId}/runs/${runId}/steps`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Obtiene los mensajes de un hilo con parámetros específicos.
   * @param threadId El ID del hilo.
   * @param params Parámetros para filtrar los mensajes (antes de una fecha, límite, etc.).
   */
  getMessagesWithParams(threadId: string, params: { before: string, limit: number }): Observable<any> {
    const url = `${this.baseUrl}/threads/${threadId}/messages`;
    return this.http.get<any>(url, { params }).pipe(
      map(response => response.data),
      catchError(this.handleHttpError)
    );
  }

  /**
   * Obtiene las conversaciones de un usuario.
   * @param userId El ID del usuario.
   */
  getConversationsUser(userId: number): Observable<any> {
    const url = `${this.baseUrl}/getConversationsByUser/usuId/${userId}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Obtiene un archivo de imagen.
   * @param fileId El ID del archivo.
   * @param type El tipo de archivo.
   */
  fetchAndDisplayImage(fileId: string, type: string): Observable<Blob> {
    const url = `${this.baseUrl}/getFilesId/${fileId}/${type}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Manejador de errores para las peticiones HTTP.
   */
  private handleHttpError(error: any): Observable<never> {
    console.error('Error in HTTP request:', error);
    if (error.status === 404) {
      return throwError(() => new Error('Resource not found.'));
    } else if (error.status === 401 || error.status === 403) {
      return throwError(() => new Error('Unauthorized.'));
    } else {
      return throwError(() => new Error('Request error, please try again later.'));
    }
  }
}