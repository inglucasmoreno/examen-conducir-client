import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPreguntasEstadisticas'
})
export class FiltroPreguntasEstadisticasPipe implements PipeTransform {
  
  transform(valores: any[], parametro: string): any {
        
    // Filtrado por parametro
    parametro = parametro.toString().toLocaleLowerCase();

    if(parametro.length !== 0){
      return valores.filter( valor => { 
        return valor._id.pregunta.descripcion.toLocaleLowerCase().includes(parametro) ||
               valor._id.pregunta.numero == parametro
      });
    }else{
      return valores;
    }

  }

}
