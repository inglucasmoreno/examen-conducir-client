import { Component, OnInit } from '@angular/core';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { ExamenesService } from 'src/app/services/examenes.service';

@Component({
  selector: 'app-examenes-estadisticas',
  templateUrl: './examenes-estadisticas.component.html',
  styles: [
  ]
})
export class ExamenesEstadisticasComponent implements OnInit {

  public fechaDesde = '';
  public fechaHasta = '';
  public estadisticas = null;
  public inicio = true;

  constructor(
    private alertService: AlertService,
    private examenesService: ExamenesService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

  // Generar estadisticas
  generarEstadisticas(
  ): void {
    this.alertService.loading();
    this.examenesService.estadisiticasExamenes(
      this.fechaDesde,
      this.fechaHasta
    ).subscribe({
      next: ({ estadisticas }) => {
        this.estadisticas = estadisticas;
        this.inicio = false;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

}
