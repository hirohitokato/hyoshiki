import { ReactP5Wrapper, Sketch, SketchProps } from "@p5-wrapper/react";
import { P5Tiles } from "./sketches/P5Tiles";
import { P5Tile } from './sketches/P5Tile';
import { useParentSize } from "../hooks/useParentSize";
import React, { RefObject, useEffect, useImperativeHandle, useMemo } from "react";

type TilesSketchProps = SketchProps & {
    tileUrls: string[];
    backgroundColor: [number, number, number, number]; // RGBA
    parentWidth: number; // 親要素の幅
    parentHeight: number; // 親要素の高さ
    tileGap: number; // タイル間のギャップ（ピクセル）
    columns: number; // 列数
    fadeDuration: number; // クロスフェードの継続時間（ミリ秒）
};

function createSketch(initialProps: TilesSketchProps): Sketch<TilesSketchProps> {

    return p5 => {
        const columns = initialProps.columns;
        const tileGap = initialProps.tileGap; // デフォルトのギャップ（ピクセル）
        const fadeDuration = initialProps.fadeDuration; // クロスフェードの継続時間（ミリ秒）
        let backgroundColor = initialProps.backgroundColor; // RGBA。デフォルトは黒

        let tiles: P5Tiles;
        console.log(`createSketch called::: width=${columns}, height=${tileGap}`);

        p5.setup = () => {
            console.log(`:::p5.setup called::: width=${columns}, height=${tileGap}`);
            p5.createCanvas(screen.width, 600);
            // 背景色を白に設定
            p5.background(...backgroundColor);
            console.log(`columns=${columns}, parentHeight=${initialProps.parentHeight}`);
            // 指定した列数で masonry レイアウトを構築
            tiles = new P5Tiles(columns, p5.width, p5.height, tileGap);

            for (const url of initialProps.tileUrls) {
                const tile = new P5Tile(p5, url, fadeDuration, tiles);
                tiles.addTile(tile);
            }
        }

        p5.updateWithProps = props => {
            if (!tiles) {
                return;
            }
            if (props.tileUrls) {
                // タイル画像の更新
                for (let i = 0; i < props.tileUrls.length; i++) {
                    tiles.columnsTiles.flat()[i].setUrl(props.tileUrls[i]);
                }
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
    ref?: RefObject<HTMLDivElement>
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
        const { sizeRef, ref: parentRef } = useParentSize();
        const { width, height } = sizeRef.current;
        // ここで width や height が 0 の場合もあるので、
        // 必要に応じてデフォルト値などで対応します
        const parentWidth = width || 100;
        const parentHeight = height || 100;
        console.log(`Tiles rendered:::: width=${width}, height=${height}`);

        useImperativeHandle(ref, () => {
            return {
                update() {
                    console.log('layout');
                }
            };
        }, []);

        const initialProps: TilesSketchProps = useMemo(() => {
            return {
                tileUrls: tileUrls,
                backgroundColor: [0, 0, 0, 255],
                parentWidth,
                parentHeight,
                tileGap: tileGap,
                columns: columns,
                fadeDuration: fadeDuration, // クロスフェードの継続時間（ミリ秒）
            }
        }, [tileUrls, parentWidth, parentHeight, tileGap, columns, fadeDuration]);

        const sketch = useMemo(() => createSketch(initialProps), [initialProps]);

        if (!width || !height) {
            return <div ref={parentRef} style={style} />;
        }

        return (
            <div ref={parentRef} style={style}>
                <ReactP5Wrapper
                    sketch={sketch}
                    parentWidth={parentWidth}
                    parentHeight={parentHeight}
                    tileGap={tileGap}
                    fadeDuration={fadeDuration} />
            </div>
        )
    });

export default Tiles
