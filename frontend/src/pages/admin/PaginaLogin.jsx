import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, UserCheck, Eye } from "lucide-react";
import { useAutenticacion } from "../../hooks/useAutenticacion";

// Importa tu servicio de autenticación
import styles from "./PaginaLogin.module.css";

const PaginaLogin = () => {
  //Obtener variables de contexto
  const {iniciarSesionUsuario}=useAutenticacion();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // Usamos el servicio de autenticación
      await iniciarSesionUsuario(correo, contrasena);
      navigate("/admin/dashboard"); // Redirige al dashboard tras login exitoso
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Encabezado Superior / Brand */}
      <div className={styles.brandContainer}>
        <div className={styles.logoBadge}>
          <Trophy size={28} className={styles.trophyIcon} />
        </div>
        <h1 className={styles.brandTitle}>FANFUTBOL</h1>
        <p className={styles.brandSubtitle}>Gestión de torneos amateur</p>
      </div>

      {/* Card del Formulario */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Iniciar sesión</h2>
          <p>Accede al panel de administración</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Input Correo */}
          <div className={styles.field}>
            <label htmlFor="correo">Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                id="correo"
                type="email"
                required
                placeholder="admin@fanfutbol.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className={styles.field}>
            <label htmlFor="contrasena">Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                id="contrasena"
                type="password"
                required
                placeholder="••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={cargando}
          >
            <UserCheck size={18} />
            {cargando ? "Ingresando..." : "Ingresar al Panel"}
          </button>
        </form>

        {/* Link Inferior */}
        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.btnInvitado}
            onClick={() => navigate("/torneos")}
          >
            <Eye size={16} />
            <span>Ver torneos sin iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;
