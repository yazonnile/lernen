<?php

namespace lib;

class Router extends StateManager {
  private $router;

  public function __construct() {
    $this->updateState('url', isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/');

    $this->router = new \AltoRouter();

    $this->addRoutes('auth', \routes\AuthRoutes::getRoutes());
    $this->addRoutes('home', \routes\HomeRoutes::getRoutes());
    $this->addRoutes('addWord', \routes\AddWordRoutes::getRoutes());
    $this->addRoutes('dict', \routes\DictRoutes::getRoutes());
    $this->addRoutes('stat', \routes\StatRoutes::getRoutes());
    $this->addRoutes('setup', \routes\SetupRoutes::getRoutes());
    $this->addRoutes('notFound', \routes\NotFoundRoutes::getRoutes());

    $match = $this->router->match();
    $this->updateState('match', [
      'routeId' => $match['name'],
      'componentId' => $match['target'],
      'params' => $match['params'],
      'route' => $this->getState('routes.' . $match['target'] . '.' . $match['name'])
    ]);
  }

  public function setNotFound() {
    $this->updateState('match', [
      'routeId' => 'notFound',
      'componentId' => 'notFound',
      'params' => [],
      'route' => $this->getState('routes.notFound.notFound'),
      'shouldUpdateRouter' => true
    ]);
  }

  public function setAuth() {
    $authRoute = $this->getState('routes.auth.auth');
    $this->updateState('match', [
      'routeId' => 'auth',
      'componentId' => 'auth',
      'params' => [],
      'route' => $authRoute,
      'shouldUpdateRouter' => true
    ]);
    $this->updateState('url', $authRoute['url']);
  }

  private function addRoutes($componentId, $arr) {
    foreach ($arr as $routeId => $route) {
      $this->addRoute($componentId, $routeId, $route);
    }
  }

  private function addRoute($componentId, $routeId, $route) {
    $route = $this->mergeRouteWithDefaults($componentId, $routeId, $route);
    $this->updateState('routes.' . $componentId, function($routes) USE($routeId, $route) {
      $routes[$routeId] = $route;
      return $routes;
    });

    try {
      $this->router->map(implode('|', $route['methods']), $route['url'], $componentId, $routeId);
    } catch (\Exception $e) {}
  }

  private function mergeRouteWithDefaults($componentId, $routeId, $route) {
    if (!isset($route['methods'])) {
      $route['methods'] = ['POST', 'GET'];
    }

    if (implode('', $route['methods'] ?? []) !== 'POST') {
      $route['shouldUpdateRouter'] = true;
    }

    if (!isset($route['url'])) {
      $route['url'] = '/' . Utils::camelCaseToDashed($componentId) . ($routeId === $componentId ? '' : ('/' . Utils::camelCaseToDashed($routeId)));
    }

    return $route;
  }
}
