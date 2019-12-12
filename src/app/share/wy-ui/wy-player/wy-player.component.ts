import { Component, OnInit } from '@angular/core';
import { SliderValue } from 'src/app/services/data-types/wy-slider-types';

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less']
})
export class WyPlayerComponent implements OnInit {
  sliderValue: SliderValue = 30;
  bufferOffset: SliderValue = 70;
  constructor() { }

  ngOnInit() {
  }

}
