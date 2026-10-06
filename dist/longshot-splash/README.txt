LONG SHOT STUDIOS SPLASH SCREEN

A reusable copy of the Longshot opening from Tents & Trees:
three arrows miss, the fourth lands, the target opens, and the screen fades out.
Includes the original vector wordmark, arrow swish and impact sounds, timing,
portrait/landscape sizing, and reduced-motion behavior.

PREVIEW
Double-click index.html. Click "Replay with sound" to replay it.
Browsers may block sound on automatic startup until a visitor interacts.

USE IN ANOTHER WEBSITE OR WEB APP
1. Copy this entire folder into your new project, keeping the files together.
   You can rename the folder (for example, longshot-splash).
2. Add this inside your page's <head> (adjust the path to match the folder):

   <link rel="stylesheet" href="longshot-splash/splash.css">

3. Add these just before </body>:

   <script src="longshot-splash/splash.js"></script>
   <script>
     LongShotStudiosSplash.play();
   </script>

No packages, build step, fonts, or Tents & Trees files are needed.
Asset paths resolve from splash.js, so nested pages work too.
The play() method returns a Promise that resolves when the splash closes.

OPTIONS
Dark opening, retaining the red arrow:
   LongShotStudiosSplash.play({darkMode: true});
By default it follows the page's data-dark-mode attribute.

Dark silhouette version:
   LongShotStudiosSplash.play({style: 'silhouette'});

Wait for your app to finish loading before the fade (up to four seconds):
   LongShotStudiosSplash.play({ready: yourAppReadyPromise});

Close the splash immediately:
   LongShotStudiosSplash.dismiss();

OPTIONAL: PREVENT YOUR PAGE FROM FLASHING BEFORE THE SPLASH
Place the following in <head>, before your styles/scripts:

   <style>
     html[data-splash-pending],html[data-splash-pending] body{
       background:#f5f1e8!important;
     }
     html[data-splash-pending] body>:not(.studio-splash){
       visibility:hidden!important;
     }
   </style>
   <script>
     document.documentElement.setAttribute('data-splash-pending','');
     window.splashStartupTimeout=setTimeout(function(){
       document.documentElement.removeAttribute('data-splash-pending');
     },15000);
   </script>

Use #0a1011 for the background if you choose the dark silhouette version.
The timeout restores the page if its scripts fail to load.

FILES
index.html - standalone preview
splash.js - reusable animation and playback controls
splash.css - splash appearance and target animations
assets/studios/longshot-wordmark.svg - original vector wordmark
assets/longshot-arrow-swish.mp3 - missed-arrow sound
assets/longshot-arrow-impact.mp3 - target-hit sound

This is a web splash screen; native applications can use it in a web view.
