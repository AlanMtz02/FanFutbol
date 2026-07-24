from fastapi import FastAPI
from routes.auth import auth_router
from routes.torneos import torneos_router
from models.usuario import Usuario
from models.equipo import Equipo
from models.jornada import Jornada
from models.partido import Partido
from models.torneo import Torneo
from models.torneoequipo import TorneoEquipo
from config.db import engine,Base
from fastapi.middleware.cors import CORSMiddleware

# Crear las tablas automáticamente en MySQL al iniciar
Base.metadata.create_all(bind=engine)

#Instanciar Fastapi
app = FastAPI(
    title="FanFutbol API",
    description="API RESTful para la gestión de ligas de fútbol amateur",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción se especifica el dominio exacto del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Incluir routers
app.include_router(auth_router)
app.include_router(torneos_router)

@app.get('/')
def Bienvenida():
    return {
        'mensaje':'Bienvenido a la API de FanFutbol'
    }
