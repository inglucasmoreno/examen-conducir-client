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

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Usuarios
            { path: 'usuarios', canActivate: [AdminGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', canActivate: [AdminGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', canActivate: [AdminGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', canActivate: [AdminGuard], component: EditarPasswordComponent },
            
            // Perfil
            { path: 'perfil', component: PerfilComponent },

            // Personas
            { path: 'personas', component: PersonasComponent },
            
            // Lugares
            { path: 'lugares', canActivate: [AdminGuard], component: LugaresComponent },
            
            // Preguntas
            { path: 'preguntas', canActivate: [AdminGuard], component: PreguntasComponent },
            { path: 'preguntas/estadisticas', canActivate: [AdminGuard], component: PreguntasEstadisticasComponent },

            // Examenes
            { path: 'examenes', component: ExamenesComponent },
            { path: 'examenes/detalles/:id', component: ExamenesDetallesComponent },
            
            // Imagenes
            { path: 'imagenes', component: ImagenesComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}