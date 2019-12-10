import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ViewChild, Input, Inject } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { filter, tap, pluck, map, distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';
import { SliderEventObserverConfig } from 'src/app/services/data-types/wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { SliderEvent, getElementOffset } from './wy-slider-helper';
import { inArray } from 'src/app/utils/array';
import { limitNumberInRange } from 'src/app/utils/number';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WySliderComponent implements OnInit {
  private sliderDom: HTMLDivElement;
  @ViewChild('wySlider', { static: true }) private wySlider: ElementRef;
  @Input() wyVertical = false;
  @Input() wyMin: number = 0;
  @Input() wyMax: number = 100;

  private dragStart$ = new Observable<number>(); // 定义一个订阅
  private dragMove$ = new Observable<number>();
  private dragEnd$ = new Observable<number>();

  private isDragging = false;
  constructor(
    @Inject(DOCUMENT) private doc: Document
  ) { }

  // 思路：
  // 水平：
  //   track: width
  //   handle: left
  // 垂直：
  //   track: height
  //   handle: bottom

  // pc:
  //   mousedown mousemove mouseup
  // phone:
  //   touchstart touchmove touchend

  // position => val
  // position / 滑块组件总长 === (val - min) / (max - min)

  ngOnInit() {
    this.sliderDom = this.wySlider.nativeElement;
    console.log('sliderDom el: ' + this.sliderDom);
    this.createDraggingObservables();
    this.subscribeDrag(['start']);
  }

  createDraggingObservables() {
    const orientField = this.wyVertical ? 'pageY' : 'pageX';
    // 用一个对象来定义PC的鼠标事件
    const mouse: SliderEventObserverConfig = {
      start: 'mousedown', // 开始
      move: 'mousemove', // 移动时
      end: 'mouseup', // 结束
      filter: (e: MouseEvent) => e instanceof MouseEvent, // 筛选事件类型（判断是PC还是手机）
      pluckKey: [orientField] // 区分是垂直还是水平的坐标
    };
    // 用一个对象来定义手机端的鼠标事件
    const touch: SliderEventObserverConfig = {
      start: 'touchdown',
      move: 'touchmove',
      end: 'touchup',
      filter: (e: MouseEvent) => e instanceof TouchEvent,
      pluckKey: [orientField]
    };

    // 绑定PC/移动端的事件
    [mouse, touch].forEach(source => {
      const { start, move, end, filter: filterFunc, pluckKey } = source;
      source.startPlucked$ = fromEvent(this.sliderDom, start)
        .pipe(
          filter(filterFunc),
          tap(SliderEvent), // 类似console.log, 可以做一个中间的调试
          pluck(...pluckKey),
          map((position: number) => this.findClosestValue(position))
        );

      source.end$ = fromEvent(this.doc, end);
      source.moveResolved$ = fromEvent(this.sliderDom, start)
        .pipe(
          filter(filterFunc),
          tap(SliderEvent), // 类似console.log, 可以做一个中间的调试
          pluck(...pluckKey),
          distinctUntilChanged(), // 防止触发频繁
          map((position: number) => this.findClosestValue(position)),
          takeUntil(source.end$)
        );
    });

    // 订阅三个合并事件
    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.moveResolved$, touch.moveResolved$);
  }

  // 订阅
  private subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart$) {
      this.dragStart$.subscribe(this.onDragStart.bind(this));
    }
    if (inArray(events, 'move') && this.dragMove$) {
      this.dragStart$.subscribe(this.onDragMove.bind(this));
    }
    if (inArray(events, 'end') && this.dragEnd$) {
      this.dragStart$.subscribe(this.onDragEnd.bind(this));
    }
  }

  private onDragStart(value: number) {
    console.log('val:' + value);
    this.toggleDragMoving(true); // 绑定或者解绑事件
  }

  private onDragMove(value: number) {
  }

  private onDragEnd() {
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = movable;

    if (movable) {
      this.subscribeDrag(['move', 'end']);
    } else {

    }
  }

  findClosestValue(position: number): number {
    // 获取滑块总长
    const sliderLength = this.getSliderLength();

    // 滑块(左，上)端点的位置
    const sliderStart = this.getSliderStartPosition();
    console.log(sliderLength);
    console.log(sliderLength);
    // 滑块当前位置 / 滑块总长
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, 0, 1);
    const ratioTrue = this.wyVertical ? 1 - ratio : ratio;
    console.log(ratioTrue * (this.wyMax - this.wyMin) + this.wyMin);

    return ratioTrue * (this.wyMax - this.wyMin) + this.wyMin;
  }

  getSliderLength(): number {
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }

  getSliderStartPosition(): number {
    const offset = getElementOffset(this.sliderDom);
    return this.wyVertical ? offset.top : offset.left;
  }
}
