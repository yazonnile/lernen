<?php

ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);
date_default_timezone_set('UTC');
chdir(dirname(__FILE__));

// execute vendor libraries
require_once './vendor/autoload.php';

// run application
new \src\App();
