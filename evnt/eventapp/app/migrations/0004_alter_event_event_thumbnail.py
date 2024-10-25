# Generated by Django 4.2 on 2024-09-09 16:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0003_delete_table"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="Event_Thumbnail",
            field=models.ImageField(
                blank=True,
                default="static/def2.webp",
                null=True,
                upload_to="EventPhotos/",
            ),
        ),
    ]
