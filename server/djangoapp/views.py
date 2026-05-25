# Uncomment the required imports before adding the code

# from django.shortcuts import render
# from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
# from django.shortcuts import get_object_or_404, render, redirect
# from django.contrib.auth import logout
# from django.contrib import messages
# from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .models import CarModel
from .populate import initiate
from .restapis import (
    analyze_review_sentiments,
    get_request,
    post_review,
)


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.


def _json_body(request):
    try:
        data = json.loads(request.body.decode('utf-8') or '{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    if not isinstance(data, dict):
        return None
    return data


# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "Failed",
            "message": "POST request required"
        }, status=405)

    data = _json_body(request)
    if data is None:
        return JsonResponse({
            "status": "Failed",
            "message": "Invalid JSON body"
        }, status=400)

    username = data.get('userName', '').strip()
    password = data.get('password', '')
    if not username or not password:
        return JsonResponse({
            "userName": username,
            "status": "Failed",
            "message": "Username and password are required"
        }, status=400)

    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({
            "userName": username,
            "status": "Failed",
            "message": "Invalid username or password"
        }, status=401)

    # If user is valid, call login method to login current user
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})

# Create a `logout_request` view to handle sign out request
@csrf_exempt
def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})

# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "Failed",
            "message": "POST request required"
        }, status=405)

    data = _json_body(request)
    if data is None:
        return JsonResponse({
            "status": "Failed",
            "message": "Invalid JSON body"
        }, status=400)

    username = data.get('userName', '').strip()
    password = data.get('password', '')
    first_name = data.get('firstName', '').strip()
    last_name = data.get('lastName', '').strip()
    email = data.get('email', '').strip()

    required_fields = {
        "userName": username,
        "password": password,
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
    }
    missing_fields = [
        field for field, value in required_fields.items() if not value
    ]
    if missing_fields:
        return JsonResponse({
            "userName": username,
            "status": "Failed",
            "message": "Missing required fields: " + ", ".join(missing_fields)
        }, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({
            "userName": username,
            "status": "Failed",
            "message": "Username already exists"
        }, status=409)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def get_cars(request):
    if not CarModel.objects.exists():
        initiate()

    car_models = CarModel.objects.select_related('car_make').order_by(
        'car_make__name',
        'name',
        'year',
    )
    cars = [
        {
            "id": car_model.id,
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name,
            "year": car_model.year,
            "type": car_model.type,
            "dealer_id": car_model.dealer_id,
        }
        for car_model in car_models
    ]
    return JsonResponse({"CarModels": cars})


# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
def get_dealerships(request, state="All"):
    endpoint = "fetchDealers"
    if state.lower() != "all":
        endpoint = f"fetchDealers/{state}"

    dealers = get_request(endpoint)
    if not isinstance(dealers, list):
        dealers = []
    return JsonResponse({"status": 200, "dealers": dealers})

# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    reviews = get_request(f"fetchReviews/dealer/{dealer_id}")
    if not isinstance(reviews, list):
        reviews = []

    for review in reviews:
        if isinstance(review, dict):
            review["sentiment"] = analyze_review_sentiments(
                review.get("review", "")
            )
    return JsonResponse({"status": 200, "reviews": reviews})

# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    dealer = get_request(f"fetchDealer/{dealer_id}")
    if isinstance(dealer, dict):
        dealer = [dealer]
    if not isinstance(dealer, list):
        dealer = []
    return JsonResponse({"status": 200, "dealer": dealer})

# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 403,
            "message": "Login required to add a review"
        }, status=403)

    if request.method != "POST":
        return JsonResponse({
            "status": 405,
            "message": "POST request required"
        }, status=405)

    data = _json_body(request)
    if data is None:
        return JsonResponse({
            "status": 400,
            "message": "Invalid JSON body"
        }, status=400)

    user_name = request.user.get_full_name() or request.user.username
    if not data.get("name"):
        data["name"] = user_name
    data["user_id"] = request.user.id

    saved_review = post_review(data)
    if not saved_review:
        return JsonResponse({
            "status": 500,
            "message": "Error posting review"
        }, status=500)

    return JsonResponse({"status": 200, "review": saved_review})
