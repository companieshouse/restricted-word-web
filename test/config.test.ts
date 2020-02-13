import { expect } from "chai";

const proxyquire = require("proxyquire").noCallThru();

describe("config", function () {

    it("provides a proxy object if HTTPS_PROXY is defined", function () {

        process.env.HTTPS_PROXY = "https://myproxy:9001";

        const config = proxyquire("../src/config", {});

        expect(config.proxy).to.exist;
        expect(config.proxy?.host).to.equal("myproxy");
        expect(config.proxy?.port).to.equal(9001);
    });

    it("doesn't provide a proxy if environment variable is undefined", function () {

        delete process.env.HTTPS_PROXY;
        const config = proxyquire("../src/config", {});

        expect(config.proxy).to.not.exist;
    });

    it("see what happens", function () {

        process.env.RESTRICTED_WORD_ADMIN_WEB_PORT = "sdfsdf";
    });
});
