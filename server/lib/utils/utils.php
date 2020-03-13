<?php

  namespace lib;

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

    static public function createFile(string $path, string $data) {
      return file_put_contents(HOME . $path, $data);
    }

    static public function deleteFile($path) {
      return unlink(HOME . $path);
    }

    static public function fileExist(string $path) : bool {
      return file_exists(HOME . $path);
    }

    static public function isDir(string $path) : bool {
      return is_dir(HOME . $path);
    }

    static public function scanDir(string $path) : array {
      return array_diff(scandir(HOME . $path), ['..', '.']);
    }

    static public function getJSON(string $url) : array {
      return json_decode(self::getFile($url), true);
    }

    static public function getFile(string $url) : string {
      return file_get_contents(HOME . $url);
    }

    static public function ensureDir(string $path) : string {
      $dirPath = HOME . $path;
      if (!file_exists($dirPath)) {
        mkdir($dirPath, 0777, true);
      }

      return $dirPath;
    }

    static public function isImage(string $path) : bool {
      $info = getimagesize($path);
      return !($info[0] <= 0 || $info[1] <= 0 || !$info['mime']);
    }

    static public function isRealUrl(string $path) : bool {
      if (strpos($path, 'http') !== 0) {
        $path = 'https://' . $path;
      }

      $headers = @get_headers($path);
      return $headers && isset($headers[0]) && !strpos($headers[0], '404');
    }

    static public function createImageFromBase64(string $imageCode) {
      $img = str_replace('data:image/jpeg;base64,', '', trim($imageCode));
      $img = str_replace(' ', '+', $img);

      // validate image
      $tmpImage = imagecreatefromstring(base64_decode($img));
      if (!$tmpImage) {
        return false;
      }

      imagejpeg($tmpImage, 'temp.jpeg');
      $isImage = self::isImage('temp.jpeg');
      unlink('temp.jpeg');
      return $isImage ? $img : false;
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
