export function SliderEvent(e: Event) { // 类似console.log, 可以做一个中间的调试
    e.stopPropagation();
    e.preventDefault();
}

export function getElementOffset(el: HTMLElement): {top: number; left: number} {
    if (!el.getClientRects().length) {
        return {top: 0, left: 0}
    }
    const rect = el.getBoundingClientRect();
    const win = el.ownerDocument!.defaultView; // defaultView IE9以下不支持 （加上非空断言操作符）

    return {
        top: rect.top + win!.pageYOffset,
        left: rect.left + win!.pageXOffset
    }
}