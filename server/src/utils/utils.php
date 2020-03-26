<?php

class Utils {
  static public function isDebug() {
    return true;
  }

  static public function getJSON(string $url) : array {
    return json_decode(self::getFile($url), true);
  }

  static public function getFile(string $url) : string {
    return file_get_contents(HOME . $url);
  }
}
