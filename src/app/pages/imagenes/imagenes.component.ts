import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { environment } from 'src/environments/environment';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';

@Component({
  selector: 'app-imagenes',
  templateUrl: './imagenes.component.html',
  styles: [
  ]
})
export class ImagenesComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  public urlBase = environment.base_url;
  public imagenes;
  public imagenSeleccionada;
  public showModal = false;
  public showModalNuevo = false;
  public file;
  
  // Nueva imagen
  public descripcionNuevaImg = '';

  // Subida de archivo
  public previsualizacion: string;
  public imagenParaSubir: any;

  // Filtrado
  public descripcion = '';
  public activo = 'true';

  // Actualizacion de imagen
  public actualizacion = {
    descripcion: '',
    activo: 'true'
  }

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  constructor(private imagenesService: ImagenesService,
              private authService: AuthService,
              private dataService: DataService,
              private alertService: AlertService,
              private sanitizer: DomSanitizer
              ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .5 });
    this.dataService.ubicacionActual = 'Dashboard - Imagenes';
    this.permisos.all = this.permisosUsuarioLogin();
    this.listarImagenes();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('IMAGENES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }
  
  // Se sube una nueva imagen al servidor
  nuevaImagen(): void {
    
    if(this.descripcionNuevaImg.trim() === '') return this.alertService.info('Debes colocar una descripción');

    this.alertService.loading();
    const formData = new FormData();
    formData.append('file', this.imagenParaSubir);
    formData.append('descripcion', this.descripcionNuevaImg);
    this.imagenesService.nuevaImagen(formData).subscribe(() => {
      this.listarImagenes();
      this.showModalNuevo = false;
    },({error}) => {
      this.alertService.errorApi(error.message);
    })
  }

  // Se captura la imagen a subir
  capturarImagen(event: any): void {
    if(event.target.files[0]){ // Se captura si hay imagen seleccionada
      this.imagenParaSubir = event.target.files[0];
      
      const formato = this.imagenParaSubir.type.split('/')[1];
      const condicion = formato !== 'png' && formato !== 'jpg' && formato !== 'jpeg' && formato !== 'gif';
  
      if(condicion){
        this.previsualizacion = '';
        this.file = '';
        return this.alertService.errorApi('El archivo debe ser una imagen');
      }
  
      this.extraerBase64(this.imagenParaSubir).then( (imagen: any) => {
        this.previsualizacion = imagen.base;
      });
    }
  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })


  // Listado de imagenes
  listarImagenes(): void {
    this.alertService.loading();
    this.imagenesService.listarImagenes().subscribe( ({ imagenes }) => {
      this.imagenes = imagenes;
      this.alertService.close();
    },({ error }) => {
      this.alertService.errorApi(error.message);
    })
  }

  // Actualizar imagen
  actualizarImagen(accion: string): void {
    
    let data = {};
    
    if(accion == 'Actualizar') data = { descripcion: this.actualizacion.descripcion } 
    else if(accion == 'Baja') data = { activo: false }; 
    else if(accion == 'Alta') data = { activo: true };
  
    this.alertService.loading();
    this.imagenesService.actualizarImagen(this.imagenSeleccionada._id, data).subscribe( () => {
      this.listarImagenes();
      this.showModal = false;  
    },({error}) => {
      this.alertService.errorApi(error.message);
    });  
  }

  // Reinicia paginacion
  reiniciarPaginacion(): void {
    this.paginaActual = 1;
  }

  // Abrir detalles de imagen
  detallesImagen(imagen: any): void {
    window.scrollTo(0,0);
    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');
    this.imagenSeleccionada = imagen;
    this.actualizacion.descripcion = imagen.descripcion;
    this.showModal = true;
  }

  // Nueva imagen
  modalNuevaImagen(): void {
    this.file = '';
    this.descripcionNuevaImg = '';
    this.imagenParaSubir = null;
    this.previsualizacion = null;
    this.showModalNuevo = true;
  }

  // Cerrar modal detalles
  cerrarImagen(): void {
    this.showModal = false;
  }

  // Cerrar modal nueva imagen
  cerrarNuevaImagen(): void {
    this.showModalNuevo = false;
  }

}
