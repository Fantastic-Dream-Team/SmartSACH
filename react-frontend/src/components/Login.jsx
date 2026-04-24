const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // Mostrar en consola lo que se está enviando (para depurar)
    console.log("Enviando login:", { correo, password });

    try {
        const response = await fetch('http://localhost/SmartSACH/api/api_login.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                correo: correo, 
                password: password 
            })
        });
        
        const data = await response.json();
        console.log("Respuesta:", data);

        if (data.success) {
            const rutasResponse = await fetch(`http://localhost/SmartSACH/api/api_rutas.php?usuario_id=${data.usuario_id}`);
            const rutasData = await rutasResponse.json();
            onLogin(data, rutasData.success ? rutasData.ruta : null);
        } else {
            setError(data.message);
        }
    } catch (err) {
        console.error("Error:", err);
        setError('Error al conectar con el servidor');
    } finally {
        setCargando(false);
    }
};