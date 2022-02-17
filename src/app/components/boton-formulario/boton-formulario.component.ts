import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-boton-formulario',
  templateUrl: './boton-formulario.component.html',
  styles: [
  ]
})
export class BotonFormularioComponent implements OnInit {

  @Input() deshabilitado: boolean = false; // Deshabilitar accion de boton

  constructor() { }

  ngOnInit(): void {
  }

}
