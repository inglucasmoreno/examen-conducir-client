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
  listarFormularios(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/formulario-practica`,{
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Nuevo formulario
  nuevoFormulario(data: any): Observable<any> {
    return this.http.post(`${base_url}/formulario-practica`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  }

  // Actualizar formulario
  actualizarFormulario(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/formulario-practica/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
