from fastapi import APIRouter,HTTPException,Depends
from config.db import get_db
from sqlalchemy.orm import Session
from schemas.torneo import CrearTorneoSchema,TorneoFinalizarSchema,TorneoOutSchema,ResumenDashboardOutSchema
from utils.seguridad import obtener_usuario_actual
from models.torneo import Torneo
from models.equipo import Equipo
from datetime import datetime,timezone
from services.calendario import generar_calendario_round_robin
from sqlalchemy import func
from models.torneoequipo import TorneoEquipo
torneos_router=APIRouter(prefix='/api/torneos',tags=['Torneos'])

#PIDE TOKEN
@torneos_router.post('',response_model=TorneoOutSchema)
def crear_torneo(datos:CrearTorneoSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Crea un nuevo torneo.
    Por defecto entra en estado 'registro' y fase 'regular'.
    """
    nuevo_torneo=Torneo(
        nombre=datos.nombre,
        fecha_inicio=datos.fecha_inicio,
        hora_inicio=datos.hora_inicio,
        numero_canchas=datos.numero_canchas,
        admin_id=usuario_actual["id"]
    )
    
    db.add(nuevo_torneo)
    db.commit()
    db.refresh(nuevo_torneo)
    return nuevo_torneo

@torneos_router.get('',response_model=list[TorneoOutSchema])
def listar_torneos(db:Session=Depends(get_db)):
    """Ruta Pública: Lista todos los torneos registrados en el sistema."""
    torneos = db.query(Torneo).order_by(Torneo.creado_en.desc()).all()
    resultado = []
    for t in torneos:
        nombre_campeon = None
        if t.equipo_campeon_id:
            equipo = db.query(Equipo).filter(
                Equipo.id == t.equipo_campeon_id).first()
            if equipo:
                nombre_campeon = equipo.nombre
        resultado.append({
            **vars(t),
            "nombre_campeon": nombre_campeon
        })
    return resultado
    
    
@torneos_router.get('/{id}',response_model=TorneoOutSchema)
def obtener_torneo(id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Retorna la información detallada de un torneo por su ID.
    """
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail='Torneo no encontrado.')

    nombre_campeon = None
    if torneo.equipo_campeon_id:
        equipo = db.query(Equipo).filter(
            Equipo.id == torneo.equipo_campeon_id).first()
        if equipo:
            nombre_campeon = equipo.nombre

    return {**vars(torneo), "nombre_campeon": nombre_campeon}

# REQUIERE TOKEN
@torneos_router.patch('/{id}/finalizar', response_model=TorneoOutSchema)
def finalizar_torneo(
    id: int,
    datos: TorneoFinalizarSchema,
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """
    Ruta Privada (Admin): Cambia el estado del torneo a 'finalizado'
    y asigna el ID del equipo campeón para el Palmarés.
    """
    # Validar que exista el torneo
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail='Torneo no encontrado.')

    # Validar que exista el equipo campeón
    equipo_existe = db.query(Equipo).filter(
        Equipo.id == datos.equipo_campeon_id).first()
    if not equipo_existe:
        raise HTTPException(
            status_code=404, detail='El equipo a asignar campeón no existe.')

    # Actualizar estado, equipo campeón y fecha de finalización
    torneo.estado = 'finalizado'
    torneo.equipo_campeon_id = datos.equipo_campeon_id
    torneo.fecha_fin = datetime.now(timezone.utc)

    db.commit()
    db.refresh(torneo)

    # Resolver nombre del campeón
    nombre_campeon = equipo_existe.nombre if equipo_existe else None

    # Devolver torneo con campo extra
    return {**vars(torneo), "nombre_campeon": nombre_campeon}

#Generar el calendario
#Requiere token
@torneos_router.post('/{id}/generar-calendario')
def generar_calendario_endpoint(id:int,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Aplica el algoritmo Round Robin, genera las jornadas y 
    partidos correspondientes, y pasa el torneo a estado 'en_curso'.
    """
    resultado=generar_calendario_round_robin(id,db)
    return resultado #Diccionario con un mensaje de exito

#Requiere token
@torneos_router.get('/dashboard/resumen', response_model=ResumenDashboardOutSchema)
def obtener_resumen_dashboard(
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """
    Ruta Privada (Admin): Retorna los contadores de la barra superior del Dashboard.
    - Total de Torneos registrados
    - Torneos actualmente 'en_curso'
    - Total de Equipos globales registrados
    """
    total_torneos = db.query(func.count(Torneo.id)).scalar() or 0
    torneos_en_curso = db.query(func.count(Torneo.id)).filter(
        Torneo.estado == 'en_curso').scalar() or 0
    #Cuenta cada equipo una sola vez, aunque esté en varios torneos.
    total_equipos_unicos = db.query(func.count(
        func.distinct(TorneoEquipo.equipo_id))).scalar() or 0

    return {
        "total_torneos": total_torneos,
        "torneos_en_curso": torneos_en_curso,
        "total_equipos": total_equipos_unicos
    }
