<?php

  namespace routes;

  class Setup extends \lib\RouteComponent {
    /** @var \api\Setup() */
    private $api;

    public function __construct() {
      $this->api = new \api\Setup();
    }

    public function updateSetup() {
      $this->api->update('setup', [
        'userId' => $this->user->getId(),
        'voice' => intval($this->getPayload('voice')),
        'voiceSpeed' => $this->getPayload('voiceSpeed'),
        'phrases' => intval($this->getPayload('phrases')),
        'soundPhrases' => intval($this->getPayload('soundPhrases')),
        'other' => intval($this->getPayload('other')),
        'nouns' => intval($this->getPayload('nouns')),
        'soundNouns' => intval($this->getPayload('soundNouns')),
        'articles' => intval($this->getPayload('articles')),
        'soundArticles' => intval($this->getPayload('soundArticles')),
        'plural' => intval($this->getPayload('plural')),
        'soundPlural' => intval($this->getPayload('soundPlural')),
        'verbs' => intval($this->getPayload('verbs')),
        'soundVerbs' => intval($this->getPayload('soundVerbs')),
        'strongVerbs' => intval($this->getPayload('strongVerbs')),
        'soundStrongVerbs' => intval($this->getPayload('soundStrongVerbs')),
        'irregularVerbs' => intval($this->getPayload('irregularVerbs')),
        'soundIrregularVerbs' => intval($this->getPayload('soundIrregularVerbs')),
      ]);

      $this->addMessage('updateSetup.success');
    }
  }
