// Modelo - Usuario Online
export class UsuarioOnline {
    constructor(
        public userId: string,
        public usuario: string,
        public nombre: string,
        public apellido: string,
        public role: string,
        public lugar: string,
        public lugar_descripcion: string,
        public permisos: string[],
    ){}   
}