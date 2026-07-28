const URL_BASE = "http://127.0.0.1:8000";

export async function obtenerTorneos(){
    const respuesta=await fetch(`${URL_BASE}/api/torneos`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
        }
    })

    const datos=await respuesta.json();

    if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al obtener la lista de torneos');
  }

  //Devuelve una lista
  //[{id,nombre..},{},{}]
//    id:int
//    nombre:str
//    fecha_inicio:date
//    hora_inicio:time
//    numero_canchas:int
//    estado:str
//    fase_actual:str
//    equipo_campeon_id:Optional[int] = None #Valor por defecto
//    creado_en:datetime
//    fecha_fin:Optional[datetime]=None #Valor por defecto
//    admin_id:int

  return datos;

}

//Funcion para crear un torneo (El endpint requiere token)
export async function crearTorneo(datosTorneo){
    const token=localStorage.getItem('token');
    
    const respuesta=await fetch(`${URL_BASE}/api/torneos`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify(datosTorneo)
    })

    const datos=await respuesta.json();

    if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al crear el torneo');
  }

  return datos;

}

// Métricas de los 3 contadores superiores
//El endpoint requiere token
export async function obtenerResumenDashboard(){
    const token=localStorage.getItem('token');
    const respuesta=await fetch(`${URL_BASE}/api/torneos/dashboard/resumen`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`,
        }
    })

    const datos=await respuesta.json();
    if(!respuesta.ok){
        throw new Error(datos.detail || 'Error al obtener el resumen.')
    }

    return datos; // Devuelve: { total_torneos: 3, torneos_en_curso: 1, total_equipos: 8 }

}