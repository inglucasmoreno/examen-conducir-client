import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { ExamenesService } from '../services/examenes.service';
import { Router } from '@angular/router';
import gsap from 'gsap';
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
    
    // GSAP - Animacion
    var tl = gsap.timeline({ defaults: { duration: 0.1 } });
    tl.from('.gsap-formulario', { y:-100, opacity: 0, duration: .5 })
      .from('.gsap-fondo', { y:100, opacity: 0, duration: .5 })
      .from('.gsap-imagen', { y:100, opacity: 0, duration: .5 });
  
  }

  ingresarExamen(): void {
    
    this.alertService.loading();

    if(this.dni === '') return this.alertService.info('Debes ingresar tu DNI');
  
    // Se obtienen datos los datos del examen
    this.examenesService.getExamenDni(this.dni).subscribe( ({ examen }) => {

      // Se coloca el examen en estado de -> 'Rindiendo'
      this.examenesService.actualizarExamen(examen._id, { estado: 'Rindiendo', fecha_rindiendo: Date.now() }).subscribe(({examen}) => {
        localStorage.setItem('nro', '0');
        localStorage.setItem('examen', JSON.stringify(examen));
        this.socketService.listarExamenes({
          examen: examen._id,
          lugar: examen.lugar
        }); // Socket - Se deben volver a listar los examenes en la tabla de admin
        this.alertService.close();
        this.router.navigateByUrl('examen-resolucion'); 
      }, ({error}) => {
        this.alertService.errorApi(error.message);
      });

    },({error})=>{
      this.dni = '';
      this.alertService.info(error.message);
    });
    
  }

}
