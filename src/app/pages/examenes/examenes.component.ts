import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { interval, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ExamenesService } from 'src/app/services/examenes.service';
import { LugaresService } from 'src/app/services/lugares.service';
import { PersonasService } from 'src/app/services/personas.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.component.html',
  styles: [
  ]
})
export class ExamenesComponent implements OnInit {

  // Fechas
  public fechaHoy = new Date();

  // Suscripciones
  public wbListarExamenes: Subscription;

  // Permisos de usuarios login
  public permisos = { all: false };

  // Obervables
  public timerSubscribe;

  // Modal
  public showModalExamen = false;
  public showModalReactivar = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Examenes
  public idExamen: string = '';
  public examenes: any = [];
  public examenesTmp: any = [];
  public examenReactivar: any;
  public descripcion: string = '';
  public reactivar = {
    motivo: '',
    tiempo: 5
  }

  // Personas
  public dni: string = '';
  public persona: any;
  public personaSeleccionada;
  public personaNoEncontrada = false;
  public loadingPersona = false;

  // Lugares
  public lugares: any[] = [];
  public lugaresSelector: any[] = [];
  public queryLugar: string = '';

  // Data
  public data = {
    persona: '',
    usuario: '',
    tipo_licencia: 'A',
    lugar: ''
  };

  // Nueva persona
  public dataNuevaPersona = {
    apellido: '',
    nombre: '',
    dni: ''
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
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private examenesService: ExamenesService,
              private lugaresService: LugaresService,
              private personasService: PersonasService,
              private alertService: AlertService,
              public authService: AuthService,
              private socketService: SocketService,
              private dataService: DataService) { }

  ngOnInit(): void {
  
    this.dataService.ubicacionActual = 'Dashboard - Examenes';
    this.data.usuario = this.authService.usuario.userId;
    this.data.lugar = this.authService.usuario.lugar;
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();

    this.limpiarExamenes(); // Se limpian los examenes antiguos

    // Probando observables
    const timer = interval(5000); // Cada 5 segundos
    this.timerSubscribe = timer.subscribe((n) => { this.filtradoExamenes(); });

    this.listarExamenesInicial();

    // WB - Actualizar lista de examenes
    this.wbListarExamenes = this.socketService.getListarExamenes().subscribe( data => {
      (this.authService.usuario.lugar === data.lugar || this.authService.usuario.role === 'ADMIN_ROLE') ? this.listarExamenes('modal') : null;
    });

  }

