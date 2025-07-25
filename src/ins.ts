import { NodeSDK, tracing } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import config from "./config";
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { propagation } from "@opentelemetry/api";
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

const traceExporter = new OTLPTraceExporter({
    url: config.traceExporterUrl,
    headers: {}
});

const sdk = new NodeSDK({
    spanProcessors: [
        new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS),
        new BatchSpanProcessor(traceExporter),
        new BatchSpanProcessor(new ConsoleSpanExporter())
    ],

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
