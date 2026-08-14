from models.torneo import Torneo
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.torneoequipo import TorneoEquipo
from models.jornada import Jornada
from models.partido import Partido
from datetime import timedelta,datetime
from schemas.torneo import HoraCuartosSchema,HoraSemisSchema,HoraFinalSchema
from routes.posiciones import obtener_tabla_posiciones

def generar_calendario_round_robin(torneo_id:int,db:Session):
    """Genera el calendario para un torneo.Si la lista de equipos es impar, un equipo descansa """
    torneo=db.query(Torneo).filter(Torneo.id==torneo_id).first()
    #Obtener los equipos que estan inscritos al torneo [Equipo1,Equipo2,Equipo3]
    inscripciones=db.query(TorneoEquipo).filter(TorneoEquipo.torneo_id==torneo_id).all()
    #Meter los IDs de los equipos en una lista
    lista_equipos=[]
    for i in inscripciones:
        lista_equipos.append(i.equipo_id)
    
    #Validar que haya minimo 2 equipos
    if len(lista_equipos)<2:
        raise HTTPException(status_code=400,detail='Se necesitan al menos 2 equipos para generar el calendario')
    
    # Si la cantidad de equipos es impar, agregamos None (representa el descanso)
    if len(lista_equipos)%2!=0:
        lista_equipos.append(None)
    
    #Fórmulas del Round Robin:
    # Con 2 equipos → 1 jornadas. --Con 10 equipos -> 9 jornadas -- Con 15 equipos -> 14 jornadas
    # Cada jornada → 1 partidos. ------ Cada jornada -> 5 partidos -- Cada jornada -> 7 partidos
    #En numeros de equipo impares descansa 1. Por eso al multiplicar el total de partidos por 2 (cantidad de equipos en un partido) dara uno menos que la cantidad de equipo total
    num_equipos=len(lista_equipos)
    num_jornadas=len(lista_equipos)-1
    partidos_por_jornada=num_equipos//2
    
    #Generación de Jornadas y Partidos
    fecha_actual=torneo.fecha_inicio
    for i in range(num_jornadas):
        #Crear la jornada 
        nueva_jornada=Jornada(
            numero_jornada=i+1,
            tipo_fase='regular',
            torneo_id=torneo_id,
        )
        db.add(nueva_jornada)
        db.flush()#Hara commit en automatico al finalizar el for. Es decir terminara de hacer el calendario completo porque primero generara una jornada despues, creara los partidos con sus fechas y despues de acabar todas las jornadas entonces ahi hara commit
        
        # Cofigurar hora y fecha de inicio del bloque. Tambien la cancha actual
        #Indica dia y hora (por eso combinamos fecha_actual y la hora de inicio del torneo)
        #En la primera iteracion sera sabado 10 febrero 2026 9:00am
        #Lo unico que va ir cambiando es fecha_actual ya que en el for de jornada, al final sumamos 7 dias. La hona de inicio de torneo nunca cambia
        hora_bloque_actual = datetime.combine(fecha_actual, torneo.hora_inicio)
        cancha_actual = 1

        #Crear partidos emparejando por ejemplo Partido 1: 1vs10,Partido 2:2vs9,Partido: 3vs8
        for j in range(partidos_por_jornada):
            local_id = lista_equipos[j] # Posicion 0: Equipo con id 1
            visitante_id = lista_equipos[num_equipos - 1 - j] #Posicion 9 :Equipo con id 2

            #Validar que tanto el local como el visitante tengan un equipo
            #Si uno es None, significa que descansa y por tanto no se debe generar un partido
            if local_id is not None and visitante_id is not None:
                nuevo_partido = Partido(
                    jornada_id=nueva_jornada.id, #Asignar el id de la jornada del for padre
                    equipo_local_id=local_id,
                    equipo_visita_id=visitante_id,
                    fecha_hora=hora_bloque_actual,
                    cancha=f"Cancha {cancha_actual}",
                    estado="pendiente"
                )
                db.add(nuevo_partido)

                # Avanzar a la siguiente cancha para el próximo partido
                cancha_actual += 1

                # Si ya ocupamos todas las canchas disponibles para esta hora:
                # Se reinicia a la Cancha 1 y avanzamos 1 hora para el siguiente bloque
                #Permite que no se reinicie el bloque_actual para que haya partidos a la misma hora pero en diferente cancha
                if cancha_actual > torneo.numero_canchas:
                    cancha_actual = 1
                    hora_bloque_actual= hora_bloque_actual+timedelta(hours=1)

        #Este es para el for de las jornadas, es decir, para la jornada 2 el conjunto o la lista de equipos estara en diferente orden lo que permite nuevos emparejamientos
        #Ejemplo: Para la jornada 1 esta asi [1, 2, 3, 4] crea la jornada 1, entra al for para crear los partidos para la jornada 1 , cuando termina de crear los partidos de la jornada 1 llega aqui y ahora segunda iteracion la jornada 2 sera [1, 4, 2, 3] y se repite hasta llegar al numero de jornadas que se deben hacer con la cantidad de equipos que se tienen.
        #Así cambian los rivales cada jornada.
        lista_equipos = [lista_equipos[0]] + \
            [lista_equipos[-1]] + lista_equipos[1:-1]

        #Ahora tambien toca actualizar la nueva fecha de la jornada 2 PARA LOS PARTIDOS, entonces , la fecha actual para EL PRIMER PARTIDO DE LA JORNADA 2 ahora debe ser Sabado 17 de febrero 2026.Cada se jornada se juega cada 7 días
        fecha_actual += timedelta(days=7)

    # 5. Cambiar el estado del torneo
    torneo.estado = "en_curso"
    torneo.fase_actual = "regular"

    db.commit()
    return {"mensaje": f"Calendario generado con éxito. Se crearon {num_jornadas} jornadas."}
        

