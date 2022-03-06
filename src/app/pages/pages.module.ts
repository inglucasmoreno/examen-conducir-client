import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PagesComponent } from './pages.component';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PersonasComponent } from './personas/personas.component';
import { LugaresComponent } from './lugares/lugares.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { ExamenesComponent } from './examenes/examenes.component';
import { ExamenesDetallesComponent } from './examenes/examenes-detalles.component';
import { ImagenesComponent } from './imagenes/imagenes.component';
import { PreguntasEstadisticasComponent } from './preguntas/preguntas-estadisticas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ExamenesHistorialComponent } from './examenes/examenes-historial.component';
import { ExamenesHistorialDetallesComponent } from './examenes/examenes-historial-detalles.component';


@NgModule({
  declarations: [
    HomeComponent,
    PagesComponent,
    UsuariosComponent,
    NuevoUsuarioComponent,
    EditarUsuarioComponent,
    EditarPasswordComponent,
    PersonasComponent,
    LugaresComponent,
    PreguntasComponent,
    ExamenesComponent,
    ExamenesDetallesComponent,
    ImagenesComponent,
    PreguntasEstadisticasComponent,
    PerfilComponent,
    ExamenesHistorialComponent,
    ExamenesHistorialDetallesComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    PipesModule,
    ComponentsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule
  ]
})
export class PagesModule { }
