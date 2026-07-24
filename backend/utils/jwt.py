from jose import jwt,JWTError
from datetime import datetime,timezone,timedelta
from dotenv import load_dotenv
import os

#Cargar el .env
load_dotenv()

SECRET_KEY=os.getenv('SECRET_KEY','fanfutbol_secret_key_super_segura_2026_jwt')
ALGORITHM=os.getenv('ALGORITHM','HS256')
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES','480'))#Convertir a int


def crear_token(data:dict)->str:
    """Recibe un diccionario y a partir de esos datos, crea y devuelve un token"""
    to_encode=data.copy()
    expire=datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp':expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

def decodificar_token(token:str):
    """Regresa el diccionario con el que fue creado el token si es valido"""
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    
    except JWTError:
        None
    