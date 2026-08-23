### 4.12.0 (in development)
- Added keybinds for going to the start and end of a video
  - Default keybinds are Home and End, respectively
- Made the keybind for going to the previous modal menu modifiable
  - Default keybind is Backspace
- Changed the way modal menus are laid out
  - In most menus, the close/back button now shares space with the menu title
  - Menu titles and subtitles are now centered and always at the top of the modal
  - Most menus now have titles
- The Edit/Add Bookmark menu is now a bit wider with shorter anime names
- Made bookmark icons slightly larger with the grid layout on mobile, since there is now more space
- The image for the link to the previous/next anime is now slightly blurred
- Tab focusing the link for the previous/next episode/anime now shows an outline
- The page is no longer scrolled when pressing a keybind that would otherwise do so
- Made the section text of the Options menu bold
- Fixed session refreshing sometimes not working properly
- Fixed the no bookmarks text disappearing when changing the bookmark sorting/layout
- Fixed some links in the Manage Data menu still using IDs instead of names 
- Various other fixes

### 4.11.1 (2026-08-20)
- Fixed share links failing when confirming a redirect
- Fixed a potential error

### 4.11.0 (2026-08-19)
- Added bookmark and episode feed buttons to episode pages
- Added an icon on anime and episode pages to copy a link to the anime
- Added a Delete button in the sync menu, for deleting the sync code entirely
  - Sync codes will still be automatically deleted if all users disconnect from them
- Added a Version History menu through a button at the bottom of the Options menu
- Added tooltips to switches in the Options menu (and some other places)
- Toast messages for removing various entries/data now show the anime's name and episode
- Added toast messages for marking all episodes as watched/unwatched
- Lessened the performance impact from loading a page
- Moved the Refresh Session button towards the bottom of the Options menu
- Pressing the Theater Mode keybind while having the video player in fullscreen now exits fullscreen
- Pressing Ctrl+F in a modal menu with a search bar now focuses the first search bar in the menu
- Re-added and fixed feature to set video player time to time elapsed
- Buttons that change text when clicked on no longer become smaller while the text is changed
- Share links now show a unique message when failing to redirect
- Made the loading bar for the Continue Watching section a bit thinner
- Updated the styling for when hovering over the filter logic buttons on the index page
- Data format version 5
  - Changed the format for associated videos in video progress entries
- This version is now required for the data sync feature, due to data format changes
- Fixed bookmark links not working due to site changes
- Fixed various other issues caused by site changes
- Fixed errors in the Manage Feed menu when having anime with no episodes added to the feed
- Fixed the video player being incorrectly focused when pressing Enter on an episode page
- Fixed keyboard navigation for the expandable menus below the video player
- Fixed video progress being deleted on the first episode of certain anime
- Fixed the video player being able to load more than once, causing a few issues
- Fixed certain modal menus taking a long time to open on some devices
- Fixed the search query not being kept when changing sorting direction in various menus
- Fixed the search query not being kept when changing sorting type in the Bookmarks menu
- Fixed certain keybinds being able to be activated while having the video player in fullscreen
- Fixed descriptions for switches in the Options menu not being read by screen readers
- Fixed the modal open animation for the Manage Feed menu playing after removing the last feed entry
- Fixed changing filter rules on the index page not always updating the Apply button
- Fixed the Continue Watching section not being added after importing data
- Fixed the Continue Watching section not being updated after updating episodes on the main page, and vice versa
- Fixed errors from entering an invalid season range filter in the index page's URL
- More small fixes

### 4.10.1 (2026-08-12)
- Removed the Shortcut Link button on anime pages, due to it being removed from the site
- Copying a shortcut link to an episode now uses its name instead of its ID, due to site changes
- Getting an error in the episode feed now shows which anime caused the error
- Fixed errors while loading the Continue Watching section, due to site changes
- Known issue: Due to site changes with how IDs are handled, certain anime will now produce errors in eg. the episode feed. I'm working on a solution.

### 4.10.0 (2026-08-02)
- Made the following keybinds modifiable:
  - Toggle Theater Mode (T)
  - Next Episode (Shift+N)
  - Previous Episode (Shift+P)
  - Backward 10 Seconds (J)
  - Forward 10 Seconds (L)
  - Backward 1 Frame (,)
  - Forward 1 Frame (.)
  - Toggle Looping (Shift+L)
