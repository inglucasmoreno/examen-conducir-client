import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FormulariosPracticaService } from 'src/app/services/formularios-practica.service';

@Component({
  selector: 'app-formularios',
  templateUrl: './formularios.component.html',
  styles: [
  ]
})
export class FormulariosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalFormulario = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Formulario
  public idFormulario: string = '';
  public formularios: any = [];
  public descripcion: string = '';

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
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private formulariosPracticaService: FormulariosPracticaService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Formularios'; 
    // this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarFormularios(); 
  }

  // Asignar permisos de usuario login
  // permisosUsuarioLogin(): boolean {
  //   return this.authService.usuario.permisos.includes('LUGARES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  // }

  // Abrir modal
  abrirModal(estado: string, formulario: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idFormulario = '';
    
    if(estado === 'editar') this.getFormulario(formulario);
    else this.showModalFormulario = true;

    this.estadoFormulario = estado;  
  }

  // Traer datos de formulario
  getFormulario(formulario: any): void {
    this.alertService.loading();
    this.idFormulario = formulario._id;
    this.formulariosPracticaService.getFormulario(formulario._id).subscribe(({formulario}) => {
      this.descripcion = formulario.descripcion;
      this.alertService.close();
      this.showModalFormulario = true;
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar formularios
  listarFormularios(): void {
    this.formulariosPracticaService.listarFormularios( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ formularios }) => {
      this.formularios = formularios;
      this.showModalFormulario = false;
      this.alertService.close();
    }, (({error}) => {
      console.log(error);
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo formulario
  nuevoFormulario(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.formulariosPracticaService.nuevoFormulario({ descripcion: this.descripcion }).subscribe(() => {
      this.listarFormularios();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar formulario
  actualizarFormulario(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.formulariosPracticaService.actualizarFormulario(this.idFormulario, { descripcion: this.descripcion.toLocaleUpperCase() }).subscribe(() => {
      this.listarFormularios();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(formulario: any): void {
    
    const { _id, activo } = formulario;
    
    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.formulariosPracticaService.actualizarFormulario(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarFormularios();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';  
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
    this.listarFormularios();
  }

}
