import config from "../config";
import tunnel = require("tunnel");
import axios from "axios";

const requiredHeaders = {
    "Authorization": config.internalApiKey,
    "ERIC-Identity": "123",
    "ERIC-Identity-Type": "key",
    "ERIC-Authorised-Key-Roles": "*",
    "Content-Type": "application/json"
};

const agent = tunnel.httpsOverHttp({
    proxy: config.proxy
});

const axiosInstance = axios.create({
    baseURL: config.apiAddress,
    headers: requiredHeaders,
    timeout: 10000,
    proxy: false,
    httpsAgent: agent
});

export = axiosInstance;
