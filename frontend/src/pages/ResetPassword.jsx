import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from "react-toastify"

const ResetPassword = () => {
  axios.defaults.withCredentials = true 
  const [email,setEmail] = useState('')
  const [newPassword,setNewPassword] = useState('')
  const [isEmailSent,setIsEmailSent] = useState('')
  const [otp,setOtp] = useState('')
  const [isOtpSubmitted,setIsOtpSubmitted] = useState(false)

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

  const onSubmitEmail = async(e)=>{
    e.preventDefault()
    try {
      const {data} = await axios.post(backendUrl+'/api/auth/send-reset-otp',{email})
      if(data.success){
        toast.success(data.message)
        setIsEmailSent(true)
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async(e)=>{
   
    try {
      e.preventDefault()
      const otpArray = inputRefs.current.map(e => e.value)
        setOtp(otpArray.join(''))
        setIsOtpSubmitted(true)

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const onSubmitNewPassword = async(e)=>{
    e.preventDefault()
    try {
      const {data} = await axios.post(backendUrl+"/api/auth/reset-password",{email,otp,newPassword})
      if(data.success){
        toast.success(data.message)
        navigate('/sign-up')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      {
        !isEmailSent && <form onSubmit={onSubmitEmail} className='flex flex-col w-[400px] bg-slate-100 text-gray-700 p-4 rounded-lg mt-20 items-center'>
        <h1 className='text-xl text-center'>Reset your password</h1>
        <p className='text-center'>Enter your registered email address.</p>
        <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" className='bg-transparent text-black p-2 border rounded-xl mt-2 w-full' placeholder='Enter email here'  required/>
        <button type='submit' className='py-2 w-[80%] hover:opacity-80 bg-slate-600 text-white rounded-lg mt-4'>Submit</button>
      </form>
      }

    {/* OTP input form */}
{
  !isOtpSubmitted && isEmailSent &&     <form onSubmit={onSubmitOtp}  className='rounded-lg flex flex-col items-center bg-slate-100 w-[400px] mt-20 p-4'>
  <h1 className='text-lg'>Reset Password Otp</h1>
  <p className='text-gray-600'>Enter 6 digit code sent to your email id.</p>
  <div className='flex justify-between mb-8 gap-1' onPaste={handlePaste}>
    {
      Array(6).fill(0).map((_,index)=>(
        <input type="text" maxLength='1' key={index} required className='mt-4 w-12 h-12 bg-slate-200 text-mainColor text-center text-lg rounded-md ' ref={e => inputRefs.current[index] = e} onInput = {(e)=> handleInput(e, index)} onKeyDown = {(e)=> handleKeyDown(e, index)}  />
      ))
    }
  </div>
  <button type='submit' className='py-2 w-[80%] hover:opacity-80 bg-slate-600 text-white rounded-lg'>Submit</button>
</form>
}


        {/* Enter new password */}

      {
        isOtpSubmitted && isEmailSent &&   <form onSubmit={onSubmitNewPassword} className='flex flex-col w-[400px] bg-slate-100 text-gray-700 p-4 rounded-lg mt-20 items-center'>
        <h1 className='text-xl text-center'>New Password</h1>
        <p className='text-center'>Enter your new password below.</p>
        <input onChange={(e)=> setNewPassword(e.target.value)} value={newPassword} type="password" className='bg-transparent text-black p-2 border rounded-xl mt-2 w-full' placeholder='Enter new password here'  required/>
        <button type='submit' className='py-2 w-[80%] hover:opacity-80 bg-slate-600 text-white rounded-lg mt-4'>Reset Password</button>
      </form>
      }

    </div>
  )
}

export default ResetPassword
