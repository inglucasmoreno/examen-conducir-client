import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class InicializacionService {

  constructor(private http: HttpClient) { }

  // Inicializacion de TABLA - usuarios
  inicializarUsuarios(): Observable<any> {
    return this.http.get(`${base_url}/inicializacion/usuarios`);
  }

  // Inicializacion de TABLA - preguntas
  inicializarPreguntas(): Observable<any> {
    return this.http.get(`${base_url}/inicializacion/preguntas`);
  }

  // Actualizando base de fichas
  importarPreguntas(formData: any, usuario: string): Observable<any> {
    return this.http.post(`${base_url}/inicializacion/preguntas`, formData, {
      params: { usuario }
    });
  }

}
