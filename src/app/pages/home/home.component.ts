import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {
  
  constructor(private dataService: DataService) { }
  
  ngOnInit(): void { 
    this.dataService.ubicacionActual = 'Dashboard - Home';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .5 });
  }
  
}
