import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { ExamenesService } from '../services/examenes.service';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { compareAsc, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { SocketService } from '../services/socket.service';
 
@Component({
  selector: 'app-examen',
  templateUrl: './examen.component.html',
  styles: [
  ]
})
export class ExamenComponent implements OnInit, OnDestroy {
  
  // Subscripciones
  public wbFinalizar: Subscription;

  // Tiempo
  public cerrandoExamen = false;
  public estadoTiempo = 'Mucho'; // Mucho | Medio | Poco

  // Variables - WebSocket
  public urlBase = environment.base_url;

  // Variables - Tiempo
  public timerSubscripcion;
  public tiempo;
  
  // Variables - Examen
  public nroPregunta: number = 0;
  public examen: any = {};
  public preguntas: any = [];
  public respuestaSeleccionada = ''; // A | B | C
  public mostrarRespuestas: any = {
    a: {
      descripcion: '',
      real: '',
      seleccionada: false
    },
    b: {
      descripcion: '',
      real: '',
      sleccionada: false
    },
    c: {
      descripcion: '',
      real: '',
      seleccionada: false
    },
  };

  constructor(private alertService: AlertService,
              private socketService: SocketService,
              private examenesService: ExamenesService,
              private router: Router) { }

  ngOnInit(): void {
    // Verificacion: Hay examen activo?
    if(!localStorage.getItem('examen')) this.redireccionLogin();  
    else this.inicializacion();      
  }
  ngOnDestroy(): void {
    this.wbFinalizar.unsubscribe();        // Websocket - Se finaliza la suscripcion al canal de finalizacion de examen
    this.timerSubscripcion?.unsubscribe(); // Si existe la suscripcion se cancela la suscripcion
  }

  // Redireccionar al Login
  redireccionLogin(): void {
    localStorage.removeItem('nro');
    localStorage.removeItem('examen');
    this.router.navigateByUrl('examen');
  }

  // Inicializacion normal
  inicializacion(): void {
    
    this.wbFinalizarExamen();        // Websocket - Suscripcion al canal de finalizacion de examen

    const timer = interval(1000);

    this.timerSubscripcion = timer.subscribe( () => { 
      this.calcularTiempo();
      this.verificarCierreExamen(); 
    });

    // Se recupera informacion desde el localstorage
    this.nroPregunta = Number(localStorage.getItem('nro'));
    this.examen = JSON.parse(localStorage.getItem('examen'));

    this.alertService.loading();
    
    // Verificacion: Si el examen no esta activo se redirecciona al login-examen
    this.examenesService.getExamen(this.examen._id, 'true').subscribe(({examen}) => {
      this.alertService.close();
    },({error}) => {
      // Si el examen no existe - Se redirecciona a la pantalla de login
      if(error.message === 'El examen no existe'){
        localStorage.removeItem('nro');
        localStorage.removeItem('examen');
        this.alertService.close();
        this.router.navigateByUrl('examen');
      }
    });
    
    this.preguntas = this.examen.preguntas;
    // this.animacionInicial();
    this.respuestasAleatorias();
    this.calcularTiempo();

  }

  // Verificar cierre de examen
  verificarCierreExamen(): void {
    if(this.examen.fecha_finalizacion){
      const finalizar = compareAsc(new Date(), new Date(this.examen.fecha_finalizacion));
      if(finalizar != -1){
        this.cerrandoExamen = true;
        this.finalizarExamenRemoto();   
      }  
    }
  }

  // WB - Conexion a canal de finalizacion de examen de forma remota
  wbFinalizarExamen(): void {
    this.wbFinalizar = this.socketService.getFinalizar().subscribe( data => {
      if(data.examen === this.examen._id) this.finalizarExamenRemoto();
    });
  }

  // GSAP - Animacion inicial
  // animacionInicial(): void {
  //   var tl = gsap.timeline({ defaults: { duration: 0.1 } });
  //   tl.from('.gsap-pregunta', { y:100, opacity: 0, duration: .5 })
  //     .from('.gsap-respuestas', { y:100, opacity: 0, duration: .5 })
  // }

  // Pregunta anterior / Proxima pregunta
  incDecNro(tipo: string): void {

    // Se almacena la opcion seleccionada
    this.finalizarSeleccion();

    // Se limpia la respuesta seleccionada
    this.respuestaSeleccionada = '';

    // pregunta anterior
    if(tipo === 'dec' && this.nroPregunta != 0){
      this.nroPregunta -= 1;
      this.respuestasAleatorias();
    }
    
    // Proxima pregunta
    if(tipo === 'inc' && this.nroPregunta != (this.preguntas.length - 1)){
      this.nroPregunta += 1;
      this.respuestasAleatorias();
    }
    
    // // Resguardo en localstorage
    localStorage.setItem('nro',(this.nroPregunta).toString());
    localStorage.setItem('examen', JSON.stringify(this.examen));

  }
  
  // Finalizar examen desde el cliente
  finalizarExamen(): void { 
    
    this.finalizarSeleccion();

    this.alertService.question({ msg: 'Esta por finalizar el examen', buttonText: 'Finalizar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {

        this.alertService.loading();

        this.examen.preguntas = this.preguntas;
        this.examen.activo = false;
      
        const data = { preguntas: this.preguntas, activo: false };

        this.examenesService.actualizarExamen(this.examen._id, data).subscribe(() => {
          this.respuestaSeleccionada = '';
          localStorage.removeItem('examen');
          this.alertService.close();
          this.router.navigateByUrl('examen-resultado/' + this.examen._id.toString());
        },()=>{
          this.alertService.errorApi('Error al finalizar el examen');
        })        

      }
    });
  }
  
  // Finalizar examen - Desde la seccion de administracion
  finalizarExamenRemoto(): void {
    
    this.finalizarSeleccion();

    this.examen.preguntas = this.preguntas;
    this.examen.activo = false;

    const data = { preguntas: this.preguntas, activo: false };

    this.examenesService.actualizarExamen(this.examen._id, data).subscribe(() => {
      this.respuestaSeleccionada = '';
      localStorage.removeItem('examen');
      this.router.navigateByUrl('examen-resultado/' + this.examen._id.toString());
    },()=>{
      this.alertService.errorApi('Error al finalizar el examen');
    })        
  }

  // Calculo de tiempo para muestra
  calcularTiempo(): void {
    const creacion = new Date(this.examen.fecha_finalizacion);
    this.tiempo = formatDistanceToNowStrict(creacion, { locale: es });    
    this.estilosTiempo(this.tiempo);
  }

  // Estado de tiempo - Para estilos
  estilosTiempo(tiempo: string): void {

    const tiempoSplit = tiempo.split(' ');

    // Poco tiempo para cierre
    if(tiempoSplit[1] === 'segundos' || tiempoSplit[1] === 'segundo') this.estadoTiempo = 'Poco'

    // Tiempo medio para cierre
    else if(Number(tiempoSplit[0]) <= 3 && ( tiempoSplit[1] === 'minuto' || tiempoSplit[1] === 'minutos' )) this.estadoTiempo = 'Medio'
  
  }

  // Orden aleatorio para las respuestas
  respuestasAleatorias(): void {
    const min = 1;
    const max = 6;
    const aleatorio = Math.floor((Math.random() * (max - min + 1)) + min);
    
    this.mostrarRespuestas.a.descripcion = '';
    this.mostrarRespuestas.b.descripcion = '';
    this.mostrarRespuestas.c.descripcion = '';

    if(aleatorio === 1){
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.a.real = 'respuesta_correcta';
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.b.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.c.real = 'respuesta_incorrecta_2';
    }else if(aleatorio === 2){
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.a.real = 'respuesta_correcta';
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.c.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.b.real = 'respuesta_incorrecta_2';
    }else if(aleatorio === 3){
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.b.real = 'respuesta_correcta';
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.a.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.c.real = 'respuesta_incorrecta_2';
    }else if(aleatorio === 4){
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.b.real = 'respuesta_correcta';
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.c.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.a.real = 'respuesta_incorrecta_2';
    }else if(aleatorio === 5){
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.c.real = 'respuesta_correcta';
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.a.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.b.real = 'respuesta_incorrecta_2';
    }else if(aleatorio === 6){
      this.mostrarRespuestas.c.descripcion = this.preguntas[this.nroPregunta].respuesta_correcta;
      this.mostrarRespuestas.c.real = 'respuesta_correcta';
      this.mostrarRespuestas.b.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_1;
      this.mostrarRespuestas.b.real = 'respuesta_incorrecta_1';
      this.mostrarRespuestas.a.descripcion = this.preguntas[this.nroPregunta].respuesta_incorrecta_2;
      this.mostrarRespuestas.a.real = 'respuesta_incorrecta_2';
    }
    
    // Se determina que respuesta se encuentra seleccionada
    const seleccionada = this.preguntas[this.nroPregunta].seleccionada;
    if(this.mostrarRespuestas.a.real === seleccionada) this.respuestaSeleccionada = 'A';
    if(this.mostrarRespuestas.b.real === seleccionada) this.respuestaSeleccionada = 'B';
    if(this.mostrarRespuestas.c.real === seleccionada) this.respuestaSeleccionada = 'C';

  }

  // Se selecciona una pregunta
  seleccionarPregunta(seleccionada: string): void {
    if(seleccionada === 'A') this.respuestaSeleccionada = 'A';
    else if(seleccionada === 'B') this.respuestaSeleccionada = 'B';
    else if(seleccionada === 'C') this.respuestaSeleccionada = 'C';
  }

  // Se selecciona una respuesta y se almacena en el objeto examen
  finalizarSeleccion(): void {    
    if(this.respuestaSeleccionada === 'A'){
      this.preguntas[this.nroPregunta].seleccionada = this.mostrarRespuestas.a.real;
      this.mostrarRespuestas.a.real === 'respuesta_correcta' ? this.preguntas[this.nroPregunta].seleccion_correcta = true : this.preguntas[this.nroPregunta].seleccion_correcta = false;    
    }else if(this.respuestaSeleccionada === 'B'){
      this.preguntas[this.nroPregunta].seleccionada = this.mostrarRespuestas.b.real;   
      this.mostrarRespuestas.b.real === 'respuesta_correcta' ? this.preguntas[this.nroPregunta].seleccion_correcta = true : this.preguntas[this.nroPregunta].seleccion_correcta = false;    
    }else if(this.respuestaSeleccionada === 'C'){
      this.preguntas[this.nroPregunta].seleccionada = this.mostrarRespuestas.c.real;   
      this.mostrarRespuestas.c.real === 'respuesta_correcta' ? this.preguntas[this.nroPregunta].seleccion_correcta = true : this.preguntas[this.nroPregunta].seleccion_correcta = false;    
    }  
  }

}
