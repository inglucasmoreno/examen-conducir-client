import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { ExamenesService } from 'src/app/services/examenes.service';
import { environment } from 'src/environments/environment';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';


const base_url = environment.base_url;

@Component({
  selector: 'app-examenes-detalles',
  templateUrl: './examenes-detalles.component.html',
  styles: [
  ]
})
export class ExamenesDetallesComponent implements OnInit {

  public urlBase = environment.base_url;

  // Direccion de retorno
  public urlRetorno = '';

  // Modal
  public showModal = false;
  public showModalReactivacion = false;

  // Examen
  public idExamen: string = '';
  public examen: any;
  public tiempo: string;
  public reactivaciones: any[];

  // Pregunta seleccionada
  public preguntaSeleccionada: any;

  // Filtro segun respuestas
  public filtroRespuestas = ''

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;


  constructor(private dataService: DataService,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private examenesService: ExamenesService) {}

  ngOnInit(): void {    
    this.dataService.ubicacionActual = "Dashboard - Examenes - Detalles";
    this.activatedRoute.params.subscribe(({id, desde}) => {
      this.urlRetorno = desde === 'examenes' ? '/dashboard/examenes' : '/dashboard/examenes/historial';
      this.idExamen = id;
      this.getExamen();
    });
  }

  // Abrir detalles de pregunta
  detallesPregunta(pregunta: any): void {
    window.scrollTo(0,0);
    this.preguntaSeleccionada = pregunta;
    this.showModal = true;
  }

  // Traer datos examen
  getExamen(): void {
    this.alertService.loading();
    this.examenesService.getExamen(this.idExamen).subscribe( ({examen}) => {
      this.examen = examen;
      if(examen.reactivado){
        this.examenesService.listarReactivaciones(examen._id).subscribe(({reactivaciones})=>{
          this.reactivaciones = reactivaciones;
          this.calcularTiempo();
        },({error}) => {
          this.alertService.errorApi(error.message);
        });
      }else{
        this.calcularTiempo();
      }

    },({error}) => {
      this.alertService.errorApi(error.message);
    });    
  }

  // Imprimir examen
  imprimirExamen(): void {
    this.alertService.loading();
    this.examenesService.imprimirExamen(this.examen).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/examen.pdf`, '_blank');  
        this.alertService.close()
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }  
    });    
  }

  // Calcular tiempo
  calcularTiempo(): void {
    const creacion = new Date(this.examen.fecha_rindiendo);
    this.tiempo = formatDistance(new Date(), creacion, { locale: es });
    this.alertService.close();
  }

  // Reiniciar paginacion
  reiniciarPaginacion(): void{ this.paginaActual = 1; }

}
