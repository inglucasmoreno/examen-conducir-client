import { Component, OnInit } from '@angular/core';
import { Lugar } from 'src/app/models/lugar.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { LugaresService } from 'src/app/services/lugares.service';

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styles: [
  ]
})
export class LugaresComponent implements OnInit {
  
  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalLugar = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Lugares
  public idLugar: string = '';
  public lugares: any = [];
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
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private lugaresService: LugaresService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Lugares'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarLugares(); 
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('LUGARES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, lugar: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idLugar = '';
    
    if(estado === 'editar') this.getLugar(lugar);
    else this.showModalLugar = true;
  
    this.estadoFormulario = estado;  
  }

  // Traer datos de lugar
  getLugar(lugares: any): void {
    this.alertService.loading();
    this.idLugar = lugares._id;
    this.lugaresService.getLugares(lugares._id).subscribe(({lugar}) => {
      this.descripcion = lugar.descripcion;
      this.alertService.close();
      this.showModalLugar = true;
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar lugares
  listarLugares(): void {
    this.lugaresService.listarLugares( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ lugares }) => {
      this.lugares = lugares;
      this.showModalLugar = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo lugar
  nuevoLugar(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.lugaresService.nuevoLugar({ descripcion: this.descripcion }).subscribe(() => {
      this.listarLugares();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar lugares
  actualizarLugares(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.lugaresService.actualizarLugares(this.idLugar, { descripcion: this.descripcion.toLocaleUpperCase() }).subscribe(() => {
      this.listarLugares();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(lugar: Lugar): void {
    
    const { _id, activo } = lugar;
    
    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.lugaresService.actualizarLugares(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarLugares();
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
    this.listarLugares();
  }


}
