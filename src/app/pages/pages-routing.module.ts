import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

// Componentes
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { PersonasComponent } from './personas/personas.component';
import { LugaresComponent } from './lugares/lugares.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { ExamenesComponent } from './examenes/examenes.component';
import { ExamenesDetallesComponent } from './examenes/examenes-detalles.component';
import { ImagenesComponent } from './imagenes/imagenes.component';
import { PreguntasEstadisticasComponent } from './preguntas/preguntas-estadisticas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PermisosGuard } from '../guards/permisos.guard';
import { ExamenesHistorialComponent } from './examenes/examenes-historial.component';
import { ExamenesHistorialDetallesComponent } from './examenes/examenes-historial-detalles.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [ PermisosGuard ], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [ PermisosGuard ], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [ PermisosGuard ], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [ PermisosGuard ], component: EditarPasswordComponent },
            
            // Perfil
            { path: 'perfil', component: PerfilComponent },

            // Personas
            { path: 'personas', data: { permisos: 'PERSONAS_NAV' }, canActivate: [ PermisosGuard ], component: PersonasComponent },
            
            // Imagenes
            { path: 'imagenes', data: { permisos: 'IMAGENES_NAV' }, canActivate: [ PermisosGuard ], component: ImagenesComponent },
            
            // Lugares
            { path: 'lugares', data: { permisos: 'LUGARES_NAV' }, canActivate: [ PermisosGuard ], component: LugaresComponent },
            
            // Preguntas
            { path: 'preguntas', data: { permisos: 'PREGUNTAS_NAV' }, canActivate: [ PermisosGuard ], component: PreguntasComponent },
            { path: 'preguntas/estadisticas', data: { permisos: 'PREGUNTAS_NAV' }, canActivate: [ PermisosGuard ], component: PreguntasEstadisticasComponent },

            // Examenes
            { path: 'examenes', data: { permisos: 'EXAMENES_NAV' }, canActivate: [ PermisosGuard ], component: ExamenesComponent },
            { path: 'examenes/detalles/:id', data: { permisos: 'EXAMENES_NAV' }, canActivate: [ PermisosGuard ], component: ExamenesDetallesComponent },
            { path: 'examenes/historial', data: { permisos: 'EXAMENES_NAV' }, canActivate: [ PermisosGuard ], component: ExamenesHistorialComponent },
            { path: 'examenes/historial/detalles/:id', data: { permisos: 'EXAMENES_NAV' }, canActivate: [ PermisosGuard ], component: ExamenesHistorialDetallesComponent },
            
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}