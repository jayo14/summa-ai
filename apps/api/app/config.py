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
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "openai"
    LLM_MODEL: str = "openai/gpt-4o-mini"
    EMBEDDING_PROVIDER: str = "openai"
    EMBEDDING_MODEL: str = "openai/text-embedding-3-large"
    EMBEDDING_API_KEY: str = ""

    # OpenAI configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Qdrant configuration
    QDRANT_API_KEY: str = ""
    QDRANT_CLUSTER_ENDPOINT: str = ""
    VECTOR_DB_URL: str = ""
    VECTOR_DB_KEY: str = ""
    VECTOR_DB_PROVIDER: str = ""

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
    
    # Z.ai configuration (set via environment variables — do not hardcode)
    ZAI_API_KEY: str = ""
    ZAI_TOKEN: str = ""
    ZAI_USER_ID: str = ""
    ZAI_API_BASE: str = "https://internal-api.z.ai/v1"
    ZAI_MODEL: str = "glm-4.5"

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
