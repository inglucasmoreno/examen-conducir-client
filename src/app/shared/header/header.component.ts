import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from '../../services/auth.service';
import { items } from './items';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit {

  // Items
  public items: any[];

  // Permisos para navegacion
  public permiso_usuarios = true;

  constructor( public authService: AuthService,
               public alertService: AlertService,
               public dataService: DataService ) { }

  ngOnInit(): void {
    this.items = items;
  }

  // Metodo: Cerrar sesion
  logout(): void{ 
    this.alertService.question({ msg: 'Cerrando sesion', buttonText: 'Aceptar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.authService.logout(); 
      }
    });
  }

}
