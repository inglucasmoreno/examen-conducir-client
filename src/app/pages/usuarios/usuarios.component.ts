import { Component, OnInit } from '@angular/core';

import { UsuariosService } from '../../services/usuarios.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from 'src/app/services/data.service';

import { Usuario } from '../../models/usuario.model';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Usuarios Listados
  public usuarios: Usuario[];
  public total = 0;

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
    columna: 'apellido'
  }

  // Para reportes
  public totalReporte = 0;
  public usuariosReporte = [];

  constructor(private usuariosService: UsuariosService,
              public authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Usuarios';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarUsuarios(); 
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('USUARIOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Listar usuarios
  listarUsuarios(): void {
    this.usuariosService.listarUsuarios( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( resp => {
      const { usuarios, total } = resp;
      this.usuarios = usuarios;
      this.total = total;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    }));
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(usuario: Usuario): void {
    const { _id, activo } = usuario;

    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.usuariosService.actualizarUsuario(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarUsuarios();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });
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
    this.listarUsuarios();
  }

}
