import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  constructor(private http: HttpClient) { }

  // Estadisticas de preguntas
  preguntas(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/estadisticas/preguntas`,{
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

}
