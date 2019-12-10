import { Component, OnInit, SimpleChanges, Input, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from 'src/app/services/data-types/wy-slider-types';

@Component({
  selector: 'app-wy-slider-handle',
  templateUrl: './wy-slider-handle.component.html',
  styleUrls: ['./wy-slider-handle.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WySliderHandleComponent implements OnInit {
  @Input() wyVertical = false;
  @Input() wyOffset: number;
  style: WySliderStyle = {};
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['wyOffset']) {
      this.style[this.wyVertical ? 'bottom' : 'left'] = this.wyOffset + '%';
    }
  }

}
