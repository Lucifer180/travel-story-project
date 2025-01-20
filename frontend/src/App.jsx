import React from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/SignUp'
import Home from './pages/Home/Home'
const App = () => {
  return (
    <div>
      <Router>
        <Routes>

          <Route path='/' exact element={<Root/>}/>
          <Route path='/dashboard' exact element={<Home/>}/>
          <Route path='/login' exact element={<Login/>}/>
          <Route path='/signup' exact element={<Signup/>}/>
        </Routes>
      </Router>
    </div>
  )
}
const Root=()=>{
   const isAuthenticated=localStorage.getItem("token");
   return isAuthenticated?(
  <Navigate to="/dashboard"/>):(<Navigate to="/login"/>);
}
export default App