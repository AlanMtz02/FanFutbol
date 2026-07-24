from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CrearEquipoSchema(BaseModel):
    nombre:str
    escudo_url:Optional[str]=None #Valor por defecto
    
class ActualizarEquipoSchema(BaseModel):
    nombre:Optional[str]=None
    escudo_url:Optional[str]=None
    
class EquipoOutSchema(BaseModel):
    id:int
    nombre:str
    escudo_url:Optional[str]=None #Valor por defecto
    creado_en:datetime
    
    class Config:
        from_attributes=True
    
class TorneoGanadoOutSchema(BaseModel):
    id:int
    nombre:str
    fecha_inicio:str
    fecha_fin:Optional[str]=None
    
    class Config:
        from_attributes=True
        
class PalmaresEquipoOutSchema(BaseModel):
    equipo_id:int
    nombre_equipo:str
    total_titulos:int
    torneos_ganados:list[TorneoGanadoOutSchema]
    
    class Config:
        from_attributes=True