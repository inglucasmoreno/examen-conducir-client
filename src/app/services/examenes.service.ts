import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ExamenesService {

  constructor(private http: HttpClient) { }

  // Examen por ID
  getExamen(id: string, activo:string = ''): Observable<any> {
    return this.http.get(`${base_url}/examenes/${id}`, {
      params: { activo }  
    });
  }

  // Examen por DNI
  getExamenDni(dni: string): Observable<any> {
    return this.http.get(`${base_url}/examenes/dni/${dni}`);
  }

  // Listar examenes historial
  listarExamenesHistorial(
    direccion: number = 1,
    columna: string = 'createdAt',
    data: any = {}
  ): Observable<any> {
    return this.http.post(`${base_url}/examenes/historial/listado`,data, {
      params: {
        direccion: String(direccion),
        columna,
        data
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Listar examenes - Hoy
  listarExamenes(
    direccion: number = 1,
    columna: string = 'createdAt',
    lugar: string = ''  
  ): Observable<any> {
    return this.http.get(`${base_url}/examenes`,{
      params: {
        direccion: String(direccion),
        columna,
        lugar              
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Limpiar examenes antiguos
  limpiarExamenes(
  ): Observable<any> {
    return this.http.get(`${base_url}/examenes/limpiar/antiguos`,{
      params: {},
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  } 

  // Nuevo examen
  nuevoExamen(data: any): Observable<any> {
    return this.http.post(`${base_url}/examenes`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  }

  // Actualizar examen
  actualizarExamen(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/examenes/${id}`, data);
  }

  // Listar reactivaciones de examen
  listarReactivaciones(id: string): Observable<any> {
    return this.http.get(`${base_url}/examenes/reactivar/${id}`,{
      params:{
        direccion: -1,
        columna: 'createdAt'
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Reactivar examen
  reactivarExamen(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/examenes/reactivar/${id}`, data);
  }

  // Eliminar examen
  eliminarExamen(id: string): Observable<any> {
    return this.http.delete(`${base_url}/examenes/${id}`, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
