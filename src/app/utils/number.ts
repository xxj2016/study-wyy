export function limitNumberInRange(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}