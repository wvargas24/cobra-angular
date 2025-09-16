export interface User {
    _id?: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    bio?: string;
    membership?: string;
    membershipStatus?: string;
    profilePicture?: string;
    membershipEndDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    isActive?: boolean;
    password?: string;
    newPassword?: string;

    cuentaId?: number; // ID de la cuenta asociada al usuario
    usuId?: number; // ID del usuario en la base de datos
    rol?: number; // ID del rol del usuario
    username?: string; // Nombre de usuario
    asistenteId?: string; // ID del asistente asociado al usuario
}

export interface AuthResponse {
    token: string;
}
