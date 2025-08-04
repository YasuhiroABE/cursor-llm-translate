from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import httpx
import os

app = FastAPI(
    title="Translation Frontend",
    description="FastAPI frontend for translation web interface",
    version="1.0.0"
)

# Mount static directory for frontend assets
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# Backend API URL - read from environment variable
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "backend_url": BACKEND_URL})

@app.get("/health")
async def health_check():
    """Check if backend is available"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{BACKEND_URL}/health")
            return {"frontend": "healthy", "backend": response.json()}
    except httpx.TimeoutException:
        return {"frontend": "healthy", "backend": "timeout", "error": "Backend request timed out"}
    except Exception as e:
        return {"frontend": "healthy", "backend": "unavailable", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("FRONTEND_PORT", 8000))
    host = os.getenv("FRONTEND_HOST", "0.0.0.0")
    uvicorn.run(app, host="0.0.0.0", port=port)
