import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { InicializacionService } from 'src/app/services/inicializacion.service';
import { PreguntasService } from 'src/app/services/preguntas.service';
import { environment } from 'src/environments/environment';
import { ImagenesService } from '../../services/imagenes.service';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styles: [
  ]
})
export class PreguntasComponent implements OnInit {

  // Flag y mensaje de estado
  public flag_preguntas_importadas = false;
  public mensaje = '';

  // Archivos para importacion
  public file: any;
  public archivoSubir: any;

  // Permisos de usuarios login
  public permisos = { all: false };

  public urlBase = environment.base_url;

  // Modal
  public showModalPregunta = false;
  public showModalImportarPreguntas = false;
  public flagAccion = 'Creando';
  public estadoFormulario = 'crear';

  // Preguntas
  public idPregunta: string = '';
  public preguntas: any = [];
  public descripcion: string = '';

  // Imagenes
  public filtroDescripcionImagen = '';
  public imagenes;
  public imagenSeleccionada;
  public showImagenes = false;

  // Formulario
  public dataForm = {
    imagen: '',
    url_img: '',
    pregunta_img: false,
    descripcion: '',
    frecuencia: 1,
    respuesta_correcta: '',
    respuesta_incorrecta_1: '',
    respuesta_incorrecta_2: '',
    tipo_A: false,
    tipo_B: false,
    tipo_C: false,
    tipo_D: false,
    tipo_E: false,
    tipo_G: false,
    tipo_H: false,
    tipo_J: false,
    eliminatoria: false,
    alcance: ''
  };

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  public desde: number = 0;

