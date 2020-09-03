<?php

namespace App\Http\Middleware;

use Closure;

class BindSessionFromRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null) {
        app()->singleton('session.store', function () use ($request) {
            return $request->getSession();
        });
        return $next($request);
    }
}
