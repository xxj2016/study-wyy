import { NgModule, InjectionToken } from '@angular/core';

export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [
    
  ],
  providers: [
    { provide: API_CONFIG, useValue: 'http://localhost:3000/' },
    // { provide: API_CONFIG, useValue: 'http://u-to-world.com:3000/' }
  ]
})
export class ServicesModule { }
