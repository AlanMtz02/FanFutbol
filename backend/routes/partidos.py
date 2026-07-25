from fastapi import APIRouter,Depends,HTTPException
from schemas.partidos import JornadaOutSchema,PartidoOutSchema,ActualizarPartidoSchema,RecorrerJornadaSchema
from sqlalchemy.orm import Session
from config.db import get_db
from models.torneo import Torneo
from models.jornada import Jornada
from models.partido import Partido
from utils.seguridad import obtener_usuario_actual
from datetime import timedelta
partidos_router=APIRouter(tags=['Jornadas y partidos'])

#Obtener todas las jornadas con sus partidos de un torneo. Necesita el id del torneo
@partidos_router.get('/api/torneos/{id}/jornadas',response_model=list[JornadaOutSchema])
def obtener_jornadas_del_torneo(id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Devuelve todas las jornadas de un torneo con sus partidos asociados,
    fechas, horas y canchas asignadas.
    """
    #Validar que exista el torneo
    torneo=db.query(Torneo).filter(Torneo.id==id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='El torneo no existe.')
    
    # Traer jornadas de dicho torneo en orden ascendente ->Jornada 1,Jornada 2,Jornada 3 etc etc
    jornadas=db.query(Jornada).filter(Jornada.torneo_id==id).order_by(Jornada.numero_jornada.asc()).all() 
    return jornadas

#Registrar/actualizar marcador de un partido. Necesita id del partido
#Necesita token
@partidos_router.patch('/api/partidos/{id}',response_model=PartidoOutSchema)
def actualizar_partido(id:int,datos:ActualizarPartidoSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Actualiza goles, ganador en penales, observaciones
    y cambia el estado del partido a 'finalizado'.
    """
    #Validar que existe el partido
    partido=db.query(Partido).filter(Partido.id==id).first()
    if not partido:
        raise HTTPException(status_code=404,detail='El partido no existe.')
    
    #Actualizar solo los campos que si mande, si no manda alguno, se mantendra el valor que tenia anteriormente
    if datos.goles_local is not None:
        partido.goles_local = datos.goles_local
    if datos.goles_visita is not None:
        partido.goles_visita = datos.goles_visita
    if datos.ganador_penales_id is not None:
        partido.ganador_penales_id = datos.ganador_penales_id
    if datos.observaciones is not None:
        partido.observaciones = datos.observaciones
    if datos.estado is not None:
        partido.estado = datos.estado
    
    db.commit()
    db.refresh(partido)
    return partido

#Posponer/recorrer una jornada. Necesita id de jornada 
#Requiere token
@partidos_router.patch('/api/jornadas/{id}/recorrer')
def recorrer_jornada(id:int,datos:RecorrerJornadaSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Reagenda todos los partidos de una jornada a una nueva fecha
    y desplaza automáticamente las fechas de las jornadas futuras en +7 días.
    """
    #Validar que exista la jornada
    jornada_actual=db.query(Jornada).filter(Jornada.id==id).first()
    if not jornada_actual:
        raise HTTPException(status_code=404,detail='La jornada no existe.')
    
    #Validar que un partido este asignado a esa jornada
    primer_partido=db.query(Partido).filter(Partido.jornada_id==id).first()
    if not primer_partido:
        raise HTTPException(status_code=400, detail="La jornada no tiene partidos asignados.")
    
    #Diferencia de dias entre el partido con su nueva fecha con la fecha que en teoria estaba pactada 
    #Esto sera lo que le sumare a la fecha_hora del partido
    diferencia_dias=(datos.nueva_fecha-primer_partido.fecha_hora).days 
    
    # Obtener la jornada actual y todas las jornadas subsecuentes del mismo torneo
    jornadas_afectadas = db.query(Jornada).filter(
        Jornada.torneo_id == jornada_actual.torneo_id, #Pertenezcan al mismo torneo
        Jornada.numero_jornada >= jornada_actual.numero_jornada #Solo toma la jornada que se va modificar y a partir de esas las que le sigue. Por ejemplo si modifico la jornada 5 , solo tomo la jornada 5 y todas las que le siguen porque esas seran las que voy a mover de fecha
    ).all()
    
    #Itero sobre las jornadas que voy a cambiar
    for j in jornadas_afectadas:
        #Obtengo todos los partidos de esa jornada 
        partidos = db.query(Partido).filter(Partido.jornada_id == j.id).all()
        #Itero sobre los partidos de la jornada que voy a cambiar de fecha
        for p in partidos:
            #Actualizar campo fecha hora de cada partido 
            p.fecha_hora = p.fecha_hora + timedelta(days=diferencia_dias)

    db.commit()
    return {"mensaje": f"Jornada {jornada_actual.numero_jornada} y subsecuentes pospuestas exitosamente."}
    
        
    
    
    
    