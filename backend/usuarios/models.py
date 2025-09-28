from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from roles.models import Rol

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        from roles.models import Rol

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('estado', 'activo')

        # asignar rol por defecto si no viene
        if 'rol' not in extra_fields or extra_fields['rol'] is None:
            rol_admin, _ = Rol.objects.get_or_create(nombre="Administrador")
            extra_fields['rol'] = rol_admin

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    class Estados(models.TextChoices):
        ACTIVO = 'activo'
        INACTIVO = 'inactivo'
        SUSPENDIDO = 'suspendido'

    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=80)
    apellido = models.CharField(max_length=80)
    email = models.EmailField(max_length=120, unique=True)
    telefono = models.CharField(max_length=40, null=True, blank=True)

    password = models.CharField(max_length=255, db_column='password_hash')

    estado = models.CharField(max_length=20, choices=Estados.choices, default=Estados.ACTIVO)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, db_column='rol_id', related_name='usuarios')

    last_login = models.DateTimeField(null=True, blank=True, db_column='ultimo_login')
    creado_en = models.DateTimeField(default=timezone.now)
    actualizado_en = models.DateTimeField(default=timezone.now)

    # requeridos por Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # is_superuser lo aporta PermissionsMixin
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    objects = UsuarioManager()

    class Meta:
        db_table = 'usuarios'

    def save(self, *args, **kwargs):
        self.email = (self.email or '').lower()
        self.actualizado_en = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
