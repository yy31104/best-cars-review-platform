# Best Cars Dealership Review Platform

Best Cars is a full-stack dealership review platform built for the IBM Full Stack Developer Capstone. It lets customers browse dealerships, review dealer details, register or log in with Django session authentication, submit dealership reviews, and see sentiment analysis applied to review text.

The project keeps the original course template structure while completing the major capstone modules across Django, React, Express, MongoDB, Docker, Kubernetes, and GitHub Actions.

## Business Overview

Best Cars helps car shoppers make better dealership decisions before visiting a showroom. Customers can compare dealers by state, inspect dealer-specific reviews, and contribute their own purchase or service experiences. The platform is designed for a dealership group that wants a customer-facing review portal backed by reusable backend services.

## Implemented Features

- Static Django-rendered Home, About, and Contact pages.
- Django session authentication for login, logout, and registration.
- React pages for Register, Login, Dealers, Dealer detail, and Post Review.
- Dealer list filtering by state.
- Dealer detail pages with review display.
- Authenticated review submission flow.
- Express and MongoDB service for dealer and review data.
- Django proxy services that connect the React-facing Django app to the Express/MongoDB backend.
- CarMake and CarModel Django models with useful Django admin registration.
- Seed data support for car makes and models.
- Sentiment analyzer integration for dealership reviews, with a neutral fallback when the analyzer service is unavailable.
- Dockerfile and entrypoint for the Django application container.
- Kubernetes deployment manifest for the dealership app.
- GitHub Actions CI workflow with Backend, Frontend, and Docker image jobs.
- Submission evidence folder for screenshots, URLs, and grader artifacts.

## Architecture Summary

The application is split into several course-compatible services and folders:

- `server/djangoproj` contains Django settings, WSGI setup, and top-level URL routing.
- `server/djangoapp` contains Django models, admin setup, views, URL routes, proxy helpers, and seed data logic.
- `server/frontend/static` contains the static Home, About, Contact, CSS, and image assets served by Django.
- `server/frontend/src` contains the React application used for login, registration, dealer browsing, dealer details, and review submission.
- `server/database` contains the Express API and MongoDB-backed dealer/review service.
- `server/Dockerfile`, `server/entrypoint.sh`, and `server/deployment.yaml` provide container and Kubernetes deployment artifacts.
- `.github/workflows/main.yml` runs CI checks for the Django backend, React frontend, and Docker image build.

At runtime, Django serves the main web application and session-authenticated endpoints. React handles the dynamic dealership pages. Django proxy views call the Express service for dealer and review data, and the Express service reads and writes MongoDB collections. Review sentiment is requested from the sentiment analyzer service configured in `server/djangoapp/.env`.

## Tech Stack

- Python and Django
- Django authentication and session middleware
- SQLite for local Django development
- React and Create React App
- Bootstrap-based UI styling
- Node.js and Express
- MongoDB with Mongoose
- Docker and Docker Compose
- Kubernetes deployment YAML
- Gunicorn for containerized Django serving
- GitHub Actions for CI

## Local Run Instructions

These commands assume a Windows PowerShell environment from the repository root.

Build the React frontend first so Django can serve the compiled app:

```powershell
cd server/frontend
npm install
npm run build
```

Run the Django application:

```powershell
cd ..
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open the Django app at:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/about`
- `http://127.0.0.1:8000/contact`
- `http://127.0.0.1:8000/login`
- `http://127.0.0.1:8000/register`
- `http://127.0.0.1:8000/dealers`

Run the Express and MongoDB service:

```powershell
cd server/database
npm install
docker build -t nodeapp .
docker compose up -d
```

The Django proxy configuration expects these local service URLs in `server/djangoapp/.env`:

- `backend_url=http://localhost:3030`
- `sentiment_analyzer_url=http://localhost:5050`

If the sentiment analyzer is not running, review pages should still load and use the neutral fallback.

## Docker and Kubernetes Notes

The Django container artifacts are located in `server/`:

- `Dockerfile` installs Python dependencies, copies the Django server files, exposes port `8000`, and starts Gunicorn.
- `entrypoint.sh` runs migrations and `collectstatic` before starting the container command.
- `deployment.yaml` defines a Kubernetes Deployment and NodePort Service for the `dealership` app.

Build the Django image from the repository root:

```powershell
docker build -t dealership ./server
```

Run it locally:

```powershell
docker run --rm -p 8001:8000 dealership
```

The Kubernetes manifest uses the placeholder image `us.icr.io/YOUR_NAMESPACE/dealership:latest`. Replace `YOUR_NAMESPACE` with the correct IBM Cloud Container Registry namespace before applying it to a cluster.

The current `submission/deploymentURL` file points to `http://127.0.0.1:8002/`, so this repository documents container and Kubernetes readiness without claiming a public cloud deployment URL.

## CI Notes

The GitHub Actions workflow is defined at `.github/workflows/main.yml` and is named `CI`.

It runs on pushes to `main`, pull requests targeting `main`, and manual `workflow_dispatch` triggers. The workflow includes:

- Backend job: installs Python dependencies, runs focused flake8 syntax/undefined-name checks, runs `python manage.py check`, and applies migrations.
- Frontend job: installs React dependencies and runs the production build with `CI=false` to avoid treating warnings as fatal Create React App failures.
- Docker image job: rebuilds the React frontend first, then builds the Django Docker image from `server/`.

The workflow does not push images, deploy to Kubernetes, or require IBM Cloud credentials.

## Submission Artifact Notes

The `submission/` folder contains capstone evidence such as screenshots, API output captures, CI evidence, deployment URL notes, and grader-facing artifacts. Keep these files aligned with the final state of the project before submission.

Useful evidence includes:

- Landing page, About, Contact, Login, Register, Dealers, Dealer detail, and Post Review screenshots.
- Django admin login/logout and CarMake/CarModel admin screenshots.
- Dealer API, dealer-by-state API, dealer-by-id API, dealer reviews API, login, logout, and add-review evidence.
- Sentiment analyzer evidence.
- GitHub Actions CI screenshot.
- Deployment URL note.

If `submission/deploymentURL` still contains a localhost URL, treat it as local deployment evidence rather than a public cloud deployment claim.

## Portfolio Polish Note

The project is complete enough to demonstrate the capstone architecture and user flows. Future portfolio improvements could include a short architecture diagram, more robust form validation, pagination for large dealer/review lists, production environment hardening, and polished public deployment documentation once a real cloud URL is available.
