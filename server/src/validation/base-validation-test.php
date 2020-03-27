<?php

namespace src;

use PHPUnit\Framework\TestCase;

final class BaseValidationTest extends TestCase {
  /** @var validation\BaseValidation */
  protected $instance;

  public function testEqual(): void {
    $this->assertTrue((new validation\BaseValidation('111222', ['equal' => '111222']))->valid);
    $this->assertTrue(!(new validation\BaseValidation('111222', ['equal' => 111222]))->valid);
  }

  public function testMatch(): void {
    $this->assertTrue((new validation\BaseValidation('other', ['match' => '^(noun|verb|other|phrase)$']))->valid);
    $this->assertTrue(!(new validation\BaseValidation('otherr', ['match' => '^(noun|verb|other|phrase)$']))->valid);
  }

  public function testRequired(): void {
    $this->assertTrue((new validation\BaseValidation('a', ['required' => true]))->valid);
    $this->assertTrue(!(new validation\BaseValidation('', ['required' => true]))->valid);
  }
}

