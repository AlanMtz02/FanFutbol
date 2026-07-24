from fastapi import APIRouter,HTTPException,Depends
from config.db import get_db
from sqlalchemy.orm import Session
from schemas.torneo import CrearTorneoSchema,TorneoFinalizarSchema,TorneoOutSchema
from utils.seguridad import obtener_usuario_actual
from models.torneo import Torneo
from models.equipo import Equipo
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
    torneos=db.query(Torneo).order_by(Torneo.creado_en.desc()).all()#Primero los mas recientes
    return torneos
    
    
@torneos_router.get('/{torneo_id}',response_model=TorneoOutSchema)
def obtener_torneo(torneo_id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Retorna la información detallada de un torneo por su ID.
    """
    #Validar que exista el torneo
    torneo=db.query(Torneo).filter(Torneo.id==torneo_id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='Torneo no encontrado.')
    
    return torneo

#REQUIERE TOKEN
@torneos_router.patch('/{torneo_id}',response_model=TorneoOutSchema)
def finalizar_torneo(torneo_id:int,datos:TorneoFinalizarSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Cambia el estado del torneo a 'finalizado'
    y asigna el ID del equipo campeón para el Palmarés.
    """
    #Validar que exista el torneo que quiere finalizar
    torneo=db.query(Torneo).filter(Torneo.id==torneo_id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='Torneo no encontrado.')
    
    #Validar antes de que exista el equipo antes de asignarlo como campeon
    equipo_existe=db.query(Equipo).filter(Equipo.id==datos.equipo_campeon_id).first()
    if not equipo_existe:
        raise HTTPException(status_code=404,detail='El equipo a asignar campeón no existe.')
    
    torneo.estado='finalizado'
    torneo.equipo_campeon_id=datos.equipo_campeon_id
    db.commit()
    db.refresh(torneo)
    return torneo
    
    