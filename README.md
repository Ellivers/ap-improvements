# ap-improvements
Improvements and additions for AnimePahe.

The [dev](https://github.com/Ellivers/ap-improvements/tree/dev) branch is for the in-development version of the script. See [using the development version](#using-the-development-version).

If you find a bug or have a suggestion, feel free to [open an issue](https://github.com/Ellivers/ap-improvements/issues/new/choose)!

## Installation
 1. Get the Violentmonkey browser extension (Tampermonkey is mostly untested, but seems to work as well).
 2. [Click here](https://raw.githubusercontent.com/Ellivers/ap-improvements/refs/heads/master/ap-improvements.user.js), or go to the file `ap-improvements.user.js` and click the "Raw" button.
 * I highly suggest using an ad blocker (uBlock Origin is recommended).
 
## Feature list
 * Automatically redirects to the correct session when a tab with an old session is loaded.
 * Saves your watch progress of each video, so you can resume right where you left off.
 * Bookmark anime and view it in a bookmark menu.
    * You can change watching status for each bookmarked anime to keep track of what you're watching.
 * Add ongoing anime to an episode feed to easily check when new episodes are out.
 * Quickly visit the download page for a video, instead of having to wait 5 seconds when clicking the download link.
 * Find collections of anime series in the search results, with the series listed in release order.
 * Jump directly to the next anime's first episode from the previous anime's last episode, and the other way around.
 * Keeps track of episodes that have been watched.
 * Adds a section on the main page where you can view episodes that you have started watching.
 * Adds a menu to episodes in the Latest Releases feed and on anime pages where you can copy a link to them, mark/unmark them as watched, or download them.
 * Reworked anime index page. You can now:
    * Find anime with your desired genre, theme, type, demographic, status and season.
    * Search among these filter results.
    * Open a random anime within the specified filters.
 * Adds an option to hide all episode thumbnails on the site.
 * Adds an option to have the header always stay at the top of the screen.
 * Saved data can be viewed and deleted in the "Manage Data" menu.
 * You can enable data syncing to sync your data between multiple devices.
    * Choose what data to sync, per device.
    * Create a sync code and enter it on the devices you want to sync with.
 * Automatically finds a relevant cover for the top of anime pages.
 * Allows you to go to specific pages of an anime's episode list.
 * Adds points in the video player progress bar for opening, ending, and other highlights (only available for some anime).
 * Adds a button to skip openings and endings when they start (only available for some anime).
 * Allows you to copy screenshots to the clipboard instead of downloading them.
 * Frame-by-frame controls on videos, using ',' and '.'
 * Skip 10 seconds on videos at a time, using 'J' and 'L'
 * Changes the video 'loop' keybind to Shift + L (by default)
 * Allows you to press Shift + N to go to the next episode, or Shift + P to go to the previous one.
 * Speed up or slow down a video by holding Ctrl and:
    * Scrolling up/down
    * Pressing the up/down keys
    * You can also hold shift to make the speed change more gradual.
 * Remembers the selected speed for each anime.
 * Allows you to see images from the video while hovering over the progress bar.
 * Allows you to also use numpad number keys to seek through videos.
 * Theatre mode for a better non-fullscreen video experience on larger screens.
 * Instantly loads the video instead of having to click a button to load it.
 * Adds buttons to copy shortcut links to anime and episode pages.
 * Adds site-wide keyboard shortcuts:
    * B (default) to open the bookmark menu
    * N (default) to open the episode feed
    * S (default) to open the main search bar, as an alternative to F2
 * All added keyboard shortcuts can be rebound or disabled.
 * Adds a more noticeable spinning loading indicator on videos.
 * Adds an "Auto-Play Video" option to automatically play the video (on some browsers, you may need to allow auto-playing for this to work).
 * Adds an "Auto-Play Next" option to automatically go to the next episode when the current one is finished.
 * Focuses on the video player when loading the page, so you don't have to click on it to use keyboard controls.
 * Adds an option to automatically choose the highest quality available when loading the video.
 * Adds a button (in the options menu) to reset the video player.
 * Shows the dates of when episodes were added.
 * And more!

## Using the development version
The development version of the script may contain major bugs or issues from code that is currently being reworked, so use it at your own risk. (That being said, it is stable most of the time).

You can take a look at [the latest changelog](https://github.com/Ellivers/ap-improvements/blob/dev/changelogs.md) to see what is currently being worked on.

[Click here](https://raw.githubusercontent.com/Ellivers/ap-improvements/refs/heads/dev/ap-improvements.user.js) to install from the latest dev branch commit, but be aware that depending on your userscript manager, it **might not be automatically updated**, unlike the stable version.
