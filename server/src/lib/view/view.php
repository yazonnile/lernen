<?php

namespace lib;

class View {
  public function render($data) {
    $indexPage = Utils::getFile('/lib/view/index.html');
    return preg_replace('/{{% DATA %}}/', base64_encode(json_encode($data, JSON_NUMERIC_CHECK)), $indexPage);
  }
}
