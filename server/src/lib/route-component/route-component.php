<?php

  namespace lib;

  class RouteComponent extends Component {
    public function updateState($keys, $f) {
      parent::updateState('pageData.'.$keys, $f);
    }

    public function getState($keys = null) {
      return parent::getState('pageData.'.$keys);
    }
  }
