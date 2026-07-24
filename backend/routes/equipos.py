from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from config.db import get_db
from utils.seguridad import obtener_usuario_actual
from schemas.equipos import EquipoOutSchema,CrearEquipoSchema,ActualizarEquipoSchema,TorneoGanadoOutSchema,PalmaresEquipoOutSchema
from models.torneo import Torneo
from models.equipo import Equipo
from models.torneoequipo import TorneoEquipo

equipos_router=APIRouter(tags=['Equipos'])

#Inscribir equipo en un torneo
#Necesita token
@equipos_router.post('/api/torneos/{id}/equipos',response_model=EquipoOutSchema)
def inscribir_equipo_en_torneo(id:int,datos:CrearEquipoSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Inscribe un equipo en un torneo.
    Solo permitido si el torneo existe y está en estado 'registro'.
    """
    #Validar que exista el torneo
    torneo=db.query(Torneo).filter(Torneo.id==id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='El torneo no existe.')
    
    #Validar que el torneo siga en estado 'registro'
    if torneo.estado!='registro':
        raise HTTPException(status_code=400,detail='No se pueden agregar equipos a un torneo que ya comenzo o finalizo.')
    
    #Buscar el equipo por nombre globalmente (en la tabla equipo)
    equipo=db.query(Equipo).filter(Equipo.nombre==datos.nombre).first()
    if not equipo:#Si no existe el equipo en ningun torneo, creo el registro en la tabla equipo para que ya exista globalmente
        equipo=Equipo(nombre=datos.nombre,escudo_url=datos.escudo_url)
        db.add(equipo)
        db.commit()
        db.refresh(equipo)
        
    #Verificar que no este inscrito especificamente en este torneo
    inscripcion_existente=db.query(TorneoEquipo).filter(TorneoEquipo.torneo_id==id,TorneoEquipo.equipo_id==equipo.id).first()
    if inscripcion_existente:
        raise HTTPException(status_code=400,detail='El equipo ya esta inscrito en este torneo.')
        
    #Si llega aqui, es que todo esta en orden por lo tanto hacemos la inscripcion
    nueva_inscripcion=TorneoEquipo(torneo_id=id,equipo_id=equipo.id)
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)
    return equipo

#Listar equipos de un torneo
@equipos_router.get('/api/torneos/{id}/equipos')
def listar_equipos_de_torneo(id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Retorna la lista de equipos inscritos en un torneo.
    """
    #Validar que el torneo exista
    torneo=db.query(Torneo).filter(Torneo.id==id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='El torneo no existe.')
    
    #Encontrar equipos
    equipos=db.query(Equipo).join(TorneoEquipo).filter(TorneoEquipo.torneo_id==id).all()
    return equipos

#Actualizar equipo
#Necesita token
@equipos_router.patch('/api/equipos/{id}',response_model=EquipoOutSchema)
def actualizar_equipo(id:int,datos:ActualizarEquipoSchema,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Actualiza el nombre o la URL del escudo de un equipo.
    Se puede hacer en cualquier momento del torneo
    """
    #Validar que exista el equipo
    equipo=db.query(Equipo).filter(Equipo.id==id).first()
    if not equipo:
        raise HTTPException(status_code=404,detail='El equipo no existe.')
    
    if datos.nombre is not None:
        equipo.nombre = datos.nombre
    if datos.escudo_url is not None:
        equipo.escudo_url = datos.escudo_url
    
    db.commit()
    db.refresh(equipo)
    return equipo

#Eliminar equipo de un torneo
#Necesita token
@equipos_router.delete('/api/torneos/{torneo_id}/equipos/{equipo_id}')
def eliminar_equipo_de_torneo(torneo_id:int,equipo_id:int,usuario_actual:dict=Depends(obtener_usuario_actual),db:Session=Depends(get_db)):
    """
    Ruta Privada (Admin): Remueve la inscripción de un equipo de un torneo.
    Solo permitido si el torneo está en estado 'registro'.
    """
    #Validar que exista el torneo
    torneo=db.query(Torneo).filter(Torneo.id==torneo_id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='El torneo no existe.')
    
    #Validar dicho torneo este en estado registro
    if torneo.estado!='registro':
        raise HTTPException(status_code=400,detail='No se puede eliminar equipos de un torneo en curso o finalizado.')
    
    #Validar que exista el equipo
    equipo=db.query(Equipo).filter(Equipo.id==equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404,detail='El equipo no existe.')
    
    #Validar que el equipo este inscrito en dicho torneo
    inscripcion=db.query(TorneoEquipo).filter(TorneoEquipo.equipo_id==equipo_id,TorneoEquipo.torneo_id==torneo_id).first()
    if not inscripcion:
        raise HTTPException(status_code=400,detail='El equipo no esta inscrito en el torneo.')
    
    db.delete(inscripcion)
    db.commit()
    return {"mensaje": "Equipo eliminado del torneo correctamente."}

#Palmares del equipo
@equipos_router.get('/api/equipos/{id}/palmares',response_model=PalmaresEquipoOutSchema)
def obtener_palmares_equipo(id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Devuelve cuántos y cuáles torneos ha ganado un equipo.
    """
    #Validar que exista el equipo
    equipo=db.query(Equipo).filter(Equipo.id==id).first()
    if not equipo:
        raise HTTPException(status_code=404,detail='El equipo no existe.')
    
    #Obtener torneos ganados apuntando solo a los que hayan finalizado
    torneos_ganados=db.query(Torneo).filter(Torneo.equipo_campeon_id==id,Torneo.estado=='finalizado').all()
    
    #Llena la clave torneos_ganados del Schema PalmaresEquipoOutSchema
    lista_torneos=[]
    for t in torneos_ganados:
        lista_torneos.append(
            TorneoGanadoOutSchema(
                id=t.id,
                nombre=t.nombre,
                fecha_inicio=str(t.fecha_inicio),
                fecha_fin=str(t.fecha_fin)
                
            )
        )
    
    return PalmaresEquipoOutSchema(
        equipo_id=equipo.id,
        nombre_equipo=equipo.nombre,
        total_titulos=len(lista_torneos),
        torneos_ganados=lista_torneos
    )