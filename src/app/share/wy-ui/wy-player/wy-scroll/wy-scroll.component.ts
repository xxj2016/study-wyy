import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, Input, SimpleChanges, Output, EventEmitter, Inject } from '@angular/core';
import BScroll from "@better-scroll/core";
import { Song } from 'src/app/services/data-types/common.types';
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import { WINDOW } from 'src/app/services/services.module';
import { timer } from 'rxjs';
BScroll.use(MouseWheel)
BScroll.use(ScrollBar)

@Component({
  selector: 'app-wy-scroll',
  template: `
    <div class="wy-scroll" #wrap>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`.wy-scroll {width: 100%; height: 100%; overflow: hidden}`],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyScrollComponent implements OnInit {
  private bs: BScroll;
  @ViewChild('wrap', { static: true }) private wrapRef: ElementRef;
  @Input() refreshDelay = 50;
  @Input() data: Song[];
  @Output() private onScrollEnd = new EventEmitter<number>();
  constructor(
    readonly el: ElementRef,
    @Inject(WINDOW) private win: Window
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.bs = new BScroll(this.wrapRef.nativeElement, {
      scrollbar: {
        interactive: true
      },
      mouseWheel: {}
    });
    this.bs.on('scrollEnd', ({ y }) => this.onScrollEnd.emit(y));
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['data']) {
      this.refreshScroll();
    }
  }

  scrollToElement(...args) {
    this.bs.scrollToElement.apply(this.bs, args);
  }

  refresh() {
    this.bs.refresh();
  }

  refreshScroll() {
    // setTimeout(() => {
    //   this.refresh();
    // }, this.refreshDelay);

    // this.win.setTimeout( () => {
    //   this.refresh();
    // }, this.refreshDelay);

    timer(this.refreshDelay).subscribe(() => {
      this.refresh();
    })
  }
}
