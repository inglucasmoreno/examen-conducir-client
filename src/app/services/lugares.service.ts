import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class LugaresService {

  constructor(private http: HttpClient) { }

  // Lugar por ID
  getLugares(id: string): Observable<any> {
    return this.http.get(`${base_url}/lugares/${id}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Listar lugares
  listarLugares(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/lugares`,{
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Nuevo lugar
  nuevoLugar(data: any): Observable<any> {
    return this.http.post(`${base_url}/lugares`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  }

  // Actualizar lugares
  actualizarLugares(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/lugares/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
