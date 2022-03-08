import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ExamenesService } from '../../services/examenes.service';
import { FormBuilder } from '@angular/forms';
import { LugaresService } from '../../services/lugares.service';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';

@Component({
  selector: 'app-examenes-historial',
  templateUrl: './examenes-historial.component.html',
  styles: [
  ]
})
export class ExamenesHistorialComponent implements OnInit {

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Flags
  public flagInicio = true;
  public reactivados = false;
  public bajaTiempo = false;

  // Lugares
  public lugares: any[];

  // Filtrado y Ordenamiento
  public direccion = -1;
  public columna = 'createdAt';

  // Examenes
  public examenes;
  public examenesMostrar;

  // Busqueda
  public busquedaForm = this.fb.group({
    lugar: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    clase: '',
    usuario: '',
    persona: ''
  });

  constructor(private examenesService: ExamenesService,
              private lugaresService: LugaresService,
              private dataService: DataService,
              private fb: FormBuilder,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = "Dashboard - Examenes - Historial";
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .3 });
    this.listarLugares();
  }

  listarLugares(): void {
    this.alertService.loading();
    this.lugaresService.listarLugares().subscribe(({ lugares }) => {
      this.lugares = lugares.filter( lugar => lugar.descripcion !== 'DIRECCION DE TRANSPORTE' && lugar.activo);
      this.alertService.close();
    },({error}) => {
      this.alertService.errorApi(error.message);
    })
  }
  
  ordenar(direccion): void {
    this.direccion = direccion;
    this.buscar();  
  }

  soloFinalizadosPorTiempo(): void {
    this.paginaActual = 1;
    this.reactivados = false;
    this.bajaTiempo = !this.bajaTiempo;
    this.filtrarReactivados();
  }

  soloReactivados(): void {
    this.paginaActual = 1;
    this.bajaTiempo = false;
    this.reactivados = !this.reactivados;
    this.filtrarReactivados();
  }

  filtrarReactivados(): void {
    if(this.reactivados) this.examenesMostrar = this.examenes.filter( examen => examen.reactivado )
    else if(this.bajaTiempo) this.examenesMostrar = this.examenes.filter( examen => examen.baja_tiempo )
    else this.examenesMostrar = this.examenes;
  }

  buscar(): void {
    this.alertService.loading();
    this.examenesService.listarExamenesHistorial(this.direccion, this.columna, this.busquedaForm.value).subscribe( ({ examenes }) => {
      this.paginaActual = 1;
      this.examenes = examenes;
      this.examenesMostrar = examenes;
      this.flagInicio = false;
      this.filtrarReactivados();
      this.alertService.close();
    },({error}) => {
      this.alertService.errorApi(error.message);
    });
  }


}
