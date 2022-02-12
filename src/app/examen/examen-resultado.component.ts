import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { ExamenesService } from '../services/examenes.service';
import gsap from 'gsap';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-examen-resultado',
  templateUrl: './examen-resultado.component.html',
  styles: [
  ]
})
export class ExamenResultadoComponent implements OnInit {

  public examen:any = {};
  public porcentaje: any;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private socketService: SocketService,
              private alertService: AlertService,
              private examenesService: ExamenesService) {}

  ngOnInit(): void {
    
    // Efectos GSAP
    var tl = gsap.timeline({ defaults: { duration: 0.1 } });
    tl.from('.gsap-resultado', { y:-100, opacity: 0, duration: .5 })
    
      this.alertService.loading();
    this.activatedRoute.params.subscribe(({ id }) => {
      this.examenesService.getExamen(id).subscribe(({ examen }) => {
        this.examen = examen;
        this.calculoPorcentaje();
        this.alertService.close();
      },({error}) => {
        this.alertService.errorApi(error.message);
      })
    });
  }

  calculoPorcentaje(): void {
    this.porcentaje = (this.examen.cantidad_respuestas_correctas / this.examen.preguntas.length) * 100;
    this.porcentaje = this.porcentaje.toFixed(2);
    const data = { nota: this.porcentaje, estado: 'Finalizado' };
    this.examenesService.actualizarExamen(this.examen._id, data).subscribe(() => {
      this.socketService.listarExamenes({ examen: this.examen._id, lugar: this.examen.lugar._id }); // Se deben listar los examenes en la tabla de admin
    });
  }

  regresarInicio(): void{
    localStorage.removeItem('examen');
    this.router.navigateByUrl('examen');
  }

}
