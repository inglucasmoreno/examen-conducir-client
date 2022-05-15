import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FormulariosPracticaService } from 'src/app/services/formularios-practica.service';
import { LugaresService } from 'src/app/services/lugares.service';
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

  // Lugares
  public lugares: any[];

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
    lugar: ['', Validators.required],
    activo: ['true', Validators.required]
  });

  constructor(private formulariosPracticaService: FormulariosPracticaService,
              private fb: FormBuilder,
              private personasService: PersonasService,
              public authService: AuthService,
              private lugaresService: LugaresService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Formularios'; 
    this.limpiarFormularios();  // Limpiando formularios antiguos
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarLugares();
    this.listarFormularios(); 
  }

  // Limpiar formularios antiguos
  limpiarFormularios(): void {
    this.formulariosPracticaService.limpiarFormularios().subscribe({
      next: () => {}  
    })
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('FORMULARIOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, formulario: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    if(estado === 'editar') this.getFormulario(formulario);
    else this.showModalFormulario = true;
    this.estadoFormulario = estado;  
  }

  // Listar lugares
  listarLugares(): void {
    this.lugaresService.listarLugares(1, 'descripcion').subscribe({
      next: ({lugares}) => {
        this.lugares = lugares.filter(lugar => lugar.descripcion !== 'DIRECCION DE TRANSPORTE');
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Traer datos de formulario
  getFormulario(formulario: any): void {
    this.alertService.loading();
    this.idFormulario = formulario._id;
    this.formulariosPracticaService.getFormulario(formulario._id).subscribe(({formulario}) => {
      this.formularioForm.patchValue({
        nro_tramite: formulario.nro_tramite,
        persona: formulario.persona,
        lugar: formulario.lugar,
        tipo: formulario.tipo        
      });
      this.buscarPersonaPorID(formulario.persona);
      this.alertService.close();
      this.showModalFormulario = true;
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar formularios
  listarFormularios(): void {

    if(this.authService.usuario.role === 'ADMIN_ROLE'){
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
    }else{
      this.formulariosPracticaService.listarFormulariosPorLugar(
        this.authService.usuario.lugar, 
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

  }

  // Nuevo formulario
  nuevoFormulario(): void {

    const { nro_tramite, persona, lugar, tipo } = this.formularioForm.value;

    if(!this.nuevaPersona){ // La persona existe

        const verificacion_1 = (nro_tramite.trim() === '' || (lugar.trim() === '' && this.authService.usuario.role === 'ADMIN_ROLE') || !this.personaSeleccionada) && !this.nuevaPersona;


        if(verificacion_1){
          this.alertService.info('Completar los campos obligatorios');
          return;
        }
      
        const data = {
          nro_tramite,
          tipo,
          lugar: this.authService.usuario.role === 'ADMIN_ROLE' ? lugar : this.authService.usuario.lugar,
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
        // this.imprimirFormulario(tipo);
        this.eliminarPersona();
        this.listarFormularios();
        this.generarPdf(tipo);
      },({error})=>{
        this.alertService.errorApi(error.message);  
      });
    
    }else{ // La pesona no existe


      const verificacion_2 = (nro_tramite.trim() === '' || 
      (lugar.trim() === '' && this.authService.usuario.role === 'ADMIN_ROLE') ||
      this.dataNuevaPersona.apellido.trim() === '' ||
      this.dataNuevaPersona.nombre.trim() === '' ||
      this.dataNuevaPersona.dni.trim() === '') && this.nuevaPersona;

      if(verificacion_2){
        this.alertService.info('Completar los campos obligatorios');
        return;
      }

      this.alertService.loading();
      this.personasService.nuevaPersona({apellido: this.dataNuevaPersona.apellido, nombre: this.dataNuevaPersona.nombre, dni: this.dataNuevaPersona.dni, }).subscribe({
        next: ({persona}) => {
          
          const data = {
            nro_tramite, 
            tipo,
            lugar: this.authService.usuario.role === 'ADMIN_ROLE' ? lugar : this.authService.usuario.lugar,
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
              this.generarPdf(tipo);
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

  // Generar PDF luego de creacion
  generarPdf(tipo: string): void {
    if(tipo === 'Auto'){
      window.open(`${base_url}/pdf/formulario_auto.pdf`, '_blank');     
    }else{
      window.open(`${base_url}/pdf/formulario_moto.pdf`, '_blank');
    }
  }


  // Actualizar formulario
  actualizarFormulario(): void {

    const { nro_tramite, persona, lugar, tipo } = this.formularioForm.value;

    // Verificacion de datos

    const verificacion_1 = (nro_tramite.trim() === '' || (lugar.trim() === '' && this.authService.usuario.role === 'ADMIN_ROLE') || !this.personaSeleccionada) && !this.nuevaPersona;
    const verificacion_2 = (nro_tramite.trim() === '' ||
                            (lugar.trim() === '' && this.authService.usuario.role === 'ADMIN_ROLE') || 
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
        lugar: this.authService.usuario.role === 'ADMIN_ROLE' ? lugar : this.authService.usuario.lugar,
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
  imprimirFormulario(formulario: any): void {
    
    this.alertService.loading();

    const data = {
      nro_tramite: formulario.nro_tramite,
      tipo: formulario.tipo,
      nombre: formulario.persona.nombre,
      apellido: formulario.persona.apellido,
      dni: formulario.persona.dni,
      nro_formulario: formulario.nro_formulario_string,
      fecha: formulario.createdAt
    }

    if(formulario.tipo === 'Auto'){
      this.formulariosPracticaService.imprimirFormulario(data).subscribe({
        next: () => {
          this.alertService.close();
          window.open(`${base_url}/pdf/formulario_auto.pdf`, '_blank');     
        },
        error: ({error}) => {
          this.alertService.errorApi(error.message);
        }
      });
    }else{
      this.formulariosPracticaService.imprimirFormulario(data).subscribe({
        next: () => {
          this.alertService.close();
          window.open(`${base_url}/pdf/formulario_moto.pdf`, '_blank');     
        },
        error: ({error}) => {
          this.alertService.errorApi(error.message);
        }
      });
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
      lugar: '',
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
