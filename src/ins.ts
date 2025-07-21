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
console.log("TraceExporterUrl :: " + config.traceExporterUrl);
console.log("MetricsExporterUrl :: " + config.metricsExporterUrl);
console.log("BaseUrl :: " + config.baseUrl);
console.log("ApplicationNamespace :: " + config.applicationNamespace);
console.log(sdk);
sdk.start();
