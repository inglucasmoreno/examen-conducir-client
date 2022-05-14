import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PersonasService } from 'src/app/services/personas.service';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styles: [
  ]
})
export class PersonasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };
  
  // Modal
  public showModalPersona = false;
  
  // Estado formulario 
  public estadoFormulario = 'crear';
  
  // Personas
  public personas:any[] = [];
  public idPersona: string = '';
  public persona: any = [];
  public descripcion: string = '';
  
  // Formulario
  public data = {
    dni: '',
    apellido: '',
    nombre: '',
  }
  
  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  
  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }
  
  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private personasService: PersonasService,
              private alertService: AlertService,
              private authService: AuthService,
              private dataService: DataService) { }
  
  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Personas'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarPersonas(); 
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('PERSONAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }
  
  // Abrir modal
  abrirModal(estado: string, persona: any = null): void {
    window.scrollTo(0,0);
    this.reiniciar();
    this.descripcion = '';
    this.idPersona = '';
  
    if(estado === 'editar') this.getPersona(persona);
    else this.showModalPersona = true;
  
    this.estadoFormulario = estado;  
  }
  
  // Cerrar modal
  cerrarModal(): void {
    this.reiniciar();
  }
  
  // Traer datos de persona
  getPersona(persona: any): void {
    this.alertService.loading();
    this.idPersona = persona._id;
    this.personasService.getPersona(persona._id).subscribe(({persona}) => {
    this.data = {
      dni: persona.dni,
      apellido: persona.apellido,
      nombre: persona.nombre,
    };
    this.alertService.close();
    this.showModalPersona = true;
  },({error})=>{
    this.alertService.errorApi(error.message);
  });
  }
  
  // Listar personas
  listarPersonas(): void {
    this.personasService.listarPersonas( 
    this.ordenar.direccion,
    this.ordenar.columna
    )
    .subscribe( ({ personas }) => {
      this.personas = personas;
      this.showModalPersona = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.message);
    }));
  }
  
  // Nueva persona
  nuevaPersona(): void {
    
    const verificacion = this.data.dni.trim() === "" || 
                        this.data.apellido.trim() === "" ||
                        this.data.nombre.trim() === ""
  
    // Verificacion: Descripción vacia
    if(verificacion){
      this.alertService.info('Debes completar todos los datos');
      return;
    }
  
    this.alertService.loading();
      this.personasService.nuevaPersona(this.data).subscribe(() => {
      this.listarPersonas();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
  
  }
  
  // Actualizar personas
  actualizarPersona(): void {
  
    const verificacion = this.data.dni.trim() === "" || 
                        this.data.apellido.trim() === "" ||
                        this.data.nombre.trim() === ""
  
    // Verificacion: Descripción vacia
    if(verificacion){
      this.alertService.info('Debes completar todos los datos');
      return; 
    }
  
    this.alertService.loading();
    this.personasService.actualizarPersona(this.idPersona, this.data).subscribe(() => {
    this.listarPersonas();
  
  },({error})=>{
      this.alertService.errorApi(error.message);
    });
  
  }
  
  // Actualizar estado Activo/Inactivo
  actualizarEstado(personas: any): void {
    
    const { _id, activo } = personas;

    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.alertService.loading();
        this.personasService.actualizarPersona(_id, {activo: !activo}).subscribe(() => {
          this.alertService.loading();
          this.listarPersonas();
        }, ({error}) => {
          this.alertService.close();
          this.alertService.errorApi(error.message);
        });
      }
    });
  }
  
  // Reiniciar
  reiniciar(): void {
    this.data = {
      dni: '',
      apellido: '',
      nombre: ''
    }
    this.showModalPersona = false;
  }
  
  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }
  
  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }
  
  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.listarPersonas();
  }
  
}
