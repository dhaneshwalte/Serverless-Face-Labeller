import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './pages/signup/signup';
import Login from './pages/login/login';
import Landing from './pages/landing/landing';

const RoutesComp = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to='/signup' />}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/home" element={<Landing/>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default RoutesComp;