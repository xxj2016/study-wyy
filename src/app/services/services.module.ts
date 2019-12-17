import { NgModule, InjectionToken } from '@angular/core';

export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [
    
  ],
  providers: [
    // { provide: API_CONFIG, useValue: 'http://localhost:3000/' },
    { provide: API_CONFIG, useValue: 'http://49.232.96.54:7777/' }, // 可以用(仅用于学习)
    // { provide: API_CONFIG, useValue: 'http://musicapi.leanapp.cn/' },
    // { provide: API_CONFIG, useValue: 'http://u-to-world.com:3000/' }
  ]
})
export class ServicesModule { }
