from .models import CarMake, CarModel


CAR_DATA = [
    {
        "make": "Nissan",
        "description": "Japanese automaker known for dependable sedans, SUVs, and crossovers.",
        "models": [
            ("Pathfinder", CarModel.SUV, 2022, 1),
            ("Qashqai", CarModel.SUV, 2021, 1),
            ("XTRAIL", CarModel.SUV, 2020, 1),
        ],
    },
    {
        "make": "Mercedes",
        "description": "Premium vehicle brand offering luxury sedans and performance models.",
        "models": [
            ("A-Class", CarModel.HATCHBACK, 2022, 2),
            ("C-Class", CarModel.SEDAN, 2021, 2),
            ("E-Class", CarModel.SEDAN, 2020, 2),
        ],
    },
    {
        "make": "Audi",
        "description": "German brand recognized for refined interiors and quattro-inspired engineering.",
        "models": [
            ("A4", CarModel.SEDAN, 2022, 3),
            ("A5", CarModel.COUPE, 2021, 3),
            ("A6", CarModel.SEDAN, 2020, 3),
        ],
    },
    {
        "make": "Kia",
        "description": "Automaker offering practical cars, SUVs, and family-focused vehicles.",
        "models": [
            ("Sorento", CarModel.SUV, 2022, 4),
            ("Carnival", CarModel.MINIVAN, 2021, 4),
            ("Cerato", CarModel.SEDAN, 2020, 4),
        ],
    },
    {
        "make": "Toyota",
        "description": "Global automaker known for reliability, efficiency, and broad model coverage.",
        "models": [
            ("Corolla", CarModel.SEDAN, 2022, 5),
            ("Camry", CarModel.SEDAN, 2021, 5),
            ("Kluger", CarModel.SUV, 2020, 5),
        ],
    },
]


def initiate():
    for make_data in CAR_DATA:
        car_make, _ = CarMake.objects.update_or_create(
            name=make_data["make"],
            defaults={"description": make_data["description"]},
        )
        for name, car_type, year, dealer_id in make_data["models"]:
            CarModel.objects.update_or_create(
                car_make=car_make,
                name=name,
                year=year,
                defaults={"type": car_type, "dealer_id": dealer_id},
            )
