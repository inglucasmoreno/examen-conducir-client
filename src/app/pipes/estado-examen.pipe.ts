import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoExamen'
})
export class EstadoExamenPipe implements PipeTransform {

  transform(estado: string): string {
    
    let frase = '';

    if(estado == 'Creado') frase = 'Listo para rendirse';
    else if(estado == 'Finalizado') frase = 'Examen completado';
    else if(estado == 'Rindiendo') frase = 'Rindiendose';
    
    return frase;

  }

}
