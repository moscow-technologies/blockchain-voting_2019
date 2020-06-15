<?php

namespace App\Service;

use Illuminate\Auth\GenericUser;
use Illuminate\Contracts;

class User {

    public const SESSION_KEY_USER = 'user';

    /** @var GenericUser */
    private $_user;

    public function getUser(Contracts\Session\Session $session): ?GenericUser {
        if ($this->_user === null) {
            $this->_user = $this->_initUser($session);
        }
        return $this->_user;
    }

    public function clearUserSession() {
        $session = app()['session.store'];
        $session->remove(User::SESSION_KEY_USER);
        $session->remove(OAuth::$USER_TOKEN);
    }

    private function _initUser(Contracts\Session\Session $session): ?GenericUser {
        $oauth = OAuth::getInstance();
        $userFromSession = $this->_retrieveUserFromSession($session);
        if ($userFromSession !== null) {
            if (!$oauth->verifyCookieToken($session)) {
                return null;
            }
            return $this->_initGenericUser($userFromSession);
        }
        $userData = $oauth->getUserDataFromService();
        if ($userData === null) {
            return null;
        }
        $this->_storeUserInSession($session, $userData);
        return $this->_initGenericUser($userData);
    }

    private function _initGenericUser(array $userData) {
        return new GenericUser([
            'id'       => $userData['SSO_ID'],
            'phone'    => $userData['mobile'] ?? '',
            'email'    => $userData['mail'],
            'is_legal' => $userData['is_legal'] ?? false,
        ]);
    }

    private function _storeUserInSession(Contracts\Session\Session $session, array $user) {
         $session->put(self::SESSION_KEY_USER, $user);
    }

    private function _retrieveUserFromSession(Contracts\Session\Session $session): ?array {
        $user = $session->get(self::SESSION_KEY_USER);
        return is_array($user) && count($user) > 0 ? $user : null;
    }

    private function _convertUserToLegacyUser(GenericUser $user) {
        return [
            'SUDIR_ID'  => $user->id,
            'TELEPHONE' => $user->phone,
            'EMAIL'     => $user->email,
        ];
    }

    public function getUserInLegacyFormat($session): array {
        $user = $this->getUser($session);
        return $this->_convertUserToLegacyUser($user);
    }
}