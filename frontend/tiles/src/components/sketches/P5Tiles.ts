import { P5Tile } from "./P5Tile";

/**
 * Tiles クラス
 * － 複数の P5Tile を指定された列数に基づき、masonry レイアウト風に並べます。
 * － 各列の幅は canvas 幅を列数で割った値となり、各 P5Tile はアスペクト比を維持して表示されます。
 * － P5Tile から画像のサイズ情報を受け取った際は、該当列のレイアウトを再計算します。
 */
export class P5Tiles {
    columns: number;
    canvasWidth: number;
    canvasHeight: number;
    columnsTiles: P5Tile[][];
    tileCount: number = 0;
    fadeDuration: number = 1000; // クロスフェードの継続時間（ミリ秒）
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
        fadeDuration: number
    ) {
        this.columns = columns;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gap = tileGap;
        this.fadeDuration = fadeDuration;
        this.columnsTiles = [];

        for (let i = 0; i < this.columns; i++) {
            this.columnsTiles[i] = [];
        }
    }

    /**
     * P5Tile を追加し、ラウンドロビン方式で列に割り当てた後、該当列のレイアウトを更新します。
     * @param tile 追加する P5Tile
     */
    addTile(tile: P5Tile): void {
        // ラウンドロビン方式により、tileCount % columns で所属列を決定
        const colIndex = this.tileCount % this.columns;
        tile.column = colIndex;
        this.columnsTiles[colIndex].push(tile);
        this.tileCount++;
        // 追加した列のレイアウトを更新
        this.layoutColumn(colIndex);
    }

    /**
     * P5Tile の画像読み込み完了時に呼ばれ、該当列のレイアウト再計算を行います。
     * @param tile 画像読み込み完了の P5Tile
     */
    notifyTileLoaded(tile: P5Tile): void {
        const col = tile.column;
        this.layoutColumn(col);
    }

    /**
     * キャンバスのサイズを設定し、全 P5Tile の配置を再計算します。
     */
    setSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.layout();
    }

    /**
     * 全 P5Tile を再配置します。
     */
    layout(): void {
        for (let i = 0; i < this.columns; i++) {
            this.layoutColumn(i);
        }
    }

    /**
     * 指定された列において、上から順に P5Tile を配置します。
     * 各 P5Tile の上端は前の P5Tile の下端に合わせ、隙間や重なりが生じないようにします。
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
     * 各 P5Tile の更新処理を呼び出します。
     */
    update(): void {
        for (const col of this.columnsTiles) {
            for (const tile of col) {
                tile.update();
            }
        }
    }

    /**
     * 各 P5Tile の描画処理を呼び出します。
     */
    draw(): void {
        for (const col of this.columnsTiles) {
            for (const tile of col) {
                tile.draw();
            }
        }
    }
}
