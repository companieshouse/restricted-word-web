import ApplicationConfiguration from "../src/ApplicationConfiguration";
import { expect } from "chai";

const proxyquire = require("proxyquire").noCallThru();

describe("config", function () {

    const getFreshConfig = function (): ApplicationConfiguration {
        return proxyquire("../src/config", {}).default;
    };

    it("provides a proxy object if HTTPS_PROXY is defined", function () {

        process.env.HTTPS_PROXY = "https://myproxy:9001";

        const config = getFreshConfig();

        expect(config.proxy).to.exist;
        expect(config.proxy?.host).to.equal("myproxy");
        expect(config.proxy?.port).to.equal(9001);
    });

    it("doesn't provide a proxy if environment variable is undefined", function () {

        delete process.env.HTTPS_PROXY;
        const config = getFreshConfig();

        expect(config.proxy).to.not.exist;
    });

    it("defaults to development if NODE_ENV is undefined", function () {

        delete process.env.NODE_ENV;
        const config = getFreshConfig();

        expect(config.env).to.equal("development");
    });

    it("reads NODE_ENV if it exists", function () {

        process.env.NODE_ENV = "production";
        const config = getFreshConfig();

        expect(config.env).to.equal("production");
    });
});
