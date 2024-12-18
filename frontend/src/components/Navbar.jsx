import React, { useContext, useState } from 'react'
import logo from '../assets/logo and icons/trip-with-ajji-logo.png'
import profile from '../assets/logo and icons/profile.png'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from "react-toastify";
import axios from 'axios'
const Navbar = () => {

    const {userData,setIsLoggedin,setUserData,backendUrl} = useContext(AppContext)

    const navigate = useNavigate()
    const logout = async()=>{
      try {
        axios.defaults.withCredentials = true 
        const {data} = await axios.post(backendUrl+'/api/auth/logout')
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        navigate('/')
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  return (
    <div className='flex justify-evenly items-center py-2 shadow-sm'>
        {/* Logo */}
      <Link to={'/'}>
        <img className='w-[150px] cursor-pointer' src={logo} alt="" />
      </Link>
      {/* Quick Links */}
      <ul className='flex items-center gap-4'>
        <li><NavLink to={'/'}>Home</NavLink></li>
        <li><NavLink to={'/explore'}>Explore</NavLink></li>
        <li><NavLink to={'/plan-your-trip'}>Plan Your Trip</NavLink></li>
        <li><NavLink to={'/contact-us'}>Contact Us</NavLink></li>
        <p>{userData.name}</p>
      </ul>
      {/* Profile or Sign Up */}
      <div>
        {
            userData ? <button onClick={logout} className='bg-mainColor text-white text-xs px-4 py-2 rounded-full hover:opacity-80 duration-300'>Logout</button>
            : <button onClick={()=>{navigate('/sign-up');window.scrollTo(0,0)}} className='bg-mainColor text-white text-xs px-4 py-2 rounded-full hover:opacity-80 duration-300'>Sign Up</button>
        }
      </div>
    </div>
  )
}

export default Navbar
