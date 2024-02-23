from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from dotenv import load_dotenv

environment = os.environ["ENVIRONMENT"]
endpoint = os.environ["TEL_EXPORTER_OTLP_ENDPOINT"]
load_dotenv(".env")

from routers import general
from routers import filer
from routers import stocks

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    ),
]
app = FastAPI(middleware=middleware)
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)

if environment == "production":
    FastAPIInstrumentor.instrument_app(app)
    resource = Resource(attributes={
        SERVICE_NAME: "fastapi"
    })
    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint))
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)