def generar_cuartos(torneo_id: int, datos: HoraCuartosSchema, db: Session):
    #Validar que existe el torneo
    torneo = db.query(Torneo).filter(Torneo.id == torneo_id).first()
    #O ... existe el torneo pero no esta en fase regular
    if not torneo or torneo.fase_actual != "regular":
        raise HTTPException(
            status_code=400, detail="El torneo no está en fase regular")

    # Validar que todas las jornadas regulares estén finalizadas
    jornadas_regulares = db.query(Jornada).filter(Jornada.torneo_id == torneo_id, Jornada.tipo_fase == "regular").all()
    for j in jornadas_regulares:
        #Obtengo los partidos de dicha jornada y con que un partido este en pendiente, no sigo
        partidos = db.query(Partido).filter(Partido.jornada_id == j.id).all()
        if any(p.estado != "finalizado" for p in partidos):
            raise HTTPException(status_code=400, detail="No todas las jornadas regulares están completas")

    # Obtener posiciones
    posiciones = obtener_tabla_posiciones(torneo_id, db)
    #Obtener solo los primeros 8 y guardo su ID del equipo
    clasificados = [p["equipo_id"] for p in posiciones[:8]]
    if len(clasificados) < 8:
        raise HTTPException(status_code=400, detail="No hay suficientes equipos para cuartos")

    # Calcular fecha base
    ultima_jornada = db.query(Jornada).filter(Jornada.torneo_id == torneo_id).order_by(Jornada.numero_jornada.desc()).first()
    #Obtengo la ultima fecha de la ultima jornada
    ultima_fecha = db.query(Partido).filter(Partido.jornada_id == ultima_jornada.id).order_by(Partido.fecha_hora.desc()).first().fecha_hora
    
    #La fecha de cuartos sera 7 dias despues de la ultima fecha
    fecha_cuartos = ultima_fecha + timedelta(days=7)

    # Crear jornada cuartos.El numero de jornada sera la ultima jornada+1, su fase correspondiente y torneo asociado
    jornada_cuartos = Jornada(numero_jornada=ultima_jornada.numero_jornada+1, tipo_fase="cuartos", torneo_id=torneo_id)
    db.add(jornada_cuartos)
    db.flush()

    # Emparejamientos cuartos
    emparejamientos = [(clasificados[0], clasificados[7]),
                       (clasificados[1], clasificados[6]),
                       (clasificados[2], clasificados[5]),
                       (clasificados[3], clasificados[4])]

    #Formo la primer hora del partido de cuartos ya con 7 dias de diferencia a la ultima fase
    hora_bloque = datetime.combine(fecha_cuartos.date(), datos.hora_inicio_cuartos)
    cancha_actual = 1
    for local, visita in emparejamientos:
        partido = Partido(
            jornada_id=jornada_cuartos.id,#Asocio el id de la jornada de cuartos
            equipo_local_id=local,
            equipo_visita_id=visita,
            fecha_hora=hora_bloque,
            cancha=f"Cancha {cancha_actual}",
            estado="pendiente"
        )
        db.add(partido)
        cancha_actual += 1
        if cancha_actual > torneo.numero_canchas:
            cancha_actual = 1
            hora_bloque = hora_bloque+timedelta(hours=1)

    torneo.fase_actual = "cuartos"
    db.commit()
    return {"mensaje": "Se generaron los cuartos de final"}