- Updated the Edit Keybinds menu
  - It's now split into Site and Video Player
  - Keybinds can now have modifier keys (Shift and Control)
  - Conflicting keybinds are now highlighted
  - Added a Numpad Seeking option, which allows you to disable using the numpad to seek through videos
- Added a Reset Player keybind (unbound by default)
- Added a confirmation screen for disconnecting from data syncing
- Added a progress bar to the Continue Watching section
- Updated styling for the index page's filter dropdown buttons
  - Also, the buttons now show a plus or minus symbol depending on filter status
- The Manage Feed menu no longer plays the modal open animation when removing a feed entry
- Dropdown menus now behave more consistently
  - All dropdown menus can now be closed with Escape
- The bookmark menu's grid layout now has smaller icons on mobile, meaning two entries fit next to each other on most screens
- The secondary sorting for sorting bookmarks by watching status is now alphabetically (previously, it was by recently added)
- Made modal menus less cramped on mobile
- Updated styling for collection icons in search results
- Video player time is now kept as time remaining
  - The script will no longer attempt to set to to time elapsed, because it wasn't working consistently
- The "View full poster" link now looks better with bright backgrounds on mobile
- Sharing bookmarks as an image now has higher resolution when you only have a few bookmarks
- Added a note in the Video Progress menu about icons coming from bookmarks
- Added a button element for cancelling timestamp editing
- The Raw button in Manage Data now pretty prints the JSON data
- Fixed seek thumbnails getting stuck on screen after seeking
- Fixed invalid dates and other time issues on Safari
- Fixed the video loading indicator not disappearing on Safari (iOS)
- Fixed certain dropdown menus not closing properly on Safari (iOS)
- Fixed some modal menus going off screen on Safari (iOS)
- Fixed the episode options menu getting cut off on mobile landscape (sideways) view
- Fixed styling issues with video player messages on mobile
- Fixed sharing bookmarks as an image keeping the "new" icon on bookmark entries
- Fixed Export Data having with the wrong file extension on some browsers
- Fixed video duration data being stored with decimals
- And some more

### 4.9.3 (2026-06-27)
- Fixed errors in the Manage Feed menu when having anime with no episodes added to the feed
- Fixed having certain anime in the episode feed causing an error when refreshing
- Fixed broken anime ID data from 4.9.0

### 4.9.2 (2026-06-25)
- Fixed a sync error after unmarking watched episodes for an anime with no watched episodes
- Other small fixes

### 4.9.1 (2026-06-24)
- Search bars are no longer automatically selected on mobile
- Updated the look of episode feed items
- The bookmark menu buttons now look better on mobile
- The bookmark menu's list layout now looks better on mobile
- The bookmark share result image can now be scrolled through horizontally
- Fixed the Clear Episode Sessions button not working properly
- Fixed the mobile styling of the buttons that appear on random anime pages
- Fixed the styling of collections in search results being broken due to site changes
- Fixed bookmark icons not being properly centered
- Fixed collection items sometimes not having the same icon size on mobile
- Fixed the image in the bookmark add menu going off-screen on mobile
- Other small styling updates
- Other small fixes

### 4.9.0 (2026-06-14)
- Added a Download Preferences menu in Options, where you can select the preferred resolution and language of episodes downloaded through the episode options menu
- Added a Watching Section option, which allows you to show/hide the Continue Watching section of the homepage
- Moved the Manage Data and Options buttons higher up on the homepage
- The buttons on anime and episode pages are now laid out better on mobile
- Anime pages should now load a bit faster
- Fixed the "View full poster" link on anime pages showing multiple times
- Fixed not being able to get a bookmark image for certain anime
- Other small fixes

### 4.8.1 (2026-06-13)
- Updated collection items to look more like the site's new search result style
- The Manage Feed schedule now marks the current day
- Made site search results more easily clickable
- Bookmarks now use a slightly lower quality version of the poster
  - Applied when they are first loaded, not retroactively
- Fixed the "View full poster" link on anime pages

