<?php

  namespace api;

  abstract class Access {
    const guest = 0;
    const user = 1;

    /**
     * @param int[] $accessRoles
     * @param \lib\User $user
     * @return bool
     */
    static public function hasAccess($accessRoles, $user) {

      // check every required access option
      foreach ($accessRoles as $role) {
        if ($role === self::guest && $user->isLoggedIn()
          || $role === self::user && !$user->isLoggedIn()
        ) {
          return false;
        }
      }

      return true;
    }
  }
