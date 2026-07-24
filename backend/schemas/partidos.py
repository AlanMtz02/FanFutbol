from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from schemas.equipos import EquipoOutSchema
class ActualizarPartidoSchema(BaseModel):
    goles_local:int
    goles_visita:int
    ganador_penales_id:Optional[int]=None #Valor por defecto
    observaciones:Optional[str]=None #Valor por defecto
    estado:Optional[str]='finalizado' #Valor por defecto
    
class RecorrerJornadaSchema(BaseModel):
    nueva_fecha:datetime
    
class PartidoOutSchema(BaseModel):
    id:int
    equipo_local_id:int
    equipo_visitante_id:Optional[int]=None #Valor por defecto porque puede ser partido de descanso
    goles_local:Optional[int]=None
    goles_visita:Optional[int]=None
    ganador_penales_id:Optional[int]=None
    fecha_hora: datetime
    cancha: str
    estado: str
    observaciones: Optional[str] = None
    
    # Objetos anidados de los equipos para mostrar nombre y escudo en React
    equipo_local:Optional[EquipoOutSchema]=None
    equipo_visita:Optional[EquipoOutSchema]=None
    
    
    class Config:
        from_attributes=True
        
class JornadaOutSchema(BaseModel):
    id:int
    numero_jornada:int
    tipo_fase:str
    partidos:list[PartidoOutSchema]=[]
    
    class Config:
        from_attributes=True