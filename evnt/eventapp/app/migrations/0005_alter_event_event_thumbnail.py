# Generated by Django 4.2 on 2024-09-09 16:35

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0004_alter_event_event_thumbnail"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="Event_Thumbnail",
            field=models.ImageField(
                blank=True, default="def2.webp", null=True, upload_to="EventPhotos/"
            ),
        ),
    ]
