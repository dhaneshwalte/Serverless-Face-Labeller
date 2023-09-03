import "./sourcelist.css";
import React, { useState, useEffect, useContext } from 'react';
import { Typography, Button } from '@mui/material';
import axios from "axios";
import { UserContext } from "../../contexts/userContext";
import { replacePathParams } from "../../utils/urlUtiils";
import { v4 as uuidv4 } from "uuid";

const SourceList = () => {
    const [sourceList, setSourceList] = useState([]);
    const { email } = useContext(UserContext);
    const GET_ALL_SOURCES_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${replacePathParams(process.env.REACT_APP_GET_ALL_SOURCES_ENDPOINT, "email", email)}`;

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const response = await axios.get(GET_ALL_SOURCES_ENDPOINT);
                console.debug("user source list is ", response.data);
                setSourceList(response.data.sources);
                // if(response.data.sources.every(source => source.status === "Done")){
                //     clearInterval(intervalId);
                // }
            } catch (e) {
                console.debug("error while polling source list for user", e);
            }
        }, process.env.REACT_APP_POLL_INTERVAL);
    }, []);

    const handleDeleteSource = async (label) => {
        const DELETE_SOURCE_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${replacePathParams(replacePathParams(process.env.REACT_APP_GET_SOURCE_BY_REF_ENDPOINT,"email",email),"label", label)}`;
        try{
            await axios.delete(DELETE_SOURCE_ENDPOINT);
        } catch(e){
            console.debug("error deleting source",e);
        }
    }

    return (
        <div className="source-list">
            <Typography variant="h5" >
                Sources
            </Typography>
            {sourceList?.length ? sourceList.map(source => {
                return (
                    <>
                        <div key={source.importId+"_root"+uuidv4()} style={{display:"block", width: "100%", marginTop: "1em"}}>
                            <Typography style={{display:"inline-block"}} key={source.importId} variant="subtitle1" color="text.primary">
                                {source.label}
                            </Typography>
                            <Button key={source.importId+"_1"+uuidv4()} onClick={()=>handleDeleteSource(source.label)} variant="contained" disabled={source.status !== "Done"} color={source.status === "Done" ? "error" : "secondary"} style={{marginLeft: "0.5em", display:"inline-block"}}>
                                {source.status === "Done" ? "Delete": "Processing"}
                            </Button>
                        </div>
                    </>
                );
            }) : ""}
        </div>
    );
}

export default SourceList;