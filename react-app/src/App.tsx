import './App.css'
import Login from './login'
import Recommendations from './magic'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/recommendations" element={<Recommendations/>}/>
      </Routes>
    </BrowserRouter>
)
}

export default App
