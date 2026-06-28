# bookings/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from datetime import date
from rest_framework import status
from collections import defaultdict
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from django.db.models.functions import Coalesce
from rest_framework.views import APIView
from .models import *
from vendors.models import Vendor
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied 
from django.db import transaction
from .serializers import *


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            booking = serializer.save()

            return Response({
                "message": "Booking created successfully",
                "booking_id": booking.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class VendorBookingListView(ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor = self.request.user.vendor_profile
        filter_type = self.request.query_params.get("type")

        qs = Booking.objects.filter(
            vendor=vendor,
            is_deleted=False
        ).prefetch_related("dates", "payments", "expenses")

        today = date.today()

        if filter_type == "today":
            qs = qs.filter(dates__event_date=today)
        elif filter_type == "upcoming":
            qs = qs.filter(dates__event_date__gt=today)
        elif filter_type == "past":
            qs = qs.filter(dates__event_date__lt=today)

        
        return qs.distinct().order_by("-created_at")


class VendorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = request.user.vendor_profile
        today = date.today()

        try:
            year = int(request.query_params.get("year", today.year))
        except (TypeError, ValueError):
            year = today.year

        try:
            month = int(request.query_params.get("month", today.month))
        except (TypeError, ValueError):
            month = today.month

        month = min(max(month, 1), 12)

        bookings = Booking.objects.filter(
            vendor=vendor,
            is_deleted=False,
        ).prefetch_related("dates", "payments", "expenses").order_by("-created_at")

        def amount(value):
            return float(value or 0)

        def primary_date(booking):
            event_dates = [booking_date.event_date for booking_date in booking.dates.all()]
            if event_dates:
                return min(event_dates)
            return booking.created_at.date()

        totals = {
            "bookings": 0,
            "revenue": 0,
            "received": 0,
            "expenses": 0,
            "profit": 0,
            "pending_balance": 0,
            "today": 0,
            "upcoming": 0,
            "past": 0,
        }

        current_month = {
            "bookings": 0,
            "revenue": 0,
            "received": 0,
            "expenses": 0,
            "profit": 0,
            "pending_balance": 0,
        }

        monthly = {
            m: {
                "month": m,
                "bookings": 0,
                "revenue": 0,
                "received": 0,
                "expenses": 0,
                "profit": 0,
                "pending_balance": 0,
            }
            for m in range(1, 13)
        }

        for booking in bookings:
            booking_date = primary_date(booking)
            booking_values = {
                "revenue": amount(booking.total_amount),
                "received": amount(booking.total_paid),
                "expenses": amount(booking.total_expense),
                "profit": amount(booking.profit_amount),
                "pending_balance": amount(booking.balance_amount),
            }

            totals["bookings"] += 1
            for key, value in booking_values.items():
                totals[key] += value

            if booking.event_status == "TODAY":
                totals["today"] += 1
            elif booking.event_status == "UPCOMING":
                totals["upcoming"] += 1
            elif booking.event_status == "PAST":
                totals["past"] += 1

            if booking_date.year == year:
                month_data = monthly[booking_date.month]
                month_data["bookings"] += 1
                for key, value in booking_values.items():
                    month_data[key] += value

            if booking_date.year == year and booking_date.month == month:
                current_month["bookings"] += 1
                for key, value in booking_values.items():
                    current_month[key] += value

        recent = BookingListSerializer(bookings[:5], many=True).data

        return Response({
            "year": year,
            "month": month,
            "totals": totals,
            "current_month": current_month,
            "monthly": list(monthly.values()),
            "recent_bookings": recent,
        })
    
class AddPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        vendor = request.user.vendor_profile
        booking = get_object_or_404(Booking, pk=pk, vendor=vendor)

        serializer = AddPaymentSerializer(
            data=request.data,
            context={"booking": booking}
        )

        if serializer.is_valid():
            Payment.objects.create(
                booking=booking,
                amount=serializer.validated_data["amount"]
            )

            return Response({"message": "Payment added successfully"})

        return Response(serializer.errors, status=400)
    
class AddExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        vendor = request.user.vendor_profile
        booking = get_object_or_404(Booking, pk=pk, vendor=vendor)

        serializer = AddExpenseSerializer(data=request.data)

        if serializer.is_valid():
            expense = serializer.save(booking=booking)
            return Response({
                "message": "Expense added successfully",
                "expense": BookingExpenseSerializer(expense).data,
                "total_expense": booking.total_expense,
                "profit_amount": booking.profit_amount,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)

class BookingUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        vendor = request.user.vendor_profile
        booking = get_object_or_404(Booking, pk=pk, vendor=vendor)

        serializer = BookingUpdateSerializer(booking, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Booking updated successfully"})

        return Response(serializer.errors, status=400)
    

class BookingDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        vendor = request.user.vendor_profile
        booking = get_object_or_404(Booking, pk=pk, vendor=vendor)

        booking.is_deleted = True
        booking.save()

        return Response({"message": "Booking deleted"})
    
class BookingCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = request.user.vendor_profile

        bookings = Booking.objects.filter(
            vendor=vendor,
            is_deleted=False
        ).prefetch_related("dates__slots", "payments", "expenses")

        calendar = defaultdict(list)

        for booking in bookings:
            for b_date in booking.dates.all():
                calendar[str(b_date.event_date)].append({
                    "booking_id": booking.id,
                    "customer_name": booking.customer_name,
                    "phone_number": booking.phone_number,

                    # financial info
                    "total_amount": float(booking.total_amount),
                    "paid_amount": float(booking.total_paid),
                    "balance_amount": float(booking.balance_amount),
                    "expense_amount": float(booking.total_expense),
                    "profit_amount": float(booking.profit_amount),
                    "payment_status": booking.payment_status,

                    # event info
                    "event_status": booking.event_status,

                    # slots
                    "slots": [
                        {
                            "start_time": slot.start_time,
                            "end_time": slot.end_time
                        }
                        for slot in b_date.slots.all()
                    ]
                })

        return Response(calendar)
