import axios from 'axios';

const localInstance = Axios.create();

localInstance.interceptors.request.use(config=>{
    config.url = `${process.env.NODE_ENV == 'production' ? process.env.PUBLIC_URL : process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/v1/${config.url}`;
    return config;
});

export default apicall = async () => "API CALL!"