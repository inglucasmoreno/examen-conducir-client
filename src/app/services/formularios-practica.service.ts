import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FormulariosPracticaService {

  constructor(private http: HttpClient) { }

  // Formulario por ID
  getFormulario(id: string): Observable<any> {
    return this.http.get(`${base_url}/formulario-practica/${id}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Listar formularios
  listarFormularios(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/formulario-practica`,{
      params: {
        columna: parametros?.columna || 'descripcion',
        direccion: parametros?.direccion || 1,
        desde: parametros?.desde || 0,
        registerpp: parametros?.cantidadItems || 100000,
        activo: parametros?.activo || '',
        parametro: parametros?.parametro || '',                
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Limpiar formularios
  limpiarFormularios(): Observable<any> {
    console.log('Limpiar formularios');
    return this.http.get(`${base_url}/formulario-practica/antiguos/limpiar/todos`,{
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Listar formularios por lugar de trabajo
  listarFormulariosPorLugar(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/formulario-practica/lugar/${parametros.id || ''}`,{
      params: {
        columna: parametros?.columna || 'descripcion',
        direccion: parametros?.direccion || 1,
        desde: parametros?.desde || 0,
        registerpp: parametros?.cantidadItems || 100000,
        activo: parametros?.activo || '',
        parametro: parametros?.parametro || '',             
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Nuevo formulario
  nuevoFormulario(data: any , querys: any = {}): Observable<any> {
    return this.http.post(`${base_url}/formulario-practica`, data, {
      headers: {'Authorization': localStorage.getItem('token')},
      params: querys
    });  
  }

  // Imprimir formulario
  imprimirFormulario(data: any): Observable<any> {
    return this.http.post(`${base_url}/formulario-practica/imprimir`, data, {
      headers: {'Authorization': localStorage.getItem('token')},
    });  
  }
 
  // Actualizar formulario
  actualizarFormulario(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/formulario-practica/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
