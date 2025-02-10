import './App.css'
import Tiles from './components/Tiles';

const API_URL = "http://localhost:8000/api/images/"; // API のエンドポイント

function App() {

  return (
    <>
      <h1>みんなの美術館</h1>
      <Tiles style={{ width: "80vw", height: "600px" }} columns={5} tileGap={20}></Tiles>
    </>
  )
}

export default App
