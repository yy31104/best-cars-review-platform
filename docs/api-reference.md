# API Reference

This document summarizes the browser-facing Django endpoints, the supporting Express/MongoDB service, and the sentiment analyzer used by Best Cars.

Base URLs for local development:

- Django web app: `http://127.0.0.1:8000`
- Express dealers/reviews service: `http://localhost:3030`
- Sentiment analyzer: `http://localhost:5050`

## Django Auth Endpoints

These endpoints are served by Django under `/djangoapp`.

### Register

`POST /djangoapp/register`

Request:

```json
{
  "userName": "alex",
  "firstName": "Alex",
  "lastName": "Driver",
  "email": "alex@example.com",
  "password": "example-password"
}
```

Success response:

```json
{
  "userName": "alex",
  "status": "Authenticated"
}
```

Possible failure responses include `400` for invalid or missing fields, `405` for non-POST methods, and `409` when the username already exists.

### Login

`POST /djangoapp/login`

Request:

```json
{
  "userName": "alex",
  "password": "example-password"
}
```

Success response:

```json
{
  "userName": "alex",
  "status": "Authenticated"
}
```

Possible failure responses include `400` for invalid or missing data, `401` for invalid credentials, and `405` for non-POST methods.

### Logout

`GET /djangoapp/logout`

Success response:

```json
{
  "userName": ""
}
```

## Django Dealer and Review Proxy Endpoints

Django acts as a browser-facing backend-for-frontend. It proxies dealer and review data to the Express service configured through `backend_url`.

### Get Dealers

`GET /djangoapp/get_dealers`

Success response:

```json
{
  "status": 200,
  "dealers": [
    {
      "id": 29,
      "city": "Austin",
      "state": "TX",
      "address": "Example address",
      "zip": "78701",
      "full_name": "Example Best Cars Dealer"
    }
  ]
}
```

### Get Dealers by State

`GET /djangoapp/get_dealers/<state>`

Example:

```text
GET /djangoapp/get_dealers/TX
```

Response shape matches `GET /djangoapp/get_dealers`.

### Get Dealer Detail

`GET /djangoapp/dealer/<dealer_id>`

Success response:

```json
{
  "status": 200,
  "dealer": [
    {
      "id": 29,
      "city": "Austin",
      "state": "TX",
      "address": "Example address",
      "zip": "78701",
      "full_name": "Example Best Cars Dealer"
    }
  ]
}
```

### Get Dealer Reviews

`GET /djangoapp/reviews/dealer/<dealer_id>`

Django fetches reviews from Express, then adds a `sentiment` field by calling the sentiment analyzer. If the analyzer is unavailable or returns an unexpected value, Django returns `neutral`.

Success response:

```json
{
  "status": 200,
  "reviews": [
    {
      "id": 101,
      "name": "Alex Driver",
      "dealership": 29,
      "review": "Helpful team and clear pricing.",
      "purchase": true,
      "purchase_date": "2024-05-10",
      "car_make": "Toyota",
      "car_model": "Camry",
      "car_year": 2022,
      "sentiment": "positive"
    }
  ]
}
```

### Add Review

`POST /djangoapp/add_review`

Authentication is required through Django session login.

Request:

```json
{
  "name": "Alex Driver",
  "dealership": 29,
  "review": "Helpful team and clear pricing.",
  "purchase": true,
  "purchase_date": "2024-05-10",
  "car_make": "Toyota",
  "car_model": "Camry",
  "car_year": 2022
}
```

Success response:

```json
{
  "status": 200,
  "review": {
    "id": 102,
    "name": "Alex Driver",
    "dealership": 29,
    "review": "Helpful team and clear pricing.",
    "purchase": true,
    "purchase_date": "2024-05-10",
    "car_make": "Toyota",
    "car_model": "Camry",
    "car_year": 2022
  }
}
```

Possible failure responses include `403` when not logged in, `405` for non-POST methods, `400` for invalid JSON, and `500` when the Express service cannot save the review.

## Django Get Cars Endpoint

### Get Car Make/Model Data

`GET /djangoapp/get_cars`

If no `CarModel` records exist yet, Django seeds the car make/model data before responding.

Success response:

```json
{
  "CarModels": [
    {
      "id": 1,
      "CarModel": "Camry",
      "CarMake": "Toyota",
      "year": 2022,
      "type": "Sedan",
      "dealer_id": 29
    }
  ]
}
```

## Express/MongoDB Endpoints

The Express service lives in `server/database` and listens on port `3030` locally.

### Service Home

`GET /`

Response:

```text
Welcome to the Mongoose API
```

### Fetch Reviews

`GET /fetchReviews`

Returns all review documents.

### Fetch Reviews by Dealer

`GET /fetchReviews/dealer/:id`

Example response:

```json
[
  {
    "id": 101,
    "name": "Alex Driver",
    "dealership": 29,
    "review": "Helpful team and clear pricing.",
    "purchase": true,
    "purchase_date": "2024-05-10",
    "car_make": "Toyota",
    "car_model": "Camry",
    "car_year": 2022
  }
]
```

### Fetch Dealers

`GET /fetchDealers`

Returns all dealer documents.

### Fetch Dealers by State

`GET /fetchDealers/:state`

The service matches either `state` or `st` fields case-insensitively.

### Fetch Dealer by ID

`GET /fetchDealer/:id`

Returns dealer documents matching the numeric dealer `id`.

### Insert Review

`POST /insert_review`

The Django proxy posts the same review payload it receives, plus a Django `user_id`. The Express service assigns the next review id and persists the record in MongoDB.

Request:

```json
{
  "name": "Alex Driver",
  "dealership": 29,
  "review": "Helpful team and clear pricing.",
  "purchase": true,
  "purchase_date": "2024-05-10",
  "car_make": "Toyota",
  "car_model": "Camry",
  "car_year": 2022,
  "user_id": 1
}
```

Success response is the saved MongoDB review document.

## Sentiment Analyzer Endpoint

The sentiment analyzer is a Flask service using NLTK VADER.

### Analyze Text

`GET /analyze/<input_txt>`

Example:

```text
GET /analyze/Helpful%20team%20and%20clear%20pricing.
```

Success response:

```json
{
  "sentiment": "positive"
}
```

Expected values are `positive`, `neutral`, or `negative`.

## Configuration

Django reads service URLs from `server/djangoapp/.env`:

```text
backend_url=http://localhost:3030
sentiment_analyzer_url=http://localhost:5050
```

If those variables are absent, the code falls back to the same localhost defaults.
