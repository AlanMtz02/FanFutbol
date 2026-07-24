from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime
from config.db import Base

class TorneoEquipo(Base):
    __tablename__ = "torneo_equipos"

    #Nace porque: Un equipo puede estar en MUCHOS torneos y un torneo puede tener MUCHOS equipos, entonces como los dos tienen el muchos surge esta tabla que incluye el id del torneo y el id del equipo 
    #--COLUMNAS--
    id = Column(Integer, primary_key=True, index=True)
    torneo_id = Column(Integer, ForeignKey("torneos.id"), nullable=False)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)

    # Restricción para evitar inscribir el mismo equipo 2 veces en el mismo torneo
    __table_args__ = (
        UniqueConstraint('torneo_id', 'equipo_id', name='_torneo_equipo_uc'),
    )