from sqlalchemy import Integer,Column,String,ForeignKey,DateTime,Text
from config.db import Base

class Partido(Base):
    __tablename__='partidos'
    
    #--COLUMNAS--
    id=Column(Integer,primary_key=True,index=True)
    goles_local=Column(Integer,nullable=True)
    goles_visita=Column(Integer,nullable=True)
    ganador_penales_id=Column(Integer,ForeignKey('equipos.id'),nullable=True)
    fecha_hora=Column(DateTime,nullable=False)
    cancha=Column(String(50),nullable=False)
    estado=Column(String(30),nullable=False,default='pendiente') # 'pendiente', 'finalizado'
    observaciones=Column(Text,nullable=True)
    
    jornada_id=Column(Integer,ForeignKey('jornadas.id'),nullable=False)#FK->Una jornada puede tener MUCHOS partidos pero un partido siempre debe estar asociado a un unica jornada
    equipo_local_id=Column(Integer,ForeignKey('equipos.id'),nullable=False)#FK
    equipo_visita_id=Column(Integer,ForeignKey('equipos.id'),nullable=True)#Null si descansa un equipo porque la cantidad de equipos es impar
    