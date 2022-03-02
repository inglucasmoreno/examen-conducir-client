import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import gsap from 'gsap';
import { ExamenesService } from '../services/examenes.service';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-login-examen',
  templateUrl: './login-examen.component.html',
  styles: [
  ]
})
export class LoginExamenComponent implements OnInit {

  public dni: string = '';

  constructor(private alertService: AlertService,
              private socketService: SocketService,
              private router: Router,
              private examenesService: ExamenesService) { }

  ngOnInit(): void {

    // Si hay examen activo se redirecciona al examen
    if(localStorage.getItem('examen')) this.router.navigateByUrl('examen-resolucion');
    
    // Animacion de inicio
    this.animacionInicio();
  
  }
  
  // GSAP - Animacion de inicio
  animacionInicio(): void {
    var tl = gsap.timeline({ defaults: { duration: 0.1 } });
    tl.from('.gsap-formulario', { y:-100, opacity: 0, duration: .5 })
      .from('.gsap-fondo', { y:100, opacity: 0, duration: .5 })
      .from('.gsap-imagen', { y:100, opacity: 0, duration: .5 });
  }

  // Se ingresa a rendir el examen
  ingresarExamen(): void {  
    // Verificacion de campo vacio -> DNI
    if(this.dni === '') return this.alertService.info('Debes ingresar tu DNI');

    this.alertService.loading();

    // Se traen los datos del examen
    this.examenesService.getExamenDni(this.dni).subscribe( ({ examen }) => {
      
      if(examen.estado === 'Creado'){
        this.examenEstadoRindiendo(examen);
      }else{
        this.almacenarExamen(examen);  
        this.wbInicioExamen(examen);
        this.alertService.close();
        this.router.navigateByUrl('examen-resolucion'); 
      } 
      
    },({error})=>{
      this.dni = '';
      this.alertService.info(error.message);
    });
    
  }

  // Se coloca el examen en estado -> "Rindiendo"
  examenEstadoRindiendo(examen: any): void {
    const { tiempo } = examen;
    this.examenesService.actualizarExamen(examen._id, { estado: 'Rindiendo', tiempo }).subscribe(({examen}) => {
      this.almacenarExamen(examen);  
      this.wbInicioExamen(examen);
      this.alertService.close();
      this.router.navigateByUrl('examen-resolucion'); 
    }, ({error}) => {
      this.alertService.errorApi(error.message);
    });    
  }

  // Se almacena el examen en el localstorage
  almacenarExamen(examen: any): void {
    localStorage.setItem('nro', '0');
    localStorage.setItem('examen', JSON.stringify(examen));
  }

  // Websocket -> Avisa al examinador que se comenzo a rendir el examen
  wbInicioExamen(examen: any): void {
    this.socketService.listarExamenes({
      examen: examen._id,
      lugar: examen.lugar
    });
  }

}
