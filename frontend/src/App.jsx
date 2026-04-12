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
import { useUser } from '@clerk/clerk-react'
import ProtectedRoute from './Components/ProtectedRoute'
import TrainerBlog from './Components/TrainerBlog'
import TrainerDashboard from './Components/TrainerDashBoard'
import TrainerTalk from './Components/TrainerTalk'
import TrainerChat from './Components/TrainerChat'
import ClientChat from './Components/ClientChat'
import TrainerHome from './Components/TrainerHome'
import DietPlan from './Components/DietPlan'
import Reminders from './Components/Reminders'

function App() {
const {isSignedIn} = useUser();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Login/>} path='/'></Route>
        <Route element={<Profile/>} path='/profile'></Route>
        <Route element={<ProtectedRoute><ClientChat/></ProtectedRoute>} path='/c-chat' />
        <Route element={<ProtectedRoute><Reminders/></ProtectedRoute>} path='/reminders' />
        <Route element={<ProtectedRoute isSignedIn={isSignedIn}><Home/></ProtectedRoute>} path='/home'></Route>
        <Route element={<Dashboard/>} path='/dashboard'></Route>
        <Route element={<Tracker/>} path='/tracker'></Route>
        <Route element={<Blog/>} path='/blog'></Route>
        <Route element={<TrainerHome/>} path='/trainer-home'></Route>
        <Route element={<TrainerDashboard/>} path='/trainerDashboard'></Route>
        <Route element={<TrainerChat/>} path='/chat/:clientEmail'></Route>
        <Route element={<ClientChat />} path="/client/chat/:trainerEmail"></Route>
        <Route element={<TrainerTalk/>} path='/trainerTalk'></Route>
        <Route element={<TrainerBlog/>} path='/trainerBlog'></Route>
        <Route element={<BlogContent/>} path='/blogContent'></Route>
        <Route element={<Community/>} path='/community-post'></Route>
        <Route element={<Trainers/>} path='/trainers'></Route>
        <Route element={<ViewLog/>} path='/view-log'></Route>
        <Route element={<DietPlan/>} path='/diet-plan'></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App