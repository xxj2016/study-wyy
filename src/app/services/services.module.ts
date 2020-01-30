import { NgModule, InjectionToken, PLATFORM_ID } from '@angular/core';
import { httpInterceptorProvides } from './http-interceptors';
import { environment } from '../../environments/environment';

export const API_CONFIG = new InjectionToken('ApiConfigToken');
// export const WINDOW = new InjectionToken('WindowToken');

@NgModule({
  declarations: [],
  imports: [

  ],
  providers: [
    // { provide: API_CONFIG, useValue: 'http://49.232.96.54:7777/' }, // 可以用(仅用于学习)
    // { provide: API_CONFIG, useValue: 'http://musicapi.leanapp.cn/' },
    // { provide: API_CONFIG, useValue: 'http://u-to-world.com:3000/' }
    { provide: API_CONFIG, useValue: environment.production ? '/' : '/api/' },
    httpInterceptorProvides,
    // {
    //   provide: WINDOW, 
    //   useFactory(platformId: object): Window | Object {
    //     return isPlatformBrowser(platformId) ? window : {};
    //   },
    //   deps: [PLATFORM_ID]
    // }
  ]
})
export class ServicesModule { }
