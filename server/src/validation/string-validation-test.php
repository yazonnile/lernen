<?php

namespace src;

use PHPUnit\Framework\TestCase;

final class StringValidationTest extends TestCase {
  public function testMin(): void {
    $this->assertTrue((new validation\StringValidation('asc', ['min' => 2]))->valid);
    $this->assertTrue(!(new validation\StringValidation('asc', ['max' => 2]))->valid);
  }

  public function testMax(): void {
    $this->assertTrue((new validation\StringValidation('asc', ['max' => 4]))->valid);
    $this->assertTrue(!(new validation\StringValidation('asc', ['min' => 4]))->valid);
  }

  public function testBetween(): void {
    $this->assertTrue((new validation\StringValidation('asc', ['between' => [3,5]]))->valid);
    $this->assertTrue(!(new validation\StringValidation('asc', ['between' => [1,2]]))->valid);
  }
}

