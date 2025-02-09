/**
 * p5.js + TypeScript による Masonry レイアウト風表示サンプル
 *
 * ・P5Tile クラス
 *   - 指定された画像 URL から画像を読み込み、画像サイズ取得後に親（Tiles）へ通知
 *   - Tiles から指示された位置へ、1 秒かけたアニメーション移動を実施
 *   - 画像読み込み前はプレースホルダーを描画
 *
 * ・P5Tiles クラス
 *   - 指定された列数に基づき、各 P5Tile を列単位に配置（各列の横幅は canvas 幅を列数で割った値）
 *   - 画像読み込み完了時に該当列のみ再レイアウトを行い、Tile 同士が重なったり隙間が生じないように調整
 */
import "p5";
import p5 from "p5";
import { P5Tiles } from "./P5Tiles";

/**
 * P5Tile クラス
 * － 画像の読み込み、サイズ計算、アニメーション移動、描画を担当します。
 */
export class P5Tile {
    private _p5: p5;

    url: string;
    parent: P5Tiles;
    image: p5.Image | null;
    loaded: boolean;
    originalWidth: number;
    originalHeight: number;
    scaledWidth: number;
    scaledHeight: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number = 1000; // 移動にかける時間（ミリ秒）
    column: number = 0; // 所属する列（Tiles から設定）

    constructor(p5: p5, url: string, parent: P5Tiles) {
        this._p5 = p5;
        this.url = url;
        this.parent = parent;
        this.image = null;
        this.loaded = false;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.scaledWidth = 0;
        this.scaledHeight = 0;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;

        this.fetchImage(url);
        setInterval(() => {
            this.fetchImage(url);
        }, 3000 + p5.random(100, 1000));
    }

    async fetchImage(url: string) {
        const response = await fetch(url);
        const json = await response.json();
        const data = `data:${json.mime_type};base64,${json.data}`;
        this._p5.loadImage(data, (img: p5.Image) => {
            this.onImageLoaded(img);
        });
    }

    /**
     * 画像の読み込み完了時に呼ばれるコールバック
     * 読み込んだ画像のサイズ情報を元に、表示用サイズを計算し親に通知します。
     * @param img 読み込まれた p5.Image
     */
    onImageLoaded(img: p5.Image): void {
        this.image = img;
        this.loaded = true;
        this.originalWidth = img.width;
        this.originalHeight = img.height;
        // 親の指定する列幅に合わせ、アスペクト比を維持したサイズを計算
        this.scaledWidth = this.parent.columnWidth;
        this.scaledHeight = this.originalHeight *
            (this.parent.columnWidth / this.originalWidth);
        // 画像読み込み完了を親に通知（該当列のみ再レイアウト）
        this.parent.notifyTileLoaded(this);
    }

    /**
     * 目標位置を設定し、現在位置からの移動を 1 秒かけたアニメーションで行います。
     * @param newX 目標の x 座標
     * @param newY 目標の y 座標
     */
    setTargetPosition(newX: number, newY: number): void {
        // 初回配置時は即時反映
        if (this.startTime === 0) {
            this.x = newX;
            this.y = newY;
            this.targetX = newX;
            this.targetY = newY;
            this.startX = newX;
            this.startY = newY;
            this.startTime = this._p5.millis();
        } else {
            // 目標位置が変更された場合、現在位置から新たな目標位置へ移動開始
            if (this.targetX !== newX || this.targetY !== newY) {
                this.startX = this.x;
                this.startY = this.y;
                this.targetX = newX;
                this.targetY = newY;
                this.startTime = this._p5.millis();
            }
        }
    }

    /**
     * 毎フレーム呼ばれ、位置のアニメーション更新を行います。
     */
    update(): void {
        const elapsed = this._p5.millis() - this.startTime;
        if (elapsed < this.duration) {
            const t = elapsed / this.duration;
            // 線形補間により位置を更新
            this.x = this._p5.lerp(this.startX, this.targetX, t);
            this.y = this._p5.lerp(this.startY, this.targetY, t);
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }

    /**
     * P5Tile を描画します。画像が読み込み済みの場合は画像を、
     * 未読み込みの場合はプレースホルダーの矩形を描画します。
     */
    draw(): void {
        if (this.loaded && this.image) {
            this.scaledWidth = this.parent.columnWidth;
            this.scaledHeight = this.originalHeight *
                (this.parent.columnWidth / this.originalWidth);
console.log(this.x, this.y, this.scaledWidth, this.scaledHeight);
            this._p5.image(
                this.image,
                this.x,
                this.y,
                this.scaledWidth,
                this.scaledHeight,
            );
        } else {
            // 読み込み中は薄いグレーの矩形を描画
            this._p5.noStroke();
            this._p5.fill(220);
            this._p5.rect(this.x, this.y, this.parent.columnWidth, 100);
        }
    }
}
