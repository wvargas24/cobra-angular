// src/app/core/models/chat.ts

export interface Message {
    id?: string; // Hacemos el ID opcional para los mensajes de usuario y carga
    text?: string;
    imageUrl?: string;
    isUser: boolean;
    timestamp: number;
    isLoading?: boolean;
    isError?: boolean;
    typing?: boolean;
}

export interface Conversation {
    id: number;
    thread: string;
    usuId: number;
    createdAt: string;
    createdBy: number;
    updatedAt: string | null;
    updatedBy: number | null;
    cuentaId: number;
    threadname: string; // Nombre de la conversación
}

export interface ApiMessage {
    id: string;
    object: string;
    created_at: number;
    thread_id: string;
    role: 'user' | 'assistant';
    content: {
        type: 'text' | 'image_file';
        text?: {
            value: string;
            annotations: any[];
        };
        image_file?: {
            file_id: string;
        };
    }[];
}

// Interfaz para la respuesta de getSteps
export interface RunStepsResponse {
    data: any[];
}