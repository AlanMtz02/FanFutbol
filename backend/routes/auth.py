from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from config.db import get_db
from schemas.auth import UsuarioLoginSchema,TokenOutSchema,UsuarioCreateSchema,UsuarioOutSchema
from models.usuario import Usuario
from utils.seguridad import verify_password,hash_password
from utils.jwt import crear_token
from utils.seguridad import obtener_usuario_actual

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


@auth_router.get('/me', response_model=UsuarioOutSchema)
def obtener_perfil_usuario(
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """
    Ruta Privada (Admin): Recibe el Token JWT y valida si sigue activo.
    Retorna la información del usuario logueado.
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_actual["id"]).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    return usuario
