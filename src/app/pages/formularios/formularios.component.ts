import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FormulariosPracticaService } from 'src/app/services/formularios-practica.service';
import { PersonasService } from 'src/app/services/personas.service';

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

  // Personas
  public personas;

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

  // Modelo reactivo
  public formularioForm = this.fb.group({
    nro_tramite: ['', Validators.required],
    persona: ['', Validators.required],
    tipo: ['Auto', Validators.required],
    activo: ['true', Validators.required]
  });

  constructor(private formulariosPracticaService: FormulariosPracticaService,
              private fb: FormBuilder,
              private personasService: PersonasService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Formularios'; 
    this.alertService.loading();
    this.listarFormularios(); 
  }

  // Abrir modal
  abrirModal(estado: string, formulario: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    console.log(formulario);
    if(estado === 'editar') this.getFormulario(formulario);
    else this.showModalFormulario = true;
    this.estadoFormulario = estado;  
  }

  // Traer datos de formulario
  getFormulario(formulario: any): void {
    this.alertService.loading();
    this.idFormulario = formulario._id;
    this.formulariosPracticaService.getFormulario(formulario._id).subscribe(({formulario}) => {
      this.formularioForm.patchValue({
        nro_tramite: formulario.nro_tramite,
        persona: formulario.persona,
        tipo: formulario.tipo        
      });
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
      this.listarPersonas();
    }, (({error}) => {
      console.log(error);
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo formulario
  nuevoFormulario(): void {

    const { nro_tramite, persona, tipo } = this.formularioForm.value;

    const verificacion = nro_tramite.trim() === '' || persona === '';

    // Verificacion de datos
    if(verificacion){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.alertService.loading();
    this.formulariosPracticaService.nuevoFormulario({ nro_tramite, persona, tipo }).subscribe(() => {
      this.listarFormularios();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar formulario
  actualizarFormulario(): void {

    const { nro_tramite, persona, tipo } = this.formularioForm.value;

    const verificacion = nro_tramite.trim() === '' || persona === '';

    // Verificacion de datos
    if(verificacion){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.alertService.loading();
    this.formulariosPracticaService.actualizarFormulario(this.idFormulario, this.formularioForm.value).subscribe(() => {
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
  
  // Listar personas
  listarPersonas(): void {
    this.personasService.listarPersonas(1, 'apellido').subscribe({
      next: ({ personas }) => {
        this.personas = personas;
        this.alertService.close();
        this.showModalFormulario = false;
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }


  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.formularioForm.patchValue({
      nro_tramite: '',
      persona: '',
      tipo: 'Auto'
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
    this.listarFormularios();
  }

}
