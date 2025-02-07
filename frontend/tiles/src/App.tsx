import React, { useEffect, useState } from "react";
import './App.css'
import { ReactP5Wrapper, Sketch, SketchProps } from "@p5-wrapper/react";
import { Tile, Tiles } from './sketches/Tile';
import { useParentSize } from "./hooks/useParentSize";

type MySketchProps = SketchProps & {
  backgroundColor: [number, number, number, number]; // RGBA
  parentWidth: number; // 親要素の幅
  parentHeight: number; // 親要素の高さ
  tileGap: number; // タイル間のギャップ（ピクセル）
};

const sketch: Sketch<MySketchProps> = p5 => {

  let tiles: Tiles;
  let backgroundColor: [number, number, number, number] = [0, 0, 0, 255]; // RGBA。デフォルトは黒
  let tileGap = 10; // デフォルトのギャップ（ピクセル）

  p5.setup = () => {
    console.log(`setup:  width=${p5.width}, height=${p5.height}`);
    p5.createCanvas(screen.width, 600);
    // 背景色を白に設定
    p5.background(...backgroundColor);

    // 3 列で masonry レイアウトを構築
    tiles = new Tiles(3, p5.width, p5.height, tileGap);

    // 例として複数の画像 URL を用いて Tile を追加
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
      const tile = new Tile(p5, url, tiles);
      tiles.addTile(tile);
    }
  }

  p5.updateWithProps = props => {
    if (props.parentHeight && props.parentWidth) {
      p5.resizeCanvas(props.parentWidth, props.parentHeight);

      // キャンバスサイズの変更(レイアウトも更新)
      tiles.setsize(props.parentWidth, props.parentHeight);
    }
    if (props.backgroundColor) {
      backgroundColor = props.backgroundColor;
    }
    if (props.tileGap !== undefined) {
      tileGap = props.tileGap;
      tiles.gap = tileGap;
      tiles.layout();
    }
  };

  p5.draw = () => {
    p5.background(...backgroundColor);
    // 各 Tile のアニメーション更新
    tiles.update();
    // 各 Tile の描画
    tiles.draw();
  }
};

function App() {
  const { width, height, ref } = useParentSize();

  return (
    <>
      <h1>みんなの美術館</h1>
      <div ref={ref} style={{ width: "80vw", height: "600px" }}>
        <ReactP5Wrapper
          sketch={sketch}
          parentWidth={width || 100}
          parentHeight={height || 100}
          tileGap={20} />
      </div>
    </>
  )
}

export default App
