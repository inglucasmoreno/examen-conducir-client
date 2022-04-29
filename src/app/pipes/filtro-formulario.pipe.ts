import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroFormulario'
})
export class FiltroFormularioPipe implements PipeTransform {

  transform(valores: any[], parametro: string, activo: string): any {
    
    // Trabajando con activo boolean
    let boolActivo: boolean;
    let filtrados: any[];
  
    // Creando variable booleana
    if(activo === 'true') boolActivo = true;
    else if(activo === 'false') boolActivo = false; 
    else boolActivo = null;
    
    // Filtrado Activo - Inactivo - Todos
    if(boolActivo !== null){
      filtrados = valores.filter( valor => {
        return valor.activo == boolActivo;
      });
    }else if(boolActivo === null){
      filtrados = valores; 
    }
    
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.nro_formulario_string.toLocaleLowerCase().includes(parametro) ||
               valor.nro_tramite.toLocaleLowerCase().includes(parametro) ||
               valor.persona.dni.toLocaleLowerCase().includes(parametro) ||
               (valor.persona.apellido.toLocaleLowerCase() + ' ' + valor.persona.nombre.toLocaleLowerCase()).includes(parametro) 
      });
    }else{
      return filtrados;
    }

  }


}
