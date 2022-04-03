import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { LugaresService } from 'src/app/services/lugares.service';

import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styles: [
  ]
})
export class NuevoUsuarioComponent implements OnInit {

  // Permisos de usuario
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    personas: 'PERSONAS_ALL',
    imagenes: 'IMAGENES_NOT_ACCESS',
    lugares: 'LUGARES_NOT_ACCESS',
    preguntas: 'PREGUNTAS_NOT_ACCESS',
    examenes: 'EXAMENES_ALL'
  }

  public loading = false;
  
  // Lugares
  public lugares = [];
  
  // Modelo reactivo
  public usuarioForm = this.fb.group({
    usuario: ['', Validators.required],
    apellido: ['', Validators.required],
    nombre: ['', Validators.required],
    dni: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    repetir: ['', Validators.required],
    role: ['ADMIN_ROLE', Validators.required],
    lugar: '',
    activo: ['true', Validators.required]
  });

  constructor(private fb: FormBuilder,
              private router: Router,
              private usuariosService: UsuariosService,
              private lugaresService: LugaresService,
              private alertService: AlertService,
              private dataService: DataService
              ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';
    this.alertService.loading();
    this.listarLugares();
  }
  
  // Lugares
  listarLugares(): void {
    this.lugaresService.listarLugares().subscribe(({ lugares }) => {
      this.alertService.close();
      this.lugares = lugares.filter(lugar => (lugar.descripcion.toUpperCase() !== 'DIRECCION DE TRANSPORTE' && lugar.activo));
    },({error}) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { status } = this.usuarioForm;
    const {usuario, apellido, nombre, dni, role, email, lugar, password, repetir} = this.usuarioForm.value;
    
    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' ||
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '' ||
                       password.trim() === '' ||
                       repetir.trim() === '';


    // Si el usuario es estandar - Debe seleccionar lugar de trabajo 
    if(role === 'USER_ROLE' && lugar.trim() === ''){
      this.alertService.info('Se debe seleccionar un lugar de trabajo');
      return;
    }

    // Se verifica si los campos son invalidos
    if(status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido();
      return;
    }

    // Se verifica si las contraseñas coinciden
    if(password !== repetir){
      this.alertService.info('Las contraseñas deben coincidir');
      return;   
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;
    
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];   

    this.alertService.loading();  // Comienzo de loading

    // Se crear el nuevo usuario
    this.usuariosService.nuevoUsuario(data).subscribe(() => {
      this.alertService.close();  // Finaliza el loading
      this.router.navigateByUrl('dashboard/usuarios');
    },( ({error}) => {
      this.alertService.close();  // Finaliza el loading
      this.alertService.errorApi(error.message);
      return;  
    }));

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

}
