import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { FormulariosPracticaService } from 'src/app/services/formularios-practica.service';
import { PersonasService } from 'src/app/services/personas.service';
import { environment } from 'src/environments/environment';


const base_url = environment.base_url;

@Component({
  selector: 'app-formularios',
  templateUrl: './formularios.component.html',
  styles: [
  ]
})
export class FormulariosComponent implements OnInit {

  // Flags
  public nuevaPersona = false;

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalFormulario = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Personas
  public dni = '';
  public personas: any[];
  public personaSeleccionada: any;
  public dataNuevaPersona: any = {
    apellido: '',
    nombre: '',
    dni: ''
  };

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
    this.dataService.showMenu = false;
    this.alertService.loading();
    this.listarFormularios(); 
  }

  // Abrir modal
  abrirModal(estado: string, formulario: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
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
      this.buscarPersonaPorID(formulario.persona);
      // this.dni = formulario.persona.dni;
      // this.buscarPersona();
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
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo formulario
  nuevoFormulario(): void {

    const { nro_tramite, persona, tipo } = this.formularioForm.value;

    // Verificacion de datos

    const verificacion_1 = (nro_tramite.trim() === '' || !this.personaSeleccionada) && !this.nuevaPersona;
    const verificacion_2 = (nro_tramite.trim() === '' || 
                            this.dataNuevaPersona.apellido.trim() === '' ||
                            this.dataNuevaPersona.nombre.trim() === '' ||
                            this.dataNuevaPersona.dni.trim() === '') && this.nuevaPersona;

    if(verificacion_1){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }else if(verificacion_2){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    if(!this.nuevaPersona){ // La persona existe
      
        const data = {
          nro_tramite,
          tipo,
          persona: this.personaSeleccionada._id
        }

        const query = { 
          nro_tramite, 
          tipo,  
          apellido: this.personaSeleccionada.apellido, 
          nombre: this.personaSeleccionada.nombre, 
          dni: this.personaSeleccionada.dni 
        };
  
        this.alertService.loading();
        this.formulariosPracticaService.nuevoFormulario(data, query).subscribe(() => {
        this.imprimirFormulario(tipo);
        this.eliminarPersona();
        this.listarFormularios();
      },({error})=>{
        this.alertService.errorApi(error.message);  
      });
    
    }else{ // La pesona no existe

      this.alertService.loading();
      this.personasService.nuevaPersona({apellido: this.dataNuevaPersona.apellido, nombre: this.dataNuevaPersona.nombre, dni: this.dataNuevaPersona.dni, }).subscribe({
        next: ({persona}) => {
          
          const data = {
            nro_tramite, 
            tipo, 
            persona: persona._id   
          }

          const querys = {
            nro_tramite, 
            tipo,  
            apellido: persona.apellido, 
            nombre: persona.nombre, 
            dni: persona.dni
          }

          this.formulariosPracticaService.nuevoFormulario(data, querys).subscribe({
            next: () => {
              this.eliminarPersona();
              this.listarFormularios();
              this.imprimirFormulario(tipo);
            },
            error: ({error}) => {
              this.alertService.errorApi(error.msg);
            }
          })
        },  
        error: ({error}) => {
          this.alertService.errorApi(error.msg);
        }
      });

    }

  }

  // Actualizar formulario
  actualizarFormulario(): void {

    const { nro_tramite, persona, tipo } = this.formularioForm.value;

    // Verificacion de datos

    const verificacion_1 = (nro_tramite.trim() === '' || !this.personaSeleccionada) && !this.nuevaPersona;
    const verificacion_2 = (nro_tramite.trim() === '' || 
                            this.dataNuevaPersona.apellido.trim() === '' ||
                            this.dataNuevaPersona.nombre.trim() === '' ||
                            this.dataNuevaPersona.dni.trim() === '') && this.nuevaPersona;

    if(verificacion_1){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }else if(verificacion_2){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    if(!this.nuevaPersona){ // La persona existe
      
      const data = {
        nro_tramite,
        tipo,
        persona: this.personaSeleccionada._id
      }
  
      this.alertService.loading();
      this.formulariosPracticaService.actualizarFormulario(this.idFormulario, data).subscribe(() => {
        this.eliminarPersona();
        this.listarFormularios();
      },({error})=>{
        this.alertService.errorApi(error.message);  
      });
    
    }else{ // La pesona no existe

      this.alertService.loading();
      this.personasService.nuevaPersona({apellido: this.dataNuevaPersona.apellido, nombre: this.dataNuevaPersona.nombre, dni: this.dataNuevaPersona.dni, }).subscribe({
        next: ({persona}) => {
          this.formulariosPracticaService.actualizarFormulario(this.idFormulario, {nro_tramite, tipo, persona: persona._id}).subscribe({
            next: () => {
              this.eliminarPersona();
              this.listarFormularios();
            },
            error: ({error}) => {
              this.alertService.errorApi(error.msg);
            }
          })
        },  
        error: ({error}) => {
          this.alertService.errorApi(error.msg);
        }
      });

    }

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

  // Buscar persona por ID
  buscarPersonaPorID(id: string): void {
    this.personasService.getPersona(id).subscribe({
      next: ({persona}) => {
        this.personaSeleccionada = persona;
      },
      error: ({error}) => {
        this.alertService.errorApi(error.msg);
      }
    });
  }

  // Imprimir formulario
  imprimirFormulario(tipo: string): void {
    if(tipo === 'Auto'){
      window.open(`${base_url}/formularios/formulario_auto.pdf`, '_blank');     
    }else{
      window.open(`${base_url}/formularios/formulario_moto.pdf`, '_blank');     
    }
  }

  // Buscar personas por DNI
  buscarPersona(): void {

    if(this.dni?.trim() === ''){
      this.alertService.info('Debe ingresar un DNI');
      return;
    }

    this.alertService.loading();
    this.personasService.getPersonaDNI(this.dni).subscribe({
      next: ({ persona }) => { 
        if(persona){
          this.personaSeleccionada = persona;
        }else{
          this.dataNuevaPersona.dni = this.dni;
          this.nuevaPersona = true;
        } 
        this.dni = '';
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Eliminar persona
  eliminarPersona(): void {
    this.personaSeleccionada = null;
    this.nuevaPersona = false;
    this.dni = '';
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    
    this.personaSeleccionada = null;
    
    this.dataNuevaPersona = {
      apellido: '',
      nombre: '',
      dni: ''
    };
    
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
