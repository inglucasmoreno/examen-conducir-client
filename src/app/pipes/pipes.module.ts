import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaPipe } from './fecha.pipe';
import { RolPipe } from './rol.pipe';
import { MonedaPipe } from './moneda.pipe';
import { FiltroUsuariosPipe } from './filtro-usuarios.pipe';
import { FiltroPersonasPipe } from './filtro-personas.pipe';
import { FiltroLugaresPipe } from './filtro-lugares.pipe';
import { FiltroPreguntasPipe } from './filtro-preguntas.pipe';
import { FiltroExamenesPipe } from './filtro-examenes.pipe';
import { FiltroPreguntasDetallesPipe } from './filtro-preguntas-detalles.pipe';
import { FiltroImagenesPipe } from './filtro-imagenes.pipe';
import { EstadoExamenPipe } from './estado-examen.pipe';
import { FiltroPreguntasEstadisticasPipe } from './filtro-preguntas-estadisticas.pipe';

@NgModule({
  declarations: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroPersonasPipe,
    FiltroLugaresPipe,
    FiltroPreguntasPipe,
    FiltroExamenesPipe,
    FiltroPreguntasDetallesPipe,
    FiltroImagenesPipe,
    EstadoExamenPipe,
    FiltroPreguntasEstadisticasPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroPersonasPipe,
    FiltroLugaresPipe,
    FiltroPreguntasPipe,
    FiltroExamenesPipe,
    FiltroPreguntasDetallesPipe,
    FiltroImagenesPipe,
    EstadoExamenPipe,
    FiltroPreguntasEstadisticasPipe
  ]
})
export class PipesModule { }
