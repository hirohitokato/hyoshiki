import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Tiles from "./components/Tiles";

import './App.css'

import { useQueryParam } from './hooks/useQueryParam.ts';

function App() {
  const [count, setCount] = useState(0)
  // URLパラメータから取得
  const numTiles = useQueryParam<number>("num_tiles", 10);
  const columns = useQueryParam<number>("num_columns", 4);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div style={{ width: "100vw", height: 400, border: "1px solid black" }}>
        <Tiles num_tiles={numTiles} columns={columns} />
      </div>
          </>
  )
}

export default App
