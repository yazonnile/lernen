<?php

use routes\Auth;
use routes\Data;
use routes\Home;
use routes\Setup;
use function lib\autoload;

date_default_timezone_set('UTC');
chdir(dirname(__FILE__));
define('HOME', dirname(__FILE__));

// execute vendor libraries
require_once './lib/vendor/autoload.php';

// turn class auto-loading on
require_once './lib/autoload/autoload.php';
autoload();

$router = new AltoRouter();

$router->map( 'POST', '/login', function() {
  new Auth();
});

$router->map( 'POST', '/add', function() {
  $instance = new Data();
  $instance->add();
});

$router->map( 'POST', '/on', function() {
  $instance = new Data();
  $instance->on();
});

$router->map( 'POST', '/off', function() {
  $instance = new Data();
  $instance->off();
});

$router->map( 'POST', '/setup', function() {
  $instance = new Setup();
  $instance->save();
});

$router->map( 'GET', '*', function() {
  new Home();
});

$match = $router->match();
$match['target']();
