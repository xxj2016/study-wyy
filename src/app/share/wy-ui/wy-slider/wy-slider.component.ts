import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ViewChild, Input, Inject, ChangeDetectorRef, OnDestroy, forwardRef } from '@angular/core';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { filter, tap, pluck, map, distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';
import { SliderEventObserverConfig, SliderValue } from 'src/app/services/data-types/wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { sliderEvent, getElementOffset } from './wy-slider-helper';
import { inArray } from 'src/app/utils/array';
import { limitNumberInRange, getPercent } from 'src/app/utils/number';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{  // 注入一个token,才能实现 [(ngModel)]
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WySliderComponent), // 允许我们引用尚未定义的类
    multi: true
  }]
})
export class WySliderComponent implements OnInit, OnInit, OnDestroy, ControlValueAccessor {
  
  @ViewChild('wySlider', { static: true }) private wySlider: ElementRef;
  @Input() wyVertical = false;
  @Input() wyMin: number = 0;
  @Input() wyMax: number = 100;

  private sliderDom: HTMLDivElement;

  private dragStart$: Observable<number>; // 定义一个订阅
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;

  private dragStart_: Subscription | null; // 取消订阅
  private dragMove_: Subscription | null;
  private dragEnd_: Subscription | null; 

  private isDragging = false;

  value: SliderValue = null;
  offset: SliderValue = null;
  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubscribeDrag();
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
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchup',
      filter: (e: MouseEvent) => e instanceof TouchEvent,
      pluckKey: ['touches', '0', orientField]
    };

    // 绑定PC/移动端的事件
    [mouse, touch].forEach(source => {
      const { start, move, end, filter: filterFunc, pluckKey } = source;
      source.startPlucked$ = fromEvent(this.sliderDom, start)
        .pipe(
          filter(filterFunc),
          tap(sliderEvent), // 类似console.log, 可以做一个中间的调试
          pluck(...pluckKey),
          map((position: number) => this.findClosestValue(position))
        );

      source.end$ = fromEvent(this.doc, end);
      source.moveResolved$ = fromEvent(this.doc, move)
        .pipe(
          filter(filterFunc),
          tap(sliderEvent), // 类似console.log, 可以做一个中间的调试
          pluck(...pluckKey),
          distinctUntilChanged(), // 防止触发频繁
          map((position: number) => this.findClosestValue(position)),
          takeUntil(source.end$)
        );
    });

    // 订阅三个合并事件
    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  // 订阅
  private subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart$ && !this.dragStart_) {
      this.dragStart_ = this.dragStart$.subscribe(this.onDragStart.bind(this));
    }
    if (inArray(events, 'move') && this.dragMove$ && !this.dragMove_) {
      this.dragMove_ = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }
    if (inArray(events, 'end') && this.dragEnd$ && !this.dragEnd_) {
      this.dragEnd_ = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }

  // 取消订阅
  private unsubscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart_) {
      this.dragStart_.unsubscribe();
      this.dragStart_ = null;
    }
    if (inArray(events, 'move') && this.dragMove_) {
      this.dragMove_.unsubscribe();
      this.dragMove_ = null;
    }
    if (inArray(events, 'end') && this.dragEnd_) {
      this.dragEnd_.unsubscribe();
      this.dragEnd_ = null;
    }
  }

  // 开始拖动(点击)
  private onDragStart(value: number) {
    console.log('val:' + value);
    this.toggleDragMoving(true); // 绑定或者解绑事件
    this.setValue(value);
  }

  // 拖动中
  private onDragMove(value: number) {
    if (this.isDragging) {
      this.setValue(value);
      this.cdr.markForCheck();
    }
  }

  private onDragEnd() {
    this.toggleDragMoving(false); // 绑定或者解绑事件
    this.cdr.markForCheck();
  }

  private setValue(value: SliderValue, needCheck = false) {
    if (needCheck) {
      if(this.isDragging) return;
      this.value = this.formateValue(value);
      this.updateTrackAndHandles(); // 更新Dom的样子
    }else  if (!this.valuesEqual(this.value, value)) {
      this.value = value;
      this.updateTrackAndHandles(); // 更新Dom的样子
      this.onValueChange(this.value);
    }
  }

  private formateValue(value: SliderValue): SliderValue {
    let res = value;
    if(this.assertValueValid(value)) {
      res = this.wyMin;
    } else {
      res = limitNumberInRange(value, this.wyMin, this.wyMax);
    }
    return res;
  }

  // 判断是否为NAN
  private assertValueValid(value: SliderValue): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value);
  }

  // 判断两个值是否相等
  private valuesEqual (valA: SliderValue, valB: SliderValue): boolean {
    if (typeof valA !== typeof valB) {
      return false;
    }
    return valA === valB;
  }

  private updateTrackAndHandles() {
    this.offset = this.getValueToOffset(this.value);
    this.cdr.markForCheck();
  }

  private getValueToOffset(value: SliderValue): SliderValue {
    return getPercent(value, this.wyMin, this.wyMax);
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = movable;

    if (movable) {
      this.subscribeDrag(['move', 'end']);
    } else {
      this.unsubscribeDrag(['move', 'end']);
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

  private onValueChange(value: SliderValue): void {}

  private onTouched(): void {}

  writeValue(value: SliderValue): void {
    this.setValue(value, true); // 读取值，赋值
  }
  registerOnChange(fn: any): void {
    this.onValueChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
