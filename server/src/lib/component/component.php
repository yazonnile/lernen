<?php

  namespace lib;

  class Component {
    /** @var Request */
    private $req;

    /** @var Response */
    private $res;

    /** @var \api\Config */
    private $config;

    /** @var User */
    public $user;

    /** @var Router */
    public $router;

    public function setRequest($req) {
      $this->req = $req;
    }

    public function getRequest() {
      return $this->req;
    }

    public function setResponse($res) {
      $this->res = $res;
    }

    public function getResponse() {
      return $this->res;
    }

    public function setUser($user) {
      $this->user = $user;
    }

    public function setRouter($router) {
      $this->router = $router;
    }

    public function setConfig($config) {
      $this->config = $config;
    }

    public function getConfig() {
      return $this->config;
    }

    public function setError($error, $errorData = []) {
      $this->res->setError($error, $errorData);

      if ($this->isGet()) {
        $this->router->setNotFound();
      }
    }

    public function getParam($keys = null) {
      return $this->req->getState('params' . ($keys ? '.'.$keys : ''));
    }

    public function getPayload($keys = null) {
      return $this->req->getState('payload' . ($keys ? '.'.$keys : ''));
    }

    public function getConfigState($keys) {
      return $this->config->getState($keys);
    }

    public function updateState($keys, $f) {
      $this->res->updateState($keys, $f);
    }

    public function updateRequestState($keys, $f) {
      $this->req->updateState($keys, $f);
    }

    public function removeState($keys = null) {
      $this->res->removeKey($keys);
    }

    public function getState($keys = null) {
      return $this->res->getState($keys);
    }

    public function addMessage($messageName) {
      $this->res->addMessage($messageName);
    }

    public function isPost() {
      return $this->req->isPost();
    }

    public function isGet() {
      return $this->req->isGet();
    }
  }
