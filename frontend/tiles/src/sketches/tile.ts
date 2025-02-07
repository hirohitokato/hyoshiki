/**
 * p5.js + TypeScript による Masonry レイアウト風表示サンプル
 *
 * ・Tile クラス
 *   - 指定された画像 URL から画像を読み込み、画像サイズ取得後に親（Tiles）へ通知
 *   - Tiles から指示された位置へ、1 秒かけたアニメーション移動を実施
 *   - 画像読み込み前はプレースホルダーを描画
 *
 * ・Tiles クラス
 *   - 指定された列数に基づき、各 Tile を列単位に配置（各列の横幅は canvas 幅を列数で割った値）
 *   - 画像読み込み完了時に該当列のみ再レイアウトを行い、Tile 同士が重なったり隙間が生じないように調整
 */
import "p5";
import p5 from "p5";

/**
 * Tile クラス
 * － 画像の読み込み、サイズ計算、アニメーション移動、描画を担当します。
 */
export class Tile {
    private _p5: p5;

    url: string;
    parent: Tiles;
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

    constructor(p5: p5, url: string, parent: Tiles) {
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
     * Tile を描画します。画像が読み込み済みの場合は画像を、
     * 未読み込みの場合はプレースホルダーの矩形を描画します。
     */
    draw(): void {
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
            // 読み込み中は薄いグレーの矩形を描画
            this._p5.noStroke();
            this._p5.fill(220);
            this._p5.rect(this.x, this.y, this.parent.columnWidth, 100);
        }
    }
}

/**
 * Tiles クラス
 * － 複数の Tile を指定された列数に基づき、masonry レイアウト風に並べます。
 * － 各列の幅は canvas 幅を列数で割った値となり、各 Tile はアスペクト比を維持して表示されます。
 * － Tile から画像のサイズ情報を受け取った際は、該当列のレイアウトを再計算します。
 */
export class Tiles {
    columns: number;
    canvasWidth: number;
    canvasHeight: number;
    columnsTiles: Tile[][];
    tileCount: number = 0;
    gap: number; // タイル間のギャップ（ピクセル）

    get columnWidth(): number {
        return (this.canvasWidth - this.gap * (this.columns - 1)) /
            this.columns;
    }

    constructor(
        columns: number,
        canvasWidth: number,
        canvasHeight: number,
        tileGap: number,
    ) {
        this.columns = columns;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gap = tileGap;
        this.columnsTiles = [];

        for (let i = 0; i < this.columns; i++) {
            this.columnsTiles[i] = [];
        }
    }

    /**
     * Tile を追加し、ラウンドロビン方式で列に割り当てた後、該当列のレイアウトを更新します。
     * @param tile 追加する Tile
     */
    addTile(tile: Tile): void {
        // ラウンドロビン方式により、tileCount % columns で所属列を決定
        const colIndex = this.tileCount % this.columns;
        tile.column = colIndex;
        this.columnsTiles[colIndex].push(tile);
        this.tileCount++;
        // 追加した列のレイアウトを更新
        this.layoutColumn(colIndex);
    }

    /**
     * Tile の画像読み込み完了時に呼ばれ、該当列のレイアウト再計算を行います。
     * @param tile 画像読み込み完了の Tile
     */
    notifyTileLoaded(tile: Tile): void {
        const col = tile.column;
        this.layoutColumn(col);
    }

    /**
     * キャンバスのサイズを設定し、全 Tile の配置を再計算します。
     */
    setsize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.layout();
    }

    /**
     * 全 Tile を再配置します。
     */
    layout(): void {
        for (let i = 0; i < this.columns; i++) {
            this.layoutColumn(i);
        }
    }

    /**
     * 指定された列において、上から順に Tile を配置します。
     * 各 Tile の上端は前の Tile の下端に合わせ、隙間や重なりが生じないようにします。
     * @param colIndex 対象の列インデックス
     */
    private layoutColumn(colIndex: number): void {
        const colWidth = this.columnWidth;
        const newX = colIndex * (colWidth + this.gap);
        let y = 0;
        const columnTiles = this.columnsTiles[colIndex];
        for (let i = 0; i < columnTiles.length; i++) {
            const tile = columnTiles[i];
            tile.setTargetPosition(newX, y);
            // 画像読み込み済みなら scaledHeight、未読み込みなら仮の高さ 100px を使用
            const tileHeight = tile.loaded ? tile.scaledHeight : 100;
            y += tileHeight;
            // 最後のタイル以外は縦方向にもギャップを加える
            if (i < columnTiles.length - 1) {
                y += this.gap;
            }
        }
    }

    /**
     * 各 Tile の更新処理を呼び出します。
     */
    update(): void {
        for (const col of this.columnsTiles) {
            for (const tile of col) {
                tile.update();
            }
        }
    }

    /**
     * 各 Tile の描画処理を呼び出します。
     */
    draw(): void {
        for (const col of this.columnsTiles) {
            for (const tile of col) {
                tile.draw();
            }
        }
    }
}