  ngOnDestroy(): void {
    this.wbListarExamenes.unsubscribe();  // Se cancela la suscripcion al canal listar-examenes
    this.timerSubscribe.unsubscribe();    // Se cancela la subscripcion al observable timer
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('EXAMENES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Se limpian los examenes antiguos
  limpiarExamenes(): void {
    this.examenesService.limpiarExamenes().subscribe( resp => {
      console.log(resp);
    },({error}) => {
      console.log(error.message);
    });
  }
  
  // Abrir modal - Nuevo examen
  abrirModal(estado: string, examen: any = null): void {
    this.reiniciarFormulario();
    this.personaNoEncontrada = false;
    this.limpiarNuevaPersona();
    this.eliminarPersonaSeleccionada();
    this.dni = '';
    this.descripcion = '';
    this.idExamen = '';

    if(estado === 'editar') this.getExamen(examen);
    else this.showModalExamen = true;

    this.estadoFormulario = estado;
  }

  // Abrir modal - reactivar examen
  abrirModalReactivar(examen: any): void {
    this.reactivar = { motivo: '', tiempo: 5 };
    this.examenReactivar = examen;
    this.showModalReactivar = true;
  }

  // Buscar personas
  buscarPersona(): void {
    this.loadingPersona = true;
    this.personasService.getPersonaDNI(this.dni).subscribe( ({ persona }) => {

      // La persona esta registrada?
      if(!persona){
        this.dataNuevaPersona.dni = this.dni;
        this.personaNoEncontrada = true;
      }

      if(persona && !persona.activo){
        this.loadingPersona = false;
        return this.alertService.info('La persona esta registrada pero inactiva');
      }

      this.persona = persona;
            
      this.dni = '';
      this.loadingPersona = false;
      
      this.seleccionarPersona();

    },({error}) => {
      this.dni = '';
      this.loadingPersona = false;
      this.alertService.errorApi(error);
    })
  }

  // Crear nueva persona
  nuevaPersona(): void {

    const verificacion = this.dataNuevaPersona.apellido.trim() === '' ||
                         this.dataNuevaPersona.nombre.trim() === '' ||
                         this.dataNuevaPersona.dni.trim() === ''

    if(verificacion) return this.alertService.info('Debes completar todos los campos');

    this.alertService.loading();
    this.personasService.nuevaPersona(this.dataNuevaPersona).subscribe(({ persona }) => {
      this.personaSeleccionada = persona;
      this.personaNoEncontrada = false;
      this.limpiarNuevaPersona();
      this.alertService.close();
    },( {error}) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Seleccionar persona
  seleccionarPersona(): void {
    this.personaSeleccionada = this.persona;
  }

  // Eliminar persona seleccionada
  eliminarPersonaSeleccionada(): void {
    this.personaSeleccionada = null;
    this.persona = null;
  }

  // Cancelar seleccion de persona
  cancelarPersona(): void {
    this.persona = null;
  }

  // Listar lugares
  listarLugares(): void {
    this.lugaresService.listarLugares().subscribe(({lugares}) => {
      this.lugares = lugares.filter(lugar => lugar.descripcion !== 'DIRECCION DE TRANSPORTE');
      this.lugaresSelector = lugares.filter(lugar => (lugar.descripcion !== 'DIRECCION DE TRANSPORTE' && lugar.activo));
      this.alertService.close();
    },({error})=>{
      this.alertService.errorApi(error.message);
    })
  }

  // Traer datos de examen
  getExamen(examen: any): void {
    this.idExamen = examen._id;
    this.examenesService.getExamen(examen._id).subscribe(({examen}) => {
      this.descripcion = examen.descripcion;
      this.showModalExamen = true;
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Listar examenes - Primera vez
  listarExamenesInicial(): void {
    if(this.authService.usuario.role === 'ADMIN_ROLE'){
      this.queryLugar = '';
    }else{
      this.queryLugar = this.authService.usuario.lugar;
    }

    this.examenesService.listarExamenes(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.queryLugar
      )
    .subscribe( ({ examenes }) => {
      this.examenes = examenes;
      this.examenesTmp = examenes;
      this.showModalExamen = false;
      this.filtradoExamenes();
      this.listarLugares();
    }, (({error}) => {
      this.alertService.errorApi(error.message);
    }));
  }

  // Listar examens
  listarExamenes(tipo: string = 'normal'): void {
    this.examenesService.listarExamenes(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.queryLugar
      )
    .subscribe( ({ examenes }) => {
      this.examenes = examenes;
      this.examenesTmp = examenes;
      this.limpiarExamenes();
      this.filtradoExamenes();
      // tipo === 'modal' ? this.showModalExamen = false : null;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.message);
    }));
  }

  // Nuevo examen
  nuevoExamen(): void {

    // Verificaciones de datos de examen
    if(!this.personaSeleccionada && !this.personaNoEncontrada) return this.alertService.info('Debe seleccionar una persona');
    if(this.data.lugar == '' && this.authService.usuario.role === 'ADMIN_ROLE') return this.alertService.info('Debe seleccionar un lugar');
    if(this.authService.usuario.role === 'USER_ROLE') this.data.lugar = this.authService.usuario.lugar;
     
    if(this.personaNoEncontrada){ // La persona no esta registrada
      
      const verificacionPersona = this.dataNuevaPersona.apellido.trim() === '' ||
                                  this.dataNuevaPersona.nombre.trim() === '' ||
                                  this.dataNuevaPersona.dni.trim() === ''

      if(verificacionPersona){
        this.alertService.close();
        return this.alertService.info('Datos de persona incompletos');     
      } 
      
      this.alertService.loading();

      this.personasService.nuevaPersona(this.dataNuevaPersona).subscribe( ({ persona }) => {
      
        this.personaSeleccionada = persona;
        this.data.persona = this.personaSeleccionada._id; // Se guarda en data el ID de la persona
        
        // Se crea el nuevo examen
        this.examenesService.nuevoExamen(this.data).subscribe(() => {
          this.showModalExamen = false;
          this.alertService.close();
          this.listarExamenes();
          this.socketService.listarExamenes({ lugar: this.data.lugar });
          this.eliminarPersonaSeleccionada();
        },({error})=>{
          this.alertService.errorApi(error.message);
        });
      
      },({error}) => {
        this.alertService.errorApi(error.message);
      })

    }else{ // La persona esta registrada
   
      this.data.persona = this.personaSeleccionada._id; // Se guarda en data el ID de la persona
     
      this.alertService.loading();

      // Se crea el nuevo examen
      this.examenesService.nuevoExamen(this.data).subscribe(() => {
        this.showModalExamen = false;
        this.socketService.listarExamenes({ lugar: this.data.lugar });
        this.listarExamenes();
        this.eliminarPersonaSeleccionada();
      },({error})=>{
        this.alertService.errorApi(error.message);
      });
    
    }
  
  }

  // Actualizar examenes
  actualizarExamenes(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.examenesService.actualizarExamen(this.idExamen, {descripcion: this.descripcion}).subscribe(() => {
      this.listarExamenes();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(examen: any): void {
    const { _id, activo } = examen;
    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.examenesService.actualizarExamen(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarExamenes();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });
  }

  // Finalizar examen
  finalizarExamen(idExamen: string): void {
    this.alertService.question({ msg: '¿Quieres finalizar este examen?', buttonText: 'Finalizar' })
    .then(({isConfirmed}) => {
      if (isConfirmed) {
        this.socketService.finalizarExamen({ examen: idExamen });
        // this.alertService.loading();
        // this.listarExamenes();
      }
    });
  }

  // Eliminar examen
  eliminarExamen(examen: any): void {
    this.alertService.question({ msg: '¿Quieres eliminar este examen?', buttonText: 'Eliminar' })
    .then(({isConfirmed}) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.examenesService.eliminarExamen(examen._id).subscribe(() => {
          this.showModalExamen = false;
          this.listarExamenes();
          this.socketService.listarExamenes({ lugar: examen.lugar._id });
        },({error}) => {
          this.alertService.errorApi(error.message);
        });
      }
    });
  }

  // Reactivar examen
  reactivarExamen(): void {
    if(this.reactivar.motivo.trim() === '') return this.alertService.info('Debes colocar un motivo');
    
    const { motivo, tiempo } = this.reactivar;

    const data = {
      reactivado: true,
      estado: 'Creado',
      persona: this.examenReactivar.persona._id,
      usuario: this.authService.usuario.userId,
      activo: true,
      motivo,
      tiempo  
    }
    
    this.alertService.loading();

    this.examenesService.reactivarExamen(this.examenReactivar._id, data).subscribe(() => {
      this.showModalReactivar = false;
      this.listarExamenes();
    },({error}) => {
      this.alertService.errorApi(error.message);
    })
    
  }

  // Cancelar nueva persona
  cancelarNuevaPersona(): void {
    this.dni = '';
    this.limpiarNuevaPersona();
    this.eliminarPersonaSeleccionada();
    this.personaNoEncontrada = false;
  }

  // Limpiar datos de nueva persona
  limpiarNuevaPersona(): void {
    this.dataNuevaPersona.apellido = '';
    this.dataNuevaPersona.nombre = '';
    this.dataNuevaPersona.dni = '';
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.data = {
      persona: '',
      usuario: this.authService.usuario.userId,
      tipo_licencia: 'A',
      // lugar: this.authService.usuario.lugar
      lugar: ''
    };
  }

  // Filtrado de examenes - Actualizacion de tiempo de examen
  filtradoExamenes(): void {
    this.examenes.forEach(examen => {
      if(examen.activo){ // Si el examen esta activo se calcula el tiempo faltante
        const creacion = new Date(examen.fecha_rindiendo);
        examen.tiempo = formatDistance(new Date(), creacion, { locale: es });
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
    this.listarExamenes();
  }

}
