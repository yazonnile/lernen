<?php

ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);
date_default_timezone_set('UTC');
chdir(dirname(__FILE__));
define('HOME', dirname(__FILE__));

// execute vendor libraries
require_once './vendor/autoload.php';

// turn class auto-loading on
require_once './autoload/autoload.php';
autoload();

// run application
new App();
