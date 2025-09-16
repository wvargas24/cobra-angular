export interface Project {
    id: number;
    name: string; // "nombre del proyecto"
    thumbnail: string; // url de la imagen
    type: string;
    subtype: string;
    idLineOfAction: number;
    lineOfAction: string; // "linea de accion"
    imgLineOfAction: string;
    trafficColor: string;
    value: number; // "valor del proyecto"
    intState: number;
    state: string; // "estado del proyecto"
    progress: number; // "avance fisico"
    idArgis: number;
    latitude: number;
    longitude: number;
    favorite: boolean;
    myProject: boolean;
    numvalejecobra: number; // "ejecuciones de proyecto"
    datefechaalimen: string; // "fecha de alimentacion"
}