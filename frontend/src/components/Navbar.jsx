import React, { useState } from 'react'
import logo from '../assets/logo and icons/trip-with-ajji-logo.png'
import profile from '../assets/logo and icons/profile.png'
import { Link, NavLink, useNavigate } from 'react-router-dom'
const Navbar = () => {
    const [token,setToken] = useState(false)
    const navigate = useNavigate()
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
      </ul>
      {/* Profile or Sign Up */}
      <div>
        {
            token ? <img className='w-10 rounded-full object-cover cursor-pointer' src={profile} alt="" />
            : <button onClick={()=>{navigate('/sign-up');window.scrollTo(0,0)}} className='bg-mainColor text-white text-xs px-4 py-2 rounded-full hover:opacity-80 duration-300'>Sign Up</button>
        }
      </div>
    </div>
  )
}

export default Navbar
