from fastapi.responses import JSONResponse


class BrowserCachedResponse(JSONResponse):
    def __init__(
        self, content: dict, cache_hours: int, status_code: int = 200, **kwargs
    ):
        super().__init__(content=content, status_code=status_code, **kwargs)
        self.headers["Cache-Control"] = f"public, max-age={int(cache_hours * 60 * 60)}"
        self.headers["Vary"] = "Accept-Encoding"
