import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from "react-toastify";
import axios from 'axios'
const SignUp = () => {
  const navigate = useNavigate()
  const {backendUrl, setIsLoggedin} = useContext(AppContext)
  const [state,setState] = useState("Sign Up")
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const submitHandler = async(e)=>{
    e.preventDefault()
    try {
      axios.defaults.withCredentials = true 
      if(state === "Sign Up"){
        const {data} = await axios.post(backendUrl+'/api/auth/register',{name,email,password})
        if(data.success){
          setIsLoggedin(true)
          toast.success("Account Created")
        }else{
          toast.error(data.message)
        }
      }else{
        const {data} = await axios.post(backendUrl+'/api/auth/login',{email,password})
        if(data.success){
          setIsLoggedin(true)
          navigate('/')
          toast.success("Login Successfully")

        }else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  
  return (
    <div className='w-full flex justify-center items-center min-h-[90vh]'>
     <div className='w-[350px] flex flex-col bg-mainColor text-white px-4 pt-8 pb-4 rounded-lg'>
      <p className='text-3xl'>{state}</p>
      <form onSubmit={submitHandler} className='flex flex-col gap-2 mt-4'>
        <div className=''>
          {
            state === 'Sign Up' ? (
              <div>
                <p className='font-medium '>Username:</p>
                <input onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Enter username' className='w-full p-2 bg-transparent mt-1 border rounded' required />
              </div>
            )
            : <></>
          }
        </div>
        <div>
        <p className='font-medium '>Email:</p>
        <input onChange={e => setEmail(e.target.value)} value={email}  type="email" placeholder='Enter email' className='w-full p-2 bg-transparent mt-1 border rounded ' required  />
        </div>
        <div>
        <p className='font-medium '>Password:</p>
        <input onChange={e => setPassword(e.target.value)} value={password}  type="password" placeholder='Enter password' className='w-full p-2 bg-transparent mt-1 border rounded ' required  />
        </div>
        <button type='submit' className='w-full bg-white text-mainColor mt-2 py-2 rounded-lg hover:opacity-70'>{state === "Sign Up"?"Create Account":"Login to Account"}</button>
        <p onClick={()=>navigate('/reset-password')} className='text-right text-sm italic cursor-pointer hover:underline '>forgot password?</p>
        <hr />
        <p className='text-center text-sm'>{state === "Sign Up"? "Already have an account?":"Do not have an account?"} <span onClick={()=>{state==="Sign Up"?setState("Login"):setState("Sign Up")}}>{state === "Sign Up"?"Login Here":"Create Account"}</span> </p>
      </form>
     </div>
    </div>
  )
}

export default SignUp
