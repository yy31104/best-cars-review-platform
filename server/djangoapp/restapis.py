# Uncomment the imports below before you add the function code
import json
import os
from pathlib import Path
from urllib.parse import quote, urljoin

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050")


def _url(base_url, endpoint):
    return urljoin(base_url.rstrip('/') + '/', endpoint.lstrip('/'))


def get_request(endpoint, **kwargs):
    try:
        formatted_endpoint = endpoint.format(
            **{
                key: quote(str(value), safe='')
                for key, value in kwargs.items()
            }
        )
    except KeyError:
        formatted_endpoint = endpoint

    query_params = {
        key: value
        for key, value in kwargs.items()
        if f"{{{key}}}" not in endpoint
    }

    try:
        response = requests.get(
            _url(backend_url, formatted_endpoint),
            params=query_params or None,
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError) as error:
        print(f"GET request failed for {endpoint}: {error}")
        return []


def analyze_review_sentiments(text):
    if not text:
        return "neutral"

    try:
        response = requests.get(
            _url(sentiment_analyzer_url, f"analyze/{quote(text, safe='')}"),
            timeout=5,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as error:
        print(f"Sentiment analysis failed: {error}")
        return "neutral"

    if isinstance(payload, dict):
        sentiment = (
            payload.get("sentiment")
            or payload.get("prediction")
            or payload.get("label")
        )
    else:
        sentiment = payload

    sentiment = str(sentiment).lower()
    if sentiment in ["positive", "negative", "neutral"]:
        return sentiment
    return "neutral"


def post_review(data_dict):
    try:
        response = requests.post(
            _url(backend_url, "insert_review"),
            data=json.dumps(data_dict),
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError) as error:
        print(f"POST review failed: {error}")
        return {}
