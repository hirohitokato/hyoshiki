import Masonry from "@mtsmfm/react-masonry"; // https://github.com/mtsmfm/react-masonry
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

    // これだとクロスフェードしてくれない。
    // たぶん再レンダリングが発生するせいでTileがそのたびに再生成されていて、クロスフェードにならない
    // タイルの中でリロードするのであればいいけれど、URLを管理するのはタイルの外側のコンポーネントの責務にしたい
    return (
        <Masonry minColumnWidth={200} gap={10} transition="0.5s">
            {imageList.map((item) => (
                <div key={item.id} style={{  }}>
                    <Tile key={item.id}
                        resource_url={item.url} />
                </div>
            ))}
        </Masonry>
    );
};

export default Tiles;
