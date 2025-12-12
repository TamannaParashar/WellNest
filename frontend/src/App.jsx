import './App.css'
import {BrowserRouter, Route,Routes,Router} from "react-router-dom"
import Login from "./Components/Login"
import Blog from './Components/Blog'
import BlogContent from './Components/BlogContent'
import Community from './Components/Community'
import Trainers from './Components/Trainers'
import Profile from './Components/Profile'
import Home from './Components/Home'
import Tracker from './Components/Tracker'
import ViewLog from './Components/ViewLog'
import Dashboard from './Components/Dashboard'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Login/>} path='/'></Route>
        <Route element={<Profile/>} path='/profile'></Route>
        <Route element={<Home/>} path='/home'></Route>
        <Route element={<Dashboard/>} path='/dashboard'></Route>
        <Route element={<Tracker/>} path='/tracker'></Route>
        <Route element={<Blog/>} path='/blog'></Route>
        <Route element={<BlogContent/>} path='/blogContent'></Route>
        <Route element={<Community/>} path='/community-post'></Route>
        <Route element={<Trainers/>} path='/trainers'></Route>
        <Route element={<ViewLog/>} path='/view-log'></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App