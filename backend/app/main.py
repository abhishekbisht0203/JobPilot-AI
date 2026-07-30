import logging
import traceback
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from .core.config import settings
from .core.database import connect_db, close_db
from .core.logging_config import setup_logging
from .api.router import api_router

logger = setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except HTTPException:
            raise
        except Exception as exc:
            tb = traceback.format_exc()
            exc_type = type(exc).__name__
            logger.error(
                f"\n"
                f"============================================================\n"
                f"UNHANDLED EXCEPTION\n"
                f"============================================================\n"
                f"Request:    {request.method} {request.url.path}\n"
                f"Type:       {exc_type}\n"
                f"Message:    {str(exc)}\n"
                f"Traceback:\n{tb}\n"
                f"============================================================"
            )
            status_code = 500
            detail = "Internal server error"
            if isinstance(exc, ValidationError):
                detail = str(exc)
                status_code = 422
            return JSONResponse(
                status_code=status_code,
                content={
                    "success": False,
                    "error": detail,
                    "type": exc_type,
                    "path": request.url.path,
                },
            )

app.add_middleware(ExceptionLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
async def startup():
    await connect_db()
    logger.info(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    exc_type = type(exc).__name__
    logger.error(
        f"\n"
        f"============================================================\n"
        f"GLOBAL EXCEPTION HANDLER\n"
        f"============================================================\n"
        f"Request:  {request.method} {request.url.path}\n"
        f"Type:     {exc_type}\n"
        f"Message:  {str(exc)}\n"
        f"Traceback:\n{tb}\n"
        f"============================================================"
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc) if settings.DEBUG else "Internal server error",
            "type": exc_type,
            "path": request.url.path,
        },
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
