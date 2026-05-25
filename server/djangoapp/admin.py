from django.contrib import admin
from .models import CarMake, CarModel


# Register your models here.

# CarModelInline class
class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 0
    fields = ('name', 'type', 'year', 'dealer_id')

# CarModelAdmin class
@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'car_make', 'type', 'year', 'dealer_id')
    list_filter = ('car_make', 'type', 'year')
    search_fields = ('name', 'car_make__name')
    ordering = ('car_make__name', 'name', 'year')

# CarMakeAdmin class with CarModelInline
@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    inlines = [CarModelInline]

# Register models here
