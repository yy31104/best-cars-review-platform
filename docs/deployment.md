# Deployment Notes

This project includes local, Docker, Kubernetes, and IBM Code Engine-oriented deployment artifacts. It does not currently claim a public production web app URL.

## Local Development

Recommended local shape:

1. Build the React frontend.
2. Start the Express/MongoDB service.
3. Configure Django service URLs.
4. Run Django.
5. Optionally run the sentiment analyzer locally.

Build React:

```powershell
cd server/frontend
npm install
npm run build
```

Prepare Django:

```powershell
cd ..
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
```

Run Django:

```powershell
python manage.py runserver
```

Local app URL:

```text
http://127.0.0.1:8000/
```

## Docker Compose for Express/Mongo

The Express/MongoDB stack lives in `server/database`.

Build the Node image:

```powershell
cd server/database
docker build -t nodeapp .
```

Start MongoDB and Express:

```powershell
docker compose up -d
```

The compose file starts:

- `mongo_db` from `mongo:latest`, exposed on port `27017`.
- `api` from the locally built `nodeapp` image, exposed on port `3030`.

The Express app connects to MongoDB at:

```text
mongodb://mongo_db:27017/
```

The service seeds dealership and review documents from bundled JSON files when it starts.

## Django Dockerfile

The Django Dockerfile is `server/Dockerfile`.

It:

- Uses `python:3.12.0-slim-bookworm`.
- Installs `server/requirements.txt`.
- Copies the Django server files.
- Exposes port `8000`.
- Runs `server/entrypoint.sh`.
- Starts Gunicorn with `djangoproj.wsgi`.

Build from the repository root:

```powershell
docker build -t dealership ./server
```

Run locally:

```powershell
docker run --rm -p 8001:8000 dealership
```

For a fully connected local Docker deployment, make sure the Django container can reach the Express service and sentiment analyzer by network-visible hostnames, not just `localhost` inside the container.

## Kubernetes `deployment.yaml`

The Kubernetes manifest is `server/deployment.yaml`.

It defines:

- `Deployment` named `dealership`
- One replica
- Container port `8000`
- Image placeholder `us.icr.io/YOUR_NAMESPACE/dealership:latest`
- `NodePort` Service exposing port `8000`

Before applying:

1. Build and push the Django image to a registry accessible by the cluster.
2. Replace `YOUR_NAMESPACE` with the real IBM Cloud Container Registry namespace.
3. Configure environment variables or mounted configuration for service URLs.
4. Confirm Django `ALLOWED_HOSTS`, static file handling, and public hostnames for the target environment.

Apply:

```powershell
kubectl apply -f server/deployment.yaml
```

## IBM Code Engine Sentiment Analyzer Deployment

The sentiment analyzer source is in `server/djangoapp/microservices/app.py`. It is a Flask app with a route:

```text
GET /analyze/<input_txt>
```

The project is structured so this service can be deployed separately on IBM Code Engine, then referenced from Django through `sentiment_analyzer_url`.

High-level deployment flow:

1. Package the Flask microservice with its Python dependencies.
2. Build and push a container image.
3. Create or update an IBM Code Engine application.
4. Confirm the public or internal Code Engine URL.
5. Set Django `sentiment_analyzer_url` to that URL.

Example target value:

```text
sentiment_analyzer_url=https://best-cars-sentiment.example.appdomain.cloud
```

## Environment Variables

Django reads these values from `server/djangoapp/.env` through `python-dotenv`:

```text
backend_url=http://localhost:3030
sentiment_analyzer_url=http://localhost:5050
```

Meanings:

- `backend_url`: Base URL for the Express dealers/reviews service.
- `sentiment_analyzer_url`: Base URL for the Flask sentiment analyzer service.

If not provided, Django falls back to:

```text
backend_url=http://localhost:3030
sentiment_analyzer_url=http://localhost:5050
```

For containers or Kubernetes, `localhost` means the current container/pod, so these values should usually point to service DNS names or cloud URLs.

## GitHub Actions CI

The workflow at `.github/workflows/main.yml` validates:

- Backend Python dependency installation, focused flake8 checks, Django system checks, and migrations.
- Frontend dependency installation and production build.
- Docker image build for the Django app after rebuilding React.

The workflow does not currently publish images or deploy to Kubernetes.

## Known Deployment Caveat

The public web app deployment may require cloud-specific URL/host configuration. In particular, Django `ALLOWED_HOSTS`, service URLs, container networking, static asset serving, CORS, and secrets should be reviewed before exposing the app publicly.

Before real production deployment, rotate `SECRET_KEY`, set `DEBUG=False`, configure `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`, and manage secrets through environment variables or a secret manager.
