import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleSheetComponent } from './single-sheet/single-sheet.component';
import { PlayCountPipe } from '../play-count.pipe';
import { WyPlayerModule } from './wy-player/wy-player.module';
import { WySliderTrackComponent } from './wy-slider-track/wy-slider-track.component';
import { WySliderHandleComponent } from './wy-slider-handle/wy-slider-handle.component';



@NgModule({
  declarations: [SingleSheetComponent, PlayCountPipe],
  imports: [
    WyPlayerModule
  ],
  exports: [
    SingleSheetComponent,
    PlayCountPipe,
    WyPlayerModule,
  ]
})
export class WyUiModule { }
