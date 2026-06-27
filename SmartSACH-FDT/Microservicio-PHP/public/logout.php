<?php
session_start();
session_destroy();
require_once __DIR__ . '/../src/config/config.php';
header('Location: ' . PHP_URL . '/login.php');
exit;
