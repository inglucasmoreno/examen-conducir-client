import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPreguntasDetalles'
})
export class FiltroPreguntasDetallesPipe implements PipeTransform {

  transform(valores: any[], filtro: string): any {
    
    // Arreglo respuesta
    let filtrados: any[];
  
    // Se realiza el filtrado
    if(filtro !== ''){
      filtrados = valores.filter( valor => {
        return valor.seleccion_correcta == filtro;
      });
    }else if(filtro === ''){
      filtrados = valores; 
    }

    // Respuesta del pipe
    return filtrados;

  }

}
