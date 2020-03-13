<?php

ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);
date_default_timezone_set('UTC');
chdir(dirname(__FILE__));
define('HOME', dirname(__FILE__));

//header("Content-Security-Policy: ". implode('; ', [
//    "default-src 'self'",
//    "script-src lll.com:*",
//    "style-src lll.com:*",
//    "connect-src 'self'",
//    "img-src 'self' data: ll.ru ",
//    "font-src 'self' data:"
//  ]));

// execute vendor libraries
require_once './lib/vendor/autoload.php';

// turn class auto-loading on
require_once './lib/autoload/autoload.php';
\lib\autoload();

// run application
new \lib\App();
