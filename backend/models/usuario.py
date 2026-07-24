from sqlalchemy import Column,Integer,String,DateTime
from config.db import Base
from datetime import datetime,timezone

class Usuario(Base):
    __tablename__='usuarios'
    
    #--COLUMNAS--
    id=Column(Integer,primary_key=True,index=True)
    nombre=Column(String(100),nullable=False)
    email=Column(String(150),unique=True,nullable=False,index=True)
    hashed_password=Column(String(255),nullable=False)
    creado_en=Column(DateTime,default=datetime.now(timezone.utc))
    
    