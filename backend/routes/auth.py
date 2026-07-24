from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from config.db import get_db
from schemas.auth import UsuarioLoginSchema,TokenOutSchema,UsuarioCreateSchema,UsuarioOutSchema
from models.usuario import Usuario
from utils.seguridad import verify_password,hash_password
from utils.jwt import crear_token

auth_router=APIRouter(prefix='/api/auth',tags=['Autenticación'])

@auth_router.post('/login',response_model=TokenOutSchema)
def login(datos:UsuarioLoginSchema,db:Session=Depends(get_db)):
    #1.Validar si el usuario existe
    usuario=db.query(Usuario).filter(Usuario.email==datos.email).first()
    #Existe el usuario pero la contraseña no coincide con la hasheada
    if not usuario or not verify_password(datos.password,usuario.hashed_password):
        raise HTTPException(status_code=401,detail='Credenciales invalidas.')
    
    #Crear token a partir de un diccionario
    token=crear_token({
        'sub':usuario.email,
        'id':usuario.id,
    })
    
    return {
        'access_token':token,
        'token_type':'bearer',
        'usuario':usuario,
    }


@auth_router.post('/crear-admin',response_model=UsuarioOutSchema)
def crear_administrador(data:UsuarioCreateSchema,db:Session=Depends(get_db)):
    #1.Validar que el correo no exista en la bd
    usuario_existente=db.query(Usuario).filter(Usuario.email==data.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400,detail='El correo ya existe.')
    
    #Crear usuario con contraseña hasheada
    nuevo_admin=Usuario(nombre=data.nombre,email=data.email,hashed_password=hash_password(data.password))
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    return nuevo_admin

