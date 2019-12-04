import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush // Angular 变更检测: Input输入属性发生变化，才会进行变更检测(有利于提升性能，后面会学手动触发变更检测)
})
export class WyCarouselComponent implements OnInit {
  @Input() activeIndex = 0;
  @Output() changeSlide = new EventEmitter<'pre' | 'next'>(); // 字符串字面量的联合类型 <'pre' | 'next'>
  @ViewChild('dot', { static: true }) dotRef: TemplateRef<any>; // 静态模板需要加上{static: true},假如模板是用ngFor动态生成，则{static: false}
  constructor() { }

  ngOnInit() {
  }

  /*
    * onChangeSlide: 点击箭头按钮
    *   @params
    *      type ['pre' | 'next'] 切换面板的类型 (字符串字面量的联合类型，传出到父组件的值)
    *   @return
    * by JetXu on 2019/12/04 10:26
    */
  onChangeSlide(type: 'pre' | 'next') {
    this.changeSlide.emit(type);
  }

}
