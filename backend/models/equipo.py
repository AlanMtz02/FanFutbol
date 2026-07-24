from sqlalchemy import Column,String,Integer,ForeignKey,DateTime
from  config.db import Base
from datetime import datetime,timezone
class Equipo(Base):
    __tablename__='equipos'
    
    #--COLUMNAS--
    id=Column(Integer,primary_key=True,index=True)
    nombre=Column(String(100),nullable=False)
    escudo_url=Column(String(500),nullable=True) 
    creado_en=Column(DateTime,default=datetime.now(timezone.utc))
    
    