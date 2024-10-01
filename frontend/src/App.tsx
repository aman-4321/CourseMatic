import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Editor from './components/Editor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1 className='text-3xl'>
        Hello World
      </h1>
      <Editor/>
    </div>
  )
}

export default App
