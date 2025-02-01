import React from "react";
import Masonry from "react-masonry-css";
import Tile from "./Tile";
import { useFetchImageList } from "../hooks/useFetchImageList";

interface TilesProps {
    columns: number;
    num_tiles: number;
}

const Tiles: React.FC<TilesProps> = ({ columns, num_tiles }) => {
    const { imageList, error } = useFetchImageList(
        "http://localhost:8000/api/images/",
        num_tiles,
        5000
    );
    if (error) return <div>Error: {error}</div>;

    // ブレークポイントを利用する場合は、必要に応じてここで設定可能です。
    const breakpointColumnsObj = {
        default: columns
        // 例: 1200: columns, 768: 2, 500: 1 など、画面幅に応じた設定も可能です。
    };

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {imageList.map((item) => (
                <Tile key={item.id} resource_url={item.url} />
            ))}
        </Masonry>
    );
};

export default Tiles;
