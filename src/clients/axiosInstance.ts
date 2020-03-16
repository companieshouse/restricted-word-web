import axios from "axios";
import config from "../config";
import tunnel = require("tunnel");

const requiredHeaders = {
    Authorization: config.internalApiKey
};

const agent = config.proxy === undefined ?
    undefined :
    tunnel.httpsOverHttp({
        proxy: config.proxy
    });

const axiosInstance = axios.create({
    baseURL: `${config.apiAddress}/internal/restricted-word`,
    headers: requiredHeaders,
    timeout: 10000,
    proxy: false,
    httpsAgent: agent
});

export default axiosInstance;
