<?php
// @formatter:off

/**
 * A helper file for Laravel 5, to provide autocomplete information to your IDE
 * Generated for Laravel Lumen (7.0.5) (Laravel Components ^7.0) on 2020-04-21 16:55:00.
 *
 * This file should not be included in your code, only analyzed by your IDE!
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 * @see https://github.com/barryvdh/laravel-ide-helper
 */

namespace Illuminate\Support\Facades { 

    /**
     * 
     *
     * @method static bool check()
     * @method static bool guest()
     * @method static \Illuminate\Contracts\Auth\Authenticatable|null user()
     * @method static int|string|null id()
     * @method static bool validate(array $credentials = [])
     * @method static void setUser(\Illuminate\Contracts\Auth\Authenticatable $user)
     * @method static bool attempt(array $credentials = [], bool $remember = false)
     * @method static bool once(array $credentials = [])
     * @method static void login(\Illuminate\Contracts\Auth\Authenticatable $user, bool $remember = false)
     * @method static \Illuminate\Contracts\Auth\Authenticatable loginUsingId(mixed $id, bool $remember = false)
     * @method static bool onceUsingId(mixed $id)
     * @method static bool viaRemember()
     * @method static void logout()
     * @method static \Symfony\Component\HttpFoundation\Response|null onceBasic(string $field = 'email',array $extraConditions = [])
     * @method static bool|null logoutOtherDevices(string $password, string $attribute = 'password')
     * @see \Illuminate\Auth\AuthManager
     * @see \Illuminate\Contracts\Auth\Factory
     * @see \Illuminate\Contracts\Auth\Guard
     * @see \Illuminate\Contracts\Auth\StatefulGuard
     */ 
    class Auth {
        
        /**
         * Attempt to get the guard from the local cache.
         *
         * @param string|null $name
         * @return \Illuminate\Contracts\Auth\Guard|\Illuminate\Contracts\Auth\StatefulGuard 
         * @static 
         */ 
        public static function guard($name = null)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->guard($name);
        }
        
