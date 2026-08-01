from sqlalchemy import Column,String,Integer,ForeignKey
from config.db import Base
from sqlalchemy.orm import relationship

class Jornada(Base):
    __tablename__='jornadas'
    
    #--COLUMNAS--
    id=Column(Integer,primary_key=True,index=True)
    numero_jornada=Column(Integer,nullable=False)
    tipo_fase=Column(String(30),nullable=False,default='regular')#'regular', 'cuartos', 'semifinal', 'final'
    torneo_id=Column(Integer,ForeignKey('torneos.id'),nullable=False)#FK->Un torneo puede tener MUCHAS jornadas pero una jornada siempre debe estar asociado a un unico torneo
    
    #Relacion para poder obtener obtener los id del equipo local y visitante y luego sus nombres
    # le dices a SQLAlchemy: “Cada jornada puede tener muchos partidos, búscalos usando la FK partido.jornada_id”.
    partidos = relationship("Partido", back_populates="jornada", cascade="all, delete-orphan")
    