import axios from "axios";
import config from "../config";
import tunnel = require("tunnel");

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
    baseURL: `${config.apiAddress}/internal/restricted-word`,
    headers: requiredHeaders,
    timeout: 10000,
    proxy: false,
    httpsAgent: agent
});

export = axiosInstance;
