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
    this.usuariosService.getUsuario(this.id).subscribe(usuarioRes => {
      this.usuario = usuarioRes;
      const {usuario, apellido, nombre, dni, lugar, email, role, activo} = this.usuario;
      console.log(lugar);
      this.usuarioForm.setValue({
        usuario,
        apellido,
        nombre,
        dni,
        email,
        role,
        lugar,
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
      this.lugares = lugares;
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
    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id, this.usuarioForm.value).subscribe(() => {
      this.alertService.close();
      this.router.navigateByUrl('dashboard/usuarios');
    }, ({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    });

  }

  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
