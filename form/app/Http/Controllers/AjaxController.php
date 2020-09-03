<?php

namespace App\Http\Controllers;

class AjaxController extends Base {

    public function handle() {
        return ['status' => 'ok'];
    }
}