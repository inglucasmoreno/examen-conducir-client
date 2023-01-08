import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SigemService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Obtener persona
  getPersona(data: any): Observable<any> {
    return this.http.post(`${base_url}/sigem/getPersona`, data, {
      headers: this.getToken
    });
  };

}
