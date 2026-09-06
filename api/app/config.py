"""Application settings — loaded from environment variables / .env file."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
            os.path.join(os.path.dirname(__file__), "..", ".env"),
            ".env",
        ],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Summa AI API"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Cognee configuration
    COGNEE_API_KEY: str = os.getenv("COGNEE_API_KEY", "")
    COGNEE_API_URL: str = os.getenv("COGNEE_API_URL", "https://api.cognee.ai")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "openai")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "openai/text-embedding-3-large")
    EMBEDDING_API_KEY: str = os.getenv("EMBEDDING_API_KEY", "")

    # OpenAI configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Google AI / Gemini configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Qdrant configuration
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_CLUSTER_ENDPOINT: str = os.getenv("QDRANT_CLUSTER_ENDPOINT", "")
    VECTOR_DB_URL: str = os.getenv("VECTOR_DB_URL", "")
    VECTOR_DB_KEY: str = os.getenv("VECTOR_DB_KEY", "")
    VECTOR_DB_PROVIDER: str = os.getenv("VECTOR_DB_PROVIDER", "")

    # Database — must be supplied via environment variable; no hardcoded default
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Supabase Auth — must be supplied via environment variable; no hardcoded default
    SUPABASE_URL: str = os.getenv(
        "SUPABASE_URL",
        os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""),
    )
    SUPABASE_ANON_KEY: str = os.getenv(
        "SUPABASE_ANON_KEY",
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    )
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # CORS - Allow production frontend URLs
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Feature flags
    SCHEDULER_ENABLED: bool = True
    WEBSOCKET_ENABLED: bool = True
    NEW_CHAT_UI: bool = False
    ADVANCED_ANALYTICS: bool = False

    # Z.ai configuration (set via environment variables — do not hardcode)
    ZAI_API_KEY: str = os.getenv("ZAI_API_KEY", "")
    ZAI_TOKEN: str = os.getenv("ZAI_TOKEN", "")
    ZAI_USER_ID: str = os.getenv("ZAI_USER_ID", "")
    ZAI_API_BASE: str = os.getenv("ZAI_API_BASE", "https://internal-api.z.ai/v1")
    ZAI_MODEL: str = os.getenv("ZAI_MODEL", "glm-4.5")

    # Hybrid memory (SummaStudy integration)
    HYBRID_MEMORY_ENABLED: bool = True

    # SummaStudy service integration
    SUMMASTUDY_API_BASE: str = ""
    SUMMASTUDY_ENABLED: bool = False

    # Observability
    SENTRY_DSN: str = ""

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
                frontend_render_url = render_url.replace("-api", "").replace(
                    "summa-ai-backend", "summa-ai-frontend"
                )
                origins.append(frontend_render_url)

        return origins


settings = Settings()
