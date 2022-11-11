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
  preguntas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/estadisticas/preguntas`,{
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

}