  // Paginacion - Imagenes
  public paginaActualImg: number = 1;
  public cantidadItemsImg: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'numero'
  }

  constructor(private preguntasService: PreguntasService,
    public authService: AuthService,
    private alertService: AlertService,
    private inicializacionService: InicializacionService,
    private imagenesService: ImagenesService,
    private dataService: DataService) { }


  ngOnInit(): void {
    this.dataService.ubicacionActual = "Dashboard - Preguntas";
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarPreguntas();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('PREGUNTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, pregunta: any = null): void {
    this.reiniciarFormulario();
    this.imagenSeleccionada = null;
    this.descripcion = '';
    this.idPregunta = '';
    if (estado === 'editar') {
      this.estadoFormulario = 'editar';
      this.getPregunta(pregunta);
    } else {
      this.estadoFormulario = 'crear';
      this.showModalPregunta = true;
    }
  }

  // Traer datos de pregunta
  getPregunta(pregunta: any): void {

    this.idPregunta = pregunta._id;

    this.alertService.loading();

    this.preguntasService.getPregunta(pregunta._id).subscribe(({ pregunta }) => {
      this.dataForm = {
        imagen: pregunta.imagen,
        url_img: pregunta.url_img,
        pregunta_img: pregunta.pregunta_img,
        descripcion: pregunta.descripcion,
        frecuencia: pregunta.frecuencia,
        respuesta_correcta: pregunta.respuesta_correcta,
        respuesta_incorrecta_1: pregunta.respuesta_incorrecta_1,
        respuesta_incorrecta_2: pregunta.respuesta_incorrecta_2,
        tipo_A: false,
        tipo_B: false,
        tipo_C: false,
        tipo_D: false,
        tipo_E: false,
        tipo_G: false,
        tipo_H: false,
        tipo_J: false,
        eliminatoria: pregunta.eliminatoria,
        alcance: pregunta.alcance
      };

      // Se agrega la imagen seleccionada
      if (pregunta.pregunta_img) {
        this.imagenesService.getImagen(pregunta.imagen).subscribe(({ imagen }) => {
          this.imagenSeleccionada = imagen;
        }, ({ error }) => {
          this.alertService.errorApi(error);
        });
      }

      this.alertService.close();

      this.ajustarAlcance(pregunta.alcance);
      this.showModalPregunta = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar imagenes
  listarImagenes(): void {
    this.alertService.loading();
    this.imagenesService.listarImagenes().subscribe(({ imagenes }) => {
      this.alertService.close();
      this.imagenes = imagenes;
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Seleccionar imagen
  seleccionarImagen(imagen: any): void {
    this.imagenSeleccionada = imagen;
    this.showImagenes = false;
    this.showModalPregunta = true;
  }

  // Eliminar imagen seleccionada
  limpiarImagenSeleccionada(): void {
    this.imagenSeleccionada = null;
  }

  // Ajustar alcance
  ajustarAlcance(alcance: string): void {
    if (alcance.includes('A')) this.dataForm.tipo_A = true;
    if (alcance.includes('B')) this.dataForm.tipo_B = true;
    if (alcance.includes('C')) this.dataForm.tipo_C = true;
    if (alcance.includes('D')) this.dataForm.tipo_D = true;
    if (alcance.includes('E')) this.dataForm.tipo_E = true;
    if (alcance.includes('G')) this.dataForm.tipo_G = true;
    if (alcance.includes('H')) this.dataForm.tipo_H = true;
    if (alcance.includes('J')) this.dataForm.tipo_J = true;
  }

  // Listar preguntas
  listarPreguntas(): void {
    this.preguntasService.listarPreguntas(
      {
        direccion: this.ordenar.direccion,
        columna: this.ordenar.columna,
        desde: this.desde,
        cantidadItems: this.cantidadItems,
        activo: this.filtro.activo,
        parametro: this.filtro.parametro
      }
    )
      .subscribe(({ preguntas, totalItems }) => {
        this.preguntas = preguntas;
        this.totalItems = totalItems;
        this.showModalPregunta = false;
        this.showModalImportarPreguntas = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Cambiar tipo
  cambiarAlcance(tipo: string, valor: boolean): void {
    this.dataForm['tipo_' + tipo] = !valor;
    this.armarAlcance();
  }

  // Se arma el string de alcance
  armarAlcance() {
    this.dataForm.alcance = '';

    if (this.dataForm.tipo_A) {
      this.dataForm.alcance += 'A';
    }

    if (this.dataForm.tipo_B) {
      this.dataForm.alcance += 'B';
    }
    if (this.dataForm.tipo_C) {
      this.dataForm.alcance += 'C';
    }

    if (this.dataForm.tipo_D) {
      this.dataForm.alcance += 'D';
    }

    if (this.dataForm.tipo_E) {
      this.dataForm.alcance += 'E';
    }

    if (this.dataForm.tipo_G) {
      this.dataForm.alcance += 'G';
    }

    if (this.dataForm.tipo_H) {
      this.dataForm.alcance += 'H';
    }

    if (this.dataForm.tipo_J) {
      this.dataForm.alcance += 'J';
    }
  }

  // Nueva pregunta
  nuevaPregunta(): void {

    // Verificacion: Descripción vacia
    if (this.dataForm.descripcion.trim() === "") return this.alertService.info('Debes colocar una descripción');
    if (this.dataForm.respuesta_correcta.trim() === "") return this.alertService.info('Debes colocar una respuesta correcta');
    if (this.dataForm.respuesta_incorrecta_1.trim() === "") return this.alertService.info('Debes colocar una respuesta incorrecta 1');
    if (this.dataForm.respuesta_incorrecta_2.trim() === "") return this.alertService.info('Debes colocar una respuesta incorrecta 2');
    if (this.dataForm.alcance.trim() === "") return this.alertService.info('La pregunta debe tener al menos un alcance minimo');

    // Pregunta con imagen asociada
    if (this.imagenSeleccionada) {
      this.dataForm.url_img = this.imagenSeleccionada.url;
      this.dataForm.imagen = this.imagenSeleccionada._id;
      this.dataForm.pregunta_img = true;
    } else {
      this.dataForm.url_img = '';
      this.dataForm.imagen = '';
      this.dataForm.pregunta_img = false;
    }

    this.alertService.loading();

    // Se genera una nueva pregunta
    this.preguntasService.nuevaPregunta(this.dataForm).subscribe(() => {
      this.imagenSeleccionada = null;
      this.listarPreguntas();
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Actualizar pregunta
  actualizarPregunta(): void {

    // Verificacion: Descripción vacia
    if (this.dataForm.descripcion.trim() === "") return this.alertService.info('Debes colocar una descripción');
    if (this.dataForm.respuesta_correcta.trim() === "") return this.alertService.info('Debes colocar una respuesta correcta');
    if (this.dataForm.respuesta_incorrecta_1.trim() === "") return this.alertService.info('Debes colocar una respuesta incorrecta 1');
    if (this.dataForm.respuesta_incorrecta_2.trim() === "") return this.alertService.info('Debes colocar una respuesta incorrecta 2');
    if (this.dataForm.alcance.trim() === "") return this.alertService.info('La pregunta debe tener al menos un alcance minimo');

    // Pregunta con imagen asociada
    if (this.imagenSeleccionada) {
      this.dataForm.url_img = this.imagenSeleccionada.url;
      this.dataForm.imagen = this.imagenSeleccionada._id;
      this.dataForm.pregunta_img = true;
    } else {
      this.dataForm.url_img = '';
      this.dataForm.imagen = '';
      this.dataForm.pregunta_img = false;
    }

    this.alertService.loading();
    this.preguntasService.actualizarPregunta(this.idPregunta, this.dataForm).subscribe(() => {
      this.listarPreguntas();
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(pregunta: any): void {

    const { _id, activo } = pregunta;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.preguntasService.actualizarPregunta(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarPreguntas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.msg);
          });
        }
      });
  }

  // Abrir modal imagenes
  abrirModalImagenes(): void {
    this.filtroDescripcionImagen = '';
    this.showModalPregunta = false;
    this.showImagenes = true;
    this.listarImagenes();
  }

  // Cerrar modal imagenes
  cerrarModalImagenes(): void {
    this.showImagenes = false;
    this.showModalPregunta = true;
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.dataForm = {
      imagen: '',
      url_img: '',
      pregunta_img: false,
      descripcion: '',
      frecuencia: 1,
      respuesta_correcta: '',
      respuesta_incorrecta_1: '',
      respuesta_incorrecta_2: '',
      tipo_A: false,
      tipo_B: false,
      tipo_C: false,
      tipo_D: false,
      tipo_E: false,
      tipo_G: false,
      tipo_H: false,
      tipo_J: false,
      eliminatoria: false,
      alcance: ''
    };
  }

  // Capturando archivo de importacion
  capturarArchivo(event: any): void {
    if (event.target.files[0]) {
      // Se capatura el archivo
      this.archivoSubir = event.target.files[0];

      // Se verifica el formato - Debe ser un excel
      const formato = this.archivoSubir.type.split('/')[1];
      const condicion = formato !== 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (condicion) {
        this.file = null;
        this.archivoSubir = null;
        return this.alertService.info('Debes seleccionar un archivo de excel');
      }
    }
  }

  // Abrir modal de importacion de preguntas
  abrirImportarPreguntas(): void {
    this.file = null;
    this.showModalImportarPreguntas = true;
  }

  // Importar preguntas
  importarPreguntas(): void {

    if (!this.file) return this.alertService.info('Debe seleccionar un archivo de excel');

    this.alertService.loading();
    const formData = new FormData();
    formData.append('file', this.archivoSubir); // FormData -> key = 'file' y value = Archivo

    this.inicializacionService.importarPreguntas(formData, this.authService.usuario.userId).subscribe({
      next: ({ msg }) => {
        this.mensaje = msg;
        this.flag_preguntas_importadas = true;
        this.listarPreguntas();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    })

  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarPreguntas();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarPreguntas();
  }

}
