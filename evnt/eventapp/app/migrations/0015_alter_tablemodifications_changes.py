# Generated by Django 4.2 on 2024-10-15 14:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0014_tablemodifications"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tablemodifications",
            name="changes",
            field=models.CharField(max_length=800, null=True),
        ),
    ]