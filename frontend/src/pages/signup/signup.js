import "./signup.css";

import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Backdrop, CircularProgress } from '@mui/material';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
    const [fname, setFName] = useState('');
    const [lname, setLName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const POST_USER_DATA_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${process.env.REACT_APP_POST_USER_DATA_ENDPOINT}`;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            setShowLoader(true);
            const response = await axios.post(POST_USER_DATA_ENDPOINT, {
                firstName: fname,
                lastName: lname,
                email,
                password: hashPassword(password)
            });
            console.info("response from end point is ", response);
            // navigate to login page
            if(response.status === 200){
                navigate("/login");
            }
        } catch(e){
            console.warn("error uploading user data to endpoint", e);
        }
        setShowLoader(false);

    };

    const handleClose = () => {
        setShowLoader(false);
    }

    return (
        <>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={showLoader}
                    onClick={handleClose}
                    >
                    <CircularProgress color="inherit" />
                </Backdrop>
            <div className="form-container">
                <Container maxWidth="xs" >
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h4" align="center">
                            Sign Up
                        </Typography>
                        <p>Already a user? <Link to="/login">Sign In</Link></p>
                        <div style={{display:"flex"}}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={fname}
                                onChange={(e) => setFName(e.target.value)}
                                margin="normal"
                                style={{marginRight:"1em"}}
                                required
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={lname}
                                onChange={(e) => setLName(e.target.value)}
                                margin="normal"
                                required
                            />
                        </div>
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
                            Sign Up
                        </Button>
                    </form>
                </Container>
            </div>
        </>
    );
};

function hashPassword(password){
    let hashedPassword = password;
    //hashing logic
    return hashedPassword;
}

export default SignUp;