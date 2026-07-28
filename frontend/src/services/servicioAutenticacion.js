const BASE_URL = "http://127.0.0.1:8000";

//Funcion para iniciar sesion
export async function iniciarSesion(correo,contraseña){
    const respuesta=await fetch(`${BASE_URL}/api/auth/login`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            //Claves que espera el schema
            email:correo,
            password:contraseña})
    })

    const datos=await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.detail || "Error al iniciar sesión");
    }
    // Devuelve access_token, token_type , usuario {id,email,creado_en}
    return datos

}

// Función para obtener los datos del usuario logueado usando el token
//Esta funcion apunta al endpoint a auth/me (QUE REQUIERE TOKEN) que verifica si el token es valido
export async function obtenerUsuarioActual(){
    //Verificar si hay un token
    const token=localStorage.getItem('token')

    const respuesta=await fetch(`${BASE_URL}/api/auth/me`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        }
    })

    const datos=await respuesta.json();

    if(!respuesta.ok){
        throw new Error(datos.detail || 'Error al obtener el perfil de usuario.')
    }

    //Devuelve id , email , creado_en
    return datos



}