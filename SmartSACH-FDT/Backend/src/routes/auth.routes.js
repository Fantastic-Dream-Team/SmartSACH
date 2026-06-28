// ===== OBTENER PERFIL DEL USUARIO AUTENTICADO =====
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;

    console.log('🔍 /me llamado para email:', userEmail);

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido, cedula, telefono, direccion, correo_electronico, estado_verificacion')
      .eq('correo_electronico', userEmail)
      .single();

    if (error) {
      console.error('❌ Error al obtener usuario por correo:', error);
      return res.status(404).json({ error: 'Usuario no encontrado en la tabla pública' });
    }

    console.log('✅ Usuario encontrado:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Error en /me:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;