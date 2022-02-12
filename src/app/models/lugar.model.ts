// Modelo - Lugar
export class Lugar {
    constructor(
        public _id: string,
        public descripcion: string,
        public activo?: boolean,
        public createdAt?: string        
    ){}    
}