### 4.8.0 (2026-06-12)
- Revamped the homepage
  - Added a section that shows the 6 most recent episodes you started watching
    - With the Show More button below the section, you can view all current video progress and remove episodes you don't want to keep
  - Added an episode options menu, release date info, and watched status to episodes in the Latest Releases section
  - Episodes numbers now show in the Latest Releases section even when that anime has finished airing
  - The Manage Data and Options buttons are now at the bottom
- Added a Relative Episode Numbers option, which makes it so episode numbers are contained within each anime (eg. 1-12 instead of 13-24)
  - This is applied everywhere except the homepage's video progress modal menu and the Manage Data menu
- You can now change bookmark watching status through a dropdown in the main Bookmarks menu
  - The Edit button has been changed to a Remove button
- Added a button in the Bookmarks menu that allows you to share the bookmark list as an image or a text file
- Added a small icon in the Bookmarks menu for each bookmark that is new since the menu was last opened
- Renamed the Handle Feed button and menu to Manage Feed
- Added a schedule in the Manage Feed menu that shows which episodes are expected to release on what day
- Added a button in the Options menu for changing keybinds
- Anime collections in search results now tend to show more entries
- Added a loading indicator in the search results for when a collection is being loaded
- Added Manage Data and Options buttons at the bottom of the index page
- The Seek Thumbnails option can now be toggled without having to reload the video player
- Renamed the "Clear from Tracker" button to "Clear Session"
- Renamed the "Clear Episodes from Tracker" button to "Clear Episode Sessions"
- Added icons on the episode options menu buttons
- Changed the color of the Remove button in the Manage Feed menu to gray
- The time format shown for latest episodes in the Manage Feed menu is now shorter
- Episode share links now use the anime ID instead of the name
- Tweaked and updated various styling
- Changing filter rules on the index page now counts as making changes to the filters
- Added limits to various data, such as bookmarks
- Data format version 3
  - Changed the format of subInfo in session entry data
- Video progress data now contains video duration. This is added to existing data when the video is loaded
- Fixed anime images in various places being broken due to site changes
- Fixed episodes with decimal points not being marked as watched correctly
- Fixed certain issues that occurred when not being able to get anime data
- Fixed search bars in the Bookmarks and Manage Data menus not giving any results when using uppercase letters
- Fixed rare error caused by the sub group's name
- Fixed pressing the shortcut key for the site search bar sometimes putting a character in the search bar
- And more small stuff

### 4.7.2 (2026-05-14)
- Fixed auto-loading the video sometimes not working on Chromium-based browsers

### 4.7.1 (2026-04-29)
- Renamed the "Auto-Clear Links" option to "Auto-Clear Episodes"
- Changed the hover text of the anime page link button from "Get Link" to "Shortcut Link"
- Video progress time is now stored without decimals
- Fixed too many episodes in the episode feed causing it to delete newer episodes instead of older ones
- Fixed episode timestamps not being found for sequels with continuing episode numbers
- Fixed anime index results having no hover text
- Fixed the "to" season selection dropdown button being too wide when Fall is selected
- Some more small fixes

### 4.7.0 (2026-04-10)
- Added an option to have the header follow scrolling and stay at the top of the screen
- Updated the look of the Options menu
- Added the ability to press S to quickly open the site search bar, as an alternative to F2
- Added a button in the Options menu on episode pages to define or edit timestamps
  - This is an advanced feature. Use it if you'd like to contribute to defining sections in anime episodes
- Changed the bookmark Delete button to be red
- Added a bookmark icon to the Add Bookmark button
- A small message is now shown when adding and removing anime from bookmarks and the episode feed
- Keyboard shortcuts are now handled more consistently between the main page and video player
- Fixed hotkeys activating while typing in the index page's filter selection boxes
- Fixed not being able to find episode timestamps
- Fixed not being able to find anime covers from Anilist
- Fixed the hotkeys B and N (bookmarks and episode feed) not working when having the video player focused
- Fixed hotkeys not working on the 404 page
- Fixed a few typos
- And some more small things

### 4.6.1 (2026-04-05)
- Added support for the new domain

### 4.6.0 (2026-02-13)
- Added watched statuses to bookmarks. You can change the status of a bookmark anytime you want.
  - You can also sort bookmarks by status
