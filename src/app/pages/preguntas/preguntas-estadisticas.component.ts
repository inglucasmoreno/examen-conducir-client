import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-preguntas-estadisticas',
  templateUrl: './preguntas-estadisticas.component.html',
  styleUrls: []
})
export class PreguntasEstadisticasComponent implements OnInit {

  public estadisticas;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    tipo: 'respuestas',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: '_id.pregunta.numero'
  }

  constructor(private estadisticasService: EstadisticasService,
              private dataService: DataService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Preguntas - Estadisticas';
    this.alertService.loading();
    this.listarEstadisticas();
  }

  // Listar estadisticas
  listarEstadisticas(): void{
    this.estadisticasService.preguntas(this.ordenar.direccion, this.ordenar.columna).subscribe(({ estadisticas }) => {
      this.estadisticas = estadisticas;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
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
    this.listarEstadisticas();
  }

}
