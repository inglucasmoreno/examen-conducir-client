import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styles: [
  ]
})
export class ItemsComponent implements OnInit {

  @Input() item: string;
  @Input() route: string;
  @Input() routerLinkActive: string = 'bg-thirdColor rounded';
  @Input() svg: string;

  constructor() { }

  ngOnInit(): void {
  }

}
