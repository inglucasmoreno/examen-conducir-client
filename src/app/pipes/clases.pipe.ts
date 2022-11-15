import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clases'
})
export class ClasesPipe implements PipeTransform {
  transform(clases: string): string {
    return clases.replace('H','D4').replace('J','E2')
  }
}
