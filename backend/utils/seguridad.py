import os
from dotenv import load_dotenv
from fastapi import Depends,Security,HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from utils.jwt import decodificar_token
#Cargar contexto para encriptar/verificar contraseñas
pwd_context=CryptContext(schemes=['argon2'],deprecated='auto')

def hash_password(password:str)->str:
    """Recibe una contraseña plana y la devuelve hasheada"""
    return pwd_context.hash(password)

def verify_password(plain_password:str,hash_password:str)->bool:
    """Devuelve True si la contraseña plana coincide con la hasheada"""
    return pwd_context.verify(plain_password,hash_password)

security=HTTPBearer()#Permite leer el header

def obtener_usuario_actual(credenciales:HTTPAuthorizationCredentials=Depends(security),db:Session=Security(security)):
    """Devuelve el diccionario con el fue creado el token y valida si el token es valido"""
    token=credenciales.credentials#Obtener el token
    payload=decodificar_token(token)
    if not payload: #Regresa None decodificar token
        raise HTTPException(status_code=403,detail='Token inválido o expirado.')
    
    return payload

    