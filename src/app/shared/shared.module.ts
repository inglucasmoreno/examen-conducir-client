import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from '../app-routing.module';
import { StatebarComponent } from './statebar/statebar.component';
import { PipesModule } from '../pipes/pipes.module';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [
    HeaderComponent,
    StatebarComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    PipesModule
  ],
  exports: [
    HeaderComponent,
    StatebarComponent,
    LoaderComponent
  ]
})
export class SharedModule { }
