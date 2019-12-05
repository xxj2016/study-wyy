import { NgModule, InjectionToken } from '@angular/core';

export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [

  ],
  providers: [
    { provide: API_CONFIG, useValue: 'http://localhost:3000/' } // 注入一个常量存 放共同 域名
    // { provide: API_CONFIG, useValue: 'https://music.jeeas.cn/v1/' } // 注入一个常量存放共同域名

  ]
})
export class ServicesModule { }
