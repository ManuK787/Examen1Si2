from django.db import models
from django.utils import timezone

class Propiedad(models.Model):
    class Tipo(models.TextChoices):
        EDIFICIO = 'edificio', 'Edificio'
        CONDOMINIO = 'condominio', 'Condominio'
        COMPLEJO = 'complejo', 'Complejo'
        OTRO = 'otro', 'Otro'

    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=120)
    direccion = models.TextField(null=True, blank=True)
    ciudad = models.CharField(max_length=80, null=True, blank=True)
    estado = models.CharField(max_length=80, null=True, blank=True)
    pais = models.CharField(max_length=80, null=True, blank=True)
    tipo = models.CharField(max_length=30, choices=Tipo.choices, null=True, blank=True)

    creado_en = models.DateTimeField(default=timezone.now)
    actualizado_en = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'propiedades'

    def save(self, *args, **kwargs):
        self.actualizado_en = timezone.now()
        super().save(*args, **kwargs)

class Unidad(models.Model):
    class Estados(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'

    id = models.BigAutoField(primary_key=True)
    propiedad = models.ForeignKey(Propiedad, on_delete=models.CASCADE, db_column='propiedad_id', related_name='unidades')
    codigo = models.CharField(max_length=50)
    nivel = models.CharField(max_length=30, null=True, blank=True)
    metros_cuadrados = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dormitorios = models.IntegerField(null=True, blank=True)
    banos = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estados.choices, default=Estados.ACTIVO)

    creado_en = models.DateTimeField(default=timezone.now)
    actualizado_en = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'unidades'
        constraints = [
            models.UniqueConstraint(fields=['propiedad', 'codigo'], name='uniq_propiedad_codigo')
        ]

    def save(self, *args, **kwargs):
        self.actualizado_en = timezone.now()
        super().save(*args, **kwargs)
