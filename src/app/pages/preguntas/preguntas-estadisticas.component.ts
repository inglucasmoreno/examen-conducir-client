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
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10000;
  public desde: number = 0;

  // Filtrado
  public filtro = {
    tipo: 'respuestas',
    parametro: '',
    fechaDesde: '',
    fechaHasta: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'porcentaje_incorrectas'
  }

  constructor(private estadisticasService: EstadisticasService,
    private dataService: DataService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Preguntas - Estadisticas';
    // this.alertService.loading();
    // this.listarEstadisticas();
  }

  // Listar estadisticas
  listarEstadisticas(): void {

    // Verificacion de fecha de inicio
    if(!this.filtro.fechaDesde || this.filtro.fechaDesde === ''){
      this.alertService.info('Debe colocar una fecha de inicio de busqueda');
      return;
    }

    // Verificacion de fecha 
    if(!this.filtro.fechaHasta || this.filtro.fechaHasta === ''){
      this.alertService.info('Debe colocar una fecha de finalización de busqueda');
      return;
    }

    this.alertService.loading();
    this.estadisticasService.preguntas(
      {
        direccion: this.ordenar.direccion,
        columna: this.ordenar.columna,
        desde: this.desde,
        cantidadItems: this.cantidadItems,
        activo: '',
        parametro: this.filtro.parametro,
        fechaDesde: this.filtro.fechaDesde,
        fechaHasta: this.filtro.fechaHasta
      }
    ).subscribe(({ estadisticas, totalItems }) => {
      this.estadisticas = estadisticas;
      this.totalItems = totalItems;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarEstadisticas();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarEstadisticas();
  }

}
