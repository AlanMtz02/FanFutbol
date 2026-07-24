from pydantic import BaseModel
from typing import Optional
from datetime import date,time,datetime

class CrearTorneoSchema(BaseModel):
    nombre:str
    fecha_inicio:date
    hora_inicio:time
    numero_canchas:int = 1 #Valor por defecto
    
class TorneoOutSchema(BaseModel):
    id:int
    nombre:str
    fecha_inicio:date
    hora_inicio:time
    numero_canchas:int
    estado:str
    fase_actual:str
    equipo_campeon_id:Optional[int] = None #Valor por defecto
    creado_en:datetime
    admin_id:int
    
    class Config:
        from_attributes=True
        

class TorneoFinalizarSchema(BaseModel):
    equipo_campeon_id:int