import { Directive, TemplateRef, ViewContainerRef, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appPermisos]'
})
export class PermisosDirective implements OnInit {

  private usuarioLogin: any;
  private permisos: any;

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.usuarioLogin = this.authService.usuario;
    this.actualizarVista();
  }

  // Se reciben los permisos - Permisos necesarios para visualizar el item en pantalla
  @Input()
  set appPermisos(val: Array<string>){
    this.permisos = val;
    this.usuarioLogin ? this.actualizarVista() : null;
  }

  // Actualizar vista
  private actualizarVista(): void {
    this.viewContainer.clear();
    if(this.comprobarPermisos()) this.viewContainer.createEmbeddedView(this.templateRef);
  }

  // Comparacion de permisos de elementos y usuarios
  private comprobarPermisos(): boolean {
    if(this.usuarioLogin && this.usuarioLogin.role !== 'ADMIN_ROLE'){
      
      let tienePermiso = false;

      if(this.usuarioLogin && this.usuarioLogin.permisos){
        
        for(const checkPermisos of this.permisos){
          
          const coincide = this.usuarioLogin.permisos.find((p: string) => {
            return (p.toUpperCase() === checkPermisos.toUpperCase());
          });
          
          if(coincide){
            tienePermiso = true;
            break  // Se sale del for
          }
        
        }  
      
      }else{
        return false;
      }

      return tienePermiso;

    }else{
      return true;
    }
  }

}
