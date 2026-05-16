import { WebTracerProvider } from 'https://esm.sh/@opentelemetry/sdk-trace-web@1.7.0';
import { BatchSpanProcessor, ConsoleSpanExporter } from 'https://esm.sh/@opentelemetry/sdk-trace-base@1.7.0';
import { OTLPTraceExporter } from 'https://esm.sh/@opentelemetry/exporter-trace-otlp-http@1.7.0';
import { registerInstrumentations } from 'https://esm.sh/@opentelemetry/instrumentation@1.7.0';
import { DocumentLoadInstrumentation } from 'https://esm.sh/@opentelemetry/instrumentation-document-load@1.7.0';
import { FetchInstrumentation } from 'https://esm.sh/@opentelemetry/instrumentation-fetch@1.7.0';
import { XMLHttpRequestInstrumentation } from 'https://esm.sh/@opentelemetry/instrumentation-xml-http-request@1.7.0';
import { Resource } from 'https://esm.sh/@opentelemetry/resources@1.7.0';
import { SemanticResourceAttributes } from 'https://esm.sh/@opentelemetry/semantic-conventions@1.7.0';
import { trace, diag, DiagConsoleLogger, DiagLogLevel } from 'https://esm.sh/@opentelemetry/api@1.7.0';

const OTLP_ENDPOINT = '/otlp/v1/traces';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'rwa-eudr-prototype',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'blockchain-agroexport',
  }),
});

const exporter = new OTLPTraceExporter({ url: OTLP_ENDPOINT });
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new FetchInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});

export const tracer = trace.getTracer('rwa-eudr-prototype-tracer');
