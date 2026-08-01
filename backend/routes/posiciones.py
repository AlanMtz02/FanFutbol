from fastapi import APIRouter,Depends,HTTPException
from config.db import get_db
from sqlalchemy.orm import Session
from schemas.posiciones import PosicionEquipoOutSchema
from models.torneo import Torneo
from models.equipo import Equipo
from models.torneoequipo import TorneoEquipo
from models.partido import Partido
from models.jornada import Jornada
from functools import cmp_to_key

posiciones_router=APIRouter(prefix='/api/torneos',tags=['Tabla de posiciones'])

#Necesita el id del torneo
@posiciones_router.get('/{id}/posiciones',response_model=list[PosicionEquipoOutSchema])
def obtener_tabla_posiciones(id:int,db:Session=Depends(get_db)):
    """
    Ruta Pública: Calcula en tiempo real la tabla de posiciones con
    criterios de desempate jerárquicos (PTS -> DG -> GF -> Directo -> GC).
    """
    #Validar que exista el torneo
    torneo=db.query(Torneo).filter(Torneo.id==id).first()
    if not torneo:
        raise HTTPException(status_code=404,detail='El torneo no existe.')
    
    #Obtener todos los equipos del torneo
    equipos_inscritos=db.query(Equipo).join(TorneoEquipo).filter(TorneoEquipo.torneo_id==id).all()
    
    # Inicializar la estructura estadística de cada equipo
    stats={}
    for eq in equipos_inscritos:
        stats[eq.id]={
            "equipo_id": eq.id,
            "nombre_equipo": eq.nombre,
            "escudo_url": eq.escudo_url,
            "pj": 0, "pg": 0, "pe": 0, "pp": 0,
            "gf": 0, "gc": 0, "dg": 0, "pts": 0,
            "desempate_directo_aplicado": False,
            "detalle_desempate": None
        }
    
    #Obtener partidos finalizados de dicho torneo y que tenga el estado finalizado solo en los jornadas de fase regular
    partidos_finalizados=db.query(Partido).join(Jornada).filter(Jornada.torneo_id==id,Partido.estado=='finalizado',Jornada.tipo_fase=='regular').all()
    
    #Procesar resultados en los partidos
    #Se itera sobre los partidos que ya finalizaron y se llenara las estadisticas de la tabla partido
    for p in partidos_finalizados:
        local_id=p.equipo_local_id
        visita_id=p.equipo_visita_id
        
        # Si no hay visitante (partido de descanso/bye), se ignora
        if not visita_id or local_id not in stats or visita_id not in stats:
            continue
        
        gl=p.goles_local or 0
        gv=p.goles_visita or 0
        
        # Actualizar PJ, GF, GC para equipo local y visita
        stats[local_id]["pj"]+=1
        stats[visita_id]["pj"] += 1
        stats[local_id]["gf"] += gl
        stats[local_id]["gc"] += gv
        stats[visita_id]["gf"] += gv
        stats[visita_id]["gc"] += gl
        
        # Asignar Puntos y Victoria/Empate/Derrota
        if gl > gv: #Gano el local
            stats[local_id]["pg"] += 1 
            stats[local_id]["pts"] += 3
            stats[visita_id]["pp"] += 1
        elif gv > gl: #Gano la visita
            stats[visita_id]["pg"] += 1
            stats[visita_id]["pts"] += 3
            stats[local_id]["pp"] += 1
        else: #Hubo empate (estamos iterando solo sobre partidos finalizados y en fase regular)
            stats[local_id]["pe"] += 1
            stats[local_id]["pts"] += 1
            stats[visita_id]["pe"] += 1
            stats[visita_id]["pts"] += 1
            
    # Recalcular Diferencia de Goles (DG)
    #Las demas estadisticas de stats ya fueron llenadas en el for anterior
    for eq_id in stats:
        stats[eq_id]["dg"] = stats[eq_id]["gf"] - stats[eq_id]["gc"]
        
        

    #Función de comparación con Criterios de Desempate
    def comparar_equipos(a, b):
        # 1. Puntos
        if a["pts"] != b["pts"]:
            return b["pts"] - a["pts"]
        # 2. Diferencia de Goles
        if a["dg"] != b["dg"]:
            return b["dg"] - a["dg"]
        # 3. Goles a Favor
        if a["gf"] != b["gf"]:
            return b["gf"] - a["gf"]

        # 4. Enfrentamiento Directo (Resultado entre ellos dos)
        partido_directo = next((p for p in partidos_finalizados if 
            (p.equipo_local_id == a["equipo_id"] and p.equipo_visita_id == b["equipo_id"]) or
            (p.equipo_local_id == b["equipo_id"] and p.equipo_visita_id == a["equipo_id"])
        ), None)

        if partido_directo and partido_directo.goles_local is not None and partido_directo.goles_visita is not None:
            if partido_directo.equipo_local_id == a["equipo_id"]:
                g_a, g_b = partido_directo.goles_local, partido_directo.goles_visita
            else:
                g_a, g_b = partido_directo.goles_visita, partido_directo.goles_local

            if g_a != g_b:#Si hay un ganador en el enfrentamiento directo
                ganador = a if g_a > g_b else b
                perdedor = b if g_a > g_b else a
                ganador["desempate_directo_aplicado"] = True
                ganador["detalle_desempate"] = f"Criterio de desempate aplicado: {ganador['nombre_equipo']} venció a {perdedor['nombre_equipo']} en enfrentamiento directo."
                return -1 if g_a > g_b else 1

        # 5. Menor Goles en Contra
        return a["gc"] - b["gc"]
    
    # Ordenar lista con el comparador
    #.values() devuelve solo los valores de cada llave pero NO las llaves (que es el id del equipo) y eso los convierto en listas para que sea una lista de diccionarios
    # [ {..."nombre_equipo:"Barcelona"...}, {...nombre_equipo="Madrid"...}, {...nombre_equipo="América"...} ]
    lista_posiciones = list(stats.values())
    
    #Toma pares de la lista y los pasa como a y b en la funcion comparar_equipos gracias a key=cmp_to_key ya que permite que funcione con .sort()
    
    # Primer comparación: a = {...Barcelona...}, b = {...Madrid...}.
    # La función decide quién va primero según los criterios.
    # Devuelve un número:
    #     Negativo → a va antes que b.
    #     Positivo → b va antes que a.
    #     Cero → son iguales en ese criterio, pasa al siguiente.
    
    lista_posiciones.sort(key=cmp_to_key(comparar_equipos))

    # Asignar posición ordinal (1°, 2°, 3°...)
    # Mete un nuevo valor a lista de diccionarios, recordando que solo se tienen los valores, no hay como tal llave (id del equipo)
    # {"posicion":1,"nombre_equipo":"América","pts":6,"dg":+5,"gf":10},
    # {"posicion":2,"nombre_equipo":"Tigres","pts":6,"dg":+5,"gf":10},
    # {"posicion":3,"nombre_equipo":"Barcelona","pts":6,"dg":+5,"gf":9}
    #OJO: lista_posiciones ya esta ordenada correctamente , lo unico que se hace es agregarle un nuevo valor "posicion" al diccionario 
    for indice, item in enumerate(lista_posiciones): 
        item["posicion"] = indice + 1

    return lista_posiciones
    
    