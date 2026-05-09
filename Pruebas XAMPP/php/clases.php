<?php
class ConexionBase {
    protected $db;
    public function __construct($conexion) {
        $this->db = $conexion;
    }
}

class Usuario extends ConexionBase {
    public function __construct($conexion) {
        parent::__construct($conexion);
    }

    // Registro adaptado a la nueva BD
    public function registrar($datos) {
        $pass_hash = password_hash($datos['password'], PASSWORD_BCRYPT);
        $this->db->begin_transaction();
        try {
            $sql = "INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("sssss", $datos['nombre'], $datos['apellido'], $datos['cedula'], $datos['correo'], $pass_hash);
            $stmt->execute();
            $user_id = $this->db->insert_id;

            $sql_ubi = "INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps) VALUES (?, ?, ST_GeomFromText('POINT(8.43 -82.43)'))";
            $stmt_ubi = $this->db->prepare($sql_ubi);
            $stmt_ubi->bind_param("is", $user_id, $datos['descripcion']);
            $stmt_ubi->execute();

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    public function login($correo, $password) {
        $sql = "SELECT * FROM usuarios WHERE correo_electronico = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($u = $res->fetch_assoc()) {
            if (password_verify($password, $u['password'])) return $u;
        }
        return false;
    }

    // Obtiene las rutas vinculadas a las suscripciones del usuario
    public function obtenerMisRutas($usuario_id) {
        $sql = "SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado 
                FROM rutas r
                JOIN suscripciones s ON r.ruta_id = s.ruta_id
                WHERE s.usuario_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Verifica el estado financiero en la tabla suscripciones
    public function obtenerEstadoFinanciero($usuario_id) {
        $sql = "SELECT estado_pago, proximo_vencimiento 
                FROM suscripciones 
                WHERE usuario_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}
?>