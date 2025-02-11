export class Ease {
    private constructor() {}

    // Ease.InOutCubic を計算するヘルパーメソッド
    public static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public static easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    public static easeInQuad(t: number): number {
        return t * t;
    }

    // Ease.OutQuad を計算するヘルパーメソッド
    public static easeOutQuad(t: number): number {
        return 1 - Math.pow(1 - t, 2);
    }

    // Ease.InOutBack の計算を行うヘルパーメソッド
    public static easeInOutBack(t: number): number {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        if (t < 0.5) {
            return (Math.pow(2 * t, 2) * (((c2 + 1) * 2 * t) - c2)) / 2;
        } else {
            return (Math.pow(2 * t - 2, 2) * (((c2 + 1) * (2 * t - 2)) + c2) +
                2) / 2;
        }
    }
}

export default Ease;