        /**
         * Create a session based authentication guard.
         *
         * @param string $name
         * @param array $config
         * @return \Illuminate\Auth\SessionGuard 
         * @static 
         */ 
        public static function createSessionDriver($name, $config)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->createSessionDriver($name, $config);
        }
        
        /**
         * Create a token based authentication guard.
         *
         * @param string $name
         * @param array $config
         * @return \Illuminate\Auth\TokenGuard 
         * @static 
         */ 
        public static function createTokenDriver($name, $config)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->createTokenDriver($name, $config);
        }
        
        /**
         * Get the default authentication driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultDriver()
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->getDefaultDriver();
        }
        
        /**
         * Set the default guard driver the factory should serve.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function shouldUse($name)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        $instance->shouldUse($name);
        }
        
        /**
         * Set the default authentication driver name.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function setDefaultDriver($name)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        $instance->setDefaultDriver($name);
        }
        
        /**
         * Register a new callback based request guard.
         *
         * @param string $driver
         * @param callable $callback
         * @return \Illuminate\Auth\AuthManager 
         * @static 
         */ 
        public static function viaRequest($driver, $callback)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->viaRequest($driver, $callback);
        }
        
        /**
         * Get the user resolver callback.
         *
         * @return \Closure 
         * @static 
         */ 
        public static function userResolver()
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->userResolver();
        }
        
        /**
         * Set the callback to be used to resolve users.
         *
         * @param \Closure $userResolver
         * @return \Illuminate\Auth\AuthManager 
         * @static 
         */ 
        public static function resolveUsersUsing($userResolver)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->resolveUsersUsing($userResolver);
        }
        
        /**
         * Register a custom driver creator Closure.
         *
         * @param string $driver
         * @param \Closure $callback
         * @return \Illuminate\Auth\AuthManager 
         * @static 
         */ 
        public static function extend($driver, $callback)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->extend($driver, $callback);
        }
        
        /**
         * Register a custom provider creator Closure.
         *
         * @param string $name
         * @param \Closure $callback
         * @return \Illuminate\Auth\AuthManager 
         * @static 
         */ 
        public static function provider($name, $callback)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->provider($name, $callback);
        }
        
        /**
         * Determines if any guards have already been resolved.
         *
         * @return bool 
         * @static 
         */ 
        public static function hasResolvedGuards()
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->hasResolvedGuards();
        }
        
        /**
         * Create the user provider implementation for the driver.
         *
         * @param string|null $provider
         * @return \Illuminate\Contracts\Auth\UserProvider|null 
         * @throws \InvalidArgumentException
         * @static 
         */ 
        public static function createUserProvider($provider = null)
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->createUserProvider($provider);
        }
        
        /**
         * Get the default user provider name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultUserProvider()
        {
                        /** @var \Illuminate\Auth\AuthManager $instance */
                        return $instance->getDefaultUserProvider();
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Database\DatabaseManager
     * @see \Illuminate\Database\Connection
     */ 
    class DB {
        
        /**
         * Get a database connection instance.
         *
         * @param string|null $name
         * @return \Illuminate\Database\Connection 
         * @static 
         */ 
        public static function connection($name = null)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->connection($name);
        }
        
        /**
         * Disconnect from the given database and remove from local cache.
         *
         * @param string|null $name
         * @return void 
         * @static 
         */ 
        public static function purge($name = null)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        $instance->purge($name);
        }
        
        /**
         * Disconnect from the given database.
         *
         * @param string|null $name
         * @return void 
         * @static 
         */ 
        public static function disconnect($name = null)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        $instance->disconnect($name);
        }
        
        /**
         * Reconnect to the given database.
         *
         * @param string|null $name
         * @return \Illuminate\Database\Connection 
         * @static 
         */ 
        public static function reconnect($name = null)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->reconnect($name);
        }
        
        /**
         * Get the default connection name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultConnection()
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->getDefaultConnection();
        }
        
        /**
         * Set the default connection name.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function setDefaultConnection($name)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        $instance->setDefaultConnection($name);
        }
        
        /**
         * Get all of the support drivers.
         *
         * @return array 
         * @static 
         */ 
        public static function supportedDrivers()
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->supportedDrivers();
        }
        
        /**
         * Get all of the drivers that are actually available.
         *
         * @return array 
         * @static 
         */ 
        public static function availableDrivers()
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->availableDrivers();
        }
        
        /**
         * Register an extension connection resolver.
         *
         * @param string $name
         * @param callable $resolver
         * @return void 
         * @static 
         */ 
        public static function extend($name, $resolver)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        $instance->extend($name, $resolver);
        }
        
        /**
         * Return all of the created connections.
         *
         * @return array 
         * @static 
         */ 
        public static function getConnections()
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        return $instance->getConnections();
        }
        
        /**
         * Set the database reconnector callback.
         *
         * @param callable $reconnector
         * @return void 
         * @static 
         */ 
        public static function setReconnector($reconnector)
        {
                        /** @var \Illuminate\Database\DatabaseManager $instance */
                        $instance->setReconnector($reconnector);
        }
        
        /**
         * Get a schema builder instance for the connection.
         *
         * @return \Illuminate\Database\Schema\MySqlBuilder 
         * @static 
         */ 
        public static function getSchemaBuilder()
        {
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getSchemaBuilder();
        }
        
        /**
         * Set the query grammar to the default implementation.
         *
         * @return void 
         * @static 
         */ 
        public static function useDefaultQueryGrammar()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->useDefaultQueryGrammar();
        }
        
        /**
         * Set the schema grammar to the default implementation.
         *
         * @return void 
         * @static 
         */ 
        public static function useDefaultSchemaGrammar()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->useDefaultSchemaGrammar();
        }
        
        /**
         * Set the query post processor to the default implementation.
         *
         * @return void 
         * @static 
         */ 
        public static function useDefaultPostProcessor()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->useDefaultPostProcessor();
        }
        
        /**
         * Begin a fluent query against a database table.
         *
         * @param \Closure|\Illuminate\Database\Query\Builder|string $table
         * @param string|null $as
         * @return \Illuminate\Database\Query\Builder 
         * @static 
         */ 
        public static function table($table, $as = null)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->table($table, $as);
        }
        
        /**
         * Get a new query builder instance.
         *
         * @return \Illuminate\Database\Query\Builder 
         * @static 
         */ 
        public static function query()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->query();
        }
        
        /**
         * Run a select statement and return a single result.
         *
         * @param string $query
         * @param array $bindings
         * @param bool $useReadPdo
         * @return mixed 
         * @static 
         */ 
        public static function selectOne($query, $bindings = [], $useReadPdo = true)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->selectOne($query, $bindings, $useReadPdo);
        }
        
        /**
         * Run a select statement against the database.
         *
         * @param string $query
         * @param array $bindings
         * @return array 
         * @static 
         */ 
        public static function selectFromWriteConnection($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->selectFromWriteConnection($query, $bindings);
        }
        
        /**
         * Run a select statement against the database.
         *
         * @param string $query
         * @param array $bindings
         * @param bool $useReadPdo
         * @return array 
         * @static 
         */ 
        public static function select($query, $bindings = [], $useReadPdo = true)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->select($query, $bindings, $useReadPdo);
        }
        
        /**
         * Run a select statement against the database and returns a generator.
         *
         * @param string $query
         * @param array $bindings
         * @param bool $useReadPdo
         * @return \Generator 
         * @static 
         */ 
        public static function cursor($query, $bindings = [], $useReadPdo = true)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->cursor($query, $bindings, $useReadPdo);
        }
        
        /**
         * Run an insert statement against the database.
         *
         * @param string $query
         * @param array $bindings
         * @return bool 
         * @static 
         */ 
        public static function insert($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->insert($query, $bindings);
        }
        
        /**
         * Run an update statement against the database.
         *
         * @param string $query
         * @param array $bindings
         * @return int 
         * @static 
         */ 
        public static function update($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->update($query, $bindings);
        }
        
        /**
         * Run a delete statement against the database.
         *
         * @param string $query
         * @param array $bindings
         * @return int 
         * @static 
         */ 
        public static function delete($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->delete($query, $bindings);
        }
        
        /**
         * Execute an SQL statement and return the boolean result.
         *
         * @param string $query
         * @param array $bindings
         * @return bool 
         * @static 
         */ 
        public static function statement($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->statement($query, $bindings);
        }
        
        /**
         * Run an SQL statement and get the number of rows affected.
         *
         * @param string $query
         * @param array $bindings
         * @return int 
         * @static 
         */ 
        public static function affectingStatement($query, $bindings = [])
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->affectingStatement($query, $bindings);
        }
        
        /**
         * Run a raw, unprepared query against the PDO connection.
         *
         * @param string $query
         * @return bool 
         * @static 
         */ 
        public static function unprepared($query)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->unprepared($query);
        }
        
        /**
         * Execute the given callback in "dry run" mode.
         *
         * @param \Closure $callback
         * @return array 
         * @static 
         */ 
        public static function pretend($callback)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->pretend($callback);
        }
        
        /**
         * Bind values to their parameters in the given statement.
         *
         * @param \PDOStatement $statement
         * @param array $bindings
         * @return void 
         * @static 
         */ 
        public static function bindValues($statement, $bindings)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->bindValues($statement, $bindings);
        }
        
        /**
         * Prepare the query bindings for execution.
         *
         * @param array $bindings
         * @return array 
         * @static 
         */ 
        public static function prepareBindings($bindings)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->prepareBindings($bindings);
        }
        
        /**
         * Log a query in the connection's query log.
         *
         * @param string $query
         * @param array $bindings
         * @param float|null $time
         * @return void 
         * @static 
         */ 
        public static function logQuery($query, $bindings, $time = null)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->logQuery($query, $bindings, $time);
        }
        
        /**
         * Register a database query listener with the connection.
         *
         * @param \Closure $callback
         * @return void 
         * @static 
         */ 
        public static function listen($callback)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->listen($callback);
        }
        
        /**
         * Get a new raw query expression.
         *
         * @param mixed $value
         * @return \Illuminate\Database\Query\Expression 
         * @static 
         */ 
        public static function raw($value)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->raw($value);
        }
        
        /**
         * Indicate if any records have been modified.
         *
         * @param bool $value
         * @return void 
         * @static 
         */ 
        public static function recordsHaveBeenModified($value = true)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->recordsHaveBeenModified($value);
        }
        
        /**
         * Is Doctrine available?
         *
         * @return bool 
         * @static 
         */ 
        public static function isDoctrineAvailable()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->isDoctrineAvailable();
        }
        
        /**
         * Get a Doctrine Schema Column instance.
         *
         * @param string $table
         * @param string $column
         * @return \Doctrine\DBAL\Schema\Column 
         * @static 
         */ 
        public static function getDoctrineColumn($table, $column)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getDoctrineColumn($table, $column);
        }
        
        /**
         * Get the Doctrine DBAL schema manager for the connection.
         *
         * @return \Doctrine\DBAL\Schema\AbstractSchemaManager 
         * @static 
         */ 
        public static function getDoctrineSchemaManager()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getDoctrineSchemaManager();
        }
        
        /**
         * Get the Doctrine DBAL database connection instance.
         *
         * @return \Doctrine\DBAL\Connection 
         * @static 
         */ 
        public static function getDoctrineConnection()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getDoctrineConnection();
        }
        
        /**
         * Get the current PDO connection.
         *
         * @return \PDO 
         * @static 
         */ 
        public static function getPdo()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getPdo();
        }
        
        /**
         * Get the current PDO connection parameter without executing any reconnect logic.
         *
         * @return \PDO|\Closure|null 
         * @static 
         */ 
        public static function getRawPdo()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getRawPdo();
        }
        
        /**
         * Get the current PDO connection used for reading.
         *
         * @return \PDO 
         * @static 
         */ 
        public static function getReadPdo()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getReadPdo();
        }
        
        /**
         * Get the current read PDO connection parameter without executing any reconnect logic.
         *
         * @return \PDO|\Closure|null 
         * @static 
         */ 
        public static function getRawReadPdo()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getRawReadPdo();
        }
        
        /**
         * Set the PDO connection.
         *
         * @param \PDO|\Closure|null $pdo
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setPdo($pdo)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setPdo($pdo);
        }
        
        /**
         * Set the PDO connection used for reading.
         *
         * @param \PDO|\Closure|null $pdo
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setReadPdo($pdo)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setReadPdo($pdo);
        }
        
        /**
         * Get the database connection name.
         *
         * @return string|null 
         * @static 
         */ 
        public static function getName()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getName();
        }
        
        /**
         * Get an option from the configuration options.
         *
         * @param string|null $option
         * @return mixed 
         * @static 
         */ 
        public static function getConfig($option = null)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getConfig($option);
        }
        
        /**
         * Get the PDO driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDriverName()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getDriverName();
        }
        
        /**
         * Get the query grammar used by the connection.
         *
         * @return \Illuminate\Database\Query\Grammars\Grammar 
         * @static 
         */ 
        public static function getQueryGrammar()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getQueryGrammar();
        }
        
        /**
         * Set the query grammar used by the connection.
         *
         * @param \Illuminate\Database\Query\Grammars\Grammar $grammar
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setQueryGrammar($grammar)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setQueryGrammar($grammar);
        }
        
        /**
         * Get the schema grammar used by the connection.
         *
         * @return \Illuminate\Database\Schema\Grammars\Grammar 
         * @static 
         */ 
        public static function getSchemaGrammar()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getSchemaGrammar();
        }
        
        /**
         * Set the schema grammar used by the connection.
         *
         * @param \Illuminate\Database\Schema\Grammars\Grammar $grammar
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setSchemaGrammar($grammar)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setSchemaGrammar($grammar);
        }
        
        /**
         * Get the query post processor used by the connection.
         *
         * @return \Illuminate\Database\Query\Processors\Processor 
         * @static 
         */ 
        public static function getPostProcessor()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getPostProcessor();
        }
        
        /**
         * Set the query post processor used by the connection.
         *
         * @param \Illuminate\Database\Query\Processors\Processor $processor
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setPostProcessor($processor)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setPostProcessor($processor);
        }
        
        /**
         * Get the event dispatcher used by the connection.
         *
         * @return \Illuminate\Contracts\Events\Dispatcher 
         * @static 
         */ 
        public static function getEventDispatcher()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getEventDispatcher();
        }
        
        /**
         * Set the event dispatcher instance on the connection.
         *
         * @param \Illuminate\Contracts\Events\Dispatcher $events
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setEventDispatcher($events)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setEventDispatcher($events);
        }
        
        /**
         * Unset the event dispatcher for this connection.
         *
         * @return void 
         * @static 
         */ 
        public static function unsetEventDispatcher()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->unsetEventDispatcher();
        }
        
        /**
         * Determine if the connection is in a "dry run".
         *
         * @return bool 
         * @static 
         */ 
        public static function pretending()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->pretending();
        }
        
        /**
         * Get the connection query log.
         *
         * @return array 
         * @static 
         */ 
        public static function getQueryLog()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getQueryLog();
        }
        
        /**
         * Clear the query log.
         *
         * @return void 
         * @static 
         */ 
        public static function flushQueryLog()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->flushQueryLog();
        }
        
        /**
         * Enable the query log on the connection.
         *
         * @return void 
         * @static 
         */ 
        public static function enableQueryLog()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->enableQueryLog();
        }
        
        /**
         * Disable the query log on the connection.
         *
         * @return void 
         * @static 
         */ 
        public static function disableQueryLog()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->disableQueryLog();
        }
        
        /**
         * Determine whether we're logging queries.
         *
         * @return bool 
         * @static 
         */ 
        public static function logging()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->logging();
        }
        
        /**
         * Get the name of the connected database.
         *
         * @return string 
         * @static 
         */ 
        public static function getDatabaseName()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getDatabaseName();
        }
        
        /**
         * Set the name of the connected database.
         *
         * @param string $database
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setDatabaseName($database)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setDatabaseName($database);
        }
        
        /**
         * Get the table prefix for the connection.
         *
         * @return string 
         * @static 
         */ 
        public static function getTablePrefix()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->getTablePrefix();
        }
        
        /**
         * Set the table prefix in use by the connection.
         *
         * @param string $prefix
         * @return \Illuminate\Database\MySqlConnection 
         * @static 
         */ 
        public static function setTablePrefix($prefix)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->setTablePrefix($prefix);
        }
        
        /**
         * Set the table prefix and return the grammar.
         *
         * @param \Illuminate\Database\Grammar $grammar
         * @return \Illuminate\Database\Grammar 
         * @static 
         */ 
        public static function withTablePrefix($grammar)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->withTablePrefix($grammar);
        }
        
        /**
         * Register a connection resolver.
         *
         * @param string $driver
         * @param \Closure $callback
         * @return void 
         * @static 
         */ 
        public static function resolverFor($driver, $callback)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        \Illuminate\Database\MySqlConnection::resolverFor($driver, $callback);
        }
        
        /**
         * Get the connection resolver for the given driver.
         *
         * @param string $driver
         * @return mixed 
         * @static 
         */ 
        public static function getResolver($driver)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        return \Illuminate\Database\MySqlConnection::getResolver($driver);
        }
        
        /**
         * Execute a Closure within a transaction.
         *
         * @param \Closure $callback
         * @param int $attempts
         * @return mixed 
         * @throws \Throwable
         * @static 
         */ 
        public static function transaction($callback, $attempts = 1)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->transaction($callback, $attempts);
        }
        
        /**
         * Start a new database transaction.
         *
         * @return void 
         * @throws \Throwable
         * @static 
         */ 
        public static function beginTransaction()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->beginTransaction();
        }
        
        /**
         * Commit the active database transaction.
         *
         * @return void 
         * @throws \Throwable
         * @static 
         */ 
        public static function commit()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->commit();
        }
        
        /**
         * Rollback the active database transaction.
         *
         * @param int|null $toLevel
         * @return void 
         * @throws \Throwable
         * @static 
         */ 
        public static function rollBack($toLevel = null)
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        $instance->rollBack($toLevel);
        }
        
        /**
         * Get the number of active transactions.
         *
         * @return int 
         * @static 
         */ 
        public static function transactionLevel()
        {
            //Method inherited from \Illuminate\Database\Connection            
                        /** @var \Illuminate\Database\MySqlConnection $instance */
                        return $instance->transactionLevel();
        }
         
    }

    /**
     * 
     *
     * @method static \Illuminate\Contracts\Cache\Lock lock(string $name, int $seconds = 0, mixed $owner = null)
     * @method static \Illuminate\Contracts\Cache\Lock restoreLock(string $name, string $owner)
     * @see \Illuminate\Cache\CacheManager
     * @see \Illuminate\Cache\Repository
     */ 
    class Cache {
        
        /**
         * Get a cache store instance by name, wrapped in a repository.
         *
         * @param string|null $name
         * @return \Illuminate\Contracts\Cache\Repository 
         * @static 
         */ 
        public static function store($name = null)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->store($name);
        }
        
        /**
         * Get a cache driver instance.
         *
         * @param string|null $driver
         * @return \Illuminate\Contracts\Cache\Repository 
         * @static 
         */ 
        public static function driver($driver = null)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->driver($driver);
        }
        
        /**
         * Create a new cache repository with the given implementation.
         *
         * @param \Illuminate\Contracts\Cache\Store $store
         * @return \Illuminate\Cache\Repository 
         * @static 
         */ 
        public static function repository($store)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->repository($store);
        }
        
        /**
         * Re-set the event dispatcher on all resolved cache repositories.
         *
         * @return void 
         * @static 
         */ 
        public static function refreshEventDispatcher()
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        $instance->refreshEventDispatcher();
        }
        
        /**
         * Get the default cache driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultDriver()
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->getDefaultDriver();
        }
        
        /**
         * Set the default cache driver name.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function setDefaultDriver($name)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        $instance->setDefaultDriver($name);
        }
        
        /**
         * Unset the given driver instances.
         *
         * @param array|string|null $name
         * @return \Illuminate\Cache\CacheManager 
         * @static 
         */ 
        public static function forgetDriver($name = null)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->forgetDriver($name);
        }
        
        /**
         * Register a custom driver creator Closure.
         *
         * @param string $driver
         * @param \Closure $callback
         * @return \Illuminate\Cache\CacheManager 
         * @static 
         */ 
        public static function extend($driver, $callback)
        {
                        /** @var \Illuminate\Cache\CacheManager $instance */
                        return $instance->extend($driver, $callback);
        }
        
        /**
         * Determine if an item exists in the cache.
         *
         * @param string $key
         * @return bool 
         * @static 
         */ 
        public static function has($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->has($key);
        }
        
        /**
         * Determine if an item doesn't exist in the cache.
         *
         * @param string $key
         * @return bool 
         * @static 
         */ 
        public static function missing($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->missing($key);
        }
        
        /**
         * Retrieve an item from the cache by key.
         *
         * @param string $key
         * @param mixed $default
         * @return mixed 
         * @static 
         */ 
        public static function get($key, $default = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->get($key, $default);
        }
        
        /**
         * Retrieve multiple items from the cache by key.
         * 
         * Items not found in the cache will have a null value.
         *
         * @param array $keys
         * @return array 
         * @static 
         */ 
        public static function many($keys)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->many($keys);
        }
        
        /**
         * Obtains multiple cache items by their unique keys.
         *
         * @param \Psr\SimpleCache\iterable $keys A list of keys that can obtained in a single operation.
         * @param mixed $default Default value to return for keys that do not exist.
         * @return \Psr\SimpleCache\iterable A list of key => value pairs. Cache keys that do not exist or are stale will have $default as value.
         * @throws \Psr\SimpleCache\InvalidArgumentException
         *   MUST be thrown if $keys is neither an array nor a Traversable,
         *   or if any of the $keys are not a legal value.
         * @static 
         */ 
        public static function getMultiple($keys, $default = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->getMultiple($keys, $default);
        }
        
        /**
         * Retrieve an item from the cache and delete it.
         *
         * @param string $key
         * @param mixed $default
         * @return mixed 
         * @static 
         */ 
        public static function pull($key, $default = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->pull($key, $default);
        }
        
        /**
         * Store an item in the cache.
         *
         * @param string $key
         * @param mixed $value
         * @param \DateTimeInterface|\DateInterval|int|null $ttl
         * @return bool 
         * @static 
         */ 
        public static function put($key, $value, $ttl = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->put($key, $value, $ttl);
        }
        
        /**
         * Persists data in the cache, uniquely referenced by a key with an optional expiration TTL time.
         *
         * @param string $key The key of the item to store.
         * @param mixed $value The value of the item to store, must be serializable.
         * @param null|int|\DateInterval $ttl Optional. The TTL value of this item. If no value is sent and
         *                                      the driver supports TTL then the library may set a default value
         *                                      for it or let the driver take care of that.
         * @return bool True on success and false on failure.
         * @throws \Psr\SimpleCache\InvalidArgumentException
         *   MUST be thrown if the $key string is not a legal value.
         * @static 
         */ 
        public static function set($key, $value, $ttl = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->set($key, $value, $ttl);
        }
        
        /**
         * Store multiple items in the cache for a given number of seconds.
         *
         * @param array $values
         * @param \DateTimeInterface|\DateInterval|int|null $ttl
         * @return bool 
         * @static 
         */ 
        public static function putMany($values, $ttl = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->putMany($values, $ttl);
        }
        
        /**
         * Persists a set of key => value pairs in the cache, with an optional TTL.
         *
         * @param \Psr\SimpleCache\iterable $values A list of key => value pairs for a multiple-set operation.
         * @param null|int|\DateInterval $ttl Optional. The TTL value of this item. If no value is sent and
         *                                       the driver supports TTL then the library may set a default value
         *                                       for it or let the driver take care of that.
         * @return bool True on success and false on failure.
         * @throws \Psr\SimpleCache\InvalidArgumentException
         *   MUST be thrown if $values is neither an array nor a Traversable,
         *   or if any of the $values are not a legal value.
         * @static 
         */ 
        public static function setMultiple($values, $ttl = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->setMultiple($values, $ttl);
        }
        
        /**
         * Store an item in the cache if the key does not exist.
         *
         * @param string $key
         * @param mixed $value
         * @param \DateTimeInterface|\DateInterval|int|null $ttl
         * @return bool 
         * @static 
         */ 
        public static function add($key, $value, $ttl = null)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->add($key, $value, $ttl);
        }
        
        /**
         * Increment the value of an item in the cache.
         *
         * @param string $key
         * @param mixed $value
         * @return int|bool 
         * @static 
         */ 
        public static function increment($key, $value = 1)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->increment($key, $value);
        }
        
        /**
         * Decrement the value of an item in the cache.
         *
         * @param string $key
         * @param mixed $value
         * @return int|bool 
         * @static 
         */ 
        public static function decrement($key, $value = 1)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->decrement($key, $value);
        }
        
        /**
         * Store an item in the cache indefinitely.
         *
         * @param string $key
         * @param mixed $value
         * @return bool 
         * @static 
         */ 
        public static function forever($key, $value)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->forever($key, $value);
        }
        
        /**
         * Get an item from the cache, or execute the given Closure and store the result.
         *
         * @param string $key
         * @param \DateTimeInterface|\DateInterval|int|null $ttl
         * @param \Closure $callback
         * @return mixed 
         * @static 
         */ 
        public static function remember($key, $ttl, $callback)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->remember($key, $ttl, $callback);
        }
        
        /**
         * Get an item from the cache, or execute the given Closure and store the result forever.
         *
         * @param string $key
         * @param \Closure $callback
         * @return mixed 
         * @static 
         */ 
        public static function sear($key, $callback)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->sear($key, $callback);
        }
        
        /**
         * Get an item from the cache, or execute the given Closure and store the result forever.
         *
         * @param string $key
         * @param \Closure $callback
         * @return mixed 
         * @static 
         */ 
        public static function rememberForever($key, $callback)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->rememberForever($key, $callback);
        }
        
        /**
         * Remove an item from the cache.
         *
         * @param string $key
         * @return bool 
         * @static 
         */ 
        public static function forget($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->forget($key);
        }
        
        /**
         * Delete an item from the cache by its unique key.
         *
         * @param string $key The unique cache key of the item to delete.
         * @return bool True if the item was successfully removed. False if there was an error.
         * @throws \Psr\SimpleCache\InvalidArgumentException
         *   MUST be thrown if the $key string is not a legal value.
         * @static 
         */ 
        public static function delete($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->delete($key);
        }
        
        /**
         * Deletes multiple cache items in a single operation.
         *
         * @param \Psr\SimpleCache\iterable $keys A list of string-based keys to be deleted.
         * @return bool True if the items were successfully removed. False if there was an error.
         * @throws \Psr\SimpleCache\InvalidArgumentException
         *   MUST be thrown if $keys is neither an array nor a Traversable,
         *   or if any of the $keys are not a legal value.
         * @static 
         */ 
        public static function deleteMultiple($keys)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->deleteMultiple($keys);
        }
        
        /**
         * Wipes clean the entire cache's keys.
         *
         * @return bool True on success and false on failure.
         * @static 
         */ 
        public static function clear()
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->clear();
        }
        
        /**
         * Begin executing a new tags operation if the store supports it.
         *
         * @param array|mixed $names
         * @return \Illuminate\Cache\TaggedCache 
         * @throws \BadMethodCallException
         * @static 
         */ 
        public static function tags($names)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->tags($names);
        }
        
        /**
         * Get the default cache time.
         *
         * @return int|null 
         * @static 
         */ 
        public static function getDefaultCacheTime()
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->getDefaultCacheTime();
        }
        
        /**
         * Set the default cache time in seconds.
         *
         * @param int|null $seconds
         * @return \Illuminate\Cache\Repository 
         * @static 
         */ 
        public static function setDefaultCacheTime($seconds)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->setDefaultCacheTime($seconds);
        }
        
        /**
         * Get the cache store implementation.
         *
         * @return \Illuminate\Contracts\Cache\Store 
         * @static 
         */ 
        public static function getStore()
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->getStore();
        }
        
        /**
         * Get the event dispatcher instance.
         *
         * @return \Illuminate\Contracts\Events\Dispatcher 
         * @static 
         */ 
        public static function getEventDispatcher()
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->getEventDispatcher();
        }
        
        /**
         * Set the event dispatcher instance.
         *
         * @param \Illuminate\Contracts\Events\Dispatcher $events
         * @return void 
         * @static 
         */ 
        public static function setEventDispatcher($events)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        $instance->setEventDispatcher($events);
        }
        
        /**
         * Determine if a cached value exists.
         *
         * @param string $key
         * @return bool 
         * @static 
         */ 
        public static function offsetExists($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->offsetExists($key);
        }
        
        /**
         * Retrieve an item from the cache by key.
         *
         * @param string $key
         * @return mixed 
         * @static 
         */ 
        public static function offsetGet($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->offsetGet($key);
        }
        
        /**
         * Store an item in the cache for the default time.
         *
         * @param string $key
         * @param mixed $value
         * @return void 
         * @static 
         */ 
        public static function offsetSet($key, $value)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        $instance->offsetSet($key, $value);
        }
        
        /**
         * Remove an item from the cache.
         *
         * @param string $key
         * @return void 
         * @static 
         */ 
        public static function offsetUnset($key)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        $instance->offsetUnset($key);
        }
        
        /**
         * Register a custom macro.
         *
         * @param string $name
         * @param object|callable $macro
         * @return void 
         * @static 
         */ 
        public static function macro($name, $macro)
        {
                        \Illuminate\Cache\Repository::macro($name, $macro);
        }
        
        /**
         * Mix another object into the class.
         *
         * @param object $mixin
         * @param bool $replace
         * @return void 
         * @throws \ReflectionException
         * @static 
         */ 
        public static function mixin($mixin, $replace = true)
        {
                        \Illuminate\Cache\Repository::mixin($mixin, $replace);
        }
        
        /**
         * Checks if macro is registered.
         *
         * @param string $name
         * @return bool 
         * @static 
         */ 
        public static function hasMacro($name)
        {
                        return \Illuminate\Cache\Repository::hasMacro($name);
        }
        
        /**
         * Dynamically handle calls to the class.
         *
         * @param string $method
         * @param array $parameters
         * @return mixed 
         * @throws \BadMethodCallException
         * @static 
         */ 
        public static function macroCall($method, $parameters)
        {
                        /** @var \Illuminate\Cache\Repository $instance */
                        return $instance->macroCall($method, $parameters);
        }
        
        /**
         * Remove all items from the cache.
         *
         * @return bool 
         * @static 
         */ 
        public static function flush()
        {
                        /** @var \Illuminate\Cache\FileStore $instance */
                        return $instance->flush();
        }
        
        /**
         * Get the Filesystem instance.
         *
         * @return \Illuminate\Filesystem\Filesystem 
         * @static 
         */ 
        public static function getFilesystem()
        {
                        /** @var \Illuminate\Cache\FileStore $instance */
                        return $instance->getFilesystem();
        }
        
        /**
         * Get the working directory of the cache.
         *
         * @return string 
         * @static 
         */ 
        public static function getDirectory()
        {
                        /** @var \Illuminate\Cache\FileStore $instance */
                        return $instance->getDirectory();
        }
        
        /**
         * Get the cache key prefix.
         *
         * @return string 
         * @static 
         */ 
        public static function getPrefix()
        {
                        /** @var \Illuminate\Cache\FileStore $instance */
                        return $instance->getPrefix();
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Events\Dispatcher
     */ 
    class Event {
        
        /**
         * Register an event listener with the dispatcher.
         *
         * @param string|array $events
         * @param \Closure|string $listener
         * @return void 
         * @static 
         */ 
        public static function listen($events, $listener)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->listen($events, $listener);
        }
        
        /**
         * Determine if a given event has listeners.
         *
         * @param string $eventName
         * @return bool 
         * @static 
         */ 
        public static function hasListeners($eventName)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->hasListeners($eventName);
        }
        
        /**
         * Determine if the given event has any wildcard listeners.
         *
         * @param string $eventName
         * @return bool 
         * @static 
         */ 
        public static function hasWildcardListeners($eventName)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->hasWildcardListeners($eventName);
        }
        
        /**
         * Register an event and payload to be fired later.
         *
         * @param string $event
         * @param array $payload
         * @return void 
         * @static 
         */ 
        public static function push($event, $payload = [])
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->push($event, $payload);
        }
        
        /**
         * Flush a set of pushed events.
         *
         * @param string $event
         * @return void 
         * @static 
         */ 
        public static function flush($event)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->flush($event);
        }
        
        /**
         * Register an event subscriber with the dispatcher.
         *
         * @param object|string $subscriber
         * @return void 
         * @static 
         */ 
        public static function subscribe($subscriber)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->subscribe($subscriber);
        }
        
        /**
         * Fire an event until the first non-null response is returned.
         *
         * @param string|object $event
         * @param mixed $payload
         * @return array|null 
         * @static 
         */ 
        public static function until($event, $payload = [])
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->until($event, $payload);
        }
        
        /**
         * Fire an event and call the listeners.
         *
         * @param string|object $event
         * @param mixed $payload
         * @param bool $halt
         * @return array|null 
         * @static 
         */ 
        public static function dispatch($event, $payload = [], $halt = false)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->dispatch($event, $payload, $halt);
        }
        
        /**
         * Get all of the listeners for a given event name.
         *
         * @param string $eventName
         * @return array 
         * @static 
         */ 
        public static function getListeners($eventName)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->getListeners($eventName);
        }
        
        /**
         * Register an event listener with the dispatcher.
         *
         * @param \Closure|string $listener
         * @param bool $wildcard
         * @return \Closure 
         * @static 
         */ 
        public static function makeListener($listener, $wildcard = false)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->makeListener($listener, $wildcard);
        }
        
        /**
         * Create a class based listener using the IoC container.
         *
         * @param string $listener
         * @param bool $wildcard
         * @return \Closure 
         * @static 
         */ 
        public static function createClassListener($listener, $wildcard = false)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->createClassListener($listener, $wildcard);
        }
        
        /**
         * Remove a set of listeners from the dispatcher.
         *
         * @param string $event
         * @return void 
         * @static 
         */ 
        public static function forget($event)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->forget($event);
        }
        
        /**
         * Forget all of the pushed listeners.
         *
         * @return void 
         * @static 
         */ 
        public static function forgetPushed()
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        $instance->forgetPushed();
        }
        
        /**
         * Set the queue resolver implementation.
         *
         * @param callable $resolver
         * @return \Illuminate\Events\Dispatcher 
         * @static 
         */ 
        public static function setQueueResolver($resolver)
        {
                        /** @var \Illuminate\Events\Dispatcher $instance */
                        return $instance->setQueueResolver($resolver);
        }
        
        /**
         * Register a custom macro.
         *
         * @param string $name
         * @param object|callable $macro
         * @return void 
         * @static 
         */ 
        public static function macro($name, $macro)
        {
                        \Illuminate\Events\Dispatcher::macro($name, $macro);
        }
        
        /**
         * Mix another object into the class.
         *
         * @param object $mixin
         * @param bool $replace
         * @return void 
         * @throws \ReflectionException
         * @static 
         */ 
        public static function mixin($mixin, $replace = true)
        {
                        \Illuminate\Events\Dispatcher::mixin($mixin, $replace);
        }
        
        /**
         * Checks if macro is registered.
         *
         * @param string $name
         * @return bool 
         * @static 
         */ 
        public static function hasMacro($name)
        {
                        return \Illuminate\Events\Dispatcher::hasMacro($name);
        }
        
        /**
         * Assert if an event was dispatched based on a truth-test callback.
         *
         * @param string $event
         * @param callable|int|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertDispatched($event, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\EventFake $instance */
                        $instance->assertDispatched($event, $callback);
        }
        
        /**
         * Assert if a event was dispatched a number of times.
         *
         * @param string $event
         * @param int $times
         * @return void 
         * @static 
         */ 
        public static function assertDispatchedTimes($event, $times = 1)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\EventFake $instance */
                        $instance->assertDispatchedTimes($event, $times);
        }
        
        /**
         * Determine if an event was dispatched based on a truth-test callback.
         *
         * @param string $event
         * @param callable|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertNotDispatched($event, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\EventFake $instance */
                        $instance->assertNotDispatched($event, $callback);
        }
        
        /**
         * Get all of the events matching a truth-test callback.
         *
         * @param string $event
         * @param callable|null $callback
         * @return \Illuminate\Support\Collection 
         * @static 
         */ 
        public static function dispatched($event, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\EventFake $instance */
                        return $instance->dispatched($event, $callback);
        }
        
        /**
         * Determine if the given event has been dispatched.
         *
         * @param string $event
         * @return bool 
         * @static 
         */ 
        public static function hasDispatched($event)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\EventFake $instance */
                        return $instance->hasDispatched($event);
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Log\Logger
     */ 
    class Log {
        
        /**
         * Create a new, on-demand aggregate logger instance.
         *
         * @param array $channels
         * @param string|null $channel
         * @return \Psr\Log\LoggerInterface 
         * @static 
         */ 
        public static function stack($channels, $channel = null)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->stack($channels, $channel);
        }
        
        /**
         * Get a log channel instance.
         *
         * @param string|null $channel
         * @return \Psr\Log\LoggerInterface 
         * @static 
         */ 
        public static function channel($channel = null)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->channel($channel);
        }
        
        /**
         * Get a log driver instance.
         *
         * @param string|null $driver
         * @return \Psr\Log\LoggerInterface 
         * @static 
         */ 
        public static function driver($driver = null)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->driver($driver);
        }
        
        /**
         * 
         *
         * @return array 
         * @static 
         */ 
        public static function getChannels()
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->getChannels();
        }
        
        /**
         * Get the default log driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultDriver()
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->getDefaultDriver();
        }
        
        /**
         * Set the default log driver name.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function setDefaultDriver($name)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->setDefaultDriver($name);
        }
        
        /**
         * Register a custom driver creator Closure.
         *
         * @param string $driver
         * @param \Closure $callback
         * @return \Illuminate\Log\LogManager 
         * @static 
         */ 
        public static function extend($driver, $callback)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->extend($driver, $callback);
        }
        
        /**
         * Unset the given channel instance.
         *
         * @param string|null $name
         * @return \Illuminate\Log\LogManager 
         * @static 
         */ 
        public static function forgetChannel($driver = null)
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        return $instance->forgetChannel($driver);
        }
        
        /**
         * System is unusable.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function emergency($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->emergency($message, $context);
        }
        
        /**
         * Action must be taken immediately.
         * 
         * Example: Entire website down, database unavailable, etc. This should
         * trigger the SMS alerts and wake you up.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function alert($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->alert($message, $context);
        }
        
        /**
         * Critical conditions.
         * 
         * Example: Application component unavailable, unexpected exception.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function critical($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->critical($message, $context);
        }
        
        /**
         * Runtime errors that do not require immediate action but should typically
         * be logged and monitored.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function error($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->error($message, $context);
        }
        
        /**
         * Exceptional occurrences that are not errors.
         * 
         * Example: Use of deprecated APIs, poor use of an API, undesirable things
         * that are not necessarily wrong.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function warning($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->warning($message, $context);
        }
        
        /**
         * Normal but significant events.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function notice($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->notice($message, $context);
        }
        
        /**
         * Interesting events.
         * 
         * Example: User logs in, SQL logs.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function info($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->info($message, $context);
        }
        
        /**
         * Detailed debug information.
         *
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function debug($message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->debug($message, $context);
        }
        
        /**
         * Logs with an arbitrary level.
         *
         * @param mixed $level
         * @param string $message
         * @param array $context
         * @return void 
         * @static 
         */ 
        public static function log($level, $message, $context = [])
        {
                        /** @var \Illuminate\Log\LogManager $instance */
                        $instance->log($level, $message, $context);
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Queue\QueueManager
     * @see \Illuminate\Queue\Queue
     */ 
    class Queue {
        
        /**
         * Register an event listener for the before job event.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function before($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->before($callback);
        }
        
        /**
         * Register an event listener for the after job event.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function after($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->after($callback);
        }
        
        /**
         * Register an event listener for the exception occurred job event.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function exceptionOccurred($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->exceptionOccurred($callback);
        }
        
        /**
         * Register an event listener for the daemon queue loop.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function looping($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->looping($callback);
        }
        
        /**
         * Register an event listener for the failed job event.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function failing($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->failing($callback);
        }
        
        /**
         * Register an event listener for the daemon queue stopping.
         *
         * @param mixed $callback
         * @return void 
         * @static 
         */ 
        public static function stopping($callback)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->stopping($callback);
        }
        
        /**
         * Determine if the driver is connected.
         *
         * @param string|null $name
         * @return bool 
         * @static 
         */ 
        public static function connected($name = null)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        return $instance->connected($name);
        }
        
        /**
         * Resolve a queue connection instance.
         *
         * @param string|null $name
         * @return \Illuminate\Contracts\Queue\Queue 
         * @static 
         */ 
        public static function connection($name = null)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        return $instance->connection($name);
        }
        
        /**
         * Add a queue connection resolver.
         *
         * @param string $driver
         * @param \Closure $resolver
         * @return void 
         * @static 
         */ 
        public static function extend($driver, $resolver)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->extend($driver, $resolver);
        }
        
        /**
         * Add a queue connection resolver.
         *
         * @param string $driver
         * @param \Closure $resolver
         * @return void 
         * @static 
         */ 
        public static function addConnector($driver, $resolver)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->addConnector($driver, $resolver);
        }
        
        /**
         * Get the name of the default queue connection.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultDriver()
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        return $instance->getDefaultDriver();
        }
        
        /**
         * Set the name of the default queue connection.
         *
         * @param string $name
         * @return void 
         * @static 
         */ 
        public static function setDefaultDriver($name)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        $instance->setDefaultDriver($name);
        }
        
        /**
         * Get the full name for the given connection.
         *
         * @param string|null $connection
         * @return string 
         * @static 
         */ 
        public static function getName($connection = null)
        {
                        /** @var \Illuminate\Queue\QueueManager $instance */
                        return $instance->getName($connection);
        }
        
        /**
         * Assert if a job was pushed based on a truth-test callback.
         *
         * @param string $job
         * @param callable|int|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertPushed($job, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertPushed($job, $callback);
        }
        
        /**
         * Assert if a job was pushed based on a truth-test callback.
         *
         * @param string $queue
         * @param string $job
         * @param callable|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertPushedOn($queue, $job, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertPushedOn($queue, $job, $callback);
        }
        
        /**
         * Assert if a job was pushed with chained jobs based on a truth-test callback.
         *
         * @param string $job
         * @param array $expectedChain
         * @param callable|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertPushedWithChain($job, $expectedChain = [], $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertPushedWithChain($job, $expectedChain, $callback);
        }
        
        /**
         * Assert if a job was pushed with an empty chain based on a truth-test callback.
         *
         * @param string $job
         * @param callable|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertPushedWithoutChain($job, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertPushedWithoutChain($job, $callback);
        }
        
        /**
         * Determine if a job was pushed based on a truth-test callback.
         *
         * @param string $job
         * @param callable|null $callback
         * @return void 
         * @static 
         */ 
        public static function assertNotPushed($job, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertNotPushed($job, $callback);
        }
        
        /**
         * Assert that no jobs were pushed.
         *
         * @return void 
         * @static 
         */ 
        public static function assertNothingPushed()
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        $instance->assertNothingPushed();
        }
        
        /**
         * Get all of the jobs matching a truth-test callback.
         *
         * @param string $job
         * @param callable|null $callback
         * @return \Illuminate\Support\Collection 
         * @static 
         */ 
        public static function pushed($job, $callback = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->pushed($job, $callback);
        }
        
        /**
         * Determine if there are any stored jobs for a given class.
         *
         * @param string $job
         * @return bool 
         * @static 
         */ 
        public static function hasPushed($job)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->hasPushed($job);
        }
        
        /**
         * Get the size of the queue.
         *
         * @param string|null $queue
         * @return int 
         * @static 
         */ 
        public static function size($queue = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->size($queue);
        }
        
        /**
         * Push a new job onto the queue.
         *
         * @param string $job
         * @param mixed $data
         * @param string|null $queue
         * @return mixed 
         * @static 
         */ 
        public static function push($job, $data = '', $queue = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->push($job, $data, $queue);
        }
        
        /**
         * Push a raw payload onto the queue.
         *
         * @param string $payload
         * @param string|null $queue
         * @param array $options
         * @return mixed 
         * @static 
         */ 
        public static function pushRaw($payload, $queue = null, $options = [])
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->pushRaw($payload, $queue, $options);
        }
        
        /**
         * Push a new job onto the queue after a delay.
         *
         * @param \DateTimeInterface|\DateInterval|int $delay
         * @param string $job
         * @param mixed $data
         * @param string|null $queue
         * @return mixed 
         * @static 
         */ 
        public static function later($delay, $job, $data = '', $queue = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->later($delay, $job, $data, $queue);
        }
        
        /**
         * Push a new job onto the queue.
         *
         * @param string $queue
         * @param string $job
         * @param mixed $data
         * @return mixed 
         * @static 
         */ 
        public static function pushOn($queue, $job, $data = '')
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->pushOn($queue, $job, $data);
        }
        
        /**
         * Push a new job onto the queue after a delay.
         *
         * @param string $queue
         * @param \DateTimeInterface|\DateInterval|int $delay
         * @param string $job
         * @param mixed $data
         * @return mixed 
         * @static 
         */ 
        public static function laterOn($queue, $delay, $job, $data = '')
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->laterOn($queue, $delay, $job, $data);
        }
        
        /**
         * Pop the next job off of the queue.
         *
         * @param string|null $queue
         * @return \Illuminate\Contracts\Queue\Job|null 
         * @static 
         */ 
        public static function pop($queue = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->pop($queue);
        }
        
        /**
         * Push an array of jobs onto the queue.
         *
         * @param array $jobs
         * @param mixed $data
         * @param string|null $queue
         * @return mixed 
         * @static 
         */ 
        public static function bulk($jobs, $data = '', $queue = null)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->bulk($jobs, $data, $queue);
        }
        
        /**
         * Get the jobs that have been pushed.
         *
         * @return array 
         * @static 
         */ 
        public static function pushedJobs()
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->pushedJobs();
        }
        
        /**
         * Get the connection name for the queue.
         *
         * @return string 
         * @static 
         */ 
        public static function getConnectionName()
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->getConnectionName();
        }
        
        /**
         * Set the connection name for the queue.
         *
         * @param string $name
         * @return \Illuminate\Support\Testing\Fakes\QueueFake 
         * @static 
         */ 
        public static function setConnectionName($name)
        {
                        /** @var \Illuminate\Support\Testing\Fakes\QueueFake $instance */
                        return $instance->setConnectionName($name);
        }
        
        /**
         * Get the retry delay for an object-based queue handler.
         *
         * @param mixed $job
         * @return mixed 
         * @static 
         */ 
        public static function getJobRetryDelay($job)
        {
            //Method inherited from \Illuminate\Queue\Queue            
                        /** @var \Illuminate\Queue\SyncQueue $instance */
                        return $instance->getJobRetryDelay($job);
        }
        
        /**
         * Get the expiration timestamp for an object-based queue handler.
         *
         * @param mixed $job
         * @return mixed 
         * @static 
         */ 
        public static function getJobExpiration($job)
        {
            //Method inherited from \Illuminate\Queue\Queue            
                        /** @var \Illuminate\Queue\SyncQueue $instance */
                        return $instance->getJobExpiration($job);
        }
        
        /**
         * Register a callback to be executed when creating job payloads.
         *
         * @param callable $callback
         * @return void 
         * @static 
         */ 
        public static function createPayloadUsing($callback)
        {
            //Method inherited from \Illuminate\Queue\Queue            
                        \Illuminate\Queue\SyncQueue::createPayloadUsing($callback);
        }
        
        /**
         * Set the IoC container instance.
         *
         * @param \Illuminate\Container\Container $container
         * @return void 
         * @static 
         */ 
        public static function setContainer($container)
        {
            //Method inherited from \Illuminate\Queue\Queue            
                        /** @var \Illuminate\Queue\SyncQueue $instance */
                        $instance->setContainer($container);
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Database\Schema\Builder
     */ 
    class Schema {
        
        /**
         * Determine if the given table exists.
         *
         * @param string $table
         * @return bool 
         * @static 
         */ 
        public static function hasTable($table)
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->hasTable($table);
        }
        
        /**
         * Get the column listing for a given table.
         *
         * @param string $table
         * @return array 
         * @static 
         */ 
        public static function getColumnListing($table)
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->getColumnListing($table);
        }
        
        /**
         * Drop all tables from the database.
         *
         * @return void 
         * @static 
         */ 
        public static function dropAllTables()
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->dropAllTables();
        }
        
        /**
         * Drop all views from the database.
         *
         * @return void 
         * @static 
         */ 
        public static function dropAllViews()
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->dropAllViews();
        }
        
        /**
         * Get all of the table names for the database.
         *
         * @return array 
         * @static 
         */ 
        public static function getAllTables()
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->getAllTables();
        }
        
        /**
         * Get all of the view names for the database.
         *
         * @return array 
         * @static 
         */ 
        public static function getAllViews()
        {
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->getAllViews();
        }
        
        /**
         * Set the default string length for migrations.
         *
         * @param int $length
         * @return void 
         * @static 
         */ 
        public static function defaultStringLength($length)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        \Illuminate\Database\Schema\MySqlBuilder::defaultStringLength($length);
        }
        
        /**
         * Determine if the given table has a given column.
         *
         * @param string $table
         * @param string $column
         * @return bool 
         * @static 
         */ 
        public static function hasColumn($table, $column)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->hasColumn($table, $column);
        }
        
        /**
         * Determine if the given table has given columns.
         *
         * @param string $table
         * @param array $columns
         * @return bool 
         * @static 
         */ 
        public static function hasColumns($table, $columns)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->hasColumns($table, $columns);
        }
        
        /**
         * Get the data type for the given column name.
         *
         * @param string $table
         * @param string $column
         * @return string 
         * @static 
         */ 
        public static function getColumnType($table, $column)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->getColumnType($table, $column);
        }
        
        /**
         * Modify a table on the schema.
         *
         * @param string $table
         * @param \Closure $callback
         * @return void 
         * @static 
         */ 
        public static function table($table, $callback)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->table($table, $callback);
        }
        
        /**
         * Create a new table on the schema.
         *
         * @param string $table
         * @param \Closure $callback
         * @return void 
         * @static 
         */ 
        public static function create($table, $callback)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->create($table, $callback);
        }
        
        /**
         * Drop a table from the schema.
         *
         * @param string $table
         * @return void 
         * @static 
         */ 
        public static function drop($table)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->drop($table);
        }
        
        /**
         * Drop a table from the schema if it exists.
         *
         * @param string $table
         * @return void 
         * @static 
         */ 
        public static function dropIfExists($table)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->dropIfExists($table);
        }
        
        /**
         * Drop all types from the database.
         *
         * @return void 
         * @throws \LogicException
         * @static 
         */ 
        public static function dropAllTypes()
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->dropAllTypes();
        }
        
        /**
         * Rename a table on the schema.
         *
         * @param string $from
         * @param string $to
         * @return void 
         * @static 
         */ 
        public static function rename($from, $to)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->rename($from, $to);
        }
        
        /**
         * Enable foreign key constraints.
         *
         * @return bool 
         * @static 
         */ 
        public static function enableForeignKeyConstraints()
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->enableForeignKeyConstraints();
        }
        
        /**
         * Disable foreign key constraints.
         *
         * @return bool 
         * @static 
         */ 
        public static function disableForeignKeyConstraints()
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->disableForeignKeyConstraints();
        }
        
        /**
         * Register a custom Doctrine mapping type.
         *
         * @param string $class
         * @param string $name
         * @param string $type
         * @return void 
         * @throws \Doctrine\DBAL\DBALException
         * @throws \RuntimeException
         * @static 
         */ 
        public static function registerCustomDoctrineType($class, $name, $type)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->registerCustomDoctrineType($class, $name, $type);
        }
        
        /**
         * Get the database connection instance.
         *
         * @return \Illuminate\Database\Connection 
         * @static 
         */ 
        public static function getConnection()
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->getConnection();
        }
        
        /**
         * Set the database connection instance.
         *
         * @param \Illuminate\Database\Connection $connection
         * @return \Illuminate\Database\Schema\MySqlBuilder 
         * @static 
         */ 
        public static function setConnection($connection)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        return $instance->setConnection($connection);
        }
        
        /**
         * Set the Schema Blueprint resolver callback.
         *
         * @param \Closure $resolver
         * @return void 
         * @static 
         */ 
        public static function blueprintResolver($resolver)
        {
            //Method inherited from \Illuminate\Database\Schema\Builder            
                        /** @var \Illuminate\Database\Schema\MySqlBuilder $instance */
                        $instance->blueprintResolver($resolver);
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Filesystem\FilesystemManager
     */ 
    class Storage {
        
        /**
         * Get a filesystem instance.
         *
         * @param string|null $name
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function drive($name = null)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->drive($name);
        }
        
        /**
         * Get a filesystem instance.
         *
         * @param string|null $name
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function disk($name = null)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->disk($name);
        }
        
        /**
         * Get a default cloud filesystem instance.
         *
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function cloud()
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->cloud();
        }
        
        /**
         * Create an instance of the local driver.
         *
         * @param array $config
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function createLocalDriver($config)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->createLocalDriver($config);
        }
        
        /**
         * Create an instance of the ftp driver.
         *
         * @param array $config
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function createFtpDriver($config)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->createFtpDriver($config);
        }
        
        /**
         * Create an instance of the sftp driver.
         *
         * @param array $config
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function createSftpDriver($config)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->createSftpDriver($config);
        }
        
        /**
         * Create an instance of the Amazon S3 driver.
         *
         * @param array $config
         * @return \Illuminate\Contracts\Filesystem\Cloud 
         * @static 
         */ 
        public static function createS3Driver($config)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->createS3Driver($config);
        }
        
        /**
         * Set the given disk instance.
         *
         * @param string $name
         * @param mixed $disk
         * @return \Illuminate\Filesystem\FilesystemManager 
         * @static 
         */ 
        public static function set($name, $disk)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->set($name, $disk);
        }
        
        /**
         * Get the default driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultDriver()
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->getDefaultDriver();
        }
        
        /**
         * Get the default cloud driver name.
         *
         * @return string 
         * @static 
         */ 
        public static function getDefaultCloudDriver()
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->getDefaultCloudDriver();
        }
        
        /**
         * Unset the given disk instances.
         *
         * @param array|string $disk
         * @return \Illuminate\Filesystem\FilesystemManager 
         * @static 
         */ 
        public static function forgetDisk($disk)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->forgetDisk($disk);
        }
        
        /**
         * Register a custom driver creator Closure.
         *
         * @param string $driver
         * @param \Closure $callback
         * @return \Illuminate\Filesystem\FilesystemManager 
         * @static 
         */ 
        public static function extend($driver, $callback)
        {
                        /** @var \Illuminate\Filesystem\FilesystemManager $instance */
                        return $instance->extend($driver, $callback);
        }
        
        /**
         * Assert that the given file exists.
         *
         * @param string|array $path
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function assertExists($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->assertExists($path);
        }
        
        /**
         * Assert that the given file does not exist.
         *
         * @param string|array $path
         * @return \Illuminate\Filesystem\FilesystemAdapter 
         * @static 
         */ 
        public static function assertMissing($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->assertMissing($path);
        }
        
        /**
         * Determine if a file exists.
         *
         * @param string $path
         * @return bool 
         * @static 
         */ 
        public static function exists($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->exists($path);
        }
        
        /**
         * Determine if a file or directory is missing.
         *
         * @param string $path
         * @return bool 
         * @static 
         */ 
        public static function missing($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->missing($path);
        }
        
        /**
         * Get the full path for the file at the given "short" path.
         *
         * @param string $path
         * @return string 
         * @static 
         */ 
        public static function path($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->path($path);
        }
        
        /**
         * Get the contents of a file.
         *
         * @param string $path
         * @return string 
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         * @static 
         */ 
        public static function get($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->get($path);
        }
        
        /**
         * Create a streamed response for a given file.
         *
         * @param string $path
         * @param string|null $name
         * @param array|null $headers
         * @param string|null $disposition
         * @return \Symfony\Component\HttpFoundation\StreamedResponse 
         * @static 
         */ 
        public static function response($path, $name = null, $headers = [], $disposition = 'inline')
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->response($path, $name, $headers, $disposition);
        }
        
        /**
         * Create a streamed download response for a given file.
         *
         * @param string $path
         * @param string|null $name
         * @param array|null $headers
         * @return \Symfony\Component\HttpFoundation\StreamedResponse 
         * @static 
         */ 
        public static function download($path, $name = null, $headers = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->download($path, $name, $headers);
        }
        
        /**
         * Write the contents of a file.
         *
         * @param string $path
         * @param string|resource $contents
         * @param mixed $options
         * @return bool 
         * @static 
         */ 
        public static function put($path, $contents, $options = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->put($path, $contents, $options);
        }
        
        /**
         * Store the uploaded file on the disk.
         *
         * @param string $path
         * @param \Illuminate\Http\File|\Illuminate\Http\UploadedFile|string $file
         * @param array $options
         * @return string|false 
         * @static 
         */ 
        public static function putFile($path, $file, $options = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->putFile($path, $file, $options);
        }
        
        /**
         * Store the uploaded file on the disk with a given name.
         *
         * @param string $path
         * @param \Illuminate\Http\File|\Illuminate\Http\UploadedFile|string $file
         * @param string $name
         * @param array $options
         * @return string|false 
         * @static 
         */ 
        public static function putFileAs($path, $file, $name, $options = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->putFileAs($path, $file, $name, $options);
        }
        
        /**
         * Get the visibility for the given path.
         *
         * @param string $path
         * @return string 
         * @static 
         */ 
        public static function getVisibility($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->getVisibility($path);
        }
        
        /**
         * Set the visibility for the given path.
         *
         * @param string $path
         * @param string $visibility
         * @return bool 
         * @static 
         */ 
        public static function setVisibility($path, $visibility)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->setVisibility($path, $visibility);
        }
        
        /**
         * Prepend to a file.
         *
         * @param string $path
         * @param string $data
         * @param string $separator
         * @return bool 
         * @static 
         */ 
        public static function prepend($path, $data, $separator = '')
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->prepend($path, $data, $separator);
        }
        
        /**
         * Append to a file.
         *
         * @param string $path
         * @param string $data
         * @param string $separator
         * @return bool 
         * @static 
         */ 
        public static function append($path, $data, $separator = '')
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->append($path, $data, $separator);
        }
        
        /**
         * Delete the file at a given path.
         *
         * @param string|array $paths
         * @return bool 
         * @static 
         */ 
        public static function delete($paths)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->delete($paths);
        }
        
        /**
         * Copy a file to a new location.
         *
         * @param string $from
         * @param string $to
         * @return bool 
         * @static 
         */ 
        public static function copy($from, $to)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->copy($from, $to);
        }
        
        /**
         * Move a file to a new location.
         *
         * @param string $from
         * @param string $to
         * @return bool 
         * @static 
         */ 
        public static function move($from, $to)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->move($from, $to);
        }
        
        /**
         * Get the file size of a given file.
         *
         * @param string $path
         * @return int 
         * @static 
         */ 
        public static function size($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->size($path);
        }
        
        /**
         * Get the mime-type of a given file.
         *
         * @param string $path
         * @return string|false 
         * @static 
         */ 
        public static function mimeType($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->mimeType($path);
        }
        
        /**
         * Get the file's last modification time.
         *
         * @param string $path
         * @return int 
         * @static 
         */ 
        public static function lastModified($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->lastModified($path);
        }
        
        /**
         * Get the URL for the file at the given path.
         *
         * @param string $path
         * @return string 
         * @throws \RuntimeException
         * @static 
         */ 
        public static function url($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->url($path);
        }
        
        /**
         * Get a resource to read the file.
         *
         * @param string $path
         * @return resource|null The path resource or null on failure.
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         * @static 
         */ 
        public static function readStream($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->readStream($path);
        }
        
        /**
         * Write a new file using a stream.
         *
         * @param string $path
         * @param resource $resource
         * @param array $options
         * @return bool 
         * @throws \InvalidArgumentException If $resource is not a file handle.
         * @throws \Illuminate\Contracts\Filesystem\FileExistsException
         * @static 
         */ 
        public static function writeStream($path, $resource, $options = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->writeStream($path, $resource, $options);
        }
        
        /**
         * Get a temporary URL for the file at the given path.
         *
         * @param string $path
         * @param \DateTimeInterface $expiration
         * @param array $options
         * @return string 
         * @throws \RuntimeException
         * @static 
         */ 
        public static function temporaryUrl($path, $expiration, $options = [])
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->temporaryUrl($path, $expiration, $options);
        }
        
        /**
         * Get a temporary URL for the file at the given path.
         *
         * @param \League\Flysystem\AwsS3v3\AwsS3Adapter $adapter
         * @param string $path
         * @param \DateTimeInterface $expiration
         * @param array $options
         * @return string 
         * @static 
         */ 
        public static function getAwsTemporaryUrl($adapter, $path, $expiration, $options)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->getAwsTemporaryUrl($adapter, $path, $expiration, $options);
        }
        
        /**
         * Get an array of all files in a directory.
         *
         * @param string|null $directory
         * @param bool $recursive
         * @return array 
         * @static 
         */ 
        public static function files($directory = null, $recursive = false)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->files($directory, $recursive);
        }
        
        /**
         * Get all of the files from the given directory (recursive).
         *
         * @param string|null $directory
         * @return array 
         * @static 
         */ 
        public static function allFiles($directory = null)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->allFiles($directory);
        }
        
        /**
         * Get all of the directories within a given directory.
         *
         * @param string|null $directory
         * @param bool $recursive
         * @return array 
         * @static 
         */ 
        public static function directories($directory = null, $recursive = false)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->directories($directory, $recursive);
        }
        
        /**
         * Get all (recursive) of the directories within a given directory.
         *
         * @param string|null $directory
         * @return array 
         * @static 
         */ 
        public static function allDirectories($directory = null)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->allDirectories($directory);
        }
        
        /**
         * Create a directory.
         *
         * @param string $path
         * @return bool 
         * @static 
         */ 
        public static function makeDirectory($path)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->makeDirectory($path);
        }
        
        /**
         * Recursively delete a directory.
         *
         * @param string $directory
         * @return bool 
         * @static 
         */ 
        public static function deleteDirectory($directory)
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->deleteDirectory($directory);
        }
        
        /**
         * Flush the Flysystem cache.
         *
         * @return void 
         * @static 
         */ 
        public static function flushCache()
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        $instance->flushCache();
        }
        
        /**
         * Get the Flysystem driver.
         *
         * @return \League\Flysystem\FilesystemInterface 
         * @static 
         */ 
        public static function getDriver()
        {
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $instance */
                        return $instance->getDriver();
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Validation\Factory
     */ 
    class Validator {
        
        /**
         * Create a new Validator instance.
         *
         * @param array $data
         * @param array $rules
         * @param array $messages
         * @param array $customAttributes
         * @return \Illuminate\Validation\Validator 
         * @static 
         */ 
        public static function make($data, $rules, $messages = [], $customAttributes = [])
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        return $instance->make($data, $rules, $messages, $customAttributes);
        }
        
        /**
         * Validate the given data against the provided rules.
         *
         * @param array $data
         * @param array $rules
         * @param array $messages
         * @param array $customAttributes
         * @return array 
         * @throws \Illuminate\Validation\ValidationException
         * @static 
         */ 
        public static function validate($data, $rules, $messages = [], $customAttributes = [])
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        return $instance->validate($data, $rules, $messages, $customAttributes);
        }
        
        /**
         * Register a custom validator extension.
         *
         * @param string $rule
         * @param \Closure|string $extension
         * @param string|null $message
         * @return void 
         * @static 
         */ 
        public static function extend($rule, $extension, $message = null)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->extend($rule, $extension, $message);
        }
        
        /**
         * Register a custom implicit validator extension.
         *
         * @param string $rule
         * @param \Closure|string $extension
         * @param string|null $message
         * @return void 
         * @static 
         */ 
        public static function extendImplicit($rule, $extension, $message = null)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->extendImplicit($rule, $extension, $message);
        }
        
        /**
         * Register a custom dependent validator extension.
         *
         * @param string $rule
         * @param \Closure|string $extension
         * @param string|null $message
         * @return void 
         * @static 
         */ 
        public static function extendDependent($rule, $extension, $message = null)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->extendDependent($rule, $extension, $message);
        }
        
        /**
         * Register a custom validator message replacer.
         *
         * @param string $rule
         * @param \Closure|string $replacer
         * @return void 
         * @static 
         */ 
        public static function replacer($rule, $replacer)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->replacer($rule, $replacer);
        }
        
        /**
         * Set the Validator instance resolver.
         *
         * @param \Closure $resolver
         * @return void 
         * @static 
         */ 
        public static function resolver($resolver)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->resolver($resolver);
        }
        
        /**
         * Get the Translator implementation.
         *
         * @return \Illuminate\Contracts\Translation\Translator 
         * @static 
         */ 
        public static function getTranslator()
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        return $instance->getTranslator();
        }
        
        /**
         * Get the Presence Verifier implementation.
         *
         * @return \Illuminate\Validation\PresenceVerifierInterface 
         * @static 
         */ 
        public static function getPresenceVerifier()
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        return $instance->getPresenceVerifier();
        }
        
        /**
         * Set the Presence Verifier implementation.
         *
         * @param \Illuminate\Validation\PresenceVerifierInterface $presenceVerifier
         * @return void 
         * @static 
         */ 
        public static function setPresenceVerifier($presenceVerifier)
        {
                        /** @var \Illuminate\Validation\Factory $instance */
                        $instance->setPresenceVerifier($presenceVerifier);
        }
         
    }

    /**
     * 
     *
     * @see \Illuminate\Contracts\Auth\Access\Gate
     */ 
    class Gate {
        
        /**
         * Determine if a given ability has been defined.
         *
         * @param string|array $ability
         * @return bool 
         * @static 
         */ 
        public static function has($ability)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->has($ability);
        }
        
        /**
         * Define a new ability.
         *
         * @param string $ability
         * @param callable|string $callback
         * @return \Illuminate\Auth\Access\Gate 
         * @throws \InvalidArgumentException
         * @static 
         */ 
        public static function define($ability, $callback)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->define($ability, $callback);
        }
        
        /**
         * Define abilities for a resource.
         *
         * @param string $name
         * @param string $class
         * @param array|null $abilities
         * @return \Illuminate\Auth\Access\Gate 
         * @static 
         */ 
        public static function resource($name, $class, $abilities = null)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->resource($name, $class, $abilities);
        }
        
        /**
         * Define a policy class for a given class type.
         *
         * @param string $class
         * @param string $policy
         * @return \Illuminate\Auth\Access\Gate 
         * @static 
         */ 
        public static function policy($class, $policy)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->policy($class, $policy);
        }
        
        /**
         * Register a callback to run before all Gate checks.
         *
         * @param callable $callback
         * @return \Illuminate\Auth\Access\Gate 
         * @static 
         */ 
        public static function before($callback)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->before($callback);
        }
        
        /**
         * Register a callback to run after all Gate checks.
         *
         * @param callable $callback
         * @return \Illuminate\Auth\Access\Gate 
         * @static 
         */ 
        public static function after($callback)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->after($callback);
        }
        
        /**
         * Determine if the given ability should be granted for the current user.
         *
         * @param string $ability
         * @param array|mixed $arguments
         * @return bool 
         * @static 
         */ 
        public static function allows($ability, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->allows($ability, $arguments);
        }
        
        /**
         * Determine if the given ability should be denied for the current user.
         *
         * @param string $ability
         * @param array|mixed $arguments
         * @return bool 
         * @static 
         */ 
        public static function denies($ability, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->denies($ability, $arguments);
        }
        
        /**
         * Determine if all of the given abilities should be granted for the current user.
         *
         * @param \Illuminate\Auth\Access\iterable|string $abilities
         * @param array|mixed $arguments
         * @return bool 
         * @static 
         */ 
        public static function check($abilities, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->check($abilities, $arguments);
        }
        
        /**
         * Determine if any one of the given abilities should be granted for the current user.
         *
         * @param \Illuminate\Auth\Access\iterable|string $abilities
         * @param array|mixed $arguments
         * @return bool 
         * @static 
         */ 
        public static function any($abilities, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->any($abilities, $arguments);
        }
        
        /**
         * Determine if all of the given abilities should be denied for the current user.
         *
         * @param \Illuminate\Auth\Access\iterable|string $abilities
         * @param array|mixed $arguments
         * @return bool 
         * @static 
         */ 
        public static function none($abilities, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->none($abilities, $arguments);
        }
        
        /**
         * Determine if the given ability should be granted for the current user.
         *
         * @param string $ability
         * @param array|mixed $arguments
         * @return \Illuminate\Auth\Access\Response 
         * @throws \Illuminate\Auth\Access\AuthorizationException
         * @static 
         */ 
        public static function authorize($ability, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->authorize($ability, $arguments);
        }
        
        /**
         * Inspect the user for the given ability.
         *
         * @param string $ability
         * @param array|mixed $arguments
         * @return \Illuminate\Auth\Access\Response 
         * @static 
         */ 
        public static function inspect($ability, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->inspect($ability, $arguments);
        }
        
        /**
         * Get the raw result from the authorization callback.
         *
         * @param string $ability
         * @param array|mixed $arguments
         * @return mixed 
         * @throws \Illuminate\Auth\Access\AuthorizationException
         * @static 
         */ 
        public static function raw($ability, $arguments = [])
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->raw($ability, $arguments);
        }
        
        /**
         * Get a policy instance for a given class.
         *
         * @param object|string $class
         * @return mixed 
         * @static 
         */ 
        public static function getPolicyFor($class)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->getPolicyFor($class);
        }
        
        /**
         * Specify a callback to be used to guess policy names.
         *
         * @param callable $callback
         * @return \Illuminate\Auth\Access\Gate 
         * @static 
         */ 
        public static function guessPolicyNamesUsing($callback)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->guessPolicyNamesUsing($callback);
        }
        
        /**
         * Build a policy class instance of the given type.
         *
         * @param object|string $class
         * @return mixed 
         * @throws \Illuminate\Contracts\Container\BindingResolutionException
         * @static 
         */ 
        public static function resolvePolicy($class)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->resolvePolicy($class);
        }
        
        /**
         * Get a gate instance for the given user.
         *
         * @param \Illuminate\Contracts\Auth\Authenticatable|mixed $user
         * @return static 
         * @static 
         */ 
        public static function forUser($user)
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->forUser($user);
        }
        
        /**
         * Get all of the defined abilities.
         *
         * @return array 
         * @static 
         */ 
        public static function abilities()
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->abilities();
        }
        
        /**
         * Get all of the defined policies.
         *
         * @return array 
         * @static 
         */ 
        public static function policies()
        {
                        /** @var \Illuminate\Auth\Access\Gate $instance */
                        return $instance->policies();
        }
         
    }
 
}


namespace  { 

    class Auth extends \Illuminate\Support\Facades\Auth {}

    class DB extends \Illuminate\Support\Facades\DB {}

    class Cache extends \Illuminate\Support\Facades\Cache {}

    class Event extends \Illuminate\Support\Facades\Event {}

    class Log extends \Illuminate\Support\Facades\Log {}

    class Queue extends \Illuminate\Support\Facades\Queue {}

    class Schema extends \Illuminate\Support\Facades\Schema {}

    class Storage extends \Illuminate\Support\Facades\Storage {}

    class Validator extends \Illuminate\Support\Facades\Validator {}

    class Gate extends \Illuminate\Support\Facades\Gate {}
 
}




