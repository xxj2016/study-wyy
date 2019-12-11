export function limitNumberInRange(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

export function getPercent(val: number, min: number, max: number) {
    return ((val - min) / (max - min)) * 100
}