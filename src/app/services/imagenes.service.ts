import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {

  constructor(private http: HttpClient) { }

  // Obtener imagen por ID
  getImagen(id: string): Observable<any> {
    return this.http.get(`${base_url}/imagenes/${id}`, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Nueva imagen
  nuevaImagen(formData: any): Observable<any> {
    return this.http.post(`${base_url}/imagenes`, formData, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Listar imagenes
  listarImagenes(): Observable<any> {
    return this.http.get(`${base_url}/imagenes`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Actualizar imagen
  actualizarImagen(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/imagenes/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }
  
}
