# Generated for booking-level expenses.

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0002_booking_is_deleted"),
    ]

    operations = [
        migrations.CreateModel(
            name="BookingExpense",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=150)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("note", models.TextField(blank=True, null=True)),
                ("spent_at", models.DateField(default=datetime.date.today)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="expenses",
                        to="bookings.booking",
                    ),
                ),
            ],
        ),
    ]
