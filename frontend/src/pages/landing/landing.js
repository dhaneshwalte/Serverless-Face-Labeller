import "./landing.css";
import SourceList from "../sourceList/sourcelist";
import TakeInput from "../takeInput/takeinput";
import { Button } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    }

    return (

        <>
            <Button onClick={handleLogout} variant="contained" color="primary" style={{position:"fixed", top:"1em", right:"1em"}}>
                Logout
            </Button>
            <div className="root-wrapper">
                <SourceList />
                <TakeInput />
            </div>
        </>
    );
}

export default Landing;