<?php
// Envía las solicitudes de los formularios del sitio por correo, desde el propio servidor (cPanel).
// Los destinatarios están fijos aquí: el navegador no puede cambiarlos.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$DESTINOS = [
  'empleo'   => 'reclutamiento@lachicharra.mx',
  'clientes' => 'direccion.ventas@lachicharra.mx',
];
$REMITENTE = 'no-reply@lachicharra.mx';

function salir($ok, $msg = '') { echo json_encode(['ok' => $ok, 'msg' => $msg]); exit; }
function limpio($v, $max = 600) {
  $v = is_string($v) ? trim($v) : '';
  $v = str_replace(["\r", "\n"], ' ', $v);
  return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { salir(false, 'enviar.php funcionando (PHP ' . PHP_VERSION . '; mail ' . (function_exists('mail') ? 'disponible' : 'DESHABILITADO') . ')'); }
$d = json_decode(file_get_contents('php://input'), true);
if (!is_array($d)) $d = $_POST;

if (!empty($d['_hp'])) salir(true);                       // trampa anti-spam: los bots llenan este campo
$tipo = isset($d['tipo']) ? $d['tipo'] : '';
if (!isset($DESTINOS[$tipo])) { http_response_code(400); salir(false, 'Formulario desconocido'); }

if ($tipo === 'empleo') {
  $campos = [
    'Puesto de interés'   => limpio($d['puesto'] ?? '', 80),
    'Base más cercana'    => limpio($d['base'] ?? '', 80),
    'Nombre completo'     => limpio($d['nombre'] ?? '', 120),
    'Teléfono / WhatsApp' => limpio($d['telefono'] ?? '', 40),
  ];
  if ($campos['Nombre completo'] === '' || strlen(preg_replace('/\D/', '', $campos['Teléfono / WhatsApp'])) < 10) { http_response_code(400); salir(false, 'Datos incompletos'); }
  $asunto = 'Solicitud de empleo - ' . $campos['Puesto de interés'] . ' - ' . $campos['Base más cercana'];
  $responder = '';
} else {
  $campos = [
    'Industria' => limpio($d['industria'] ?? '', 80),
    'Origen'    => limpio($d['origen'] ?? '', 120) ?: '—',
    'Destino'   => limpio($d['destino'] ?? '', 120) ?: '—',
    'Operación' => limpio($d['operacion'] ?? '', 1500) ?: '—',
    'Nombre'    => limpio($d['nombre'] ?? '', 120),
    'Empresa'   => limpio($d['empresa'] ?? '', 120),
    'Teléfono'  => limpio($d['telefono'] ?? '', 40),
    'Correo'    => limpio($d['correo'] ?? '', 160),
  ];
  if ($campos['Nombre'] === '' || $campos['Empresa'] === '' || !filter_var($campos['Correo'], FILTER_VALIDATE_EMAIL)) { http_response_code(400); salir(false, 'Datos incompletos'); }
  $asunto = 'Solicitud de evaluación operativa - ' . $campos['Empresa'] . ' - ' . $campos['Industria'];
  $responder = $campos['Correo'];
}

$filas = '';
foreach ($campos as $k => $v) {
  $filas .= '<tr><td style="padding:8px 12px;background:#f5f5f7;font-weight:600;border:1px solid #e5e5ea">' . htmlspecialchars($k) . '</td>'
          . '<td style="padding:8px 12px;border:1px solid #e5e5ea">' . nl2br(htmlspecialchars($v)) . '</td></tr>';
}
$html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1d1d1f">'
      . '<p>Nueva solicitud desde <b>lachicharra.mx</b>:</p>'
      . '<table style="border-collapse:collapse">' . $filas . '</table>'
      . '<p style="color:#86868b;font-size:12px">Enviado el ' . date('d/m/Y H:i') . '</p></div>';

$cab  = "MIME-Version: 1.0\r\n";
$cab .= "Content-Type: text/html; charset=UTF-8\r\n";
$cab .= 'From: =?UTF-8?B?' . base64_encode('Sitio web La Chicharra') . "?= <$REMITENTE>\r\n";
if ($responder) $cab .= "Reply-To: $responder\r\n";
$asuntoCod = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

if (!function_exists('mail')) { http_response_code(500); salir(false, 'La función mail() está deshabilitada en el servidor'); }
$ok = @mail($DESTINOS[$tipo], $asuntoCod, $html, $cab, '-f' . $REMITENTE);
if (!$ok) { $e = error_get_last(); http_response_code(500); salir(false, 'mail() falló' . ($e ? ': ' . $e['message'] : '')); }
salir(true);
