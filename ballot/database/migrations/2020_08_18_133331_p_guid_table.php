<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class PGuidTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('p_guid', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('vote_id');
            $table->string('vote_ext_id');
            $table->string('guid')->unique();
            $table->smallInteger('district');
            $table->string('session_id');
            $table->timestamp('vote_end');
            $table->timestamps();
            $table->boolean('opened')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('p_guid');
    }
}
