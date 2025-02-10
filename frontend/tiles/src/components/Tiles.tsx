import { ReactP5Wrapper, Sketch, SketchProps } from "@p5-wrapper/react";
import { P5Tiles } from "./sketches/P5Tiles";
import { P5Tile } from './sketches/P5Tile';
import { useParentSize } from "../hooks/useParentSize";
import React, { useMemo } from "react";

type TilesSketchProps = SketchProps & {
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
        let tileGap = initialProps.tileGap; // デフォルトのギャップ（ピクセル）
        let fadeDuration = initialProps.fadeDuration; // クロスフェードの継続時間（ミリ秒）
        let backgroundColor = initialProps.backgroundColor; // RGBA。デフォルトは黒

        let tiles: P5Tiles;

        p5.setup = () => {
            p5.createCanvas(screen.width, 600);
            // 背景色を白に設定
            p5.background(...backgroundColor);
            console.log(`columns=${columns}, parentHeight=${initialProps.parentHeight}`);
            // 指定した列数で masonry レイアウトを構築
            tiles = new P5Tiles(columns, p5.width, p5.height, tileGap, fadeDuration);

            // 例として複数の画像 URL を用いて P5Tile を追加
            // ※ここでは placeholder の画像 URL を利用しています
            const imageUrls = [
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
                "http://localhost:8000/api/images/random",
            ];

            for (const url of imageUrls) {
                const tile = new P5Tile(p5, url, tiles);
                tiles.addTile(tile);
            }
        }

        p5.updateWithProps = props => {
            if (props.parentHeight && props.parentWidth) {
                // キャンバスサイズの変更(レイアウトも更新)
                p5.resizeCanvas(props.parentWidth, props.parentHeight);
                tiles.setSize(props.parentWidth, props.parentHeight);
            }
            if (props.backgroundColor) {
                backgroundColor = props.backgroundColor;
            }
            if (props.tileGap !== undefined) {
                tileGap = props.tileGap;
                tiles.gap = tileGap;
                tiles.layout();
            }
            if (props.fadeDuration !== undefined) {
                fadeDuration = props.fadeDuration;
                tiles.fadeDuration = fadeDuration;
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

interface TilesProps {
    style?: React.CSSProperties;
    tileCount?: number;
    columns?: number;
    tileGap?: number;
    fadeDuration?: number;
}

const Tiles: React.FC<TilesProps> = (
    { style, tileCount = 30, columns = 3, tileGap = 20, fadeDuration = 1000 }) => {
    const { width, height, ref } = useParentSize();

    const initialProps: TilesSketchProps = useMemo(() => {
        return {
            backgroundColor: [0, 0, 0, 255],
            parentWidth: width || 100,
            parentHeight: height || 100,
            tileGap: tileGap,
            columns: columns,
            fadeDuration: fadeDuration, // クロスフェードの継続時間（ミリ秒）
        }
    }, [width, height, tileGap, columns, fadeDuration]);

    const sketch = useMemo(() => createSketch(initialProps), [initialProps]);

    return (
        <div ref={ref} style={style}>
            <ReactP5Wrapper
                sketch={sketch}
                parentWidth={width || 100}
                parentHeight={height || 100}
                tileGap={tileGap}
                fadeDuration={fadeDuration} />
        </div>
    )
}

export default Tiles
