import "./login.css";
import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Typography, Backdrop, CircularProgress } from '@mui/material';
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../contexts/userContext";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const VALIDATE_USER_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${process.env.REACT_APP_AUTHENTICATE_USER_ENDPOINT}`;
    const navigate = useNavigate();
    const { setUserContext } = useContext(UserContext);

    const handleClose = () => {
        setShowLoader(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            setShowLoader(true);
            const response = await axios.post(VALIDATE_USER_ENDPOINT, {
                email,
                password: hashPassword(password)
            });
            console.info("response from end point is ", response);
            // navigate to home page
            if(response.status === 200){
                setUserContext({
                    email,
                    password: hashPassword(password)
                });
                navigate("/home");
            }
        } catch(e){
            console.warn("error validating user", e);
        }
        setShowLoader(false);
    }
    return (
        <>
            <div className="form-container">
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={showLoader}
                    onClick={handleClose}
                    >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Container maxWidth="xs" >
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h4" align="center">
                            Login
                        </Typography>
                        <p>New to the platform? <Link to="/signup">Sign Up</Link></p>
                        <TextField
                            label="Email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Submit
                        </Button>
                    </form>
                </Container>
            </div>
        </>
    );
}

function hashPassword(password){
    let hashedPassword = password;
    //hashing logic
    return hashedPassword;
}

export default Login;