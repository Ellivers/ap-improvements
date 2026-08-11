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

### 4.9.3
- Fixed errors in the Manage Feed menu when having anime with no episodes added to the feed
- Fixed having certain anime in the episode feed causing an error when refreshing
- Fixed broken anime ID data from 4.9.0

### 4.9.2
- Fixed a sync error after unmarking watched episodes for an anime with no watched episodes
- Other small fixes

### 4.9.1
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

### 4.9.0
- Added a Download Preferences menu in Options, where you can select the preferred resolution and language of episodes downloaded through the episode options menu
- Added a Watching Section option, which allows you to show/hide the Continue Watching section of the homepage
- Moved the Manage Data and Options buttons higher up on the homepage
- The buttons on anime and episode pages are now laid out better on mobile
- Anime pages should now load a bit faster
- Fixed the "View full poster" link on anime pages showing multiple times
- Fixed not being able to get a bookmark image for certain anime
- Other small fixes

### 4.8.1
- Updated collection items to look more like the site's new search result style
- The Manage Feed schedule now marks the current day
- Made site search results more easily clickable
- Bookmarks now use a slightly lower quality version of the poster
  - Applied when they are first loaded, not retroactively
- Fixed the "View full poster" link on anime pages

### 4.8.0
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
