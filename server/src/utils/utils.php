<?php

  class Utils {
    static public function isDebug() {
      return true;
    }

    static public function repeatWithSeparator(string $str, string $sep, int $times) : string {
      return str_repeat($str . $sep, $times - 1) . $str;
    }

    static public function dashesToCamelCase(string $string, bool $capitalizeFirstCharacter = false) : string {
      $str = str_replace(' ', '', ucwords(str_replace('-', ' ', $string)));

      if (!$capitalizeFirstCharacter) {
        $str[0] = strtolower($str[0]);
      }

      return $str;
    }

    static public function camelCaseToDashed(string $string) {
      return strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $string));
    }

    static public function getJSON(string $url) : array {
      return json_decode(self::getFile($url), true);
    }

    static public function getFile(string $url) : string {
      return file_get_contents(HOME . $url);
    }

    static public function getRandomString($length = 25) : string {
      $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $string = '';

      for ($i = 0; $i < $length; $i++) {
        $string .= $characters[mt_rand(0, strlen($characters) - 1)];
      }

      return $string;
    }

    static public function print($data) {
      echo "<pre>";
      print_r($data);
      echo "</pre>";
    }

    static public function dump($data) {
      echo "<pre>", var_dump($data) ,"</pre>";
    }

    static public function html($data) {
      echo "<pre><xmp>";
      print_r($data);
      echo "</xmp></pre>";
    }
  }
