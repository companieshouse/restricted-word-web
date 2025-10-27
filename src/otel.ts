import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import config from "./config";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(config.applicationNamespace);
const traceExporter = new OTLPTraceExporter({
    url: config.traceExporterUrl,
    headers: {}
});
const sdk = new NodeSDK({
    spanProcessors: [
        new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS),
        new BatchSpanProcessor(traceExporter)
    ],

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: config.metricsExporterUrl,
            headers: {}
        })
    }),
    instrumentations: [getNodeAutoInstrumentations()]
});
logger.info("Starting OpenTelemetry SDK...");
sdk.start();
