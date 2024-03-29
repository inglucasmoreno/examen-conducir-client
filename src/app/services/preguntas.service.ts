import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {

  constructor(private http: HttpClient) { }

  // Pregunta por ID
  getPregunta(id: string): Observable<any> {
    return this.http.get(`${base_url}/preguntas/${id}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  };

  // Listar preguntas
  listarPreguntas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/preguntas`,{
      params: {
        columna: parametros?.columna || 'descripcion',
        direccion: parametros?.direccion || 1,
        desde: parametros?.desde || 0,
        registerpp: parametros?.cantidadItems || 100000,
        activo: parametros?.activo || '',
        parametro: parametros?.parametro || '',            
      },
      headers: { 'Authorization': localStorage.getItem('token') }   
    });
  };

  // Nueva pregunta
  nuevaPregunta(data: any): Observable<any> {
    console.log(data);
    return this.http.post(`${base_url}/preguntas`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  };

  // Actualizar pregunta
  actualizarPregunta(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/preguntas/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  };

  // Eliminar pregunta
  eliminarPregunta(id: string, data: any): Observable<any> {
    return this.http.delete(`${base_url}/preguntas/${id}`, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  };

}
