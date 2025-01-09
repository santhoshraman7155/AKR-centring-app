import React, { useState } from 'react'
import {assets} from '../assets/assets'
import {NavLink, useNavigate} from 'react-router-dom'

const Navbar = () => {
    const navigate=useNavigate()
    const [showMenu ,setShowMenu]=useState(false)
    const[token ,setToken]=useState(true)
  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
        <img onClick={()=>navigate('/')} className='w-40 cursor-pointer  h-10  object-cover' src={assets.akr_logo} alt="" />
        <ul className='hidden md:flex items-start gap-5 font-medium'>
            <NavLink to='/'>
                <li className='py-1'>Data Entry</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to='/datas'>
                <li className='py-1'>Datas</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
            </NavLink>
            <NavLink to='/phoneno'>
                <li className='py-1'>Phoneno</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
            </NavLink>
            <NavLink to='/calculation'>
                <li className='py-1'>Calculation</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
        </ul>
        <div className='flex item-center gap-4'>
            {
                token
                ?<div className='flex items-center gap-2 cursor-pointer group relative'>
                    <img className='w-8 rounded-full' src={assets.msd} alt="" />
                    <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                    <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block '>
                        <div className='bg-stone-100 min-w-48 rounded flex flex-col gap-4 p-4'>
                        <p onClick={()=>navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                        <p onClick={()=>setToken(false)} className='hover:text-black cursor-pointer'>Logout</p>
                        </div>
                    </div>
                </div>
                : <button onClick={()=>navigate('/login')} className='bg-primary text-white px-5 py-3 md:px-8 md:py-3 rounded-full font-light hidden-md-block'>SignUp</button>
            }
            <img onClick={()=>setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
            {/*  mobile menu */}
            <div className={` ${showMenu ? 'fixed w-1/2 bg-gray-950':'h-0 w-0'} md:hidden right-0 top-0 bottom-0 overflow-hidden bg-white transition-all`}>
                <div className='flex items-center justify-between px-5 py-6 '>
                    <img className='w-40 h-10 object-cover' src={assets.akr_logo} alt="" />
                    <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
                </div>
                <ul className='flex flex-col items-center gap-2 mt-5 text-lg font-medium'>
                    <NavLink  onClick={()=>setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>Data Entry</p></NavLink>
                    <NavLink  onClick={()=>setShowMenu(false)} to='/datas'><p className='px-4 py-2 rounded inline-block'>Datas</p></NavLink>
                    <NavLink  onClick={()=>setShowMenu(false)} to='/phoneno'><p className='px-4 py-2 rounded inline-block'>Phoneno</p></NavLink>
                    <NavLink  onClick={()=>setShowMenu(false)} to='/calculation'><p className='px-4 py-2 rounded inline-block'>Calculation</p></NavLink>
                </ul>
            </div>
        </div>
      
    </div>
  )
}

export default Navbar
