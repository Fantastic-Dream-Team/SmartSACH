<?php

class ConexionBase {
    protected $db;

    // Uso de Constructor
    public function __construct($conexion) {
        $this->db = $conexion;
    }
}

class Usuario extends ConexionBase {
    
    public function __construct($conexion) {
        parent::__construct($conexion);
    }

    // Método para Registrar
    public function registrar($datos) {
        $nombre = $datos['nombre'];
        $apellido = $datos['apellido'];
        $cedula = $datos['cedula'];
        $correo = $datos['correo'];
        $pass = password_hash($datos['password'], PASSWORD_BCRYPT);
        $descripcion = $datos['descripcion'];

        $this->db->begin_transaction();
        try {
            
            $sql_user = "INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql_user);
            $stmt->bind_param("sssss", $nombre, $apellido, $cedula, $correo, $pass);
            $stmt->execute();
            
            $last_id = $this->db->insert_id;

            // Insertar Ubicación
            $sql_ubi = "INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps) 
                        VALUES (?, ?, ST_GeomFromText('POINT(8.43 -82.43)'))";
            $stmt_ubi = $this->db->prepare($sql_ubi);
            $stmt_ubi->bind_param("is", $last_id, $descripcion);
            $stmt_ubi->execute();

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    // Método para Login
    public function login($correo, $password) {
        $sql = "SELECT * FROM usuarios WHERE correo_electronico = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                return $user;
            }
        }
        return false;
    }
}
?>