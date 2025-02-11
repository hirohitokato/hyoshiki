import p5 from "p5";
import { P5Tiles } from "./P5Tiles";
import Ease from "./easings";

export class P5Tile {
    private _p5: p5;
    url: string;
    parent: P5Tiles;

    // 現在表示中の画像と次に表示する画像（クロスフェード用）
    image: p5.Image | null = null;
    nextImage: p5.Image | null = null;

    loaded: boolean = false;
    originalWidth: number = 0;
    originalHeight: number = 0;
    scaledWidth: number = 0;
    scaledHeight: number = 0;

    // 位置および移動関連
    x: number = 0;
    y: number = 0;
    targetX: number = 0;
    targetY: number = 0;
    startX: number = 0;
    startY: number = 0;
    startTime: number = 0;
    duration: number; // 移動アニメーション時間（ms）
    column: number = 0; // 所属する列

    // クロスフェード関連の管理（新旧画像のサイズ・開始時刻を1つのオブジェクトにまとめる）
    crossfadeData: {
        startTime: number;
        oldWidth: number;
        oldHeight: number;
        newWidth: number;
        newHeight: number;
    } | null = null;
    crossfadeInProgress: boolean = false;
    notifiedHalf: boolean = false;

    constructor(p5: p5, url: string, fadeDuration: number, parent: P5Tiles) {
        this._p5 = p5;
        this.url = url;
        this.parent = parent;
        this.duration = fadeDuration;
        this.fetchImage(url);
    }

    setUrl(url: string): void {
        if (this.url === url) {
            return;
        }
        this.url = url;
        this.fetchImage(url);
    }

    setTargetPosition(newX: number, newY: number): void {
        if (this.startTime === 0) {
            this.x = newX;
            this.y = newY;
            this.targetX = newX;
            this.targetY = newY;
            this.startX = newX;
            this.startY = newY;
            this.startTime = this._p5.millis();
        } else if (this.targetX !== newX || this.targetY !== newY) {
            this.startX = this.x;
            this.startY = this.y;
            this.targetX = newX;
            this.targetY = newY;
            this.startTime = this._p5.millis();
        }
    }

    private async fetchImage(url: string) {
        const response = await fetch(url);
        const json = await response.json();
        const data = `data:${json.mime_type};base64,${json.data}`;
        this._p5.loadImage(data, (img: p5.Image) => this.onImageLoaded(img));
    }

    private onImageLoaded(img: p5.Image): void {
        if (!this.loaded || !this.image) {
            // 初回読み込み時
            this.image = img;
            this.loaded = true;
            this.originalWidth = img.width;
            this.originalHeight = img.height;
            this.scaledWidth = this.parent.columnWidth;
            this.scaledHeight = this.originalHeight *
                (this.parent.columnWidth / this.originalWidth);
            this.parent.notifyTileLoaded(this);
        } else {
            // 既に画像が表示されている場合はクロスフェード開始
            this.nextImage = img;
            const newWidth = this.parent.columnWidth;
            const newHeight = img.height *
                (this.parent.columnWidth / img.width);
            this.crossfadeData = {
                startTime: this._p5.millis(),
                oldWidth: this.scaledWidth,
                oldHeight: this.scaledHeight,
                newWidth,
                newHeight,
            };
            this.crossfadeInProgress = true;
            this.notifiedHalf = false;
        }
    }

    update(): void {
        const elapsed = this._p5.millis() - this.startTime;
        if (elapsed < this.duration) {
            const t = Ease.easeInOutQuad(elapsed / this.duration);
            this.x = this._p5.lerp(this.startX, this.targetX, t);
            this.y = this._p5.lerp(this.startY, this.targetY, t);
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }

    draw(): void {
        if (this.crossfadeInProgress && this.nextImage && this.crossfadeData) {
            const elapsed = this._p5.millis() - this.crossfadeData.startTime;
            const progress = this._p5.constrain(
                elapsed / this.duration,
                0,
                1,
            );

            // 50%進行時に親へサイズ変更の通知（1度だけ）
            if (progress >= 0.5 && !this.notifiedHalf) {
                this.scaledWidth = this.crossfadeData.newWidth;
                this.scaledHeight = this.crossfadeData.newHeight;
                this.parent.notifyTileLoaded(this);
                this.notifiedHalf = true;
            }

            // 古い画像は、クロスフェード開始前のサイズを維持して描画
            this._p5.push();
            this._p5.tint(255, (1 - progress) * 255);
            if (this.image) {
                this._p5.image(
                    this.image,
                    this.x,
                    this.y,
                    this.crossfadeData.oldWidth,
                    this.crossfadeData.oldHeight,
                );
            }
            this._p5.pop();

            // 新しい画像は新たに計算したサイズで描画
            this._p5.push();
            this._p5.tint(255, progress * 255);
            this._p5.image(
                this.nextImage,
                this.x,
                this.y,
                this.crossfadeData.newWidth,
                this.crossfadeData.newHeight,
            );
            this._p5.pop();

            if (progress >= 1) {
                // クロスフェード完了後、新画像とサイズ情報に切り替え
                this.image = this.nextImage;
                this.originalWidth = this.image.width;
                this.originalHeight = this.image.height;
                this.nextImage = null;
                this.crossfadeData = null;
                this.crossfadeInProgress = false;
            }
        } else {
            // 通常描画
            if (this.loaded && this.image) {
                this.scaledWidth = this.parent.columnWidth;
                this.scaledHeight = this.originalHeight *
                    (this.parent.columnWidth / this.originalWidth);
                this._p5.image(
                    this.image,
                    this.x,
                    this.y,
                    this.scaledWidth,
                    this.scaledHeight,
                );
            } else {
                this._p5.noStroke();
                this._p5.fill(220);
                this._p5.rect(this.x, this.y, this.parent.columnWidth, 100);
            }
        }
    }
}