- You can now sort bookmarks alphabetically
- Made the background for lists in modal menus darker, to make the text more readable on certain screens
- Updated visuals for the modal close/back button when hovered and clicked
- While the episode feed is loading, it now shows the loading status
- The default bookmark menu layout is now the grid layout
- Videos now show time elapsed instead of time remaining by default
- In data sync options, the corresponding time is now shown for the entered auto-sync value
- A message is now shown when toggling the Skip Button setting to remind that the video player must be reloaded
- Various other improvements
- This version is now required for the data sync feature, due to bookmark statuses being added
- Fixed data sync failing when the data contained certain characters
- Fixed finding anime page covers not being async

### 4.5.0 (2025-10-26)
- Anime page covers (banners) are now primarily from AniList, which should mean generally higher-quality covers
- Added a feature to go to a specific page of episodes on an anime page
- You can now press "B" to open the bookmarks menu
- You can now press "N" to open the episode feed (notifications) menu
- Fixed the search bar not being automatically selected when opening the bookmark menu
- Fixed entering a non-number in the Sync Interval setting causing an error
- Added handling for rare cases where a bookmark's image becomes invalid after it has been loaded

### 4.4.0 (2025-10-07)
- Added an option to enable data syncing between devices
  - Accessed through a Sync Data button in the Manage Data menu
  - Each device can select what data to sync and how often to automatically sync it
  - Create a sync code on one device and then enter the code on devices you want to sync with
- Added Download button in the episode menu dropdown, which takes you to the episode's download page
- Added an alternative grid layout to the bookmark list, which shows an image for each anime
- Searching on the anime index page has been improved to always put results that include the search query first
- The anime index page now shows alternating colors for the result rows
- Added a new system for quick messages shown at the bottom of the screen
- When clicking the Get Name button on an entry in the Watched Episodes storage menu, the session for that anime is now saved
- When visiting a random anime, the tab name now has a prefix to show that
- In cases where the modal menu has a back button, clicking outside the modal or pressing escape now closes it instead of going back
  - Pressing backspace still goes back to the previous menu
- You can now input more video player keybinds while the player isn't focused
- Emptying the main search bar now removes search results
- Pressing the "Clear Episodes from Tracker" button no longer freezes the page for a short moment
- Importing a partial "notifications" object is now supported
- The modal menu fade-in animation is now only played when it is opened
- The modal menu now has a limited width on larger screens
- Added descriptions to the expandable menus below the video player
- Fixed the modal menu's fade out animation not working on Chrome
- Fixed certain actions like Ctrl + C not working on episode pages
- Fixed timestamps (h:mm:ss) not being displayed with a 0 before the minute number, when applicable
- Fixed messages that show "X seconds ago" not being plural when displaying 0 seconds
- Fixed descriptions for results when searching with the main search bar
- Fixed the bookmark and episode feed header icons touching the search bar on mobile
- Fixed the episode feed anime entries not always graying out the "Get All" button, even if all available episodes were in the feed
- Fixed the resolution/dub not changing when clicking a badge icon on a resolution selection button
- Fixed Auto-Play Next being able to go to the next episode while the page for another episode was already loading
- Fixed placeholder text being added to the dropdown boxes in the index page when removing all filters of that type by pressing backspace, despite the input box still being focused
- Fixed the back button on modal menus having the description "Close modal"
- Other fixes and small changes
- Know issue: closing multiple AP tabs at the exact same time can sometimes cause it to stop syncing data in the background (if enabled). This can be fixed by opening a new AP tab (and, optionally, closing it afterwards).

### 4.3.2 (2025-09-11)
- Now also runs on the new domain

### 4.3.1 (2025-07-26)
- Renamed Time interval filter to "Season range" and fixed some associated element descriptions
- Fixed error when imported data doesn't contain one of the anime that the current site data has in the episode feed

### 4.3.0 (2025-07-18)
- Adding an anime to the episode feed now makes it look for episodes after the time you added the anime, rather than after the time you last opened the episode feed menu
- The buttons at the bottom of the Manage Data menu now look better on mobile devices
- Rerolling a random anime is now much faster
- Added a proper description to the site's Search field
- Fixed the Watched Episodes storage entry being from oldest to newest instead of the other way around
- Fixed issues caused by errors when getting a list of episodes for an anime with no episodes

### 4.2.0 (2025-06-17)
- Added a progress bar on anime pages for how much each episode has been watched
- Videos can now be marked (and unmarked) as watched
- Entire anime entries can be marked or unmarked as watched
  - Watched data can be managed in the Manage Data menu
