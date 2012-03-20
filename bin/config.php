<?php

$sec = require __DIR__ . '/secrets.php';

// Debug
$app['debug']  = false;

// Vars
$app['mb']  = preg_match('/mobile/i', $_SERVER['HTTP_USER_AGENT']);

// Root Dirs
$app['root.vendor']  = __DIR__ . '/../lib';
$app['root.source']  = __DIR__ . '/../src';
$app['root.cache']   = __DIR__ . '/../tmp';
$app['root.views']   = __DIR__ . '/../var';
$app['root.web']     = __DIR__ . '/../web';

// Class Path
$app['autoloader']->registerNamespace('Symfony', $app['root.vendor'] . '/assetic/vendor/symfony/process');
$app['autoloader']->registerNamespace('SilexExtension', $app['root.vendor'] . '/extension/src');

// Nginx
$app['nginx.secret_hash']  = $sec['nginx']['hash'];

// Twig
$app['twig.class_path']  = $app['root.vendor'] . '/twig/lib/';
$app['twig.cache_dir']   = $app['root.cache'] . '/twig';
$app['twig.path']        = $app['root.views'];

// Http
$app['http_cache.cache_dir']  = $app['root.cache'] . '/http';

// Database
$app['pdo.options']  = $sec['db'];

// Apc
$app['apc.options']  = array(
  'ttl'    => 60 * 60 * 24,
  'prefix' => 'ms.',
);

// Assetic
$app['assetic.class_path']    = $app['root.vendor'] . '/assetic/src';
$app['assetic.path_to_web']   = $app['root.web'] . '/src';
$app['assetic.cache_path']    = $app['root.cache'] . '/assetic';

$app['assetic.path_to_yui']   = '/usr/share/yui-compressor/yui-compressor.jar';
$app['assetic.path_to_node']  = '/usr/bin/node';

$app['assetic.input_css']     = $app['root.source'] . '/css/*.css';
$app['assetic.input_less']    = $app['root.source'] . '/css/*.less';
$app['assetic.input_js']      = $app['root.source'] . '/js/*.js';
$app['assetic.input_mb']      = $app['root.source'] . '/mb/*.less';

$app['assetic.output_css']    = 'styles.css';
$app['assetic.output_js']     = 'scripts.js';
$app['assetic.output_mb']     = 'styles.mb.css';
