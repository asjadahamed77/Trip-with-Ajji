import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from "react-toastify"
const EmailVerify = () => {
  const inputRefs = React.useRef([])
  const navigate = useNavigate()
  const {backendUrl, getUserData, isLoggedin,userData} = useContext(AppContext)
  axios.defaults.withCredentials = true 
  const handleInput = (e, index)=>{
    if(e.target.value.length>0 && index < inputRefs.current.length - 1){
      inputRefs.current[index+1].focus()
    }
  }

  const handleKeyDown = (e, index)=>{
    if(e.key === 'Backspace' && e.target.value === "" && index>0){
      inputRefs.current[index-1].focus()
    }
  }

  const handlePaste = (e)=>{
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char
      }
    })   
  }

  const submitHandler = async(e)=>{
    try{
      e.preventDefault()
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')
      const {data} = await axios.post(backendUrl+'/api/auth/verify-account',{otp})
      if(data.success){
        toast.success(data.message)
        getUserData()
        isLoggedin(true)
        navigate('/')
      }else{
        toast.error(data.message)
      }
    }catch(error){
      console.log(error)
            toast.error(error.message)
    }
  }

  useEffect(()=>{
      isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin,userData])

  return (
    <div className='flex justify-center items-center'>
      <form onSubmit={submitHandler} className='rounded-lg flex flex-col items-center bg-slate-100 w-[400px] mt-20 p-4'>
      <h1 className='text-lg'>Email Verification</h1>
      <p className='text-gray-600'>Enter 6 digit code sent to your email id.</p>
      <div className='flex justify-between mb-8 gap-1' onPaste={handlePaste}>
        {
          Array(6).fill(0).map((_,index)=>(
            <input type="text" maxLength='1' key={index} required className='mt-4 w-12 h-12 bg-slate-200 text-mainColor text-center text-lg rounded-md ' ref={e => inputRefs.current[index] = e} onInput = {(e)=> handleInput(e, index)} onKeyDown = {(e)=> handleKeyDown(e, index)}  />
          ))
        }
      </div>
      <button type='submit' className='py-2 w-[80%] hover:opacity-80 bg-slate-600 text-white rounded-lg'>Verify Email</button>
    </form>
    </div>
  )
}

export default EmailVerify
