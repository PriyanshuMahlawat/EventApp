# Generated by Django 4.2 on 2024-10-13 16:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0012_remove_finalslotstable_excel_file_path_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="finalslotstable",
            name="excel_file",
            field=models.FileField(blank=True, null=True, upload_to="finaltable/"),
        ),
    ]
