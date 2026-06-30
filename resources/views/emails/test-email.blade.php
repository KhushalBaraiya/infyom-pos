@component('mail::message')
# Test Email

Hello!

{{ $testMessage }}

**Application:** {{ $appName }}  
**Sent at:** {{ $timestamp }}

If you received this email, your mail configuration is working correctly!

@component('mail::button', ['url' => config('app.url')])
Visit Application
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
