<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TestEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Test Email - Mail Configuration')
                    ->markdown('emails.test-email')
                    ->with([
                        'appName' => config('app.name'),
                        'testMessage' => 'This is a test email to verify your mail configuration is working correctly.',
                        'timestamp' => now()->format('Y-m-d H:i:s')
                    ]);
    }
}
