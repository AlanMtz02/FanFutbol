from sqlalchemy import Column,Integer,String,ForeignKey,Date,Time,DateTime
from config.db import Base
from datetime import datetime,timezone

class Torneo(Base):
    __tablename__='torneos'
    
    #--COLUMNAS--
    id=Column(Integer,primary_key=True,index=True)
    nombre=Column(String(150),nullable=False)
    fecha_inicio=Column(Date,nullable=False)
    hora_inicio=Column(Time,nullable=False)
    numero_canchas=Column(Integer,nullable=False,default=1)
    estado = Column(String(30), nullable=False, default="registro")  # 'registro', 'en_curso', 'finalizado'
    fase_actual = Column(String(30), nullable=False, default="regular")  # 'regular', 'cuartos', 'semifinal', 'final'
    equipo_campeon_id = Column(Integer, nullable=True) #Puede ser nulo  porque al crear el torneo, aun no hay campeon
    creado_en = Column(DateTime, default=datetime.now(timezone.utc))
    admin_id=Column(Integer,ForeignKey('usuarios.id'),nullable=False)#FK->Un admin puede crear MUCHOS torneos, pero un torneo siempre debe estar asociado a un solo admin
    