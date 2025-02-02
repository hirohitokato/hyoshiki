// src/components/Tiles.tsx
import React from 'react';
import Masonry from './masonry/Masonry';
import Tile from './Tile';

interface TilesProps {
    tileCount: number;
    columns: number;
}

const Tiles: React.FC<TilesProps> = ({ tileCount, columns }) => {
    const breakpointColumnsObj = {
        default: columns
        // 必要に応じてレスポンシブ用ブレークポイントも追加可能
    };

    // 0～tileCount-1 の連番を作成し、各 Tile に ID として渡す
    const indices = Array.from({ length: tileCount }, (_, i) => i);

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="tiles"
            columnClassName="tiles_column"
        >
            {indices.map(i => (
                <Tile key={i} id={i} />
            ))}
        </Masonry>
    );
};

export default React.memo(Tiles);
