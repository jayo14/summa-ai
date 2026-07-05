# Summa AI Backend - Render Deployment Guide

## Quick Deploy

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Create Web Service**: 
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `./start.sh`
   - Root Directory: `apps/api`

## Environment Variables

Set these in your Render dashboard (Environment tab):

### Required
- `ENVIRONMENT=production`
- `JWT_SECRET_KEY` - Generate a secure random string (use Render's "Generate Value")
- `COGNEE_API_KEY` - Your Cognee API key from https://app.cognee.ai
- `OPENAI_API_KEY` - Your OpenAI API key from https://platform.openai.com/api-keys
- `QDRANT_API_KEY` - Your Qdrant Cloud API key, if you are using a remote cluster
- `QDRANT_CLUSTER_ENDPOINT` - Your Qdrant cluster endpoint, such as `https://<cluster>.qdrant.cloud`

### Frontend Integration
- `BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]`
- `FRONTEND_URL=https://your-frontend-domain.com`

Replace `your-frontend-domain.com` with your actual frontend URL.

### Optional Configuration
- `DATABASE_URL=sqlite:///./db/custom.db` (default SQLite)
- `SCHEDULER_ENABLED=true`
- `ACCESS_TOKEN_EXPIRE_MINUTES=30`
- `DEMO_USER_EMAIL=alex@summa.ai`

## Health Check

The service includes a health check endpoint at `/health` that Render will use to monitor your service.

## Cognee Memory Layer

If you want persistent memory across deployments:
1. Set `COGNEE_API_KEY` to use Cognee Cloud
2. Set `QDRANT_API_KEY` and `QDRANT_CLUSTER_ENDPOINT` to use Qdrant Cloud or another remote cluster
3. Or configure external vector/graph databases for self-hosted Cognee

## Database Options

### SQLite (Default)
- Uses `sqlite:///./db/custom.db`
- Data persists with Render's disk storage
- Good for development and small production loads

### PostgreSQL (Recommended for Production)
1. Add a PostgreSQL database in Render
2. Update `DATABASE_URL` to the provided PostgreSQL connection string
3. Install additional dependencies if needed

## Monitoring

- Health endpoint: `https://your-service.onrender.com/health`
- API docs: `https://your-service.onrender.com/docs`
- Logs available in Render dashboard

## SSL/HTTPS

Render automatically provides SSL certificates. Your API will be available at:
`https://your-service-name.onrender.com`

## Deployment Process

1. Push changes to your main branch
2. Render automatically builds and deploys
3. Monitor deployment in Render dashboard
4. Check health endpoint after deployment

## Troubleshooting

- Check logs in Render dashboard for errors
- Verify all required environment variables are set
- Ensure frontend CORS origins include your production domain
- Test health endpoint: `curl https://your-service.onrender.com/health`
