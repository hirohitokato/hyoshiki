import { ReactP5Wrapper, Sketch, SketchProps } from "@p5-wrapper/react";
import { P5Tiles } from "./sketches/P5Tiles";
import { P5Tile } from './sketches/P5Tile';
import { useParentSize } from "../hooks/useParentSize";
import React, { useImperativeHandle, useMemo, useState } from "react";

type TilesSketchProps = SketchProps & {
    tileUrls: string[];
    backgroundColor: [number, number, number, number]; // RGBA
    parentWidth: number; // 親要素の幅
    parentHeight: number; // 親要素の高さ
    tileGap: number; // タイル間のギャップ（ピクセル）
    columns: number; // 列数
    fadeDuration: number; // クロスフェードの継続時間（ミリ秒）
    updateFlag: number;
};

function createTileSketch(props: TilesSketchProps): Sketch<TilesSketchProps> {
    const createTiles = (p5: import("p5"), columns: number, tileGap: number, tileUrls: string[], fadeDuration: number) => {
        const tiles = new P5Tiles(columns, p5.width, p5.height, tileGap);
        tileUrls.forEach(url => {
            const tile = new P5Tile(p5, url, fadeDuration, tiles);
            tiles.addTile(tile);
        });
        return tiles;
    };

    return (p5) => {
        const columns = props.columns;
        const tileGap = props.tileGap; // デフォルトのギャップ（ピクセル）
        const fadeDuration = props.fadeDuration; // クロスフェードの継続時間（ミリ秒）
        let backgroundColor = props.backgroundColor; // RGBA。デフォルトは黒

        let tiles: P5Tiles;
        console.log(`createSketch called::: width=${columns}, height=${tileGap}`);

        p5.setup = () => {
            console.log(`:::p5.setup called::: width=${columns}, height=${tileGap}`);
            p5.createCanvas(screen.width, 600);
            // 背景色を白に設定
            p5.background(...backgroundColor);
            console.log(`columns=${columns}, parentHeight=${props.parentHeight}`);
            // 指定した列数で masonry レイアウトを構築
            tiles = createTiles(p5, columns, tileGap, [], fadeDuration);
        }

        p5.updateWithProps = (props: TilesSketchProps) => {
            console.log(`:::p5.updateWithProps called::: props=${JSON.stringify(props)}`);
            if (!tiles) {
                return;
            }

            if (props.columns) {
                // 列数の変更は最初から作り直し
                tiles = createTiles(p5, props.columns, tiles.gap, props.tileUrls, fadeDuration);
            }

            if (props.tileUrls) {
                const alltiles = tiles.columnsTiles.flat();
                if (alltiles.length !== props.tileUrls.length) {
                    tiles = createTiles(p5, props.columns, tiles.gap, props.tileUrls, fadeDuration);
                }
                // タイル画像の更新
                alltiles.forEach((tile, i) => {
                    tile.setUrl(props.tileUrls[i]);
                });
            }
            if (props.parentHeight && props.parentWidth) {
                // キャンバスサイズの変更(レイアウトも更新)
                p5.resizeCanvas(props.parentWidth, props.parentHeight);
                tiles?.setSize(props.parentWidth, props.parentHeight);
            }
            if (props.backgroundColor) {
                backgroundColor = props.backgroundColor;
            }
            if (props.tileGap !== undefined) {
                tiles.gap = props.tileGap;
                tiles?.layout();
            }
            if (props.fadeDuration !== undefined) {
                for (const tile of tiles.columnsTiles.flat()) {
                    tile.duration = props.fadeDuration;
                }
            }
            if (props.updateFlag) {
                tiles?.layout();
            }
        };

        p5.draw = () => {
            p5.background(...backgroundColor);
            // 各 P5Tile のアニメーション更新
            tiles.update();
            // 各 P5Tile の描画
            tiles.draw();
        }
    }
}

export interface TilesProps {
    style?: React.CSSProperties;
    tileUrls: string[];
    columns?: number;
    tileGap?: number;
    fadeDuration?: number;
}

export interface TilesRef {
    update(): void;
}

const Tiles = React.forwardRef<TilesRef, TilesProps>(
    ({ style, tileUrls, columns = 3, tileGap = 20, fadeDuration = 1000 }, ref) => {

        const { size, setSize: _setSize, ref: parentRef } = useParentSize();
        const [backgroundColor, _setBackgroundColor] = useState<[number, number, number, number]>([0, 0, 0, 255]);

        const { width, height } = size;
        // ここで width や height が 0 の場合もあるので、
        // 必要に応じてデフォルト値などで対応します
        console.log(`Tiles rendered:::: width=${width}, height=${height}`);

        useImperativeHandle(ref, () => {
            return {
                update() {
                    console.log('layout');
                }
            };
        }, []);

        const initialProps = {
            tileUrls: tileUrls,
            backgroundColor,
            parentWidth: width,
            parentHeight: height,
            tileGap,
            columns,
            fadeDuration, // クロスフェードの継続時間（ミリ秒）
            updateFlag: 0,
        };
        const sketch = useMemo(() => createTileSketch(initialProps), []);

        if (!width || !height) {
            return <div ref={parentRef} style={style} />;
        }

        return (
            <div ref={parentRef} style={style}>
                {(!width || !height) ? (
                    <p>Loading...</p>
                ) : (
                    <ReactP5Wrapper
                        tileUrls={tileUrls}
                        sketch={sketch}
                        parentWidth={width}
                        parentHeight={height}
                        tileGap={tileGap}
                        fadeDuration={fadeDuration} />
                )}
            </div>
        )
    });

export default Tiles
