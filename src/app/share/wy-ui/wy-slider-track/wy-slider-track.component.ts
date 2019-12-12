import { Component, OnInit, Input, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from 'src/app/services/data-types/wy-slider-types';

@Component({
  selector: 'app-wy-slider-track',
  templateUrl: './wy-slider-track.component.html',
  styleUrls: ['./wy-slider-track.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WySliderTrackComponent implements OnInit {
  @Input() wyBuffer: boolean;
  @Input() wyVertical = false;
  @Input() wyLength: number;
  style: WySliderStyle = {};
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['wyLength']) {
      if (this.wyVertical) {
        this.style.height = this.wyLength + '%';
        this.style.width = null;
        this.style.left = null;
      } else {
        this.style.width = this.wyLength + '%';
        this.style.height = null;
        this.style.bottom = null;
      }
    }
  }

}
