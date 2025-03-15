import './App.css'
import { Navigate, Route, Router, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Chatpage from './pages/Chatpage'
import { useAuthContext } from "./Context/authContext";

function App() {
  const { authUser } = useAuthContext();
  console.log(authUser);
  
  return (
    <>
      <Routes>
        <Route path="/" element={ authUser ? <Chatpage /> : <Navigate to={"/login"}/>} />
        <Route path="/login" element={ authUser ?  <Navigate to={"/"}/> : <Login />} />
        <Route path="/signup" element={ authUser ?  <Navigate to={"/"}/> : <Signup/>} />
      </Routes>
    </>
  )
}

export default App
