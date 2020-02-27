<?php

use routes\Auth;
use routes\Data;
use routes\Home;
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

$router->map( 'POST', '/remove', function() {
  $instance = new Data();
  $instance->add();
});

$router->map( 'GET', '*', function() {
  new Home();
});

$match = $router->match();
$match['target']();
