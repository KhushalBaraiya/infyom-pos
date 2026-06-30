<?php

namespace Database\Seeders;

use App\Models\SmsSetting;
use Illuminate\Database\Seeder;

class DefaultSmsSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Add Twilio settings
        $exists = SmsSetting::where('key', 'is_twilio')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'is_twilio', 'value' => '0']);
        }

        $exists = SmsSetting::where('key', 'twilio_sid')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'twilio_sid', 'value' => '']);
        }

        $exists = SmsSetting::where('key', 'twilio_token')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'twilio_token', 'value' => '']);
        }

        $exists = SmsSetting::where('key', 'twilio_from')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'twilio_from', 'value' => '']);
        }
        
        // Add Vonage settings
        $exists = SmsSetting::where('key', 'is_vonage')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'is_vonage', 'value' => '0']);
        }

        $exists = SmsSetting::where('key', 'vonage_api_key')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'vonage_api_key', 'value' => '']);
        }

        $exists = SmsSetting::where('key', 'vonage_api_secret')->exists();
        if (! $exists) {
            SmsSetting::create(['key' => 'vonage_api_secret', 'value' => '']);
        }
    }
}