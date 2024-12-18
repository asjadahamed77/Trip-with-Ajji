import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar';
import SignUp from './pages/SignUp';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <div className=' '>
      <BrowserRouter>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
