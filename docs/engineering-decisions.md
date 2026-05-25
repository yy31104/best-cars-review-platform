# Engineering Decisions

This document explains the main architectural choices in the Best Cars Dealership Review Platform and what would change in a production version.

## Django as Web App and Proxy/BFF

Django serves as both the primary web application and a backend-for-frontend layer.

Reasons:

- The capstone structure already centered Django as the browser-facing application.
- Django provides built-in user management, session authentication, admin tooling, static file serving, and URL routing.
- React can call one stable same-origin API namespace under `/djangoapp` instead of calling multiple services directly.
- The proxy layer centralizes service URL configuration, timeout handling, and fallback behavior.

Tradeoff:

- Django becomes responsible for forwarding dealer/review traffic, so service health and latency must be considered in the Django request path.

## Express and MongoDB for Dealers and Reviews

Dealers and reviews are stored in MongoDB behind a Node/Express service.

Reasons:

- Dealership and review documents map naturally to JSON-style records.
- The Express service can seed and expose dealer/review data independently from the Django app.
- Separating dealer/review data from Django auth data demonstrates a service-oriented architecture.
- MongoDB is a practical fit for flexible review records and course-provided dealership datasets.

Tradeoff:

- Running the full app locally requires both Django and the Express/MongoDB service.

## SQLite for Django Users and Car Make/Model Data

SQLite stores Django-managed data: users, sessions, and car make/model reference data.

Reasons:

- SQLite is simple for local development and portfolio review.
- Django auth/session tables work out of the box.
- Car make/model reference data is relational and fits Django models well.
- The database requires no external server for the Django app to boot locally.

Tradeoff:

- A public production deployment should move Django data to a managed relational database such as PostgreSQL.

## Sentiment Analysis as a Separate Microservice

Sentiment analysis is isolated in a Flask service.

Reasons:

- The analyzer has different dependencies and scaling characteristics than the web app.
- It can be deployed independently to IBM Code Engine.
- Django can fail gracefully to `neutral` sentiment if the analyzer is unavailable.
- The boundary keeps AI inference concerns out of the core dealer/review service.

Tradeoff:

- Review pages depend on an additional network call for enriched sentiment values.

## Session Authentication Was Kept

Django session authentication remains the app's auth strategy.

Reasons:

- It fits Django's built-in auth system and course constraints.
- It is straightforward for server-rendered pages and the same-origin React build.
- It keeps login/logout behavior easy to understand for local demos.
- The React frontend only needs to store display state such as the username in `sessionStorage`.

Tradeoff:

- A production API consumed by multiple clients might use token-based auth or OAuth/OIDC.

## GitHub Actions Jobs: Backend, Frontend, Docker

CI is split into three jobs:

- **Backend** validates Python dependencies, syntax-focused lint, Django checks, and migrations.
- **Frontend** validates Node dependencies and the React production build.
- **Docker image** validates that the deployable Django image can be built after compiling React.

Reasons:

- Each job maps to a clear engineering ownership area.
- Backend and frontend failures are easier to diagnose separately.
- The Docker job waits for app-level checks before validating container packaging.

Tradeoff:

- CI currently validates readiness but does not publish images or deploy automatically.

## Docker and Kubernetes

Docker packages the Django app and the Express service. Docker Compose provides local orchestration for Express and MongoDB. Kubernetes manifests document deployment readiness for the Django app.

Reasons:

- Containers make runtime dependencies explicit.
- Docker Compose keeps the local dealer/review service easy to start.
- Kubernetes artifacts show how the app can be promoted beyond local development.
- The structure aligns with IBM Cloud and Code Engine-style deployment workflows.

Tradeoff:

- The current Kubernetes manifest is intentionally minimal and should be extended before production use.

## Production Improvements

For a production version, the next engineering steps would be:

- Move Django data from SQLite to PostgreSQL.
- Add managed MongoDB or a Kubernetes MongoDB deployment with persistent volumes and backups.
- Configure Django `ALLOWED_HOSTS`, CSRF trusted origins, secure cookies, HTTPS, and secrets management.
- Add environment-driven service URLs to the Kubernetes manifest with ConfigMaps and Secrets.
- Add full Kubernetes manifests for Django, Express, MongoDB, and the sentiment analyzer.
- Add pagination and sorting for dealers and reviews.
- Add integration tests for auth, dealer browsing, review submission, and sentiment fallback.
- Add image publishing and deployment stages to GitHub Actions.
- Add observability: structured logs, health checks, metrics, and error tracking.
- Replace local screenshot evidence with repeatable demo capture steps or visual regression tests.
