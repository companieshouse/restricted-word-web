import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import config from "./config";

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: config.traceExporterUrl,
        headers: {}
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: config.metricsExporterUrl,
            headers: {}
        })
    }),
    instrumentations: [getNodeAutoInstrumentations()]
});
console.log("Default TraceExporterUrl :: " + config.traceExporterUrl);
console.log("Default MetricsExporterUrl :: " + config.metricsExporterUrl);
console.log("Default BaseUrl :: " + config.baseUrl);
console.log(sdk);
sdk.start();
