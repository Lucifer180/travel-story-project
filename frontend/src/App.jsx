import { ConfigProvider } from 'antd'
import React from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import WaveGridBackground from './components/three/WaveGridBackground'
import Login from './pages/auth/Login'
import Signup from './pages/auth/SignUp'
import Home from './pages/dashboard/Home'
import SharedStory from './pages/shared/SharedStory'
import { useAuthStore } from './store/useAuthStore'

const theme={
  token:{
    colorPrimary:"#05B6D3",
    fontFamily:"Poppins, sans-serif",
  },
}

const App = () => {
  return (
    <ConfigProvider theme={theme}>
      {/* app-wide animated background; pages render on top of it */}
      <div className='fixed inset-0 z-0' aria-hidden='true'>
        <WaveGridBackground colorBase='#ffffff' colorHigh='#05B6D3'/>
      </div>
      <div className='relative z-[1]'>
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
    </ConfigProvider>
  )
}
const Root=()=>{
   const isAuthenticated=useAuthStore((s)=>s.token);
   return isAuthenticated?(
  <Navigate to="/dashboard"/>):(<Navigate to="/login"/>);
}
export default App
