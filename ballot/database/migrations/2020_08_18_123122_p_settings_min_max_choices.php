<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class PSettingsMinMaxChoices extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('p_settings', function (Blueprint $table) {
            $table->smallInteger('min_choices')->nullable();
            $table->smallInteger('max_choices')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('p_settings', function (Blueprint $table) {
            $table->dropColumn('min_choices');
            $table->dropColumn('max_choices');
        });
    }
}
