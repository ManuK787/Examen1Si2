from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from propiedades.models import Unidad

class Vehiculo(models.Model):
    class Estados(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'

    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, db_column='usuario_id', related_name='vehiculos')
    unidad = models.ForeignKey(Unidad, on_delete=models.SET_NULL, null=True, db_column='unidad_id', related_name='vehiculos')
    placa = models.CharField(max_length=20, unique=True)
    marca = models.CharField(max_length=60, null=True, blank=True)
    modelo = models.CharField(max_length=60, null=True, blank=True)
    color = models.CharField(max_length=40, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estados.choices, default=Estados.ACTIVO)

    creado_en = models.DateTimeField(default=timezone.now)
    actualizado_en = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'vehiculos'

    def save(self, *args, **kwargs):
        self.actualizado_en = timezone.now()
        super().save(*args, **kwargs)
