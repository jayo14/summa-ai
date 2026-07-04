"""Application settings — loaded from environment variables / .env file."""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8",
                                     case_sensitive=True, extra="ignore")

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Summa AI API"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Cognee configuration
    COGNEE_API_KEY: str = ""
    COGNEE_API_URL: str = "https://api.cognee.ai"
    
    # OpenAI configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Database
    DATABASE_URL: str = "sqlite:///./db/custom.db"
    
    # JWT Auth
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Allow production frontend URLs
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Feature flags
    SCHEDULER_ENABLED: bool = True
    
    # Demo account
    DEMO_USER_EMAIL: str = "alex@summa.ai"
    
    # Server configuration for production
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = "0.0.0.0"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    def get_cors_origins(self) -> List[str]:
        """Get CORS origins with production URLs added if in production."""
        origins = self.BACKEND_CORS_ORIGINS.copy()
        
        # Add your production frontend URL here
        if self.is_production:
            # Add common production patterns
            frontend_url = os.getenv("FRONTEND_URL")
            if frontend_url:
                origins.append(frontend_url)
            
            # Allow Render preview deployments
            render_url = os.getenv("RENDER_EXTERNAL_URL")
            if render_url:
                # Replace backend URL pattern with frontend pattern
                frontend_render_url = render_url.replace("-api", "").replace("summa-ai-backend", "summa-ai-frontend")
                origins.append(frontend_render_url)
        
        return origins


settings = Settings()
