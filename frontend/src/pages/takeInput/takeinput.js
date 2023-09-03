import "./takeinput.css";
import React, { useState, useContext } from 'react';
import { Button, Container, Typography, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, TextField, Backdrop, CircularProgress } from '@mui/material';
import { getBase64, downloadBase64File } from "../../utils/imageUtils";
import axios from "axios";
import { UserContext } from "../../contexts/userContext";
import { v4 as uuidv4 } from 'uuid';
import { replacePathParams } from "../../utils/urlUtiils";


const TakeInput = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [fileType, setFileType] = useState("");
    const [personName, setPersonName] = useState("");
    const [importId, setImportId] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const { email } = useContext(UserContext);

    const SOURCE_FACE_DATA_UPLOAD_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${process.env.REACT_APP_POST_SOURCE_DATA_ENDPOINT}`;
    const TARGET_FACE_DATA_UPLOAD_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${process.env.REACT_APP_POST_TARGET_DATA_ENDPOINT}`;


    const handleClose = () => {
        setShowLoader(false);
    }

    const handleFileChange = (e) => {
        const file = e;
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setSelectedFile(file);
            setFileError('');
        } else {
            setSelectedFile(null);
            setFileError('Please select a valid jpeg or png file.');
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        console.log(e);
        const file = e.dataTransfer?.files[0] || null;
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleFileTypeChange = (e) => {
        e.preventDefault();
        console.log(e.target.value);
        setFileType(e.target.value);
    }

    const pollForStatus = (id) => {
        let endpointName = replacePathParams(process.env.REACT_APP_GET_TARGET_IMPORT_STATUS_BY_REF_ENDPOINT,"email",email);
        //console.log("endpoint for status polling is 1", endpointName)
        endpointName = replacePathParams(endpointName, "importId", id);
        //console.log("endpoint for status polling is 2", endpointName)
        const TARGET_STATUS_POLL_URL = `${process.env.REACT_APP_API_GATEWAY_URL}${endpointName}`;
        const intervalId = setInterval(async ()=>{
            try{
                let response = await axios.get(TARGET_STATUS_POLL_URL);
                if(response.data && response.status === 200 && response.data.status === "Done"){
                    clearInterval(intervalId);
                    const TARGET_IMAGE_FETCH_URL = `${process.env.REACT_APP_API_GATEWAY_URL}${replacePathParams(replacePathParams(process.env.REACT_APP_GET_TARGET_BY_REF_ENDPOINT,"email", email),"importId", id)}`;
                    response = await axios.get(TARGET_IMAGE_FETCH_URL);
                    if(response.data && response.status === 200 && response.data.sourceImageBase64){
                        setShowLoader(false);
                        downloadBase64File("image/jpg",response.data.sourceImageBase64,"target.jpg");
                    }
                }
            } catch(e){
                console.debug("error getting status", e);
                clearInterval(intervalId);
            }
        }, process.env.REACT_APP_POLL_INTERVAL);
    }

    const handleSubmit = async (e)=>{
        if(selectedFile && fileType){
            const id = uuidv4();
            try{
                let base64Url = await getBase64(selectedFile);
                base64Url = base64Url.split(",")[1];
                setShowLoader(true);
                const response = await axios.put(fileType === "source" ? SOURCE_FACE_DATA_UPLOAD_ENDPOINT : TARGET_FACE_DATA_UPLOAD_ENDPOINT, {
                    fileName: selectedFile.name,
                    importId: id,
                    email: email,
                    faceLabel: fileType === "source" ? personName : undefined,
                    imageBase64: base64Url
                });
                if(response.data && response.status === 200){
                    setImportId(id);
                    if(fileType === "source"){
                        setShowLoader(false);
                    }
                    fileType !== "source" && pollForStatus(id);
                }

            } catch(e){
                console.warn("error posting data to server",e);
            }
        }
    }

    return (
        <>
            <div className="outer-div">
                {/* <span style={{ width: "fit-content", marginLeft: "1em" }}>
                    Please select a file to process
                </span> */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={showLoader}
                    onClick={handleClose}
                    >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <FormLabel id="file-type">Please select a file to process</FormLabel>
                <div
                    className="file-input-wrapper"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    style={{
                        border: '2px dashed #ccc',
                        borderRadius: '4px',
                        padding: '20px',
                        marginTop: '20px',
                    }}
                >
                    <Container maxWidth="sm">
                        <input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="source-file-input"
                        />
                        <label htmlFor="source-file-input">
                            <Button variant="contained" component="span" color="primary">
                                Choose File
                            </Button>
                        </label>
                        {selectedFile && <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            Selected File: {selectedFile.name}
                        </Typography>}
                        {!selectedFile && <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            Drag & Drop File here
                        </Typography>}
                        {fileError && (
                            <Typography variant="subtitle1" color="error" gutterBottom>
                                {fileError}
                            </Typography>
                        )}
                    </Container>
                </div>
                <br />
                {/* <span style={{ width: "fit-content", marginLeft: "1em" }}>
                    What type of file is it?
                </span> */}
                <FormControl>
                    <FormLabel id="file-type">What type of file is it?</FormLabel>
                    <RadioGroup
                        aria-labelledby="file-type"
                        defaultValue="source"
                        name="file-type-group"
                        value={fileType}
                        onChange={handleFileTypeChange}
                    >
                        <FormControlLabel value="source" control={<Radio />} label="Source" />
                        <FormControlLabel value="target" control={<Radio />} label="Target" />
                    </RadioGroup>
                </FormControl>
                {fileType === "source" && (<TextField
                        label="Name of the person"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        margin="normal"
                        required
                    />)}
                <Button variant="contained" onClick={handleSubmit}>
                    Submit
                </Button>
            </div>

        </>
    );
}

export default TakeInput;