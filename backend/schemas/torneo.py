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
    nombre_campeon: Optional[str] = None   #nuevo campo
    creado_en:datetime
    fecha_fin:Optional[datetime]=None #Valor por defecto
    admin_id:int
    
    class Config:
        from_attributes=True
        

class TorneoFinalizarSchema(BaseModel):
    equipo_campeon_id:int
    

class ResumenDashboardOutSchema(BaseModel):
    total_torneos: int
    torneos_en_curso: int
    total_equipos: int

    class Config:
        from_attributes = True
