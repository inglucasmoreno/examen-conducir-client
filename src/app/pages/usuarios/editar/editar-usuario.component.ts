import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { LugaresService } from 'src/app/services/lugares.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styles: [
  ]
})
export class EditarUsuarioComponent implements OnInit {

  // Permisos de usuario
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    personas: 'PERSONAS_ALL',
    imagenes: 'IMAGENES_NOT_ACCESS',
    lugares: 'LUGARES_NOT_ACCESS',
    preguntas: 'PREGUNTAS_NOT_ACCESS',
    examenes: 'EXAMENES_ALL'
  }

  public id: string;
  public usuario: Usuario;
  public lugares = [];
  public usuarioForm = this.fb.group({
    usuario: ['', Validators.required],
    apellido: ['', Validators.required],
    nombre: ['', Validators.required],
    dni: ['', Validators.required],
    email: ['', Validators.email],
    role: ['USER_ROLE', Validators.required],
    lugar: '',
    activo: ['true', Validators.required],
  });

  constructor(private router: Router,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private usuariosService: UsuariosService,
              private lugaresService: LugaresService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Editando usuario'
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => { this.id = id; });
    
    // Se traen los datos del usuario a editar
    this.usuariosService.getUsuario(this.id).subscribe(usuarioRes => {
      
      // Marcar permisos
      this.getPermisos(usuarioRes.permisos); // Se obtienen los permisos

      this.usuario = usuarioRes;      
      const {usuario, apellido, nombre, dni, lugar, email, role, activo} = this.usuario;
      
      this.usuarioForm.patchValue({
        usuario,
        apellido,
        nombre,
        dni,
        email,
        role,
        lugar: role !== 'ADMIN_ROLE' ? lugar : '',
        activo: String(activo)
      });
      this.listarLugares();
    },({error})=> {
      this.alertService.errorApi(error.message); 
    });
  }

  // Lugares
  listarLugares(): void {
    this.lugaresService.listarLugares().subscribe(({ lugares }) => {
      this.alertService.close();
      this.lugares = lugares.filter(lugar => (lugar.descripcion !== 'DIRECCION DE TRANSPORTE' && lugar.activo));
    },({error}) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Editar usuario
  editarUsuario(): void | boolean{
      
    const {usuario, apellido, dni, role, nombre, lugar, email} = this.usuarioForm.value;

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' || 
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '';

    // Se verifica que todos los campos esten rellenos
    if (this.usuarioForm.status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido()
      return false;
    }

    // Si el usuario es estandar - Debe seleccionar lugar de trabajo 
    if(role === 'USER_ROLE' && lugar.trim() === ''){
      this.alertService.info('Se debe seleccionar un lugar de trabajo');
      return;
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;
    
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];   

    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id, data).subscribe(() => {
      this.alertService.close();
      this.router.navigateByUrl('dashboard/usuarios');
    }, ({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    });

  }

  // Se obtienen los permisos
  getPermisos(permisosFnc: Array<string>): void {
  
    permisosFnc.forEach( permiso => {
    
      // Usuarios
      (permiso === 'USUARIOS_ALL' || permiso === 'USUARIOS_READ') ? this.permisos.usuarios = permiso : null;

      // Personas
      (permiso === 'PERSONAS_ALL' || permiso === 'PERSONAS_READ') ? this.permisos.personas = permiso : null;

      // Imagenes
      (permiso === 'IMAGENES_ALL' || permiso === 'IMAGENES_READ') ? this.permisos.imagenes = permiso : null;

      // Lugares
      (permiso === 'LUGARES_ALL' || permiso === 'LUGARES_READ') ? this.permisos.lugares = permiso : null;

      // Preguntas
      (permiso === 'PREGUNTAS_ALL' || permiso === 'PREGUNTAS_READ') ? this.permisos.preguntas = permiso : null;

      // Examenes
      (permiso === 'EXAMENES_ALL' || permiso === 'EXAMENES_READ') ? this.permisos.examenes = permiso : null;
    
    });

  }

  // Se arma el arreglo de permisos
  adicionarPermisos(): any {
    
    let permisos: any[] = [];

    // Seccion usuarios
    if(this.permisos.usuarios !== 'USUARIOS_NOT_ACCESS'){
      permisos.push('USUARIOS_NAV');
      permisos.push(this.permisos.usuarios);
    }

    // Seccion personas
    if(this.permisos.personas !== 'PERSONAS_NOT_ACCESS'){
      permisos.push('PERSONAS_NAV');
      permisos.push(this.permisos.personas);
    }

    // Seccion imagenes
    if(this.permisos.imagenes !== 'IMAGENES_NOT_ACCESS'){
      permisos.push('IMAGENES_NAV');
      permisos.push(this.permisos.imagenes);
    }

    // Seccion lugares
    if(this.permisos.lugares !== 'LUGARES_NOT_ACCESS'){
      permisos.push('LUGARES_NAV');
      permisos.push(this.permisos.lugares);
    }

    // Seccion preguntas
    if(this.permisos.preguntas !== 'PREGUNTAS_NOT_ACCESS'){
      permisos.push('PREGUNTAS_NAV');
      permisos.push(this.permisos.preguntas);
    }

    // Seccion examenes
    if(this.permisos.examenes !== 'EXAMENES_NOT_ACCESS'){
      permisos.push('EXAMENES_NAV');
      permisos.push(this.permisos.examenes);
    }

    return permisos;

  }

  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
