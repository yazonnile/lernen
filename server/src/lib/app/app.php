<?php

  namespace lib;

  use api\Access;

  class App extends Component {
    public function __construct() {
      $this->setRouter(new Router());
      $this->setRequest(new Request());
      $this->updateRequestState(null, [
        'params' => $this->router->getState('match.params'),
        'payload' => $this->decodePayload()
      ]);

      $this->setResponse(new Response());
      $this->setConfig(new \api\Config());
      $this->setUser(new User());

      $this->user->setRequest($this->getRequest());
      $this->user->setResponse($this->getResponse());
      $this->user->setConfig($this->getConfig());
      $this->user->setup();

      $route = $this->router->getState('match.route');

      // check route access
      if (isset($route['access']) && !\api\Access::hasAccess($route['access'], $this->user)) {
        if (count($route['access']) === 1 && $route['access'][0] === Access::guest && $this->user->isLoggedIn()) {
          $this->router->setNotFound();
        } else if (count($route['access']) === 1 && $route['access'][0] === Access::user && !$this->user->isLoggedIn()) {
          $this->router->setAuth();
        }
        $this->result();
        return;
      }

      // validate payload
      if (isset($route['payloadScheme'])) {
        $this->validateData($this->getPayload(), $route['payloadScheme'], 'payload');
      }

      // validate params
      $params = $this->getParam();
      if (count($params)) {
        $this->validateData($params, array_keys($params), 'params');
      }

      $componentId = $this->router->getState('match.componentId');
      $componentIdCamelCase = Utils::dashesToCamelCase($componentId, true);
      $componentClassName = str_replace('/', '\\', "routes/{$componentIdCamelCase}");

      /** @var $instance \lib\Component */
      $instance = new $componentClassName();
      $instance->setRequest($this->getRequest());
      $instance->setResponse($this->getResponse());
      $instance->setConfig($this->getConfig());
      $instance->setUser($this->user);
      $instance->setRouter($this->router);

      $routeId = $this->router->getState('match.routeId');

      // go to the route just in case of POST route
      if ($route['method'] !== 'GET') {
        if (method_exists($instance, $routeId)) {
          $instance->$routeId();
        } else {
          $this->exitWithError('actionDoesntExist.error', ['routeId' => $routeId, 'componentId' => $componentId]);
          return;
        }
      }

      $this->result();
    }

    private function validateData($data, $scheme, $errorCode) {
      $errors = Validation::validateData($data, $scheme);

      if (count($errors)) {
        $this->exitWithError('validation.'. $errorCode .'.error', $errors);
      }
    }

    private function decodePayload() {
      if ($this->isPost()) {
        try {
          return json_decode($_POST['payload'], true);
        } catch (\Exception $e) {
          $this->exitWithError('parse.error', $e->getMessage());
        }
      }

      return [];
    }

    public function exitWithError($error, $errorData = []) {
      parent::setError($error, $errorData);
      $this->result();
      exit();
    }

    private function setInitialState() {
      if (!$this->user->getId()) {
        return;
      }

      if ($this->isGet()) {
        $this->updateState('initialData', (new \lib\InitialState())->init($this->user->getId()));
      } else if ($this->isPost() && $this->user->getState('loggedIn')) {
        $this->updateState('pageData.initialData', (new \lib\InitialState())->init($this->user->getId()));
      }
    }

    private function result() {
      $this->setInitialState();

      if ($this->isGet()) {
        $this->updateState('initialData.view', $this->router->getState('match'));
        $this->updateState('initialData.view.url', $this->router->getState('url'));
        $this->updateState('initialData.routes', $this->router->getState('routes'));
        $this->updateState('initialData.validationRules', Validation::collectRules());

        // templates
        $state = $this->getState();
        $view = new View();
        echo $view->render($state);
      } else {
        header('Content-Type: application/json');
        echo json_encode($this->getState(), JSON_NUMERIC_CHECK);
      }
    }
  }