- Added an episode options menu for each episode on an anime page
  - You can copy the link to the episode or mark/unmark it as watched
- Added an option to copy episode screenshots to clipboard instead of downloading them (enabled by default)
- Renamed the Settings button to Options
- Moved the Refresh Session button into the Options menu
- Added a button in the Options menu to report issues with timestamps on the current episode
- Added a button on the index page to reset selected filters
- Swapped the positions of the Random Anime and Search buttons on the index page
- Tweaked the way certain modal menus look
- Changed video seeking thumbnails to better show the point you're seeking to
- Closing the Handle Episode Feed menu no longer takes you back to the Episode Feed menu
- Anime collections in search results now have the name of the first entry, rather than the name of the first result of that series
- Links to episodes now try to find the correct anime if none with the exact specified name is found
- Video Progress and Video Playback Speed entries in the Manage Data menu now have links to their anime pages (if they were saved with a recent format)
- Added descriptions to the Reroll Anime and Save Session buttons on random anime result pages
- Added descriptions to the storage entries in the Manage Data menu
- Added description to the search bar within storage entries
- Added description to the search bar on the index page
- Changed the color of the spinning loading indicators from red to the site's main pink color
- Changed the shape of index page filter rule buttons
- Further tweaked some styling on the index page filter selection
- Other small styling tweaks
- Increased the limit for episode feed entries being stored at once from 100 to 150
- Old video progress entries (without ID) are now converted to the new format when the video is loaded
- Video speed entries can now be imported
- When importing data, warnings are now shown in the log for data entries with an incorrect format
- Fixed pages showing anime with certain status being incorrectly redirected to the index page
- Fixed using certain keybound actions while writing in a text input
- Fixed seek points on the video progress bar sometimes being able to go beyond where the bar ends
- Various other fixes

### 4.1.0 (2025-01-24)
- Index filter selector changes:
  - You can now change the rule for how positive and negative filters are combined
  - Improved many visual elements
  - Renamed "Find" button to "Apply"
  - "Apply" button is now a standard color when no changes have been made
  - Added the option to change filter rules for negative "type" and "demographic" filters
  - Fixed the status filter dropdown not appearing after opening another dropdown
  - Fixed the status filter dropdown not displaying its selection correctly when refreshing the page
  - Fixed performance when applying negative season time filters
- Tweaked the modal open animation.
  - It's still the same length, but looks a little different.
- Added a "Reduce Motion" setting
- Fixed errors for episodes that contain multiple episodes

### 4.0.0 (2025-01-10)
- Completely reworked the index search page.
  - Now allows for negative filters
  - Layout is slightly changed
  - Now looks better on mobile
  - Much better keyboard navigation
- Now supports skipping recaps, openings, endings, and next episode previews.
  - Along with this, points are added on the progress bar to mark these different sections
  - All of these features are not yet available for all anime
  - Added settings to disable the skip button and the points on the progress bar, separately
- Now saves the set video playback speed per anime.
  - This data is viewable and can be deleted in the "Manage Data" menu
- Organized the settings menu into two categories
- Added a setting to disable the seek thumbnails that appear when seeking through the progress bar
- Made the player slightly bigger with theatre mode on
- The close button on modals is now tab selectable
- Fixed rare instances of some episodes not having seek thumbnails

### 3.23.2 (2025-01-05)
- Fixed errors when loading video

### 3.23.1 (2024-12-30)
- Fixed additional log messages about upgrading version

### 3.23 (2024-12-30)
- Added "Auto-Play Video" option
- Renamed "Auto-play" option to "Auto-Play Next"

### 3.22.2 (2024-12-26)
- Reverted modal z-index change since it appeared underneath the video player

### 3.22.1 (2024-12-24)
- Allowed snow effect to go above the modal

### 3.22 (2024-12-22)
- Significantly improved the video seeking image tooltip.
- Search collections now display titles in the correct release order.
- The season filter's initial inputs are now automatically set to the current season.
- Fixed "Clean up" buttons in the Manage Data menu not correctly displaying entries after being used.
- Images with links to a prequel or sequel are now hidden with the Hide Thumbnails setting on.
- More fixes.
