<?php

  namespace routes;

  class Home extends \lib\RouteComponent {
    public function home() {
      $this->updateState('games', [
        [ 'gameName' => 'learn', 'text' => 'учить' ]
      ]);
    }
  }
