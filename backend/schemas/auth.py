from pydantic import BaseModel,EmailStr
from datetime import datetime
class UsuarioLoginSchema(BaseModel):
    email:EmailStr
    password:str    
    
class UsuarioCreateSchema(BaseModel):
    nombre:str
    email:str
    password:str
    
class UsuarioOutSchema(BaseModel):
    id:int
    email:EmailStr
    creado_en:datetime
    
    class Config:
        from_attributes=True
        
        
class TokenOutSchema(BaseModel):
    access_token:str
    token_type:str='bearer'
    usuario:UsuarioOutSchema
    
    class Config:
        from_attributes=True
    
    