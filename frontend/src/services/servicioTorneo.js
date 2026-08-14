const URL_BASE = "http://127.0.0.1:8000";

export async function obtenerTorneos() {
  const respuesta = await fetch(`${URL_BASE}/api/torneos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al obtener la lista de torneos");
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
export async function crearTorneo(datosTorneo) {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${URL_BASE}/api/torneos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosTorneo),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al crear el torneo");
  }

  return datos;
}

// Métricas de los 3 contadores superiores
//El endpoint requiere token
export async function obtenerResumenDashboard() {
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${URL_BASE}/api/torneos/dashboard/resumen`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al obtener el resumen.");
  }

  return datos; // Devuelve: { total_torneos: 3, torneos_en_curso: 1, total_equipos: 8 }
}

export async function obtenerTorneoPorId(id) {
  //No necesita token
  const respuesta = await fetch(`${URL_BASE}/api/torneos/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al obtener el torneo.");
  }
  // id:int
  // nombre:str
  // fecha_inicio:date
  // hora_inicio:time
  // numero_canchas:int
  // estado:str
  // fase_actual:str
  // equipo_campeon_id:Optional[int] = None #Valor por defecto
  // nombre_campeon: Optional[str] = None   #nuevo campo
  // creado_en:datetime
  // fecha_fin:Optional[datetime]=None #Valor por defecto
  // admin_id:int

  return datos;
}

export async function finalizarTorneo(id, equipoCampeonId) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${URL_BASE}/api/torneos/${id}/finalizar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ equipo_campeon_id: equipoCampeonId }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || "No se pudo finalizar el torneo.");
  }
  return datos;
}

export async function iniciarTorneo(id) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${id}/generar-calendario`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al iniciar el torneo.");
  }
  return datos;
}

export async function agregarEquipo(torneoId, datosEquipo) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${URL_BASE}/api/torneos/${torneoId}/equipos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosEquipo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al inscribir al equipo.");
  }

  // id:int
  // nombre:str
  // escudo_url:Optional[str]=None #Valor por defecto
  // creado_en:datetime
  return datos;
}

export async function eliminarEquipo(torneoId, equipoId) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/equipos/${equipoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al inscribir al equipo.");
  }

  // id:int
  // nombre:str
  // escudo_url:Optional[str]=None #Valor por defecto
  // creado_en:datetime
  return datos;
}

export async function obtenerEquiposDelTorneo(torneoId) {
  const respuesta = await fetch(`${URL_BASE}/api/torneos/${torneoId}/equipos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || "Error al obtener los equipos del torneo.");
  }
  //Lista de equipos
  // [{id:int
  // nombre:str
  // escudo_url:Optional[str]=None #Valor por defecto
  // creado_en:datetime},{},{}]
  return datos;
}

export async function editarEquipo(equipoId, datosEquipo) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${URL_BASE}/api/equipos/${equipoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosEquipo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al editar al equipo.");
  }

  // id:int
  // nombre:str
  // escudo_url:Optional[str]=None #Valor por defecto
  // creado_en:datetime
  return datos;
}

export async function obtenerEquiposGlobales() {
  const respuesta = await fetch(`${URL_BASE}/api/equipos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al obtener al equipos globalmente.");
  }
  //Lista de [{id,nombre},{},{}]
  // id:int
  // nombre:str
  // escudo_url:Optional[str]=None #Valor por defecto
  // creado_en:datetime
  return datos;
}

export async function obtenerJornadasDelTorneo(torneoId) {
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/jornadas`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al obtener al equipos globalmente.");
  }
  // id:int
  // numero_jornada:int
  // tipo_fase:str
  // partidos:list[PartidoOutSchema]=[]
  //  partidos ----->
  // id:int
  // equipo_local_id:int
  // equipo_visita_id:Optional[int]=None #Valor por defecto porque puede ser partido de descanso
  // goles_local:Optional[int]=None
  // goles_visita:Optional[int]=None
  // ganador_penales_id:Optional[int]=None
  // fecha_hora: datetime
  // cancha: str
  // estado: str
  // observaciones: Optional[str] = None

  // # Objetos anidados de los equipos para mostrar nombre y escudo en React
  // equipo_local:Optional[EquipoOutSchema]=None
  // equipo_visita:Optional[EquipoOutSchema]=None

  return datos;
}

export async function obtenerPosicionesDelTorneo(torneoId) {
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/posiciones`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(
      mensaje || "Error al obtener al obtener las posiciones del torneo.",
    );
  }

  return datos;
}

export async function editarMarcador(partidoId, payload) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${URL_BASE}/api/partidos/${partidoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al modificar el resultado del partido.");
  }

  // id:int
  // equipo_local_id:int
  // equipo_visita_id:Optional[int]=None #Valor por defecto porque puede ser partido de descanso
  // goles_local:Optional[int]=None
  // goles_visita:Optional[int]=None
  // ganador_penales_id:Optional[int]=None
  // fecha_hora: datetime
  // cancha: str
  // estado: str
  // observaciones: Optional[str] = None

  return datos;
}

export async function pasarCuartos(torneoId, horaInicioCuartos) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/pasar-cuartos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ hora_inicio_cuartos: horaInicioCuartos }),
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al pasar de fase a cuartos.");
  }

  //Diccionario de exito con clave mensaje:'Exito'
  return datos;
}

export async function pasarSemis(torneoId, horaInicioSemis) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/pasar-semis`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hora_inicio_semis: horaInicioSemis }),
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al pasar de fase a cuartos.");
  }

  //Diccionario de exito con clave mensaje:'Exito'
  return datos;
}

export async function pasarFinal(torneoId, horaInicioFinal) {
  //Necesita token
  const token = localStorage.getItem("token");
  const respuesta = await fetch(
    `${URL_BASE}/api/torneos/${torneoId}/pasar-final`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hora_inicio_final: horaInicioFinal }),
    },
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos.detail)
      ? datos.detail.map((d) => d.msg).join(", ")
      : datos.detail;
    throw new Error(mensaje || "Error al pasar de fase a cuartos.");
  }

  //Diccionario de exito con clave mensaje:'Exito'
  return datos;
}
