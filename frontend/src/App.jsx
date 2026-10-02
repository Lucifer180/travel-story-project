import React from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/SignUp'
import Home from './pages/dashboard/Home'
import SharedStory from './pages/shared/SharedStory'
const App = () => {
  return (
    <div>
      <Router>
        <Routes>

          <Route path='/' exact element={<Root/>}/>
          <Route path='/dashboard' exact element={<Home/>}/>
          <Route path='/login' exact element={<Login/>}/>
          <Route path='/signup' exact element={<Signup/>}/>
          <Route path='/shared/:shareId' element={<SharedStory/>}/>
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