from pydantic import BaseModel
from typing import Optional
class PosicionEquipoOutSchema(BaseModel):
    posicion:int
    equipo_id:int
    nombre_equipo:str
    escudo_url:str
    #Estadisticas
    pj: int  # Partidos Jugados
    pg: int  # Partidos Ganados
    pe: int  # Partidos Empatados
    pp: int  # Partidos Perdidos
    gf: int  # Goles a Favor
    gc: int  # Goles en Contra
    dg: int  # Diferencia de Goles
    pts: int  # Puntos Totales
    
    # Tooltip para React en caso de desempate por enfrentamiento directo
    desempate_directo_aplicado:bool=False #Valor por defecto
    detalle_desempate:Optional[str]=None #Valor por defecto
    
    class Config:
        from_attributes=True