import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { InicializacionService } from '../services/inicializacion.service';

@Component({
  selector: 'app-inicializacion',
  templateUrl: './inicializacion.component.html',
  styleUrls: []
})
export class InicializacionComponent implements OnInit {

  constructor(private inicializacionService: InicializacionService,
              private alertService: AlertService) { }

  ngOnInit(): void {}

  inicializarUsuarios(): void {
    this.alertService.loading();
    this.inicializacionService.inicializarUsuarios().subscribe(({message}) => {
      this.alertService.success(message);
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  inicializarPreguntas(): void {
    this.alertService.loading();
    this.inicializacionService.inicializarPreguntas().subscribe(({message}) => {
      this.alertService.success(message);
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

}
