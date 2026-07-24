import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv

#Cargar variables de .env
load_dotenv()

DATABASE_URL=os.getenv('DATABASE_URL','mysql+pymysql://root:password@localhost:3306/fanfutbol')

#1.Crear conexion a la BD
engine=create_engine(DATABASE_URL,pool_pre_ping=True,pool_recycle=3600)

#2.Variable para poder crear sesiones en la BD
SessionLocal=sessionmaker(bind=engine,autocommit=False,autoflush=False)

#3.Variable que permite crear clases de Python en tablas MYSQL
Base=declarative_base()

#Funcion para crear una sesion en la BD y luego cerrarla
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