def generar_semis(torneo_id: int, datos: HoraSemisSchema, db: Session):
    #Validar que el torneo exista y que ademas la fase actual sea cuartos
    torneo = db.query(Torneo).filter(Torneo.id == torneo_id).first()
    if not torneo or torneo.fase_actual != "cuartos":
        raise HTTPException(
            status_code=400, detail="El torneo no está en cuartos")

    # Validar que todos los partidos de cuartos estén finalizados
    jornada_cuartos = db.query(Jornada).filter(Jornada.torneo_id == torneo_id, Jornada.tipo_fase == "cuartos").first()
    #Apunto a los partidos con el id de jornada de cuartos
    partidos_cuartos = db.query(Partido).filter(Partido.jornada_id == jornada_cuartos.id).all()
    if any(p.estado != "finalizado" for p in partidos_cuartos):
        raise HTTPException(
            status_code=400, detail="No todos los partidos de cuartos están finalizados")

    # Obtener ganadores
    ganadores = []
    for p in partidos_cuartos:
        if p.goles_local > p.goles_visita:
            ganadores.append(p.equipo_local_id)
        elif p.goles_visita > p.goles_local:
            ganadores.append(p.equipo_visita_id)
        else:#Cuando empatan en fases finales, se llena ganador_penales.id
            ganadores.append(p.ganador_penales_id)

    if len(ganadores) != 4:
        raise HTTPException(
            status_code=400, detail="No se pudieron determinar todos los ganadores de cuartos")

    # Crear jornada semis.El numero de jornada sera apuntando a la jornada de cuartos y le suma +1. su fase correspondiente y torneo asociado
    jornada_semis = Jornada(numero_jornada=jornada_cuartos.numero_jornada+1, tipo_fase="semifinal", torneo_id=torneo_id)
    db.add(jornada_semis)
    db.flush()

    # Emparejamientos semis
    emparejamientos = [(ganadores[0], ganadores[3]),
                       (ganadores[1], ganadores[2])]
    
    #7 dias despues del partido de fase cuartos
    fecha_semis = partidos_cuartos[0].fecha_hora + timedelta(days=7)

    #Hora bloque para formar los partidos, la fecha de semis ya con la diferencia de 7 dias y la hora sera la que me mande
    hora_bloque = datetime.combine(fecha_semis.date(), datos.hora_inicio_semis)
    cancha_actual = 1
    for local, visita in emparejamientos:
        partido = Partido(
            jornada_id=jornada_semis.id,#Lo asocio con la jornada de semis que cree previamente
            equipo_local_id=local,
            equipo_visita_id=visita,
            fecha_hora=hora_bloque,
            cancha=f"Cancha {cancha_actual}",
            estado="pendiente"
        )
        db.add(partido)
        cancha_actual += 1
        if cancha_actual > torneo.numero_canchas:
            cancha_actual = 1
            hora_bloque += timedelta(hours=1)

    torneo.fase_actual = "semifinal"
    db.commit()
    return {"mensaje": "Se generaron las semifinales"}


def generar_final(torneo_id: int, datos: HoraFinalSchema, db: Session):
    #Validar que exista el torneo y que ademas la fase sea semifinales (porque vamos a pasar a finales)
    torneo = db.query(Torneo).filter(Torneo.id == torneo_id).first()
    if not torneo or torneo.fase_actual != "semifinal":
        raise HTTPException(status_code=400, detail="El torneo no está en semifinales")

    # Validar que todos los partidos de semis estén finalizados
    jornada_semis = db.query(Jornada).filter(Jornada.torneo_id == torneo_id, Jornada.tipo_fase == "semifinal").first()
    #Obtengo los partidos apuntando al jornada id con el jornada semis
    partidos_semis = db.query(Partido).filter(Partido.jornada_id == jornada_semis.id).all()
    if any(p.estado != "finalizado" for p in partidos_semis):
        raise HTTPException(
            status_code=400, detail="No todos los partidos de semis están finalizados")

    # Obtener ganadores
    ganadores = []
    for p in partidos_semis:
        if p.goles_local > p.goles_visita:
            ganadores.append(p.equipo_local_id)
        elif p.goles_visita > p.goles_local:
            ganadores.append(p.equipo_visita_id)
        else:#Siempre hay ganador en eliminatorias con penales
            ganadores.append(p.ganador_penales_id)

    if len(ganadores) != 2:
        raise HTTPException(
            status_code=400, detail="No se pudieron determinar los ganadores de semis")

    # Crear jornada final.Con el numero de jornada de la jornada de semis +1,su fase correspondiente y torneo asociado
    jornada_final = Jornada(numero_jornada=jornada_semis.numero_jornada+1, tipo_fase="final", torneo_id=torneo_id)
    db.add(jornada_final)
    db.flush()

    #La fecha de la final sera 7 dias despues del partido de semis
    fecha_final = partidos_semis[0].fecha_hora + timedelta(days=7)

    #Aqui solo creare un partido por lo tanto no hace falta iterar sobre un emparejamiento
    partido_final = Partido(
        jornada_id=jornada_final.id,
        equipo_local_id=ganadores[0],
        equipo_visita_id=ganadores[1],
        fecha_hora=datetime.combine(
            fecha_final.date(), datos.hora_inicio_final),#La fecha final ya con los 7 dias de diferencia y la hora sera la que me manden
        cancha="Cancha 1", #Cancha directa ya que solo es un partido
        estado="pendiente"
    )
    db.add(partido_final)

    torneo.fase_actual = "final"
    db.commit()
    return {"mensaje": "Se generó la final"}
