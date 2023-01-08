import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PersonasService {

  constructor(private http: HttpClient) { }

  // Persona por ID
  getPersona(id: string): Observable<any> {
    return this.http.get(`${base_url}/personas/${id}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Persona por DNI
  getPersonaDNI(dni: string): Observable<any> {
    return this.http.get(`${base_url}/personas/dni/${dni}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Listar personas
  listarPersonas(parametros?: any): Observable<any> {
    console.log(parametros)
    return this.http.get(`${base_url}/personas`,{
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
  }

  // Nueva persona
  nuevaPersona(data: any): Observable<any> {
    console.log(data);
    return this.http.post(`${base_url}/personas`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  }

  // Actualizar persona
  actualizarPersona(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/personas/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
