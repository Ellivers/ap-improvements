// ==UserScript==
// @name        AnimePahe Improvements
// @namespace   https://gist.github.com/Ellivers/f7716b6b6895802058c367963f3a2c51
// @homepageURL https://github.com/Ellivers/ap-improvements
// @downloadURL https://raw.githubusercontent.com/Ellivers/ap-improvements/refs/heads/master/ap-improvements.user.js
// @updateURL   https://raw.githubusercontent.com/Ellivers/ap-improvements/refs/heads/master/ap-improvements.user.js
// @match       https://animepahe.pw/*
// @match       https://animepahe.com/*
// @match       https://animepahe.org/*
// @match       https://kwik.cx/e/*
// @match       https://kwik.cx/f/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM_info
// @version     4.10.0
// @author      Ellivers
// @license     MIT
// @description Improvements and additions for the AnimePahe site
// ==/UserScript==

/*
   How to install:
 * Get the Violentmonkey browser extension (Tampermonkey is mostly untested, but seems to work as well).
 * For the GitHub Gist page, click the "Raw" button above this file.
 * For Greasy Fork, click "Install this script".
 * I highly suggest using an ad blocker (uBlock Origin is recommended).

   Feature list:

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
 * Adds an option to hide all episode thumbnails on the site.
 * Adds an option to have the header always stay at the top of the screen.
 * Reworked anime index page. You can now:
    * Find anime with your desired genre, theme, type, demographic, status and season.
    * Search among these filter results.
    * Open a random anime within the specified filters.
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
 * Changes the video 'loop' keybind to Shift + L
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
 * Adds site-wide keyboard shortcuts:
    * B (default) to open the bookmark menu
    * N (default) to open the episode feed
    * S (default) to open the main search bar, as an alternative to F2
    * These keyboard shortcuts can be rebound or disabled.
 * Adds a more noticeable spinning loading indicator on videos.
 * Adds an "Auto-Play Video" option to automatically play the video (on some browsers, you may need to allow auto-playing for this to work).
 * Adds an "Auto-Play Next" option to automatically go to the next episode when the current one is finished.
 * Focuses on the video player when loading the page, so you don't have to click on it to use keyboard controls.
 * Adds an option to automatically choose the highest quality available when loading the video.
 * Adds a button (in the options menu) to reset the video player.
 * Shows the dates of when episodes were added.
 * And more!
*/

// MARKER:START

const baseUrl = window.location.toString();
const initialStorage = getStorage();

function getDefaultData() {
  return {
    version: 4,
    linkList:[],
    videoTimes:[],
    bookmarks:[],
    notifications: {
      lastUpdated: Date.now(),
      anime: [],
      episodes: []
    },
    badCovers: [],
    settings: {
      autoDelete:true,
      hideThumbnails:false,
      theatreMode:false,
      bestQuality:true,
      autoDownload:true,
      autoPlayNext:false,
      autoPlayVideo:false,
      seekThumbnails:true,
      seekPoints:true,
      skipButton:true,
      reduceMotion:false,
      copyScreenshots:true,
      stickyHeader:false,
      relativeEpNums:false,
      bookmarkLayout: "grid",
      bookmarkSort: "recent",
      notifScheduleStart: 0,
      keybindBookmarks: "b",
      keybindNotifications: "n",
      keybindSearch: "s",
      dlPreferRes: 1080,
      dlPreferLang: '',
      showContinueWatching: true,
    },
    videoSpeed: [],
    watched: "",
    sync: {
      syncCode: "",
      lastSynced: 0,
      currentMessage: null,
      temp: {
        addedData: [],
        removedData: [],
        requiredHash: '',
        inProgress: false
      },
      previousSettings: [],
      settings: {
        linkList: false,
        videoTimes: true,
        bookmarks: true,
        notifications: true,
        watched: true,
        interval: 300
      }
    }
  };
}

function upgradeData(data, fromver) {
  if (fromver === undefined) {
    fromver = 0;
  }
  const defaultVer = getDefaultData().version;
  if (fromver >= defaultVer) return;
  console.log(`[AnimePahe Improvements] Upgrading data from version ${fromver}`);
  /* Changes:
   * V1:
     * autoPlay -> autoPlayNext
   * V2:
     * autoDelete -> settings.autoDelete
     * hideThumbnails -> settings.hideThumbnails
     * theatreMode -> settings.theatreMode
     * bestQuality -> settings.bestQuality
     * autoDownload -> settings.autoDownload
     * autoPlayNext -> settings.autoPlayNext
     * autoPlayVideo -> settings.autoPlayVideo
   * V3:
     * linkList[].subInfo {name,quality,other} -> [name,quality,other]
   * V4:
     * Fix incorrect anime ID formats caused by 4.9.0
   */
  const upgradeFunctions = [
    () => { // upgrading from V0
      data.autoPlayNext = data.autoPlay;
      delete data.autoPlay;
    },
    () => { // upgrading from V1
      const settings = {};
      settings.autoDelete = data.autoDelete;
      settings.hideThumbnails = data.hideThumbnails;
      settings.theatreMode = data.theatreMode;
      settings.bestQuality = data.bestQuality;
      settings.autoDownload = data.autoDownload;
      settings.autoPlayNext = data.autoPlayNext;
      settings.autoPlayVideo = data.autoPlayVideo;
      data.settings = settings;
      delete data.autoDelete;
      delete data.hideThumbnails;
      delete data.theatreMode;
      delete data.bestQuality;
      delete data.autoDownload;
      delete data.autoPlayNext;
      delete data.autoPlayVideo;
    },
    () => { // upgrading from V2
      if (!data.linkList) return;
      data.linkList.forEach(g => {
        if (!g.subInfo || Array.isArray(g.subInfo)) return;
        g.subInfo = [g.subInfo.name, g.subInfo.quality, g.subInfo.other];
      });
    },
    () => { // upgrading from V3
      if (data.linkList?.length) data.linkList.forEach(g => {
        if (g.animeId) g.animeId = +g.animeId;
      });
      if (data.videoTimes?.length) data.videoTimes.forEach(g => {
        if (g.animeId) g.animeId = +g.animeId;
      });
      if (data.bookmarks?.length) data.bookmarks.forEach(g => {
        if (g.id) g.id = +g.id;
      });
      if (data.notifications?.anime?.length) data.notifications.anime.forEach(g => {
        if (g.id) g.id = +g.id;
      });
      if (data.notifications?.episodes?.length) data.notifications.episodes.forEach(g => {
        if (g.animeId) g.animeId = +g.animeId;
      });
    },
  ];

  for (let i = fromver; i < defaultVer; i++) {
    const fn = upgradeFunctions[i];
    if (fn !== undefined) fn();
  }

  data.version = defaultVer;
}

function getStorage() {
  const defa = getDefaultData();
  const res = GM_getValue('anime-link-tracker', defa);

  const oldVersion = res.version;

  for (const key of Object.keys(defa)) {
    if (res[key] !== undefined) continue;
    res[key] = defa[key];
  }

  for (const key of Object.keys(defa.settings)) {
    if (res.settings[key] !== undefined) continue;
    res.settings[key] = defa.settings[key];
  }

  if (oldVersion !== defa.version) {
    upgradeData(res, oldVersion);
    saveData(res);
  }

  return res;
}

function saveData(data) {
  GM_setValue('anime-link-tracker', data);
}

function getStorageLimits() {
  return {
    linkList: 1000,
    videoTimes: 1000,
    bookmarks: 300,
    notifications: {
      anime: 100,
      episodes: 150
    },
    videoSpeed: 1000,
  }
}

// Turns seconds into "hrs:minutes:seconds" or "minutes:seconds"
function secondsToHMS(secs) {
  const mins = Math.floor(secs/60);
  const hrs = Math.floor(mins/60);
  const newSecs = Math.floor(secs % 60);
  return `${hrs > 0 ? hrs + ':' : ''}${hrs > 0 && (mins%60).toString().length <= 1 ? '0' : ''}${mins % 60}:${newSecs.toString().length > 1 ? '' : '0'}${newSecs % 60}`;
}

function HMStoSeconds(hms) {
  const durParts = hms.split(':');
  if (durParts.length === 3) return (+durParts[0] * 3600) + (+durParts[1] * 60) + (+durParts[2]);
  else if (durParts.length === 2) return (+durParts[0] * 60) + (+durParts[1]);
}

// MARKER:WATCHED ENCODING
/* Watched episode format:
 * anime_id:episode_num1-episode_num2,episode_num3;<other entries>
 */

function decodeWatched(watched) {
  const decoded = [];
  if (watched?.split === undefined) {
    console.error('[AnimePahe Improvements] Attempted to decode watched episode list with incorrect type ' + typeof(watched));
    return [];
  }
  for (const anime of watched.split(';')) {
    const parts = anime.split(':');
    if (parts.length <= 1) continue;
    const animeId = parseInt(parts[0], 36);
    if (isNaN(animeId)) continue;
    const episodes = [];
    for (const ep of parts[1].split(',')) {
      if (ep.includes('-')) {
        const epParts = ep.split('-').map(e => parseEpNum(e));
        for (let i = epParts[0]; i <= epParts[1]; i++) { // If start or end of range is NaN, the for loop will not run
          episodes.push(i);
        }
      }
      else {
        const episode = parseEpNum(ep);
        if (!isNaN(episode)) episodes.push(episode);
      }
    }

    decoded.push({
      animeId: animeId,
      episodes: episodes
    });
  }
  return decoded;

  function parseEpNum(str) {
    const parts = str.split('.');
    if (parts.length === 1) return parseInt(parts[0], 36);
    else if (parts.length === 2) return parseInt(parts[0], 36) + (parseInt(parts[1], 36) / 10);
    else return NaN;
  }
}

function encodeWatched(watched) {
  return watched.map(a => {
    return a.animeId.toString(36) + ':' + (() => {
      const episodeRanges = [];

      const sorted = a.episodes.sort((a,b) => a > b ? 1 : -1);
      for (const episode of sorted) {
        const lastRange = episodeRanges[episodeRanges.length - 1];

        if (lastRange && episode - 1 === lastRange[1]) {
          lastRange[1] = episode;
        }
        else {
          episodeRanges.push([episode, episode]);
        }
      }
      return episodeRanges.map(e => {
        if (e[0] === e[1]) return encodeEpNum(e[0]);
        else return encodeEpNum(e[0]) + '-' + encodeEpNum(e[1]);
      }).join(',');
    })();
  }).join(';');

  function encodeEpNum(ep) {
    const parts = ep.toString().split('.');
    if (parts.length === 1) return ep.toString(36);
    else if (parts.length === 2) return parseInt(parts[0]).toString(36) + '.' + parseInt(parts[1][0]/*Limits the decimal value to one digit*/).toString(36);
    else return '0';
  }
}

function isWatched(animeId, episode, watched = decodeWatched(getStorage().watched)) {
  const found = watched.find(a => a.animeId === animeId);
  if (found === undefined) return false;
  return found.episodes.includes(episode);
}

function addWatched(animeId, episode, storage = getStorage()) {
  const watched = decodeWatched(storage.watched);
  const found = watched.find(a => a.animeId === animeId);

  if (found === undefined) {
    watched.push({
      animeId: animeId,
      episodes: [episode]
    });
  }
  else {
    if (found.episodes.find(e => e === episode) !== undefined) return;
    found.episodes.push(episode);
  }

  if (isSyncEnabled(storage)) {
    const foundAdded = storage.sync.temp.addedData.find(g => g.type === 'watched' && g.animeId === animeId);
    if (foundAdded) foundAdded.episodes.push(episode);
    else storage.sync.temp.addedData.push({type: 'watched', animeId: animeId, episodes: [episode]});
  }

  storage.watched = encodeWatched(watched);
  saveData(storage);
}

function removeWatched(animeId, episode, storage = getStorage()) {
  const watched = decodeWatched(storage.watched);
  const found = watched.find(a => a.animeId === animeId);
  if (found === undefined) return;
  found.episodes = found.episodes.filter(e => e !== episode);

  if (found.episodes.length === 0) {
    const index = watched.indexOf(found);
    watched.splice(index, 1);
  }

  if (isSyncEnabled(storage)) {
    storage.sync.temp.removedData.push({type: 'watched', animeId: animeId, episodes: [episode]});
  }

  storage.watched = encodeWatched(watched);
  saveData(storage);
}

function removeWatchedAnime(animeId, storage = getStorage()) {
  const decoded = decodeWatched(storage.watched);
  if (isSyncEnabled(storage)) {
    const found = decoded.filter(a => a.animeId === animeId);
    if (found.length) storage.sync.temp.removedData.push(found.map(a => {return {type: 'watched', animeId: animeId, episodes: a.episodes}})[0]);
  }

  storage.watched = encodeWatched(decoded.filter(a => a.animeId !== animeId));
  saveData(storage);
}

function getRelativeEpisodeNum(episode, firstEpisode) {
  return episode - Math.max(firstEpisode - 1, 0);
}

function getEpisodeValue(ep, ep2 = undefined, firstEp = undefined) {
  return firstEp !== undefined ? `${getRelativeEpisodeNum(ep, firstEp)}${ep2 ? '-' + getRelativeEpisodeNum(ep2, firstEp) : ''}` : `${ep}${ep2 ? '-' + ep2 : ''}`;
}

function getStoredTime(name, ep, storage, id = undefined) {
  if (id) {
    return storage.videoTimes.find(a => a.episodeNum === ep && a.animeId === id);
  }
  else return storage.videoTimes.find(a => a.animeName === name && a.episodeNum === ep);
}

function isSyncEnabled(storage) {
  return storage.sync.syncCode !== '';
}

function bumpSyncDiff(storage, bumpReason) {
  if (isSyncEnabled(storage) && !storage.sync.temp.addedData.length) storage.sync.temp.addedData.push({bump:bumpReason}); // Mark that changes have been made
}

function applyCssSheet(cssString) {
  $("head").append('<style id="anitracker-style" type="text/css"></style>');
  const sheet = $("#anitracker-style")[0].sheet;

  const rules = cssString.split(/^\}/mg).map(a => a.replace(/\n/gm,'') + '}');

  for (let i = 0; i < rules.length - 1; i++) {
    sheet.insertRule(rules[i], i);
  }
}

const kwikDLPageRegex = /^https:\/\/kwik\.\w+\/f\//;

// MARKER:VIDEO IFRAME
// Video player improvements
function anitrackerKwikLoad() {
  if (typeof $ !== "undefined" && $() !== null) anitrackerPlayerLoad(window.location.origin + window.location.pathname);
  else {
    const scriptElem = document.querySelector('head > link:nth-child(12)');
    if (scriptElem == null) {
      const h1 = document.querySelector('h1');
      // Some bug that the kwik DL page had before
      // (You're not actually blocked when this happens)
      if (!kwikDLPageRegex.test(baseUrl) && h1.textContent == "Sorry, you have been blocked") {
        h1.textContent = "Oops, page failed to load.";
        document.querySelector('h2').textContent = "This doesn't mean you're blocked. Try playing from another page instead.";
      }
      return;
    }
    scriptElem.onload(() => {anitrackerPlayerLoad(window.location.origin + window.location.pathname)});
  }

  function anitrackerPlayerLoad(url) {
  if (kwikDLPageRegex.test(url)) {
    if (initialStorage.settings.autoDownload === false) return;
    $(`
    <div style="width:100%;height:100%;background-color:rgba(0, 0, 0, 0.9);position:fixed;z-index:999;display:flex;justify-content:center;align-items:center;" id="anitrackerKwikDL">
      <span style="color:white;font-size:3.5em;font-weight:bold;">[AnimePahe Improvements] Downloading...</span>
    </div>`).prependTo(document.body);

    if ($('form').length) {
      $('form').submit();
      setTimeout(() => {$('#anitrackerKwikDL').remove()}, 1500);
    }
    else new MutationObserver(function(mutationList, observer) {
      if ($('form').length) {
        observer.disconnect();
        $('form').submit();
        setTimeout(() => {$('#anitrackerKwikDL').remove()}, 1500);
      }
    }).observe(document.body, { childList: true, subtree: true });

    return;
  }

// Needs to have this indentation
const _css = `
.anitracker-loading {
  background: none!important;
  border: 12px solid rgba(130,130,130,0.7);
  border-top-color: #00d1b2;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  translate: -50% -50%;
  width: 80px;
  height: 80px;
}
.anitracker-message {
  width:50%;
  height:10%;
  position:absolute;
  background-color:rgba(0,0,0,0.5);
  justify-content:center;
  align-items:center;
  margin-top:1.5%;
  border-radius:20px;
}
.anitracker-message>span {
  color: white;
  font-size: 2.5em;
}
.anitracker-progress-tooltip {
  width: 219px;
  padding: 5px;
  opacity:0;
  position: absolute;
  left:0%;
  bottom: 100%;
  background-color: rgba(255,255,255,0.88);
  border-radius: 8px;
  transition: translate .2s ease .1s,scale .2s ease .1s,opacity .1s ease .05s;
  transform: translate(-50%,0);
  user-select: none;
  pointer-events: none;
  z-index: 2;
}
.anitracker-progress-image {
  height: 100%;
  width: 100%;
  background-color: gray;
  display:flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 5px;
}
.anitracker-progress-image>img {
  width: 100%;
}
.anitracker-progress-image>span {
  font-size: .9em;
  bottom: 5px;
  position: fixed;
  background-color: rgba(0,0,0,0.7);
  border-radius: 3px;
  padding: 0 4px 0 4px;
}
.anitracker-skip-button {
  position: absolute;
  left: 5%;
  bottom: 10%;
  color: white;
  background-color: rgba(100,100,100,0.6);
  z-index: 1;
  border: 3px solid white;
  border-radius: 8px;
  padding: 10px 24px;
  transition: .3s;
}
.anitracker-skip-button:hover, .anitracker-skip-button:focus-visible {
  background-color: rgba(0,0,0,0.75);
}
.anitracker-skip-button:focus-visible {
  outline: 3px dotted #00b3ff;
}
.anitracker-seek-points {
  width: 100%;
  bottom: 0;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
}
.anitracker-seek-points>i {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 2px;
  background-color: #1a9166;
  pointer-events: none;
  z-index: 2;
  translate: -50% 0;
}
.plyr--hide-controls>.anitracker-hide-control {
  opacity: 0!important;
  pointer-events: none!important;
}
.plyr.plyr--hide-controls {
  cursor: none;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;

  applyCssSheet(_css);

  if ($('.anitracker-message').length) {
    console.log("[AnimePahe Improvements (Player)] Script was reloaded.");
    return;
  }

  $('button.plyr__controls__item:nth-child(1)').hide();
  $('.plyr__progress__container').hide();
  $('.plyr__control--overlaid').hide();

  $(`
  <div class="anitracker-loading plyr__control--overlaid">
      <span class="plyr__sr-only">Loading...</span>
  </div>`).appendTo('.plyr--video');

  const player = $('#kwikPlayer')[0];

  function getVideoInfo() {
    const fileName = document.getElementsByClassName('ss-label')[0].textContent;
    const nameParts = fileName.split('_');
    let name = '';
    for (let i = 0; i < nameParts.length; i++) {
      const part = nameParts[i];
      if (part.trim() === 'AnimePahe') {
        i++;
        continue;
      }
      if (part === 'Dub' && i >= 1 && [2,3,4,5].includes(nameParts[i-1].length)) break;
      if (/\d{2}/.test(part) && i >= 1 && nameParts[i-1] === '-') break;

      name += nameParts[i-1] + ' ';
    }
    return {
      animeName: name.slice(0, -1),
      episodeNum: +/^AnimePahe_.+_-_([\d\.]{2,})/.exec(fileName)[1]
    };
  }

  $(`<div class="anitracker-seek-points"></div>`).appendTo('.plyr__progress');

  function setSeekPoints(timestampData) {
    $('.anitracker-seek-points>i').remove();
    for (const t of timestampData) {
      const percentage = Math.min((t.start / player.duration) * 100, 100);
      $(`<i style="left: ${percentage}%;"></i>`).appendTo('.anitracker-seek-points');
    }
  }

  var timestamps = [];

  async function getAnidbIdFromTitle(title) {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.open('GET', 'https://raw.githubusercontent.com/NOBLES5E/anidb-titles/refs/heads/main/animes-titles.json', true);
      req.onload = () => {
        if (req.status !== 200) {
          resolve(false);
          return;
        }
        const data = JSON.parse(req.response);

        let anidbId = undefined;
        for (const anime of data) {
          if (!anime.titles.find(a => a.text === title)) continue;
          anidbId = +anime.aid;
          break;
        }

        resolve(anidbId);
      };
      req.send();
    });
  }

  async function getTimestamps(anidbId, episode, firstEpisode = undefined) {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.open('GET', 'https://raw.githubusercontent.com/Ellivers/open-anime-timestamps/refs/heads/master/timestamps.json', true); // Timestamp data
      req.onload = () => {
        if (req.status !== 200) {
          resolve(false);
          return;
        }
        const data = JSON.parse(req.response)[anidbId];
        if (!data) {
          resolve(false);
          return;
        }
        if (firstEpisode !== undefined) {
          episode = getRelativeEpisodeNum(episode, firstEpisode);
        }

        const episodeData = data.find(e => e.episode_number === episode);
        if (episodeData) {
          console.log(`[AnimePahe Improvements] Found timestamp data for episode ${episode}.`);
        }
        else {
          console.log(`[AnimePahe Improvements] No timestamp data found for episode ${episode}.`);
          resolve(false);
          return;
        }

        const duration = player.duration;
        const timestampData = [
          {
            type: "recap",
            start: episodeData.recap.start,
            end: episodeData.recap.end
          },
          {
            type: "opening",
            start: episodeData.opening.start,
            end: episodeData.opening.end
          },
          {
            type: "ending",
            start: episodeData.ending.start,
            end: episodeData.ending.end
          },
          {
            type: "preview",
            start: episodeData.preview_start
          }
        ];

        // Filter off unusable timestamps
        resolve(timestampData.filter(t => ![-1,-2].includes(t.start)));
      };
      req.send();
    });
  }

  function updateStoredPlaybackSpeed(speed) {
    const storage = getStorage();
    const vidInfo = getVideoInfo();
    const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);
    if (!storedVideoTime) return;
    const id = storedVideoTime.animeId;
    const name = vidInfo.animeName;

    const storedPlaybackSpeed = (() => {
      if (id) return storage.videoSpeed.find(a => a.animeId === id);
      else return storage.videoSpeed.find(a => a.animeName === name);
    })();

    if (speed === 1) {
      if (!storedPlaybackSpeed) return;
      if (id) storage.videoSpeed = storage.videoSpeed.filter(a => a.animeId !== id);
      else storage.videoSpeed = storage.videoSpeed.filter(a => a.animeName !== name);
      saveData(storage);
      return;
    }

    if (!storedPlaybackSpeed) {
      storage.videoSpeed.push({
        animeId: id,
        animeName: name,
        speed: speed
      });
      if (storage.videoSpeed.length > 256) storage.videoSpeed.splice(0,1);
    }
    else storedPlaybackSpeed.speed = speed;
    saveData(storage);
  }

  let reachedWatchedStatus = false;

  function updateStoredTime() {
    const currentTime = player.currentTime;
    const storage = getStorage();

    if (waitingState.idRequest === 1) return;
    const vidInfo = getVideoInfo();
    const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);

    if (!storedVideoTime) {
      if (![-1,1].includes(waitingState.idRequest)) { // If the ID request hasn't failed and isn't ongoing
        sendIdRequest();
        return;
      }
      const vidInfo = getVideoInfo();
      if (isSyncEnabled(storage)) {
        storage.sync.temp.addedData.push({type: 'videoTimes', animeName: vidInfo.animeName, episodeNum: vidInfo.episodeNum});
      }

      storage.videoTimes.push({
        videoUrls: [url],
        time: Math.floor(currentTime),
        animeName: vidInfo.animeName,
        episodeNum: vidInfo.episodeNum,
        duration: Math.floor(player.duration)
      });
      if (storage.videoTimes.length > getStorageLimits().videoTimes) {
        storage.videoTimes.splice(0,1);
      }
      saveData(storage);
      return;
    }

    if ((currentTime / player.duration) > 0.9) {
      // Mark as watched
      if (!reachedWatchedStatus && storedVideoTime.animeId) {
        reachedWatchedStatus = true;
        addWatched(storedVideoTime.animeId, vidInfo.episodeNum, storage);
      }
      // Delete the storage entry
      if (player.duration - currentTime <= 20) {
        const videoInfo = getVideoInfo();
        if (isSyncEnabled(storage)) {
          storage.sync.temp.removedData.push(...storage.videoTimes.filter(g => g.animeName === videoInfo.animeName && g.episodeNum === videoInfo.episodeNum).map(g => {return {type: 'videoTimes', animeName: videoInfo.animeName, episodeNum: vidInfo.episodeNum}}));
        }

        storage.videoTimes = storage.videoTimes.filter(a => !(a.animeName === videoInfo.animeName && a.episodeNum === videoInfo.episodeNum));
        saveData(storage);
        return;
      }
    }

    bumpSyncDiff(storage, 'videoTimeUpdate');
    storedVideoTime.time = Math.floor(currentTime);
    saveData(storage);
  }

  let timestampEditModeEnabled = false;

  // MARKER:MESSAGES FROM MAIN PAGE
  // For message requests from the main page
  // -1: failed
  // 0: hasn't started
  // 1: waiting
  // 2: succeeded
  const waitingState = {
    idRequest: 0,
    videoUrlRequest: 0,
    anidbIdRequest: 0
  };
  // Messages received from main page
  window.onmessage = async function(e) {
    const storage = getStorage();
    const vidInfo = getVideoInfo();

    const data = e.data;
    if (storage.debug?.msg) console.log('Received from main page: ' + (typeof(e.data) === 'object' ? JSON.stringify(e.data) : e.data));

    const action = data.action;
    if (action === 'id_response' && waitingState.idRequest === 1) {
      const found = storage.videoTimes.find(a => a.animeName === vidInfo.animeName && a.episodeNum === vidInfo.episodeNum);

      if (!found) {
        if (isSyncEnabled(storage)) {
          storage.sync.temp.addedData.push({type: 'videoTimes', animeName: vidInfo.animeName, episodeNum: vidInfo.episodeNum});
        }

        storage.videoTimes.push({
          videoUrls: [url],
          time: player.currentTime,
          animeName: vidInfo.animeName,
          episodeNum: vidInfo.episodeNum,
          animeId: data.id,
          duration: Math.floor(player.duration)
        });
        if (storage.videoTimes.length > getStorageLimits().videoTimes) {
          storage.videoTimes.splice(0,1);
        }
      }
      else {
        found.animeId = data.id; // If the entry already exists, just add the ID
      }

      saveData(storage);
      waitingState.idRequest = 2;

      const storedPlaybackSpeed = storage.videoSpeed.find(a => a.animeId === data.id);
      if (storedPlaybackSpeed) {
        setSpeed(storedPlaybackSpeed.speed);
      }

      waitingState.anidbIdRequest = 1;
      sendMessage({action:"anidb_id_request",id:data.id});

      return;
    }
    else if (action === 'anidb_id_response' && waitingState.anidbIdRequest === 1) {
      // anidb_id_response also responds with pahe ID and the anime's first episode number
      waitingState.anidbIdRequest = 2;
      let anidbId = data.id;
      if (anidbId === undefined) {
        const episode = storage.linkList.find(e => e.type === 'episode' && e.animeId === data.originalId);
        if (!episode) return;
        anidbId = await getAnidbIdFromTitle(episode.animeName);
      }
      if (anidbId === undefined) {
        console.warn("[AnimePahe Improvements] Couldn't get AniDB ID");
        return;
      }
      getTimestamps(anidbId, vidInfo.episodeNum, data.firstEpisode).then(response => {
        const storage = getStorage();
        const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);

        if (response === false) {
          storedVideoTime.hasTimestamps = false;
          delete storedVideoTime.timestampData;
          saveData(storage);
          return;
        }

        if (storage.settings.seekPoints) setSeekPoints(response);
        if (storage.settings.skipButton) timestamps = response;

        storedVideoTime.hasTimestamps = true;
        storedVideoTime.timestampData = response;
        saveData(storage);
      });
    }
    else if (action === 'video_url_response' && waitingState.videoUrlRequest === 1) {
      waitingState.videoUrlRequest = 2;
      setupSeekThumbnails(data.url);
    }
    else if (action === 'newer_time') {
      if (player.paused && data.time !== undefined && data.time > player.currentTime) player.currentTime = data.time;
    }
    else if (action === 'key') {
      if ([' ','k'].includes(data.key)) {
        if (player.paused) player.play();
        else player.pause();
      }
      else if (data.key === 'ArrowLeft') {
        player.currentTime = Math.max(0, player.currentTime - 5);
        return;
      }
      else if (data.key === 'ArrowRight') {
        player.currentTime = Math.min(player.duration, player.currentTime + 5);
        return;
      }
      else if (/^\d$/.test(data.key)) {
        player.currentTime = (player.duration/10)*(+data.key);
        return;
      }
      else if (data.key === 'm') player.muted = !player.muted;
      else $(player).trigger('keydown', {
        event: data.event
      });
    }
    else if (action === 'setting_changed') {
      if (player.readyState <= 2) return;
      const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);
      if (data.type === 'seek_points' && storedVideoTime.hasTimestamps === true) {
        if (data.value === true && !$('.anitracker-seek-points>i').length) setSeekPoints(storedVideoTime.timestampData);
        else if (data.value === false) $('.anitracker-seek-points>i').remove();
      }
      else if (data.type === 'seek_thumbnails') {
        if (data.value == true) {
          if ($('.anitracker-progress-tooltip').length) $('.anitracker-progress-tooltip').trigger('anitracker:enabled');
          else requestSeekThumbnails();
        }
        else if (data.value === false && $('.anitracker-progress-tooltip').length) $('.anitracker-progress-tooltip').trigger('anitracker:disabled');
      }
      else if (data.type === 'skip_button' && storedVideoTime.hasTimestamps === true) {
        if (data.value === true) {
          timestamps = storedVideoTime.timestampData;
          checkActiveTimestamps();
        }
        else {
          setSkipBtnVisibility(false);
          timestamps = [];
        }
      }
      else if (data.type === 'screenshot_mode') $('button[data-plyr="capture"]').data('mode', data.value);
    }
    else if (action === 'timestamp_edit_mode') {
      timestampEditMode();
    }
  };

  function timestampEditMode() {
    if (timestampEditModeEnabled) return;
    timestampEditModeEnabled = true;

    const vidInfo = getVideoInfo();
    const storage = getStorage();
    const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);
    if (!storedVideoTime) {
      showMessage('Error: no data object');
      return;
    }
    let newTimestamps = JSON.parse(JSON.stringify(storedVideoTime.timestampData || []));

    const types = ['recap','opening','ending','preview'];
    let currentType = 'opening';

    $('.anitracker-message').on('anitracker:message_close', () => {
      showMessage(`
      <div style="font-size: 0.6em;line-height:1.1em;">
        <div style="width:100%;"><span id="anitracker-timestamp-edit-current"></span></div>
        <span>W - Set start&nbsp;&nbsp;E - Set end</span><br>
        <span>R - Remove all&nbsp;&nbsp;D - Done&nbsp;&nbsp;Q - Cancel</span>
      </div>`, 0, true);
      setType(currentType);
    }).trigger('anitracker:message_close');
    const keydownFn = (e) => {
      if (!e.key) return;
      if (['ArrowUp','ArrowDown'].includes(e.key) && !e.ctrlKey) {
        let index = types.indexOf(currentType);
        if (e.key === 'ArrowUp') index--;
        if (e.key === 'ArrowDown') index++;

        if (index < 0) index = types.length - 1;
        if (index >= types.length) index = 0;

        setType(types[index]);

        e.preventDefault();
        e.stopPropagation();
      }
      const key = e.key.toLowerCase();
      if (['d','q'].includes(key)) {
        $(document).off('keydown', keydownFn);
        $('.anitracker-message').off('anitracker:message_close').hide();
        $('.anitracker-seek-points>i').remove();
        timestampEditModeEnabled = false;
        if (key === 'd') {
          newTimestamps = newTimestamps.filter(a => a.start !== undefined || a.end !== undefined);
          sendMessage({action:'timestamp_edit_mode_done', timestamps:newTimestamps});

          const storage = getStorage();

          if (storage.settings.skipButton) timestamps = newTimestamps;
          if (storage.settings.seekPoints) setSeekPoints(newTimestamps);

          const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);
          if (!storedVideoTime) return;

          const hasTimestamps = Boolean(newTimestamps.find(a => a.start >= 0));
          storedVideoTime.hasTimestamps = hasTimestamps;
          if (!hasTimestamps) {
            saveData(storage);
            return;
          }
          storedVideoTime.timestampData = newTimestamps;
          saveData(storage);
        }
        else {
          if (storage.settings.seekPoints) setSeekPoints(storedVideoTime.timestampData || []);
        }
      }
      else if (key === 'r') {
        $('.anitracker-seek-points>i').remove();
        newTimestamps = newTimestamps.filter(a => a.type !== currentType);
      }
      else if (key === 'w') {
        setTimestamp(Math.floor(player.currentTime), 'start');
      }
      else if (key === 'e') {
        if (currentType === 'preview') {
          showMessage("Preview only has a start");
          return;
        }
        setTimestamp(Math.floor(player.currentTime), 'end');
      }
    };
    $(document).on('keydown', keydownFn);

    function setType(type) {
      currentType = type;
      $('#anitracker-timestamp-edit-current').text(`Currently editing: ↕️ ${type[0].toUpperCase()}${type.slice(1)}`);
      $('.anitracker-seek-points>i').remove();

      const obj = getTypeObj();
      if (obj.start !== undefined) setTimestamp(obj.start, 'start');
      if (obj.end !== undefined) setTimestamp(obj.end, 'end');
    }

    function setTimestamp(time, type) { // type parameter here is 'start' or 'end'
      $(`#anitracker-timestamp-edit-${type}-point`).remove();
      getTypeObj()[type] = time;
      if (time < 0) return;

      const percentage = Math.min((time / player.duration) * 100, 100);
      $(`<i id="anitracker-timestamp-edit-${type}-point" style="left: ${percentage}%;background-color:#${type === 'start' ? '2c5ad6' : 'e78e03'};height:1em;"></i>`).appendTo('.anitracker-seek-points');
    }

    function getTypeObj() {
      const found = newTimestamps.find(a => a.type === currentType);
      if (found) return found;

      newTimestamps.push({type: currentType});
      return newTimestamps[newTimestamps.length - 1];
    }
  }

  $('.plyr--full-ui').attr('tabindex','1');
  let skipBtnVisible = false;

  function setSkipBtnVisibility(on) {
    const elem = $('.anitracker-skip-button');
    if (on && !skipBtnVisible) {
      elem.css('opacity','1').css('pointer-events','').css('translate','');
      elem.attr('tabindex','2');
      skipBtnVisible = true;
    }
    else if (!on && skipBtnVisible) {
      elem.css('opacity','0').css('pointer-events','none').css('translate','-50%');
      elem.removeClass('anitracker-hide-control');
      elem.attr('tabindex','-1');
      elem.off('click');
      skipBtnVisible = false;
    }
  }

  const skipTexts = {
    'recap': 'Skip Recap',
    'opening': 'Skip Opening',
    'ending': 'Skip Ending',
    'preview': 'Skip to End'
  };

  function checkActiveTimestamps(time = player.currentTime) {
    if (!timestamps.length) return;
    let activeTimestamp;
    for (const t of timestamps) {
      if (time > t.start && (time < (t.end - 2) || t.end === undefined)) {
        activeTimestamp = t;
        break;
      }
    }
    if (activeTimestamp === undefined) {
      setSkipBtnVisibility(false);
      return;
    }
    const elem = $('.anitracker-skip-button');

    const text = skipTexts[activeTimestamp.type] || 'Skip Section';
    if (text === elem.text() && skipBtnVisible) {
      if (time - activeTimestamp.start > 4) {
        elem.addClass('anitracker-hide-control');
      }
      return;
    }

    elem.text(text);
    setSkipBtnVisibility(true);
    elem.off('click');
    elem.on('click', () => {
      player.focus();
      player.currentTime = activeTimestamp.end !== undefined ? activeTimestamp.end - 2 : player.duration;
      setSkipBtnVisibility(false);
    });
  }

  function sendIdRequest() {
    if ([-1,1].includes(waitingState.idRequest)) return; // Return if the ID request either has failed or is ongoing
    waitingState.idRequest = 1;
    sendMessage({action: "id_request"});
    setTimeout(() => {
      if (waitingState.idRequest === 1) {
        waitingState.idRequest = -1; // Failed to get the anime ID from the main page within 2 seconds
        updateStoredTime();
      }
    }, 2000);
  }

  // MARKER:VIDEO LOADED EVENT
  player.addEventListener('loadeddata', function loadVideoData() {
    // Events
    let lastTimeUpdate = 0;
    player.addEventListener('timeupdate', function() {
      const currentTime = player.currentTime;
      checkActiveTimestamps(currentTime);
      if (Math.trunc(currentTime) % 10 === 0 && player.currentTime - lastTimeUpdate > 9) {
        updateStoredTime();
        lastTimeUpdate = player.currentTime;
      }
    });
    player.addEventListener('pause', () => {
      updateStoredTime();
    });
    player.addEventListener('seeked', () => {
      updateStoredTime();
      checkActiveTimestamps();
      finishedLoading();
    });
    player.addEventListener('ratechange', () => {
      if (player.readyState > 2) updateStoredPlaybackSpeed(player.playbackRate);
    });
    // Events end

    setTimeout(() => {
      $('.plyr__time').click(); // Toggle to show time elapsed instead of time remaining
    }, 0);

    const storage = getStorage();
    const vidInfo = getVideoInfo();
    const storedVideoTime = getStoredTime(vidInfo.animeName, vidInfo.episodeNum, storage);

    if (storedVideoTime) {
      player.currentTime = Math.max(0, Math.min(storedVideoTime.time, player.duration));
      if (storedVideoTime.hasTimestamps) {
        if (storedVideoTime.timestampData.timestamps) {
          // Handle previous format
          if (waitingState.anidbIdRequest !== 1 && storedVideoTime.animeId) {
            waitingState.anidbIdRequest = 1;
            sendMessage({action:"anidb_id_request",id:storedVideoTime.animeId});
          }
        }
        else {
          if (storage.settings.skipButton) timestamps = storedVideoTime.timestampData;
          if (storage.settings.seekPoints) setSeekPoints(storedVideoTime.timestampData);
        }
      }
      if (!storedVideoTime.videoUrls.includes(url)) {
        bumpSyncDiff(storage, 'videoTimeEntryUpdate');
        storedVideoTime.videoUrls.push(url);
        saveData(storage);
      }
      if (storedVideoTime.duration === undefined) {
        bumpSyncDiff(storage, 'videoTimeEntryUpdate');
        storedVideoTime.duration = Math.floor(player.duration);
        saveData(storage);
      }
      if (!storedVideoTime.animeId) sendIdRequest();
      const storedPlaybackSpeed = storage.videoSpeed.find(a => a.animeId === storedVideoTime.animeId);
      if (storedPlaybackSpeed) {
        setSpeed(storedPlaybackSpeed.speed);
      }
      else player.playbackRate = 1;
    }
    else {
      player.playbackRate = 1;
      sendIdRequest();
      finishedLoading();
    }

    const timeArg = Array.from(new URLSearchParams(window.location.search)).find(a => a[0] === 'time');
    if (timeArg) {
      const newTime = +timeArg[1];
      if (!storedVideoTime || (storedVideoTime && Math.floor(storedVideoTime.time) === Math.floor(newTime)) || (storedVideoTime &&
                                            confirm(`[AnimePahe Improvements]\n\nYou already have saved progress on this video (${secondsToHMS(storedVideoTime.time)}). Do you want to overwrite it and go to ${secondsToHMS(newTime)}?`))) {
        player.currentTime = Math.max(0, Math.min(newTime, player.duration));
      }
      window.history.replaceState({}, document.title, url);
    }

    player.removeEventListener('loadeddata', loadVideoData);

    // Screenshot changes
    $('button[data-plyr="capture"]').replaceWith($('button[data-plyr="capture"]').clone()); // Just to remove existing event listeners
    $('button[data-plyr="capture"]')
    .data('mode', ['download', 'copy'][+initialStorage.settings.copyScreenshots])
    .on('click', (e) => {
      const canvas = document.createElement('canvas');
      canvas.height = player.videoHeight;
      canvas.width = player.videoWidth;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
      const mode = $(e.currentTarget).data('mode');
      if (mode === 'copy') {
        canvas.toBlob((blob) => {
          try {
            navigator.clipboard.write([
              new ClipboardItem({[blob.type]: blob})
            ]);
          }
          catch (e) {
            console.error(e);
            showMessage("Couldn't copy!");
            alert("[AnimePahe Improvements]\n\nCouldn't copy screenshot. Try disabling the Copy Screenshots option.");
            return;
          }

          showMessage('Copied image');
        });
      }
      else if (mode === 'download') {
        const element = document.createElement('a');
        element.setAttribute('href', canvas.toDataURL('image/png'));
        element.setAttribute('download', $('.ss-label').text());
        element.click();
        element.remove();
      }
    });
  });

  function getFrame(video, time, dimensions) {
    return new Promise((resolve) => {
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.height = dimensions.y;
        canvas.width = dimensions.x;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          resolve(URL.createObjectURL(blob));
        }, 'image/png');
      };
      try {
        video.currentTime = time;
      }
      catch (e) {
        console.error(time, e);
      }
    });
  }

  const settingsContainerId = (() => {
    for (const elem of $('.plyr__menu__container')) {
      const regex = /plyr\-settings\-(\d+)/.exec(elem.id);
      if (regex === null) continue;
      return regex[1];
    }
    return undefined;
  })();

  function getThumbnailTime(time, timeBetweenThumbnails, fullDuration) {
    // Make thumbnails in the middle of the "time between thumbnails" slots by adding half the interval time to them
    const thumbnailTime = Math.trunc(time/timeBetweenThumbnails)*timeBetweenThumbnails + Math.trunc(timeBetweenThumbnails / 2);
    return Math.min(thumbnailTime, fullDuration);
  }

  function setupSeekThumbnails(videoSource) {
    const resolution = 167;

    const bgVid = document.createElement('video');
    bgVid.height = resolution;
    bgVid.onloadeddata = () => {
      let enabled = true;
      const fullDuration = bgVid.duration;
      const timeBetweenThumbnails = fullDuration/(24*6); // Just something arbitrary that seems good
      const thumbnails = [];
      const aspectRatio = bgVid.videoWidth / bgVid.videoHeight;

      const aspectRatioCss = `${bgVid.videoWidth} / ${bgVid.videoHeight}`;

      $('.plyr__progress .plyr__tooltip').hide();
      $(`
      <div class="anitracker-progress-tooltip" style="aspect-ratio: ${aspectRatioCss};">
        <div class="anitracker-progress-image">
          <img style="display: none; aspect-ratio: ${aspectRatioCss};">
          <span>0:00</span>
        </div>
      </div>`).insertAfter(`progress`);

      $('.anitracker-progress-tooltip img').on('load', () => {
        $('.anitracker-progress-tooltip img').css('display', 'block');
      });

      const toggleVisibility = (on) => {
        if (on) $('.anitracker-progress-tooltip').css('opacity', '1').css('scale','1').css('translate','');
        else $('.anitracker-progress-tooltip').css('opacity', '0').css('scale','0.75').css('translate','-12.5% 20px');
      };

      const elem = $('.anitracker-progress-tooltip');
      const seekElem = $(`#plyr-seek-${settingsContainerId}`);
      let currentTime = 0;
      new MutationObserver(function() {
        if (!enabled) return;

        if ($('.plyr--full-ui').hasClass('plyr--hide-controls') || !seekElem[0].matches(`#plyr-seek-${settingsContainerId}:hover,#plyr-seek-${settingsContainerId}:focus`)) {
          toggleVisibility(false);
          return;
        }
        toggleVisibility(true);

        const seekValue = seekElem.attr('seek-value') || ((+seekElem.attr('aria-valuenow') / fullDuration) * 100);
        const time = seekValue !== undefined ? Math.min(Math.max(Math.trunc(fullDuration*(+seekValue/100)), 0), fullDuration) : Math.trunc(player.currentTime);
        const timeSlot = Math.trunc(time/timeBetweenThumbnails);
        const roundedTime = getThumbnailTime(time, timeBetweenThumbnails, fullDuration);

        elem.find('span').text(secondsToHMS(time));
        elem.css('left', seekValue + '%');

        if (roundedTime === getThumbnailTime(currentTime, timeBetweenThumbnails, fullDuration)) return;

        const cached = thumbnails.find(a => a.time === timeSlot);
        if (cached) {
          elem.find('img').attr('src', cached.data);
        }
        else {
          elem.find('img').css('display', 'none');
          getFrame(bgVid, roundedTime, {y: resolution, x: resolution*aspectRatio}).then((response) => {
            thumbnails.push({
              time: timeSlot,
              data: response
            });

            if (initialStorage.debug?.seekThumbnails) console.log('thumb:',timeSlot,response);
            elem.find('img').css('display', 'none');
            elem.find('img').attr('src', response);
          });
        }
        currentTime = time;
      }).observe(seekElem[0], { attributes: true });

      seekElem.on('mouseleave blur', () => {
        toggleVisibility(false);
      });

      $('.anitracker-progress-tooltip').on('anitracker:disabled', () => {
        $('.anitracker-progress-tooltip').hide();
        $('.plyr__progress .plyr__tooltip').show();
        enabled = false;
      });

      $('.anitracker-progress-tooltip').on('anitracker:enabled', () => {
        $('.anitracker-progress-tooltip').show();
        $('.plyr__progress .plyr__tooltip').hide();
        enabled = true;
      });
    };

    if (initialStorage.debug?.seekThumbnails) {
      $(`<button class="anitracker-debug-canvas-button" style="position:absolute;top:0;left:0;z-index:1;">Test canvas</button>`).appendTo($(player).parents().eq(1))
        .on('click', () => {
        console.log('started');
        const canvas = document.createElement('canvas');
        canvas.height = resolution;
        canvas.width = resolution * 1.77777778;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgVid, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          const src = URL.createObjectURL(blob);
          console.log('showing image!', src);
          $(`<div style="background:red;padding:10px;margin:20px;position:absolute;width:90%;height:90%;"><img src=${src}></div>`).appendTo($(player).parents().eq(1));
        }, 'image/png');
      });
    }

    const hls2 = new Hls({
      maxBufferLength: 0.1,
      backBufferLength: 0,
      capLevelToPlayerSize: true,
      maxAudioFramesDrift: Infinity
    });
    hls2.loadSource(videoSource);
    hls2.attachMedia(bgVid);
  }

  // Thumbnails when seeking
  function requestSeekThumbnails() {
    if (!Hls.isSupported()) return;
    sendMessage({action:"video_url_request"});
    waitingState.videoUrlRequest = 1;
    setTimeout(() => {
      if (waitingState.videoUrlRequest === 2) return;

      waitingState.videoUrlRequest = -1;
      if (typeof hls !== "undefined") setupSeekThumbnails(hls.url);
    }, 500);
  }
  if (initialStorage.settings.seekThumbnails) requestSeekThumbnails();

  function finishedLoading() {
    if (!$('.anitracker-loading').length) return;
    $('.anitracker-loading').remove();
    $('button.plyr__controls__item:nth-child(1)').show();
    $('.plyr__progress__container').show();
    $('.plyr__control--overlaid').show();

    const storage = getStorage();
    if (storage.settings.autoPlayVideo === true) player.play().catch(() => {
      showMessage('<span style="font-size: 1.75rem;">Auto-play failed! Try enabling autoplay/sound for this site.</span>', 3000, true);
    });
  }

  let messageTimeout;
  function showMessage(text, time = 1000, html = false) {
    $('.anitracker-message span').empty();

    if (html) $('.anitracker-message span').html(text);
    else $('.anitracker-message span').text(text);

    $('.anitracker-message').css('display', 'flex');
    clearTimeout(messageTimeout);
    if (time === 0) return;
    messageTimeout = setTimeout(() => {
      $('.anitracker-message').hide().trigger('anitracker:message_close');
    }, time);
  }

  const frametime = 1 / 24;
  let funPitch = "";

  // MARKER:VIDEO KEYBOARD SHORTCUTS
  $(document).on('keydown', function(e, other = undefined) {
    if (!e.key) e = other.event;
    const key = e.key;
    if (key === 'ArrowUp') {
      changeSpeed(e, -1); // The changeSpeed function only works if ctrl is being held
      return;
    }
    if (key === 'ArrowDown') {
      changeSpeed(e, 1);
      return;
    }
    if (e.shiftKey && ['l','L'].includes(key)) {
      showMessage('Loop: ' + (player.loop ? 'Off' : 'On'));
      player.loop = !player.loop;
      return;
    }
    if (e.shiftKey && ['n','N'].includes(key)) {
      sendMessage({action: "next"});
      return;
    }
    if (e.shiftKey && ['p','P'].includes(key)) {
      sendMessage({action: "previous"});
      return;
    }
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return; // Prevents special keys for the rest of the keybinds
    if (key === 'j') {
      player.currentTime = Math.max(0, player.currentTime - 10);
      return;
    }
    else if (key === 'l') {
      player.currentTime = Math.min(player.duration, player.currentTime + 10);
      setTimeout(() => {
        player.loop = false;
      }, 5);
      return;
    }
    else if (/^Numpad\d$/.test(e.code)) {
      player.currentTime = (player.duration/10)*(+e.code.replace('Numpad', ''));
      return;
    }
    if (!(player.currentTime > 0 && !player.paused && !player.ended && player.readyState > 2)) {
      if (key === ',') {
        player.currentTime = Math.max(0, player.currentTime - frametime);
        return;
      }
      else if (key === '.') {
        player.currentTime = Math.min(player.duration, player.currentTime + frametime);
        return;
      }
    }

    funPitch += key;
    if (funPitch === 'crazy') {
      player.preservesPitch = !player.preservesPitch;
      showMessage(player.preservesPitch ? 'Off' : 'Change speed ;D');
      funPitch = "";
      return;
    }
    if (!"crazy".startsWith(funPitch)) {
      funPitch = "";
    }

    if (e.msg) return; // If this was a message from main page, don't do recursive stuff
    sendMessage({action:"key",key:e.key,event:{key:e.key, ctrlKey:e.ctrlKey, shiftKey:e.shiftKey, altKey:e.altKey, metaKey:e.metaKey, msg:true}});
  });

  // Ctrl+scrolling to change speed

  $(`
  <button class="anitracker-skip-button" tabindex="-1" style="opacity:0;pointer-events:none;translate:-50%;" aria-label="Skip section"><span>Skip Section</span></button>
  <div class="anitracker-message" style="display:none;">
    <span>2.0x</span>
  </div>`).appendTo($(player).parents().eq(1));

  jQuery.event.special.wheel = {
      setup: function( _, ns, handle ){
          this.addEventListener("wheel", handle, { passive: false });
      }
  };

  const defaultSpeeds = player.plyr.options.speed;

  function changeSpeed(e, delta) {
    if (!e.ctrlKey) return;
    if (e.preventDefault) e.preventDefault();
    if (delta == 0) return;

    const speedChange = e.shiftKey ? 0.05 : 0.1;

    setSpeed(player.playbackRate + speedChange * (delta > 0 ? -1 : 1));
  }

  function setSpeed(speed) {
    if (speed > 0) player.playbackRate = Math.round(speed * 100) / 100;
    showMessage(player.playbackRate + "x");

    if (defaultSpeeds.includes(player.playbackRate)) {
      $('.anitracker-custom-speed-btn').remove();
    }
    else if (!$('.anitracker-custom-speed-btn').length) {
      $(`#plyr-settings-${settingsContainerId}-speed>div>button`).attr('aria-checked','false');
      $(`
      <button type="button" role="menuitemradio" class="plyr__control anitracker-custom-speed-btn" aria-checked="true"><span>Custom</span></button>
      `).prependTo(`#plyr-settings-${settingsContainerId}-speed>div`);

      for (const elem of $(`#plyr-settings-${settingsContainerId}-home>div>`)) {
        if (!/^Speed/.test($(elem).children('span')[0].textContent)) continue;
        $(elem).find('span')[1].textContent = "Custom";
      }
    }
  }

  $(`#plyr-settings-${settingsContainerId}-speed>div>button`).on('click', (e) => {
    $('.anitracker-custom-speed-btn').remove();
  });

  $(document).on('wheel', function(e) {
    changeSpeed(e, e.originalEvent.deltaY);
  });

  }
}

if (/^https:\/\/kwik\.\w+/.test(baseUrl)) {
  anitrackerKwikLoad();
  return;
}

if ($() !== null) anitrackerLoad(window.location.origin + window.location.pathname + window.location.search);
else {
  document.querySelector('head > link:nth-child(10)').onload(() => {anitrackerLoad(window.location.origin + window.location.pathname + window.location.search)});
}

function anitrackerLoad(url) {

if ($('#anitracker-modal').length) {
  console.log("[AnimePahe Improvements] Script was reloaded.");
  return;
}

if (initialStorage.settings.hideThumbnails === true) {
  hideThumbnails();
}
if (initialStorage.settings.stickyHeader === true) {
  stickyHeader(true);
}

function windowOpen(url, target = '_blank') {
  $(`<a href="${url}" target="${target}"></a>`)[0].click();
}

(function($) {
  $.fn.changeElementType = function(newType) {
      let attrs = {};

      $.each(this[0].attributes, function(idx, attr) {
          attrs[attr.nodeName] = attr.nodeValue;
      });

      this.replaceWith(function() {
          return $("<" + newType + "/>", attrs).append($(this).contents());
      });
  };
  $.fn.replaceClass = function(oldClass, newClass) {
    this.removeClass(oldClass).addClass(newClass);
    return this;
  };
})(jQuery);

jQuery.anitrackerCachedScript = function(surl, success) {
  return $.ajax({
    url: surl,
    dataType: 'script',
    cache: true,
    success: success
  });
}

// -------- AnimePahe Improvements CSS ---------

const animationTimes = {
  modalOpen: 0.2,
  fadeIn: 0.2
};

// MARKER:MAIN PAGE CSS
const _css = `
:root {
  --anitracker-dark: rgb(20, 26, 31);
  --anitracker-darker: rgb(14, 20, 23);
  --pahe-pink: #d5015b;
}
#anitracker {
  display: flex;
  gap: 7px 7px;
  align-items: center;
  flex-wrap: wrap;
}
.anitracker-index {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 15px 7px;
  margin-bottom: 10px;
}
#anitracker>span {align-self: center;\n}
#anitracker-modal {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  z-index: 20;
  display: none;
  will-change: opacity;
}
#anitracker-modal-content {
  max-height: 90%;
  background-color: var(--dark);
  margin: auto auto auto auto;
  border-radius: 20px;
  display: flex;
  padding: 20px;
  z-index:50;
  box-shadow: rgba(0, 0, 0, 0.49) 0px 0px 10px 2px;
}
#anitracker-modal-close {
  font-size: 2.5em;
  margin-right: 5px;
  cursor: pointer;
  height: 1em;
  aspect-ratio: 1;
  border-radius: 5px;
  text-align: center;
}
#anitracker-modal-close:hover,#anitracker-modal-close:focus-visible {
  color: rgb(255, 0, 108);
  background-color: rgb(28, 28, 34);
}
#anitracker-modal-close:active {
  translate: 0px 7%;
}
#anitracker-modal-body {
  padding: 10px;
  overflow-x: hidden;
}
#anitracker-modal-body .anitracker-switch {margin-bottom: 2px;\n}
#anitracker-message-container>span {
  min-width: 14rem;
  max-width: 24rem;
  display: block;
  position: fixed;
  z-index: 21;
  padding: 10px;
  background-color: rgb(30,35,40);
  border-radius: 32px;
  text-align: center;
  bottom: 5rem;
  border: 5px solid var(--pahe-pink);
  animation: 1s cubic-bezier(.3,1.12,0,1.03) 2 alternate forwards anitracker-fadeIn;
  pointer-events: none;
}
.anitracker-collection-image-wrapper {
  display: inline;
  aspect-ratio: 1;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.anitracker-big-list-item {
  list-style: none;
  border-radius: 10px;
  margin-top: 5px;
}
.anitracker-big-list-item>a {
  font-size: 0.875rem;
  display: block;
  padding: 5px 15px;
  color: rgb(238, 238, 238);
  text-decoration: none;
}
.anitracker-big-list-item .anitracker-image-wrapper {
  width: 50px;
  height: 50px;
  border-radius: .25rem;
  margin: auto 0px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.anitracker-big-list-item img {
  width: 100%;
  height: auto;
}
.anitracker-big-list-item .anitracker-main-text {
  font-weight: 700;
  color: rgb(238, 238, 238);
}
.anitracker-big-list-item .anitracker-subtext {
  font-size: 0.75rem;
  color: rgb(153, 153, 153);
}
.anitracker-big-list-item:hover .anitracker-main-text {
  color: rgb(238, 238, 238);
}
.anitracker-big-list-item:hover .anitracker-subtext {
  color: rgb(238, 238, 238);
}
.anitracker-big-list-item:hover, .anitracker-big-list-item:focus-within {
  background-color: var(--anitracker-darker);
}
.anitracker-big-list-item:focus-within .anitracker-main-text {
  color: rgb(238, 238, 238);
}
.anitracker-big-list-item:focus-within .anitracker-subtext {
  color: rgb(238, 238, 238);
}
.anitracker-hide-thumbnails .anitracker-thumbnail img {display: none;\n}
.anitracker-hide-thumbnails .anitracker-thumbnail {
  border: 10px solid rgb(32, 32, 32);
  aspect-ratio: 16/9;
}
.anitracker-hide-thumbnails .episode-snapshot img {
  display: none;
}
.anitracker-hide-thumbnails .episode-snapshot {
  border: 4px solid var(--dark);
}
.anitracker-player-dropup-spinner {display: inline;\n}
.anitracker-player-dropup-spinner .spinner-border {
  height: 0.875rem;
  width: 0.875rem;
}
.anitracker-episode-spinner {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  width: 100%;
  height: 100%;
}
.anitracker-episode-spinner>.spinner-border {
  width: 5rem;
  height: 5rem;
  border-width: .5em;
}
.anitracker-dropdown-content {
  display: none;
  position: absolute;
  min-width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #171717;
}
.anitracker-dropdown-content button {
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  width:100%;
  background-color: #171717;
  border: none;
  margin: 0;
}
.anitracker-dropdown-content button:hover, .anitracker-dropdown-content button:focus {background-color: black;\n}
.anitracker-dropdown-content i {
  margin-right: 6px;
}
.anitracker-dropdown-content span {
  color: rgb(177, 177, 177);
  padding: 4px 16px;
  text-align: center;
  display: block;
}
.anitracker-active, .anitracker-active:hover, .anitracker-active:active {
  color: white!important;
  background-color: var(--pahe-pink)!important;
}
.anitracker-dropdown-content a:hover {background-color: #ddd;\n}
.anitracker-dropdown:hover .anitracker-dropdown-content {display: block;\n}
.anitracker-dropdown:hover .anitracker-dropbtn {background-color: #bc0150;\n}
#pickDownload span, #scrollArea span {
  cursor: pointer;
  font-size: 0.875rem;
}
.anitracker-expand-data-icon {
  font-size: 24px;
  float: right;
  margin-top: 2px;
  margin-right: 10px;
}
.anitracker-modal-list-container {
  background-color: var(--anitracker-dark);
  margin-bottom: 8px;
  border-radius: 12px;
}
.anitracker-storage-data {
  background-color: var(--anitracker-dark);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  z-index: 1;
}
.anitracker-storage-data:focus {
  outline: 2px solid #fff;
}
.anitracker-storage-data span {
  display: inline-block;
  font-size: 1.1em;
}
.anitracker-storage-data, .anitracker-modal-list {
  padding: 8px 14px;
}
.anitracker-modal-list.flex {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.anitracker-modal-list-entry {margin-top: 8px;\n}
.anitracker-modal-list-entry a {
  text-decoration: underline;
  display: inline-block;
}
.anitracker-modal-list-entry:hover, .anitracker-modal-list-entry:focus-within {background-color: var(--anitracker-darker);\n}
.anitracker-modal-bottom-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.anitracker-relation-link {
  text-overflow: ellipsis;
  overflow: hidden;
}
.anitracker-spinner {
  color: var(--pahe-pink);
}
.anitracker-spinner>span {
  color: white;
}
#anitracker-cover-spinner .spinner-border {
  width:2rem;
  height:2rem;
}
.anime-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  image-rendering: optimizequality;
}
.anitracker-filter-input {
  width: 12.2rem;
  display: inline-block;
  cursor: text;
}
.anitracker-filter-input > div {
  height:56px;
  width:100%;
  border-bottom: 2px solid #454d54;
  overflow-y: auto;
}
.anitracker-filter-input.active > div {
  border-color: rgb(213, 1, 91);
}
.anitracker-filter-rules {
  background: black;
  border: 1px solid #bbb;
  color: #bbb;
  padding: 5px;
  float: right;
  border-radius: 5px;
  font-size: .8em;
  width: 2em;
  aspect-ratio: 1;
  margin-bottom: -10px;
  z-index: 1;
  position: relative;
  min-height: 0;
}
.anitracker-filter-rules>i {
  vertical-align: super;
}
.anitracker-filter-rules.anitracker-active {
  border-color: rgb(213, 1, 91);
}
.anitracker-filter-rules:hover, .anitracker-filter-rules:focus-visible {
  background: white;
  color: black;
  border-color: white;
}
.anitracker-filter-input-search {
  position: absolute;
  max-width: 150px;
  max-height: 45px;
  min-width: 150px;
  min-height: 45px;
  overflow-wrap: break-word;
  overflow-y: auto;
}
.anitracker-filter-input .placeholder {
  color: #999;
  position: absolute;
  z-index: -1;
}
.anitracker-filter-icon {
  padding: 0;
  padding-right: 4px;
  border-radius: 12px;
  display: inline-block;
  cursor: pointer;
  border: 2px solid white;
  margin-right: 5px;
  transition: background-color .3s, border-color .3s;
  vertical-align: text-top;
  font-size: .95em;
}
.anitracker-filter-icon>i {
  margin: 2px;
  margin-left: 3px;
  font-size: .8em;
}
.anitracker-filter-icon.included {
  background-color: rgba(20, 113, 30, 0.64);
  border-color: rgb(5, 134, 5);
}
.anitracker-filter-icon.included>i {
  color: rgb(83, 255, 83);
}
.anitracker-filter-icon.excluded {
  background-color: rgba(187, 62, 62, 0.41);
  border-color: #d75a5a;
}
.anitracker-filter-icon.excluded>i {
  color: rgb(227, 96, 96);
}
.anitracker-filter-icon:hover {
  border-color: white;
}
#anitracker-settings-invert-switch:checked ~ .custom-control-label::before {
  border-color: red;
  background-color: red;
}
#anitracker-settings-invert-switch:checked[disabled=""] ~ .custom-control-label::before {
  border-color: #e88b8b;
  background-color: #e88b8b;
}
.anitracker-text-input {
  display: inline-block;
  height: 1em;
  line-break: anywhere;
  min-width: 50px;
}
.anitracker-text-input-bar {
  background: #333;
  box-shadow: none;
  color: #bbb;
}
.anitracker-text-input-bar:focus {
  border-color: var(--pahe-pink);
  background: none;
  box-shadow: none;
  color: #ddd;
}
.anitracker-text-input-bar[disabled=""] {
  background: rgb(89, 89, 89);
  border-color: gray;
  cursor: not-allowed;
}
.anitracker-applied-filters {
  display: inline-block;
}
.anitracker-placeholder {
  color: gray;
}
.anitracker-filter-dropdown>button {
  transition: background-color .3s;
}
.anitracker-filter-dropdown>button.included {
  background-color: rgb(6, 130, 54);
}
.anitracker-filter-dropdown>button.included:focus {
  border: 2px dashed rgb(141, 234, 141);
}
.anitracker-filter-dropdown>button.excluded {
  background-color: rgb(117, 17, 17);
}
.anitracker-filter-dropdown>button.excluded:focus {
  border: 2px dashed rgb(215, 90, 90);
}
.anitracker-filter-dropdown>button.anitracker-active:focus {
  border: 2px dashed #ffd7eb;
}
#anitracker-season-copy-to-lower {
  color:white;
  margin-left:14px;
  border-radius:5px;
}
.anitracker-filter-spinner.small {
  display: inline-flex;
  margin-left: 10px;
  justify-content: center;
  align-items: center;
  vertical-align: bottom;
}
.anitracker-filter-spinner.screen {
  width:100%;
  height:100%;
  background-color:rgba(0, 0, 0, 0.9);
  position:fixed;
  z-index:999;
  display:flex;
  justify-content:center;
  align-items:center;
}
.anitracker-filter-spinner.screen .spinner-border {
  width:5rem;
  height:5rem;
  border-width: 10px;
}
.anitracker-filter-spinner>span {
  position: absolute;
  font-weight: bold;
}
.anitracker-filter-spinner.small>span {
  font-size: .5em;
}
.anitracker-filter-rule-selection {
  margin-bottom: 2px;
  display: grid;
  grid-template-columns: 1.5em 32% auto;
  align-items: center;
  grid-gap: 5px;
  border-radius: 20px;
  padding: 5px;
}
.anitracker-filter-rule-selection[disabled=""]>* {
  opacity: 0.5;
  pointer-events: none;
}
.anitracker-filter-rule-selection>i {
  text-align: center;
  border-radius: 35%;
  padding: 2px;
  aspect-ratio: 1;
}
.anitracker-filter-rule-selection>i::before {
  vertical-align: middle;
}
.anitracker-filter-rule-selection>.fa-plus {
  color: rgb(72, 223, 58);
  background-color: #148214;
}
.anitracker-filter-rule-selection>.fa-minus {
  color: #ff0000;
  background-color: #911212;
}
.anitracker-filter-rule-selection button {
  padding: 0;
  padding-bottom: 1px;
  width: 2.5em;
  height: 2em;
  background-color: var(--secondary);
  border: 3px solid var(--dark);
  border-radius: 10px;
  outline: rgb(94, 96, 100) solid 3px;
  margin: 5px;
  color: white;
}
.anitracker-filter-rule-selection button.anitracker-active {
  outline: rgb(213, 1, 91) solid 3px;
}
.anitracker-filter-rule-selection button:hover:not([disabled=""]), .anitracker-filter-rule-selection button:focus-visible:not([disabled=""]) {
  outline: white solid 3px;
}
.anitracker-flat-button {
  padding-top: 0;
  padding-bottom: 0;
}
.anitracker-list-btn {
  height: 40px;
  border-radius: .25rem !important;
  color: #ddd !important;
  margin-left: 8px !important;
}
.anitracker-reverse-order-button {
  font-size: 2em;
}
.anitracker-reverse-order-button::after {
  vertical-align: 20px;
}
.anitracker-reverse-order-button.anitracker-up::after {
  border-top: 0;
  border-bottom: .3em solid;
  vertical-align: 22px;
}
#anitracker-time-search-button {
  float: right;
}
#anitracker-time-search-button svg {
  width: 24px;
  vertical-align: bottom;
}
.anitracker-season-group {
  display: grid;
  grid-template-columns: 10% 30% 10% 10%;
  margin-bottom: 5px;
}
.anitracker-season-group .btn-group {
  margin-left: 5px;
}
.anitracker-season-group>label {
  align-self: center;
  margin: 0;
}
a.youtube-preview::before {
  -webkit-transition: opacity .2s linear!important;
  -moz-transition: opacity .2s linear!important;
  transition: opacity .2s linear!important;
}
.anitracker-replaced-cover {background-position-y: 25%;\n}
.anitracker-text-button {
  color:var(--pahe-pink);
  cursor:pointer;
  user-select:none;
}
.anitracker-text-button:hover, .anitracker-text-button:focus-visible {
  color:white;
}
.nav-search {
  float: left!important;
}
.anitracker-title-icon {
  margin-left: 1rem!important;
  opacity: .8!important;
  color: #ff006c!important;
  font-size: 2rem!important;
  vertical-align: middle;
  cursor: pointer;
  padding: 0;
  box-shadow: none!important;
}
.anitracker-title-icon:hover {
  opacity: 1!important;
}
.anitracker-title-icon-check {
  color: white;
  margin-left: -.7rem!important;
  font-size: 1rem!important;
  vertical-align: super;
  text-shadow: none;
  opacity: 1!important;
}
.anitracker-header {
  display: flex;
  justify-content: left;
  gap: 18px;
  flex-grow: 0.04;
  padding: 5px;
}
.anitracker-header-button {
  color: white;
  background: none;
  border: 2px solid white;
  border-radius: 5px;
  width: 2rem;
}
.anitracker-header-button:hover {
  border-color: #ff006c;
  color: #ff006c;
}
.anitracker-header-button:focus {
  border-color: #ff006c;
  color: #ff006c;
}
.anitracker-header-notifications-circle {
  color: rgb(255, 0, 108);
  margin-left: -.3rem;
  font-size: 0.7rem;
  position: absolute;
}
.anitracker-notification-item .anitracker-main-text {
  color: rgb(153, 153, 153);
}
.anitracker-notification-item .anitracker-image-wrapper {
  display: inline-flex !important;
}
.anitracker-notification-item-unwatched {
  background-color: rgb(82, 45, 50);
  outline: rgb(119, 62, 70) solid 2px;
}
.anitracker-notification-item-unwatched:hover {
  background-color: rgb(63, 37, 52);
}
.anitracker-notification-item-unwatched .anitracker-main-text {
  color: white!important;
}
.anitracker-notification-item-unwatched .anitracker-subtext {
  color: white!important;
}
.anitracker-watched-toggle {
  font-size: 1.7em;
  float: right;
  margin-right: 5px;
  margin-top: 5px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
}
.anitracker-watched-toggle:hover,.anitracker-watched-toggle:focus {
  outline: 1px solid #fff;
}
#anitracker-replace-cover {
  z-index: 99;
  right: 10px;
  position: absolute;
  bottom: 6em;
}
header.main-header nav .main-nav li.nav-item > a:focus {
  color: #fff;
  background-color: #bc0150;
}
.theatre-settings .dropup .btn:focus {
  outline: .15rem solid rgb(100, 100, 100)!important;
}
.anitracker-episode-date {
  margin-left: 5%;
  font-size: 0.75rem!important;
  cursor: default!important;
}
.episode>.anitracker-episode-date {
  white-space: nowrap;
  font-size: .75rem;
  text-shadow: 0 1px 2px #000,0 1px 2px #000;
  line-height: normal;
  position: absolute;
  top: 0px;
  margin: 5px;
  color: #fff;
  z-index: 1;
  right: 2rem;
}
.anitracker-episode-date:hover {
  text-decoration: none!important;
}
.anitracker-episode-progress {
  height: 8px;
  position: absolute;
  bottom: 0;
  background-color: #bc0150;
  z-index: 1;
}
.anitracker-episode-menu-button {
  top: 0;
  position: absolute;
  right: 0;
  width: 32px;
  height: 32px;
  z-index: 1;
  color: white;
  background: none;
  border: 0;
  transition: background-color .3s ease;
  border-radius: 10%;
  border-top-right-radius: 0;
}
.anitracker-episode-menu-button>svg {
  width: 6px;
  display: block;
  margin: auto;
  stroke: #424242;
  stroke-width: 32px;
}
.anitracker-episode-menu-button:hover, .anitracker-episode-menu-button:focus {
  background-color: rgba(0,0,0,0.8);
  color: #bc0150;
}
.anitracker-episode-menu-button:hover>svg, .anitracker-episode-menu-button:focus>svg {
  stroke-width: 0;
}
.anitracker-episode-menu-dropdown {
  z-index: 2;
  right:0;
  left: auto;
  top: 32px;
}
.anitracker-download-select-button {
  display: block;
  width: 100%;
  border: none;
  padding: 5px;
  margin: 5px;
  border-radius: 10px;
  background-color: #656f79;
  color: white;
}
.anitracker-download-select-button:hover, .anitracker-download-select-button:focus-visible {
  background-color: rgb(30,35,40);
}
.anitracker-watched-episodes-list {
  display: inline-block;
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: gray;
}
.anitracker-bookmark-grid-entry {
  width: 14rem;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.anitracker-bookmark-grid-entry img {
  transition: opacity .5s;
}
.anitracker-bookmark-grid-entry a {
  text-align: center;
}
.anitracker-secondary-info {
  color: lightgray;
}
.anitracker-thin-text {
  max-width: 16rem;
  text-align: center;
}
.anitracker-dark-area {
  display: block;
  padding: 10px;
  background-color: rgb(30,35,40);
  border-radius: 5px;
}
.anitracker-sync-message {
  margin: 16px;
}
.anitracker-sync-message.info {
  color: white;
}
.anitracker-sync-message.warning {
  color: var(--warning);
}
.anitracker-sync-message.error {
  color: var(--danger);
}
.anitracker-sync-settings-bottom {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 10px;
}
.anitracker-sync-code-display {
  background-color: rgb(30,35,40);
  padding: 10px;
  border-radius: 10px;
  display: flex;
}
.anitracker-sync-code-display>span {
  font-family: Consolas, monospace;
  font-size: 2em;
  padding: 8px;
}
.anitracker-sync-code-display>i {
  align-self: center;
  font-size: 1.5em;
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
}
.anitracker-sync-code-display>i:focus-visible {
  outline: 2px solid white;
}
.anitracker-sync-code-input {
  height: 1.8em;
  font-size: 2em;
  width: 9em;
  text-align: center;
  text-transform: uppercase;
}
.anitracker-spin {
  animation: anitracker-spin 1s linear infinite;
}
.anitracker-page-selection {
  background: none;
  border: none;
  border-bottom: 3px solid #343a40;
  margin: 0 5px 0 5px;
  width: 2em;
  color: white;
  text-align: center;
  transition: border-color .5s;
}
.anitracker-page-selection:focus {
  border-color: #bc0150;
}
.anitracker-big-poster-icon {
  width:100%;
  aspect-ratio:1;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.anitracker-big-poster-icon img {
  width:100%;
  height:auto;
  opacity:0;
}
.anitracker-bookmark-list-entry>div {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 5px;
  padding-top: 5px;
}
.anitracker-bookmark-list-status {
  width:10.4em;
  display:inline-block;
  background-color:var(--dark);
  text-align:center;
  vertical-align:bottom;
  border: none;
  border-radius: .25rem;
}
.anitracker-bookmark-list-status:hover, .anitracker-bookmark-list-status:focus-visible {
  outline: 2px solid var(--secondary);
}
.anitracker-bookmark-grid-status {
  width:100%;
  text-align:center;
  border-radius:5px;
  border:2px solid var(--dark);
  background: none;
  margin-top: 5px;
}
.anitracker-bookmark-grid-status:hover, .anitracker-bookmark-grid-status:focus-visible {
  border-color: var(--secondary);
}
.anitracker-change-status-button:after {
  display: inline-block;
  content: "";
  color: var(--secondary);
  border-top: .4em solid;
  border-right: .4em solid transparent;
  border-left: .4em solid transparent;
  vertical-align: middle;
  margin-left: 10px;
}
.anitracker-change-status-button.active:after {
  border-top: 0;
  border-bottom: .4em solid;
}
.anitracker-change-status-button:hover:after, .anitracker-change-status-button:focus-visible:after {
  color: white;
}
.anitracker-bookmark-list-status:after {
  margin-left: 5px;
}
.anitracker-bookmark-grid-status:active {
  background-color: var(--dark);
}
.anitracker-bookmark-list-status:active {
  background-color: var(--anitracker-dark);
}
.anitracker-status-button {
  border: 3px solid rgb(23, 23, 23)!important;
  border-radius: 5px;
  transition: none;
}
.anitracker-status-button:hover, .anitracker-status-button:focus-visible {
  border: 3px solid white!important;
}
.anitracker-video-progress-item {
  display:grid;
  grid-template-columns:90px 19rem 8rem;
  height:100px;
  gap:20px;
  padding:5px;
  background-repeat: no-repeat;
  background-image: linear-gradient(to right, rgb(71, 25, 47), RGB(71, 25, 47));
  background-size: 0 10%;
  background-position-y: bottom;
}
.anitracker-video-progress-item>a {
  padding:0;
}
.anitracker-video-progress-item .anitracker-image-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 10%;
  overflow: hidden;
}
.anitracker-video-progress-item .anitracker-text-section {
  display:flex;
  flex-direction:column;
  justify-content:center;
  font-size:1em;
}
.anitracker-video-progress-item .anitracker-button-section {
  display:flex;
  flex-direction:column;
  gap:5px;
  justify-content:center;
}
.anitracker-video-progress-item .anitracker-main-text {
  overflow:hidden;
  text-overflow:ellipsis;
  max-height:2.8rem;
}
.anitracker-video-progress-item .anitracker-normal-text {
  color: #eee;
}
.anitracker-video-progress-item .anitracker-video-progress-image-placeholder {
  background-color: var(--dark);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
.anitracker-feed-schedule {
  border: 2px solid var(--secondary);
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 5px;
  text-align: center;
  display: flex;
  align-items: start;
  justify-content: center;
  flex-wrap: wrap;
}
.anitracker-feed-schedule>div {
  min-width: 5rem;
  max-width: 10rem;
  position: relative;
}
.anitracker-feed-schedule .anitracker-feed-schedule-header {
  padding: 5px;
}
.anitracker-feed-schedule .anitracker-feed-schedule-header:after {
  content: "";
  background: var(--secondary);
  position: absolute;
  top: 2em;
  left: calc(50% - 1rem);
  height: 2px;
  width: 2rem;
}
.anitracker-feed-schedule .anitracker-feed-schedule-body {
  background-color: var(--anitracker-dark);
  min-height: 5rem;
  border-left: 1px solid black;
  border-right: 1px solid black;
  padding: 5px;
}
.anitracker-feed-schedule .anitracker-feed-schedule-body.anitracker-feed-schedule-today {
  outline: 2px solid var(--secondary);
  z-index: 1;
  position: relative;
}
.anitracker-feed-schedule .anitracker-feed-schedule-body a {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
}
.anitracker-feed-schedule .anitracker-feed-schedule-body a:hover {
  text-decoration: underline;
}
.anitracker-keybinds-section {
  display: grid;
  grid-template-columns: 50% auto 42px;
  gap: 5px;
  min-width: 16rem;
}
.anitracker-keybinds-section label {
  margin: 0;
}
.anitracker-keybinds-section button {
  overflow: hidden;
  text-overflow: ellipsis;
}
.anitracker-dl-options-section {
  display: grid;
  grid-template-columns: 40% auto;
  gap: 5px;
  min-width: 12rem;
  align-items: center;
}
.anitracker-dl-options-section label {
  margin: 0;
  height: fit-content;
}
.anitracker-center-content {
  display: flex;
  justify-content: center;
}
.anitracker-bookmark-grid-entry .anitracker-bookmark-new {
  display: block;
  width: 2rem;
  height: 2rem;
  margin: 0.4rem 0.4rem -2.4rem;
  background: var(--pahe-pink);
  position: relative;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0px 0px 5px black;
  z-index: 1;
  animation: anitracker-modalOpen 0.5s forwards linear;
}
.anitracker-bookmark-list-entry .anitracker-bookmark-new {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  background: var(--pahe-pink);
  border-radius: 50%;
  border: 2px solid #fff;
}
.anitracker-text-spinner>.spinner-border {
  display: block;
}
.anitracker-text-spinner>span {
  position: relative;
  font-weight: bold;
  font-size: 0.8em;
  display: block;
  top: -2em;
}
.anitracker-random-result-buttons {
  margin-left: 240px;
}
#anitracker-bookmark-share-result {
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  overflow: auto clip;
}
.anitracker-index-lower>div {
  float: right;
  margin-right: 6px;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}
.index .col-12:nth-child(4n-3), .index .col-12:nth-child(4n-2) {
  background-color: rgb(20, 19, 25);
}
.index>* {
  width: 100%;
}
header.main-header nav .nav-search .search-results-wrap a {
  width: 100%;
}
@media screen and (min-width: 1375px) {
  .theatre.anitracker-theatre-mode {
    margin-top: 10px!important;
  }
  .theatre.anitracker-theatre-mode>* {
    max-width: 81%!important;
  }
  #anitracker-modal-content {
    max-width: 80%;
  }
}
@media screen and (max-width: 700px) {
  .anitracker-video-progress-item {
    display: flex;
    flex-direction: column;
    gap: 0;
    text-align: center;
    height: auto;
    background-position-y: calc(90px - 1.4rem);
  }
  .anitracker-video-progress-item .anitracker-img-section {
    display:flex;
    justify-content: center;
  }
  .anitracker-random-result-buttons {
    width: fit-content;
    margin: auto;
  }
  .anitracker-bookmark-list-entry .anitracker-remove-bookmark-button>span {
    display: none;
  }
  .anitracker-bookmark-list-entry > div {
    gap: 12px;
  }
  .anitracker-index, .anitracker-index-lower {
    margin-left: 10px;
  }
  #anitracker {
    justify-content: center !important;
  }
}
@keyframes anitracker-modalOpen {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.07);
  }
  100% {
    transform: scale(1);
  }
}
@-webkit-keyframes anitracker-modalOpen {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.07);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes anitracker-fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes anitracker-fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes anitracker-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes anitracker-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

applyCssSheet(_css);

const siteVars = {
  prevDocumentTitle: undefined,
  episodePages: [], // element, apiLink, cachedList, mode, features
  syncErrorCooldown: 0,
  modalEvents: [],
  cached: {
    animeData: [],
    firstEpisode: {},
    animeId: {},
  },
};

const continueWatchingStatus = {
  queue: [],
  displayedEps: [],
  inProgress: false,
};

// Sets boolean options
// The "value" is a variable and can change during usage
const optionSwitches = [
  {
    optionId: 'autoDelete',
    switchId: 'auto-delete',
    value: initialStorage.settings.autoDelete
  },
  {
    optionId: 'theatreMode',
    switchId: 'theatre-mode',
    value: initialStorage.settings.theatreMode,
    onEvent: () => {
      theatreMode(true);
    },
    offEvent: () => {
      theatreMode(false);
    }
  },
  {
    optionId: 'hideThumbnails',
    switchId: 'hide-thumbnails',
    value: initialStorage.settings.hideThumbnails,
    onEvent: hideThumbnails,
    offEvent: () => {
      $('.main').removeClass('anitracker-hide-thumbnails');
    }
  },
  {
    optionId: 'bestQuality',
    switchId: 'best-quality',
    value: initialStorage.settings.bestQuality,
    onEvent: bestVideoQuality
  },
  {
    optionId: 'autoDownload',
    switchId: 'auto-download',
    value: initialStorage.settings.autoDownload
  },
  {
    optionId: 'autoPlayNext',
    switchId: 'autoplay-next',
    value: initialStorage.settings.autoPlayNext
  },
  {
    optionId: 'autoPlayVideo',
    switchId: 'autoplay-video',
    value: initialStorage.settings.autoPlayVideo
  },
  {
    optionId: 'seekThumbnails',
    switchId: 'seek-thumbnails',
    value: initialStorage.settings.seekThumbnails,
    onEvent: () => {
      sendMessage({action:'setting_changed',type:'seek_thumbnails',value:true});
    },
    offEvent: () => {
      sendMessage({action:'setting_changed',type:'seek_thumbnails',value:false});
    }
  },
  {
    optionId: 'seekPoints',
    switchId: 'seek-points',
    value: initialStorage.settings.seekPoints,
    onEvent: () => {
      sendMessage({action:'setting_changed',type:'seek_points',value:true});
    },
    offEvent: () => {
      sendMessage({action:'setting_changed',type:'seek_points',value:false});
    }
  },
  {
    optionId: 'skipButton',
    switchId: 'skip-button',
    value: initialStorage.settings.skipButton,
    onEvent: () => {
      sendMessage({action:'setting_changed',type:'skip_button',value:true});
    },
    offEvent: () => {
      sendMessage({action:'setting_changed',type:'skip_button',value:false});
    }
  },
  {
    optionId: 'copyScreenshots',
    switchId: 'copy-screenshots',
    value: initialStorage.settings.copyScreenshots,
    onEvent: () => {
      sendMessage({action:'setting_changed',type:'screenshot_mode',value:'copy'});
    },
    offEvent: () => {
      sendMessage({action:'setting_changed',type:'screenshot_mode',value:'download'});
    }
  },
  {
    optionId: 'reduceMotion',
    switchId: 'reduced-motion',
    value: initialStorage.settings.reduceMotion
  },
  {
    optionId: 'stickyHeader',
    switchId: 'sticky-header',
    value: initialStorage.settings.stickyHeader,
    onEvent: () => {stickyHeader(true)},
    offEvent: () => {stickyHeader(false)}
  },
  {
    optionId: 'relativeEpNums',
    switchId: 'relative-episode-nums',
    value: initialStorage.settings.relativeEpNums,
    onEvent: () => {setRelativeEpNums(true)},
    offEvent: () => {setRelativeEpNums(false)}
  },
  {
    optionId: 'showContinueWatching',
    switchId: 'show-continue-watching',
    value: initialStorage.settings.showContinueWatching,
    onEvent: setupContinueWatchingSection,
    offEvent: () => {
      if (isHome()) window.location.replace(window.location);
    }
  }];

const originalEpisodeValue = (() => {
  if (isEpisode()) return /Watch (?:.*) - ([\d\.]+)\-?([\d\.]+)? Online/.exec($('.theatre-info h1').text());
  else return undefined;
})();
function getEpisodeNum() {
  if (originalEpisodeValue) return +originalEpisodeValue[1];
  return undefined;
}

async function getFirstEpisode(session) {
  return new Promise(resolve => {
    const cached = siteVars.cached.firstEpisode[session];
    if (cached !== undefined) { // firstEpisode value can be 0 (falsy)
      resolve(cached);
      return;
    }

    asyncGetResponseData(`/api?m=release&sort=episode_asc&id=${session}`).then(response => {
      const ep = response[0]?.episode;
      siteVars.cached.firstEpisode[session] = ep;
      resolve(ep);
      return;
    });
  });
}

// Things that update when focusing this tab
$(document).on('visibilitychange', () => {
  if (document.hidden) return;
  updatePage();
});

function updatePage() {
  updateSwitches();
  updateEpisodePages();

  const storage = getStorage();
  const animeId = isAnime() ? getAnimeId(getAnimeSessionFromUrl()) : undefined;

  if (animeId) {
    const isBookmarked = storage.bookmarks.find(a => a.id === animeId) !== undefined;
    if (isBookmarked) $('.anitracker-bookmark-toggle .anitracker-title-icon-check').show();
    else $('.anitracker-bookmark-toggle .anitracker-title-icon-check').hide();

    const hasNotifications = storage.notifications.anime.find(a => a.id === animeId) !== undefined;
    if (hasNotifications) $('.anitracker-notifications-toggle .anitracker-title-icon-check').show();
    else $('.anitracker-notifications-toggle .anitracker-title-icon-check').hide();
  }

  if (!modalIsOpen()) return;

  if ($('.anitracker-keybinds-section').length) $('.anitracker-keybinds-section').trigger('anitracker:update');

  if ($('.anitracker-view-notif-animes').length) {
    for (const item of $('.anitracker-notification-item')) {
      const entry = storage.notifications.episodes.find(a => a.animeId === +$(item).attr('anime-data') && a.episode === +$(item).attr('episode-data'));
      if (!entry || entry.watched !== $(item).hasClass('anitracker-notification-item-unwatched')) continue;

      $(item).toggleClass('anitracker-notification-item-unwatched');
      $(item).find('.anitracker-watched-toggle').toggleClass('fa-eye').toggleClass('fa-eye-slash');
    }
  }
}

function theatreMode(on) {
  if (on) $('.theatre').addClass('anitracker-theatre-mode');
  else $('.theatre').removeClass('anitracker-theatre-mode');
}

function stickyHeader(on) {
  if (on) $('.main-header').css('position', 'sticky');
  else $('.main-header').css('position', '');
}

function playAnimation(elem, anim, duration, type = '') {
  duration = duration || animationTimes[anim];
  if (initialStorage.debug?.anim === true) console.log({anim:anim,type:type,duration:duration,elem:elem});
  return new Promise(resolve => {
    elem.css('animation', `anitracker-${anim} ${duration}s forwards linear ${type}`);
    elem.css('-webkit-animation', `anitracker-${anim} ${duration}s forwards linear ${type}`);
    if (animationTimes[anim] === undefined) resolve();
    setTimeout(() => {
      elem.css('animation', '').css('-webkit-animation', '');
      if (initialStorage.debug?.anim === true) console.log('Anim debug: completed');
      resolve();
    }, duration * 1000);
  });
}

// MARKER:MODAL
let modalBackFunction;
// Add AnimePahe Improvements modal and message container
function addPermanentElements() {
  $(`
  <div id="anitracker-message-container" class="anitracker-center-content"></div>
  <div id="anitracker-modal" tabindex="-1">
    <div id="anitracker-modal-content">
      <i tabindex="0" id="anitracker-modal-close" class="fa fa-close">
      </i>
      <div id="anitracker-modal-body"></div>
    </div>
  </div>`).insertBefore('.main-header');

  $('#anitracker-modal').on('click', (e) => {
    if (e.target !== e.currentTarget) return;
    closeModal();
  });

  $('#anitracker-modal-close').on('click keydown', (e) => {
    if (e.type === 'keydown' && e.key !== "Enter") return;
    modalBackFunction();
  });
}
addPermanentElements();

function openModal(backFunction) {
  modalBackFunction = backFunction || closeModal;
  $('#anitracker-modal').trigger('anitracker:open');

  if (backFunction) $('#anitracker-modal-close').replaceClass('fa-close', 'fa-arrow-left').attr('title', 'Go back to previous menu');
  else $('#anitracker-modal-close').replaceClass('fa-arrow-left', 'fa-close').attr('title', 'Close modal');

  const storage = getStorage();

  return new Promise(resolve => {
    if (storage.settings.reduceMotion !== true) {
      if (!modalIsOpen()) {
        playAnimation($('#anitracker-modal-content'), 'modalOpen');
        playAnimation($('#anitracker-modal'), 'fadeIn').then(() => {
          resolve();
        });
      }
      else {
        playAnimation($('#anitracker-modal-content'), 'modalOpen').then(() => {
          resolve();
        });
      }
    }
    else resolve();

    $('#anitracker-modal').css('display','flex');
    $('#anitracker-modal').focus();
  });
}

function closeModal() {
  $('#anitracker-modal').trigger('anitracker:close');
  siteVars.modalEvents.forEach(g => {
    g.elem.off(g.events, null, g.handler);
  });
  siteVars.modalEvents = [];

  const storage = getStorage();
  if (storage.settings.reduceMotion === true || !$('#anitracker-modal').css('animation').startsWith('none')) {
    $('#anitracker-modal').hide();
    return;
  }

  playAnimation($('#anitracker-modal'), 'fadeIn', 0.1, 'reverse').then(() => {
    $('#anitracker-modal').hide();
  });
}

function modalIsOpen() {
  return $('#anitracker-modal').is(':visible');
}

function addModalEvent(elem, events, handler) {
  elem.on(events, handler);
  siteVars.modalEvents.push({
    elem: elem,
    events: events,
    handler: handler
  });
}

function scrollModalToTop() {
  $('#anitracker-modal-body')[0].scrollTop = 0;
}

function showMessage(text) {
  $('#anitracker-message-container>span').remove();
  $(`<span></span>`).text(text).appendTo('#anitracker-message-container');
}

// MARKER:MESSAGES FROM IFRAME
let currentEpisodeTime = 0;
// Messages received from iframe
if (isEpisode()) {
  window.onmessage = function(e) {
    const data = e.data;
    if (initialStorage.debug?.msg) console.log('Received from iframe: ' + (typeof(e.data) === 'object' ? JSON.stringify(e.data) : e.data));

    if (typeof(data) === 'number') {
      currentEpisodeTime = Math.trunc(data);
      return;
    }

    const action = data.action;
    if (action === 'id_request') {
      sendMessage({action:"id_response",id:getAnimeId(getAnimeSessionFromUrl())});
    }
    else if (action === 'anidb_id_request') {
      getAnidbId(data.id).then(idResult => {
        getFirstEpisode(animeSession).then(epResponse => {
          sendMessage({action:"anidb_id_response",id:idResult,originalId:data.id,firstEpisode:epResponse});
        });
      });
    }
    else if (action === 'video_url_request') {
      const selected = {
        src: undefined,
        res: undefined,
        audio: undefined
      };
      for (const btn of $('#resolutionMenu>button')) {
        const src = $(btn).data('src');
        const res = +$(btn).data('resolution');
        const audio = $(btn).data('audio');
        if (selected.src && selected.res < res) continue;
        if (selected.audio && audio === 'jpn' && selected.res <= res) continue; // Prefer dubs, since they don't have subtitles
        selected.src = src;
        selected.res = res;
        selected.audio = audio;
      }
      if (!selected.src) {
        console.error("[AnimePahe Improvements] Didn't find video URL");
        return;
      }
      console.log('[AnimePahe Improvements] Found lowest resolution URL ' + selected.src);

      const request = new XMLHttpRequest();
      request.open('GET', selected.src, true);
      request.onload = () => {
        if (request.status !== 200) {
          console.error('[AnimePahe Improvements] Could not get kwik page for video source');
          return;
        }

        const pageElements = Array.from($(request.response)); // Elements that are not buried cannot be found with jQuery.find()
        const hostInfo = (() => {
          for (const link of pageElements.filter(a => a.tagName === 'LINK')) {
            const href = $(link).attr('href');
            if (!href.includes('vault')) continue;
            const result = /vault-(\d+)\.(\w+\.\w+)$/.exec(href);
            return {
              vaultId: result[1],
              hostName: result[2]
            };
            break;
          }
        })();

        const searchInfo = (() => {
          for (const script of pageElements.filter(a => a.tagName === 'SCRIPT')) {
            if ($(script).attr('url') || !$(script).text().startsWith('eval')) continue;
            const result = /(\w{64})\|((?:\w+\|){4,5})https/.exec($(script).text());
            let extraNumber;
            result[2].split('|').forEach(a => {if (/\d{2}/.test(a)) extraNumber = a;}); // Some number that's needed for the url (doesn't always exist here)
            if (extraNumber === undefined) {
              const result2 = /q=\\'\w+:\/{2}\w+\-\w+\.\w+\.\w+\/((?:\w+\/)+)/.exec($(script).text());
              result2[1].split('/').forEach(a => {if (/\d{2}/.test(a) && a !== hostInfo.vaultId) extraNumber = a;});
            }
            if (extraNumber === undefined) {
              const result2 = /source\|(\d{2})\|ended/.exec($(script).text());
              if (result2 !== null) extraNumber = result2[1];
            }
            return {
              part1: extraNumber ?? hostInfo.vaultId,
              part2: result[1]
            };
            break;
          }
        })();

        if (searchInfo.part1 === undefined) {
          console.error('[AnimePahe Improvements] Could not find "extraNumber" from ' + data.url);
          return;
        }

        sendMessage({action: "video_url_response", url: `https://vault-${hostInfo.vaultId}.${hostInfo.hostName}/stream/${hostInfo.vaultId}/${searchInfo.part1}/${searchInfo.part2}/uwu.m3u8`});
      };
      request.send();
    }
    else if (action === 'timestamp_edit_mode_done') {
      $('#anitracker-modal-body').empty()

      const timestamps = {
          "episode_number": getEpisodeNum(),
          "recap": {
              "start": -2,
              "end": -2
          },
          "opening": {
              "start": -2,
              "end": -2
          },
          "ending": {
              "start": -2,
              "end": -2
          },
          "preview_start": -2
      };

      for (const timestamp of data.timestamps) {
        if (timestamp.type === 'preview') {
          if (timestamp.start !== undefined) timestamps.preview_start = timestamp.start;
          continue;
        }
        if (timestamp.start !== undefined) timestamps[timestamp.type].start = timestamp.start;
        if (timestamp.end !== undefined) timestamps[timestamp.type].end = timestamp.end;
      }

      $(`<h4>Timestamp Results</h4>
      <textarea style="padding:10px;background-color: rgb(30, 35, 40);border-radius: 5px;font-family:monospace;color:white;height:20rem;"
                   >${JSON.stringify(timestamps, null, 2)}</textarea>
      <p class="anitracker-secondary-info">You can open an issue
        <a href="https://github.com/Ellivers/open-anime-timestamps" target="_blank" style="text-decoration:underline;">here</a>
        to get these added.</p>`).appendTo('#anitracker-modal-body');

      openModal();
    }
    else if (action === 'key') {
      $(document).trigger('keydown', {event: data.event});
    }
    else if (data === 'ended') {
      const storage = getStorage();
      if (storage.settings.autoPlayNext !== true || document.readyState !== 'complete') return;
      const elem = $('.sequel a');
      if (elem.length) elem[0].click();
    }
    else if (action === 'next') {
      const elem = $('.sequel a');
      if (elem.length) elem[0].click();
    }
    else if (action === 'previous') {
      const elem = $('.prequel a');
      if (elem.length) elem[0].click();
    }
  };
}

function sendMessage(message) {
  const iframe = $('.embed-responsive-item');
  if (!iframe.length) return;
  iframe[0].contentWindow.postMessage(message,'*');
}

function toggleTheatreMode() {
  const storage = getStorage();
  theatreMode(!storage.settings.theatreMode);

  storage.settings.theatreMode = !storage.settings.theatreMode;
  saveData(storage);
  updateSwitches();
}

async function getAnidbId(paheId) {
  return new Promise(async resolve => {
    const page = await asyncGetPage(`/a/${paheId}`);
    for (const link of page.find('.external-links a')) {
      const elem = $(link);
      if (!elem.text().includes('AniDB')) continue;
      resolve(/\/\/anidb.net\/anime\/(\d+)/.exec(elem.attr('href'))[1]);
      return;
    }
    resolve(undefined);
  });
}

async function getDataFromAnimeId(id) {
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.open('GET', `/a/${id}`, true);
    req.onload = () => {
      const responseLocation = new URL(req.responseURL);
      if (!isAnime(responseLocation.pathname)) {
        resolve(undefined);
        return;
      }
      resolve({
        session: responseLocation.pathname.split('/')[2],
        title: $($(req.response).find('.title-wrapper h1 span')[0]).text(),
        poster: $($(req.response).find('.anime-poster img')[0]).data('src').replace('.md','')
      });
    };
    req.send();
  });
}

function getSeasonValue(season) {
  return ({winter:0, spring:1, summer:2, fall:3})[season.toLowerCase()];
}

function getSeasonName(season) {
  return ["winter","spring","summer","fall"][season];
}

const is404 = $('h1').text().includes('404');

function updateFromImport(diff, force = {}) {
  if (force.page || (diff.bookmarksAdded + diff.notificationsAdded + diff.settingsUpdated)) updatePage();
  if (force.epPage || diff.watchedEpisodesAdded || diff.videoTimesUpdated || diff.videoTimeEntryUpdated) updateEpisodePages();
  if ((diff.videoTimesUpdated + diff.videoTimesAdded) && isEpisode()) {
    sendMessage({action:"newer_time", time:getStorage().videoTimes.find(a => a.videoUrls.includes($('.embed-responsive-item')[0].src))?.time});
  }
}

function importData(data, importedData, save = true, ignored = {settings:{}}, fromSync = false) {
  const changed = {
    linkListAdded: 0, // Session entries added
    videoTimesAdded: 0, // Video progress entries added
    videoTimesUpdated: 0, // Video progress times updated
    videoTimeEntryUpdated: 0, // Video progress entries with other added info
    bookmarksAdded: 0, // Bookmarks added
    bookmarksUpdated: 0, // Bookmarks updated
    notificationsAdded: 0, // Anime added to episode feed
    episodeFeedUpdated: 0, // Episodes either added to episode feed or that had their watched status updated
    videoSpeedUpdated: 0, // Video speed entries added or updated
    watchedEpisodesAdded: 0, // Amount of episodes marked as watched that are added
    settingsUpdated: 0 // Settings updated
  };

  const defaultData = getDefaultData();

  if (importedData.version !== defaultData.version) {
    upgradeData(importedData, importedData.version);
  }

  for (const [key, value] of Object.entries(importedData)) {
    if (defaultData[key] === undefined) continue;

    if (!ignored.linkList && key === 'linkList') {
      if (value.length === undefined) {
        console.warn('[AnimePahe Improvements] Imported "linkList" has an incorrect format.');
        continue;
      }
      value.forEach(g => {
        if ((g.type === 'episode' && data.linkList.find(h => h.type === 'episode' && h.animeSession === g.animeSession && h.episodeSession === g.episodeSession) === undefined)
           || (g.type === 'anime' && data.linkList.find(h => h.type === 'anime' && h.animeSession === g.animeSession) === undefined)) {
          data.linkList.push(g);
          changed.linkListAdded++;
          if (data.linkList.length > getStorageLimits().linkList) {
            data.linkList.splice(0,1);
          }

          if (save && isSyncEnabled(data) && !fromSync) {
            if (g.type === 'episode') data.sync.temp.addedData.push({type: 'linkList', episodeSession: g.episodeSession});
            else if (g.type === 'anime') data.sync.temp.addedData.push({type: 'linkList', animeSession: g.animeSession});
          }
        }
      });
      continue;
    }
    else if (!ignored.videoTimes && key === 'videoTimes') {
      if (value.length === undefined) {
        console.warn('[AnimePahe Improvements] Imported "videoTimes" has an incorrect format.');
        continue;
      }
      value.forEach(g => {
        const foundTime = data.videoTimes.find(h => h.videoUrls.includes(g.videoUrls[0]));
        if (foundTime === undefined) {
          data.videoTimes.push(g);
          changed.videoTimesAdded++;
          if (data.videoTimes.length > getStorageLimits().videoTimes) {
            data.videoTimes.splice(0,1);
          }

          if (save && isSyncEnabled(data) && !fromSync) data.sync.temp.addedData.push({type: 'videoTimes', animeName: g.animeName, episodeNum: g.episodeNum});
        }
        else {
          if (foundTime.time < g.time) {
            foundTime.time = g.time;
            changed.videoTimesUpdated++;
          }
          let updated = false;
          if (g.duration && !foundTime.duration) {
            foundTime.duration = g.duration;
            updated = true;
          }
          if (g.animeId && !foundTime.animeId) {
            foundTime.animeId = g.animeId;
            updated = true;
          }
          if (updated) changed.videoTimeEntryUpdated++;
        }
      });
      continue;
    }
    else if (!ignored.bookmarks && key === 'bookmarks') {
      if (value.length === undefined) {
        console.warn('[AnimePahe Improvements] Imported "bookmarks" has an incorrect format.');
        continue;
      }
      value.forEach(g => {
        const found = data.bookmarks.find(h => h.id === g.id);
        if (found !== undefined) {
          if (g.status === found.status || !g.status) return;
          if (fromSync && data.sync.temp.addedData.find(h => h.type === 'updated_bookmark' && h.id === g.id)) return;

          found.status = g.status;
          changed.bookmarksUpdated++;
          if (save && isSyncEnabled(data) && !fromSync) data.sync.temp.addedData.push({type: 'updated_bookmark', id: g.id});

          return;
        }
        if (data.bookmarks.length >= getStorageLimits().bookmarks) return;
        data.bookmarks.push(g);
        changed.bookmarksAdded++;

        if (save && isSyncEnabled(data) && !fromSync) data.sync.temp.addedData.push({type: 'bookmarks', id: g.id});
      });
      continue;
    }
    else if (!ignored.notifications && key === 'notifications') {
      if ((value.anime && value.anime?.length === undefined) || (value.episodes && value.episodes?.length === undefined)) {
        console.warn('[AnimePahe Improvements] Imported "notifications" has an incorrect format.');
        continue;
      }
      if (value.anime) value.anime.forEach(g => {
        if (data.notifications.anime.find(h => h.id === g.id) !== undefined) return;
        if (data.notifications.anime.length >= getStorageLimits().notifications.anime) return;
        data.notifications.anime.push(g);
        changed.notificationsAdded++;

        if (save && isSyncEnabled(data) && !fromSync) data.sync.temp.addedData.push({type: 'notification_anime', name: g.name});
      });

      // Checking if there exists any gap between the imported episodes and the existing ones
      if (save && value.episodes) data.notifications.anime.forEach(g => {
        const existingEpisodes = data.notifications.episodes.filter(a => (a.animeName === g.name || a.animeId === g.id));
        const addedEpisodes = value.episodes.filter(a => (a.animeName === g.name || a.animeId === g.id));
        if (existingEpisodes.length > 0 && addedEpisodes.length > 0 && (existingEpisodes[existingEpisodes.length-1].episode - addedEpisodes[0].episode > 1.5)) {
          g.updateFrom = new Date(addedEpisodes[0].time + " UTC").getTime();
        }
      });

      if (value.episodes) value.episodes.forEach(g => {
        const anime = (() => {
          if (g.animeId !== undefined) return data.notifications.anime.find(a => a.id === g.animeId);

          const fromNew = data.notifications.anime.find(a => a.name === g.animeName);
          if (fromNew !== undefined) return fromNew;
          const id = value.anime.find(a => a.name === g.animeName);
          return data.notifications.anime.find(a => a.id === id);
        })();
        if (anime === undefined) return;
        if (g.animeName !== anime.name) g.animeName = anime.name;
        if (g.animeId === undefined) g.animeId = anime.id;
        const foundEpisode = data.notifications.episodes.find(h => h.animeId === anime.id && h.episode === g.episode);
        if (foundEpisode !== undefined) {
          if (g.watched === true && !foundEpisode.watched) {
            foundEpisode.watched = true;
            changed.episodeFeedUpdated++;
          }
          return;
        }
        data.notifications.episodes.push(g);
        changed.episodeFeedUpdated++;
      });
      if (save && value.episodes) {
        data.notifications.episodes.sort((a,b) => a.time < b.time ? 1 : -1);
        if (value.episodes.length > 0) {
          data.notifications.lastUpdated = new Date(value.episodes[0].time + " UTC").getTime();
        }
        const limit = getStorageLimits().notifications.episodes;
        if (data.notifications.episodes.length > limit) {
          data.notifications.episodes = data.notifications.episodes.slice(0, limit);
        }
      }
      continue;
    }
    else if (!ignored.watchedEpisodes && key === 'watched') {
      const watched = decodeWatched(data.watched);
      const watchedNew = decodeWatched(value);

      if (value.length === undefined || (value.length > 0 && watchedNew.length === 0)) {
        console.warn('[AnimePahe Improvements] Imported "watched" has an incorrect format.');
        continue;
      }

      for (const anime of watchedNew) {
        const found = watched.find(a => a.animeId === anime.animeId);

        if (found === undefined) {
          watched.push({
            animeId: anime.animeId,
            episodes: anime.episodes
          });
          changed.watchedEpisodesAdded += anime.episodes.length;

          if (save && isSyncEnabled(data) && !fromSync) data.sync.temp.addedData.push({type: 'watched', animeId: anime.animeId, episodes: anime.episodes});
        }
        else for (const ep of anime.episodes) {
          if (found.episodes.includes(ep)) continue;
          found.episodes.push(ep);
          changed.watchedEpisodesAdded++;
        }
      }

      data.watched = encodeWatched(watched);
    }
    else if (!ignored.videoSpeed && key === 'videoSpeed') {
      if (value.length === undefined) {
        console.warn('[AnimePahe Improvements] Imported "videoSpeed" has an incorrect format.');
        continue;
      }

      for (const anime of value) {
        const found = data.videoSpeed.find(a => a.animeId === anime.animeId);
        if (found !== undefined) {
          if (found.speed === anime.speed) continue;
          found.speed = anime.speed;
          changed.videoSpeedUpdated++;
          continue;
        }

        data.videoSpeed.push(anime);
        changed.videoSpeedUpdated++;
      }
    }
    else if (ignored.settings !== true && key === 'settings') {
      for (const [key, value2] of Object.entries(value)) {
        if (defaultData.settings[key] === undefined || ignored.settings[key] || typeof(value2) !== typeof(defaultData.settings[key])) continue;
        if (data.settings[key] === value2) continue;
        data.settings[key] = value2;
        changed.settingsUpdated++;
      }
    }
  }

  if (save) saveData(data);

  return changed;
}

const syncApi = 'https://ap-improvements-database.ellivers.workers.dev';
let syncInterval;
const tabUUID = crypto.randomUUID();
const receivedTabUUIDs = [];

function broadcastTabMessage(key, value) {
  // Also sends message to itself
  localStorage.setItem(key, value);
  receiveTabMessage({originalEvent: {key: key, newValue: value}});
  localStorage.removeItem(key);
}

// MARKER:TAB MESSAGES
function receiveTabMessage(e) {
  // Values received from other tabs are always strings

  const message = e.originalEvent.newValue;
  if (!message) return; // Ignore empty msg or msg reset

  const key = e.originalEvent.key;

  if (key === 'anitracker_sync_deletion_confirmation') {
    showMessage('Potential sync issue. Check the log!');

    const removed = JSON.parse(message);
    const restore = confirm(`[AnimePahe Improvements]\n\nPotential sync issue! The latest sync deleted the following amounts of data:
    Session entries: ${removed.linkList.length}
    Video progress entries: ${removed.videoTimes.length}
    Bookmarks: ${removed.bookmarks.length}
    Episode feed entries: ${removed.notifications.anime.length}
    Watched anime: ${removed.watched.length}
    \nIf you believe this is an error, click OK to restore the removed data.`);

    if (!restore) return;

    removed.watched = encodeWatched(removed.watched);
    importData(getStorage(), removed);
    showMessage('Restored data');
    return;
  }

  if (key === 'anitracker_auto_sync_started') {
    const syncBtn = $('.anitracker-sync-button');
    if (syncBtn) syncBtn.find('i').addClass('anitracker-spin');
    return;
  }

  if (key === 'anitracker_auto_sync_ended') {
    const msg = JSON.parse(message);

    const syncBtn = $('.anitracker-sync-button');
    if (syncBtn) syncBtn.find('i').removeClass('anitracker-spin');

    const syncSinceText = $('.anitracker-time-since-sync');
    if (syncSinceText && msg?.lastSynced) {
      syncSinceText.text(timeSince(+msg.lastSynced) + ' ago');
      syncSinceText.parent().attr('title', new Date(+msg.lastSynced).toLocaleString());
    }

    if (msg?.imported) updateFromImport(msg.imported, {
      page: (msg?.removed && msg?.removed?.bookmarks.length),
      epPage: (msg?.removed && (msg?.removed?.watched.length || msg?.removed?.linkList.length || msg?.removed?.videoTimes.length))
    });
    return;
  }

  if (key === 'anitracker_update_auto_sync') {
    if (syncInterval === undefined) return;
    const value = +message;
    if (value) setAutoSync(value);
    else unsetAutoSync();
    return;
  }

  if (key !== 'anitracker_decide_sync') return;
  const instruction = JSON.parse(message);

  if (instruction.action === "send_uuids") {
    const msgToSend = syncInterval !== undefined ? 'enabled' : tabUUID;
    const sendObj = JSON.stringify({action: "add_value", value: msgToSend});

    localStorage.setItem('anitracker_decide_sync', sendObj);
    receiveTabMessage({originalEvent: {key: 'anitracker_decide_sync', newValue: sendObj}});
    return;
  }

  if (instruction.action === "add_value") {
    receivedTabUUIDs.push(instruction.value);

    if (receivedTabUUIDs.length !== 1) return;

    setTimeout(() => {
      if (!receivedTabUUIDs.find(a => a === 'enabled') && receivedTabUUIDs.sort((a,b) => a < b ? 1 : -1)[0] === tabUUID) {
        console.log(`[AnimePahe Improvements] This tab is now in charge of auto-syncing. (${new Date().toLocaleTimeString()})`);
        const storage = getStorage();
        setAutoSync(storage.sync.settings.interval);
      }
      receivedTabUUIDs.length = 0;
    }, 100);
    return;
  }
}

$(window).on('storage', receiveTabMessage);

function setupAutoSync(includeSelf = true) {
  localStorage.setItem('anitracker_decide_sync', JSON.stringify({action: "send_uuids"}));
  if (includeSelf) receiveTabMessage({originalEvent: {key: 'anitracker_decide_sync', newValue: JSON.stringify({action: "send_uuids"})}});
}

if (isSyncEnabled(initialStorage) && initialStorage.sync.settings.interval) setupAutoSync();

$(window).on('beforeunload', () => {
  const storage = getStorage();
  storage.sync.temp.inProgress = false;
  saveData(storage);

  if (syncInterval !== undefined) setupAutoSync(false);
});

function stringSimilarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function getTextContent(elem) {
  let text = '';
  Array.from(elem.contents().filter(function() {
    return this.nodeType === 3;
  })).forEach(t => { text += t.textContent; });
  return text;
}

function getSmallPosterUrl(src) {
  const parts = src.split('.');
  parts.splice(parts.length - 1, 0, 'th');
  return parts.join('.');
}

async function searchForCollections() {
  if (!$('.search-results a').length) return;

  const baseName = $($('.search-results .result-title')[0]).text();

  const response = await asyncGetResponseData('/api?m=search&q=' + makeSearchable(baseName));
  if (!response || response.length < 2) return;

  const elem = $(`
  <li class="anitracker-collection" data-index="-1" style="padding: 0;">
    <div style="padding: .5rem;" class="anitracker-spinner anitracker-center-content">
      <div class="spinner-border" role="status" style="">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </li>`).prependTo('.search-results');

  let seriesList = [];
  for (const anime of response) {
    if (stringSimilarity(baseName, anime.title) >= 0.42 || (anime.title.startsWith(baseName) && stringSimilarity(baseName, anime.title) >= 0.25)) {
      seriesList.push(anime);
    }
  }

  const additional = await getRelationList(sortAnimesChronologically(seriesList)[0].session);
  seriesList.push(...additional.filter(a => !seriesList.find(g => g.title === a.title) && !['Character'].includes(a.relation_type)));

  if (seriesList.length < 2) {
    elem.remove();
    return;
  }
  seriesList = sortAnimesChronologically(seriesList);

  displayCollection(seriesList, elem);
}

new MutationObserver(function(mutationList, observer) {
  if (!searchComplete()) return;
  searchForCollections();
  for (const elem of $('.search-results a')) {
    $(elem).attr('title', $(elem).find('.result-title').text());
  }
}).observe($('.search-results-wrap')[0], { childList: true });

function searchComplete() {
  return $('.search-results').length !== 0 && $('.search-results a').length;
}

function displayCollection(seriesList, elem) {
  elem.empty().css('padding', '');
  $(`
    <a title="${toHtmlCodes(seriesList[0].title + " - Collection")}" href="javascript:;">
      <div class="result-thumbnail">
        <div class="anitracker-collection-image-wrapper">
          <img src="${getSmallPosterUrl(seriesList[0].poster)}" referrerpolicy="no-referrer" style="pointer-events: all !important;max-width: 30px;">
        </div>
        <div class="anitracker-collection-image-wrapper">
          <img src="${getSmallPosterUrl(seriesList[1].poster)}" referrerpolicy="no-referrer" style="pointer-events: all !important;max-width: 30px;left:30px;">
        </div>
      </div>
      <div class="result-metadata">
        <div class="result-title">${toHtmlCodes(seriesList[0].title)}</div>
        <div class="result-status"><strong>Collection</strong> ∙ ${seriesList.length} Entries</div>
      </div>
    </a>`).appendTo(elem);

  function displayInModal() {
    $('#anitracker-modal-body').empty();
    $(`
    <h4 style="margin-bottom:0px;">Collection - ${seriesList.length} Entries</h4>
    <p class="anitracker-secondary-info">May not be entirely accurate</p>
    <div class="anitracker-modal-list-container">
      <div class="anitracker-modal-list" style="min-height: 100px;min-width: 200px;"></div>
    </div>`).appendTo('#anitracker-modal-body');

    for (const anime of seriesList) {
      $(`
      <div class="anitracker-big-list-item">
        <a href="/anime/${anime.session}" title="${toHtmlCodes(anime.title)}" style="display: flex; gap: 16px;">
          <div class="anitracker-image-wrapper" style="height: 60px; width: 60px; min-width: 60px;">
            <img src="${getSmallPosterUrl(anime.poster)}" referrerpolicy="no-referrer" alt="[Thumbnail of ${toHtmlCodes(anime.title)}]">
          </div>
          <div>
            <div class="anitracker-main-text">${anime.title}</div>
            <div class="anitracker-subtext">
              <strong>${anime.type}</strong> ∙ ${anime.episodes ? anime.episodes : '?'} Ep${anime.episodes === 1 ? '' : 's'} ∙ ${anime.season} ${anime.year}
            </div>
            ${anime.status !== 'Finished Airing' ? `<div class="anitracker-subtext">${anime.status}</div>` : ''}
          </div>
        </a>
      </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list');
    }

    openModal();
    scrollModalToTop();
  }

  elem.on('click', displayInModal);
}

$('.input-search').attr('title','Search for anime');
$('.input-search').on('keyup', (e) => {
  const collectionElem = $('.search-results').find('.anitracker-collection');
  if (collectionElem.length && e.key === "Enter" && collectionElem.hasClass('selected')) collectionElem.trigger('click');
  if ($(e.currentTarget).val() === '') $('.search-results-wrap').empty();
});

function getSeasonTimeframe(from, to) {
  const filters = [];
  for (let i = from.year; i <= to.year; i++) {
    const start = i === from.year ? from.season : 0;
    const end = i === to.year ? to.season : 3;
    for (let d = start; d <= end; d++) {
      filters.push({type: 'season_entry', value: {year: i, season: d}});
    }
  }
  return filters;
}

if (!isRandomAnime() && initialStorage.temp !== undefined) {
  const storage = getStorage();
  delete storage.temp;
  saveData(storage);
}

const filterSearchCache = {};

const filterValues = {
  "genre":[
    {"name":"Comedy","value":"comedy"},{"name":"Slice of Life","value":"slice-of-life"},{"name":"Romance","value":"romance"},{"name":"Ecchi","value":"ecchi"},{"name":"Drama","value":"drama"},
    {"name":"Supernatural","value":"supernatural"},{"name":"Sports","value":"sports"},{"name":"Horror","value":"horror"},{"name":"Sci-Fi","value":"sci-fi"},{"name":"Action","value":"action"},
    {"name":"Fantasy","value":"fantasy"},{"name":"Mystery","value":"mystery"},{"name":"Suspense","value":"suspense"},{"name":"Adventure","value":"adventure"},{"name":"Boys Love","value":"boys-love"},
    {"name":"Girls Love","value":"girls-love"},{"name":"Hentai","value":"hentai"},{"name":"Gourmet","value":"gourmet"},{"name":"Erotica","value":"erotica"},{"name":"Avant Garde","value":"avant-garde"},
    {"name":"Award Winning","value":"award-winning"}
  ],
  "theme":[
    {"name":"Adult Cast","value":"adult-cast"},{"name":"Anthropomorphic","value":"anthropomorphic"},{"name":"Detective","value":"detective"},{"name":"Love Polygon","value":"love-polygon"},
    {"name":"Mecha","value":"mecha"},{"name":"Music","value":"music"},{"name":"Psychological","value":"psychological"},{"name":"School","value":"school"},{"name":"Super Power","value":"super-power"},
    {"name":"Space","value":"space"},{"name":"CGDCT","value":"cgdct"},{"name":"Romantic Subtext","value":"romantic-subtext"},{"name":"Historical","value":"historical"},{"name":"Video Game","value":"video-game"},
    {"name":"Martial Arts","value":"martial-arts"},{"name":"Idols (Female)","value":"idols-female"},{"name":"Idols (Male)","value":"idols-male"},{"name":"Gag Humor","value":"gag-humor"},{"name":"Parody","value":"parody"},
    {"name":"Performing Arts","value":"performing-arts"},{"name":"Military","value":"military"},{"name":"Harem","value":"harem"},{"name":"Reverse Harem","value":"reverse-harem"},{"name":"Samurai","value":"samurai"},
    {"name":"Vampire","value":"vampire"},{"name":"Mythology","value":"mythology"},{"name":"High Stakes Game","value":"high-stakes-game"},{"name":"Strategy Game","value":"strategy-game"},
    {"name":"Magical Sex Shift","value":"magical-sex-shift"},{"name":"Racing","value":"racing"},{"name":"Isekai","value":"isekai"},{"name":"Workplace","value":"workplace"},{"name":"Iyashikei","value":"iyashikei"},
    {"name":"Time Travel","value":"time-travel"},{"name":"Gore","value":"gore"},{"name":"Educational","value":"educational"},{"name":"Delinquents","value":"delinquents"},{"name":"Organized Crime","value":"organized-crime"},
    {"name":"Otaku Culture","value":"otaku-culture"},{"name":"Medical","value":"medical"},{"name":"Survival","value":"survival"},{"name":"Reincarnation","value":"reincarnation"},{"name":"Showbiz","value":"showbiz"},
    {"name":"Team Sports","value":"team-sports"},{"name":"Mahou Shoujo","value":"mahou-shoujo"},{"name":"Combat Sports","value":"combat-sports"},{"name":"Crossdressing","value":"crossdressing"},
    {"name":"Visual Arts","value":"visual-arts"},{"name":"Childcare","value":"childcare"},{"name":"Pets","value":"pets"},{"name":"Love Status Quo","value":"love-status-quo"},{"name":"Urban Fantasy","value":"urban-fantasy"},
    {"name":"Villainess","value":"villainess"}
  ],
  "type":[
    {"name":"TV","value":"tv"},{"name":"Movie","value":"movie"},{"name":"OVA","value":"ova"},{"name":"ONA","value":"ona"},{"name":"Special","value":"special"},{"name":"Music","value":"music"}
  ],
  "demographic":[
    {"name":"Shounen","value":"shounen"},{"name":"Shoujo","value":"shoujo"},{"name":"Seinen","value":"seinen"},{"name":"Kids","value":"kids"},{"name":"Josei","value":"josei"}
  ],
  "status":[
    {"value":"airing"},{"value":"completed"}
  ]
};

const filterDefaultRules = {
  genre: {
    include: "and",
    exclude: "and"
  },
  theme: {
    include: "and",
    exclude: "and"
  },
  demographic: {
    include: "or",
    exclude: "and"
  },
  type: {
    include: "or",
    exclude: "and"
  },
  season: {
    include: "or",
    exclude: "and"
  },
  status: {
    include: "or"
  }
};

// MARKER:SEARCH FILTER LOGIC
const filterRules = JSON.parse(JSON.stringify(filterDefaultRules));

function buildFilterString(type, value) {
  if (type === 'status') return value;
  if (type === 'season_entry') return `season/${getSeasonName(value.season)}-${value.year}`;

  return type + '/' + value;
}

const seasonFilterRegex = /^!?(spring|summer|winter|fall)-(\d{4})\.\.(spring|summer|winter|fall)-(\d{4})$/;

function getFilteredList(filtersInput) {
  let filtersChecked = 0;
  let filtersTotal = 0;

  function getPage(pageUrl) {
    return new Promise((resolve, reject) => {
      const cached = filterSearchCache[pageUrl];
      if (cached !== undefined) { // If cache exists
        if (cached === 'invalid') { // Not sure if it ever is 'invalid'
          resolve([]);
          return;
        }
        resolve(cached);
        return;
      }
      const req = new XMLHttpRequest();
      req.open('GET', pageUrl, true);

      req.onload = () => {
        if (req.status !== 200) {
          filterSearchCache[pageUrl] = [];
          resolve([]);
          return;
        }
        const animeList = getAnimeList($(req.response));
        filterSearchCache[pageUrl] = animeList;
        resolve(animeList);
      };
      req.onerror = () => {
        reject('A network error occurred.');
        return;
      };

      req.send();
    });
  }

  function getLists(filters) {
    const lists = [];

    return new Promise((resolve, reject) => {
      function check() {
        if (filters.length > 0) {
          repeat(filters.shift());
        }
        else {
          resolve(lists);
        }
      }

      function repeat(filter) {
        const filterType = filter.type;
        if (filter.value === 'none') {
          filtersTotal += filterValues[filterType].length;

          getLists(filterValues[filterType].map(a => {return {type: filterType, value: a.value, exclude: false};})).then((filtered) => {
            getPage('/anime').then((unfiltered) => {
              const none = [];
              for (const entry of unfiltered) {
                const found = filtered.find(list => list.entries.find(a => a.name === entry.name));
                if (!filter.exclude && found !== undefined) continue;
                if (filter.exclude && found === undefined) continue;
                none.push(entry);
              }

              lists.push({
                type: filterType,
                excludedFilter: false,
                entries: none
              });

              check();
            });
          });
          return;
        }
        if (filterType === 'season') {
          const seasonFilters = getSeasonTimeframe(filter.value.from, filter.value.to);
          filtersTotal += seasonFilters.length;

          getLists(seasonFilters).then((filtered) => {
            const filtersResult = [];
            if (filter.exclude) getPage('/anime').then((unfiltered) => {
              for (const entry of unfiltered) {
                if (filtered.find(list => list.entries.find(a => a.name === entry.name)) !== undefined) continue;
                filtersResult.push(entry);
              }

              lists.push({
                type: 'season',
                excludedFilter: true,
                entries: filtersResult
              });

              check();
            });
            else {
              for (const list of filtered) {
                filtersResult.push(...list.entries);
              }

              lists.push({
                type: 'season',
                excludedFilter: false,
                entries: filtersResult
              });

              check();
            }
          });

          return;
        }
        if (filter.exclude) {
          getPage('/anime/' + buildFilterString(filterType, filter.value)).then((filtered) => {
            getPage('/anime').then((unfiltered) => {
              const included = [];
              for (const entry of unfiltered) {
                if (filtered.find(a => a.name === entry.name) !== undefined) continue;
                included.push(entry);
              }

              lists.push({
                type: filterType,
                excludedFilter: true,
                entries: included
              });

              check();
            });
          });
          return;
        }
        getPage('/anime/' + buildFilterString(filterType, filter.value)).then((result) => {
          if (result !== undefined) {
            lists.push({
              type: filterType,
              excludedFilter: false,
              entries: result
            });
          }
          if (filtersTotal > 0) {
            filtersChecked++;
            $($('.anitracker-filter-spinner>span')[0]).text(Math.floor((filtersChecked/filtersTotal) * 100).toString() + '%');
          }

          check();
        });
      }

      check();
    });
  }

  function combineLists(lists, rule) {
    if (lists.length === 0) return [];

    // Start with the first filter list result, then compare others to it
    let combinedList = lists[0];
    lists.splice(0,1); // Remove the first entry
    for (const list of lists) {
      // If the rule of this filter type is 'or,' start from the current list
      // Otherwise, start from an empty list
      const updatedList = rule === 'or' ? combinedList : [];
      if (rule === 'and') for (const anime of list) {
        // The anime has to exist in both the current and the checked list
        if (combinedList.find(a => a.name === anime.name) === undefined) continue;
        updatedList.push(anime);
      }
      else if (rule === 'or') for (const anime of list) {
        // The anime just has to not already exist in the current list
        if (combinedList.find(a => a.name === anime.name) !== undefined) continue;
        updatedList.push(anime);
      }
      combinedList = updatedList;
    }
    return combinedList;
  }

  return new Promise((resolve, reject) => {
    const filters = JSON.parse(JSON.stringify(filtersInput));

    if (filters.length === 0) {
      getPage('/anime').then((response) => {
        if (response === undefined) {
          alert('Page loading failed.');
          reject('Anime index page not reachable.');
          return;
        }

        resolve(response);
      });
      return;
    }

    filtersTotal = filters.length;


    getLists(filters).then((listsInput) => {
      const lists = JSON.parse(JSON.stringify(listsInput));

      // groupedLists entries have the following format:
      /* {
            type, // the type of filter, eg. 'genre'
            includeLists: [
              <list of included anime>
            ],
            excludeLists: [
              <list of excluded anime>
            ]
         }
       */
      const groupedLists = [];
      for (const list of lists) {
        let foundGroup = groupedLists.find(a => a.type === list.type);
        if (foundGroup === undefined) {
          groupedLists.push({
            type: list.type,
            includeLists: [],
            excludeLists: []
          });
          foundGroup = groupedLists[groupedLists.length - 1];
        }

        if (list.excludedFilter) foundGroup.excludeLists.push(list.entries);
        else foundGroup.includeLists.push(list.entries);
      }

      let finalList;

      for (const group of groupedLists) {
        const includeList = combineLists(group.includeLists, filterRules[group.type].include);
        const excludeList = combineLists(group.excludeLists, filterRules[group.type].exclude);

        // Combine the include and exclude lists

        // If the exclude list exists, start from an empty list
        // Otherwise, just default to the include list
        let groupFinalList = [];
        if (excludeList.length > 0 && includeList.length > 0) {
          const combineRule = filterRules[group.type].combined;
          for (const entry of excludeList) {
            if (groupFinalList.find(a => a.name === entry.name) !== undefined) continue; // Don't include duplicates
            if (combineRule === 'or') {
              if (includeList.find(a => a.name === entry.name) !== undefined) continue;
              groupFinalList.push(entry);
              continue;
            }
            // Otherwise, the rule is 'and'
            if (includeList.find(a => a.name === entry.name) === undefined) continue;
            groupFinalList.push(entry);
          }
        }
        else if (excludeList.length === 0) groupFinalList = includeList;
        else if (includeList.length === 0) groupFinalList = excludeList;

        // If the current final list is undefined, just add the resulting list to it and continue
        if (finalList === undefined) {
          finalList = groupFinalList;
          continue;
        }

        const newFinalList = [];
        // Loop through the resulting list
        // Join together with 'and'
        for (const anime of groupFinalList) {
          if (finalList.find(a => a.name === anime.name) === undefined) continue;
          newFinalList.push(anime);
        }
        finalList = newFinalList;
      }

      resolve(finalList);
    });
  });
}

function searchList(fuseClass, list, query, limit = 80) {
  const fuse = new fuseClass(list, {
    keys: ['name'],
    findAllMatches: true
  });

  const lowercaseQuery = query.toLowerCase();

  const results = fuse.search(query).map(a => {return a.item});
  const includesMatch = [];
  const other = [];
  for (const result of results) {
    if (result.name.toLowerCase().includes(lowercaseQuery)) {
      includesMatch.push(result);
      continue;
    }
    other.push(result);
  }

  return [...includesMatch, ...other].splice(0,limit);
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return interval + " year" + (interval !== 1 ? 's' : '');
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + " month" + (interval !== 1 ? 's' : '');
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + " day" + (interval !== 1 ? 's' : '');
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + " hour" + (interval !== 1 ? 's' : '');
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + " minute" + (interval !== 1 ? 's' : '');
  }
  return seconds + " second" + (seconds !== 1 ? 's' : '');
}

if (window.location.pathname.startsWith('/customlink')) {
  (async () => {
    const notFoundText = $('h1').text();
    document.title = "Redirecting... :: animepahe";
    $('h1').text('Redirecting...');

    const parts = {
      animeSession: undefined,
      episodeSession: undefined,
      time: -1
    };
    const entries = Array.from(new URLSearchParams(window.location.search).entries()).sort((a,b) => a[0] > b[0] ? 1 : -1);
    const destination = await (async () => {
      for (const entry of entries) {
        if (entry[0] === 'a') {
          const value = entry[1];
          if (+value) {
            const data = await getDataFromAnimeId(+value);
            if (data) {
              parts.animeSession = data.session;
              continue;
            }
          }
          const name = decodeURIComponent(value);
          const animeData = await asyncGetAnimeData(name, undefined, true);
          if (!animeData) return;
          if (animeData.title !== name && !confirm(`[AnimePahe Improvements]\n\nCouldn't find any anime with name "${name}".\nGo to "${animeData.title}" instead?`)) {
            return;
          }
          parts.animeSession = animeData.session;
          continue;
        }
        if (entry[0] === 'e') {
          if (!parts.animeSession) return;
          const epData = await getEpisodeData(parts.animeSession, +entry[1]);
          parts.episodeSession = epData?.session;
          continue;
        }
        if (entry[0] === 't') {
          if (!parts.animeSession) return;
          if (!parts.episodeSession) continue;

          parts.time = +entry[1];
          continue;
        }
      }

      if (parts.animeSession && parts.episodeSession && parts.time >= 0) {
        return '/play/' + parts.animeSession + '/' + parts.episodeSession + '?time=' + parts.time + '&ref=customlink';
      }
      if (parts.animeSession && parts.episodeSession && parts.time === -1) {
        return '/play/' + parts.animeSession + '/' + parts.episodeSession + '?ref=customlink';
      }
      if (parts.animeSession && !parts.episodeSession) {
        return '/anime/' + parts.animeSession + '?ref=customlink';
      }
      return undefined;
    })();

    if (destination) window.location.replace(destination);
    else {
      document.title = notFoundText;
      $('h1').text(notFoundText);
    }
  })();
  return;
}

// MARKER:MAIN PAGE KEYBOARD SHORTCUTS
// Main key events
$(document).on('keydown', (e, other = undefined) => {
  if (other) e = other.event;
  if (!e.key) return;
  const isTextInput = $(e.target).is('input[type=text],input[type=number],input[type=""],input:not([type]),textarea,*[role=textbox]');

  if (modalIsOpen()) {
    if (e.key === 'Escape') return closeModal();
    if (e.key === 'Backspace' && !isTextInput) return modalBackFunction();
    return;
  }

  if (isTextInput) return;

  const storage = getStorage();
  if (e.key === storage.settings.keybindBookmarks) {
    openBookmarksModal();
    return;
  }
  if (e.key === storage.settings.keybindNotifications) {
    openNotificationsModal();
    return;
  }
  if (e.key === storage.settings.keybindSearch) {
    setTimeout(() => {$('.input-search').focus()}, 1);
    return;
  }

  if (!isEpisode()) return;
  if (e.key === 't') {
    toggleTheatreMode();
  }
  else if (!['Control','Shift','Alt'].includes(e.key) && !e.msg /*If this was a message from iframe, don't do recursive stuff*/) {
    sendMessage({action:"key",key:e.key,event:{key:e.key, ctrlKey:e.ctrlKey, shiftKey:e.shiftKey, altKey:e.altKey, metaKey:e.metaKey, msg:true}});
    $('.embed-responsive-item')[0].contentWindow.focus();
    if ([" "].includes(e.key) || (["ArrowUp", "ArrowDown"].includes(e.key) && e.ctrlKey)) e.preventDefault();
  }
});

if (window.location.pathname.startsWith('/queue')) {
  $(`
  <span style="font-size:.6em;margin-left:10px;">(Incoming episodes)</span>
  `).appendTo('h2');
}

// Redirect filter pages
if (/^\/anime\/\w+(\/[\w\-\.]+)?$/.test(window.location.pathname)) {
  if (is404) return;

  const filter = /\/anime\/([^\/]+)\/?([^\/]+)?/.exec(window.location.pathname);

  if (filter[2] !== undefined) {
    if (filterRules[filter[1]] === undefined) return;
    if (filter[1] === 'season') {
      window.location.replace(`/anime?${filter[1]}=${filter[2]}..${filter[2]}`);
      return;
    }
    window.location.replace(`/anime?${filter[1]}=${filter[2]}`);
  }
  else {
    window.location.replace(`/anime?status=${filter[1]}`);
  }
  return;
}

function getDayName(day) {
  return [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ][day];
}

function toHtmlCodes(string) {
  return $('<div>').text(string).html().replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// MARKER:HEADER BUTTONS
// Bookmark & episode feed header buttons
$(`
<div class="anitracker-header">
  <button class="anitracker-header-notifications anitracker-header-button" title="View episode feed">
    <i class="fa fa-bell" aria-hidden="true"></i>
    <i style="display:none;" aria-hidden="true" class="fa fa-circle anitracker-header-notifications-circle"></i>
  </button>
  <button class="anitracker-header-bookmark anitracker-header-button" title="View bookmarks"><i class="fa fa-bookmark" aria-hidden="true"></i></button>
</div>`).insertAfter('.navbar-nav');

let currentNotificationIndex = 0;

function openNotificationsModal() {
  currentNotificationIndex = 0;
  const oldStorage = getStorage();
  $('#anitracker-modal-body').empty();

  $(`
  <h4>Episode Feed</h4>
  <div class="btn-group" style="margin-bottom: 10px;">
    <button class="btn btn-secondary anitracker-view-notif-animes" title="View schedule and remove anime from the feed">
      <i class="fa fa-calendar" aria-hidden="true"></i>
      &nbsp;Manage Feed...
    </button>
  </div>
  <div class="anitracker-modal-list-container">
    <div class="anitracker-modal-list" style="min-height: 100px;min-width: 200px;">
      <div id="anitracker-notifications-list-spinner" class="anitracker-spinner" style="display:flex;align-items:center;flex-direction:column;">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <span><span class="anitracker-loaded-amount">0</span><span>/${oldStorage.notifications.anime.length}</span></span>
      </div>
    </div>
  </div>`).appendTo('#anitracker-modal-body');

  function openNotifAnimesModal() {
    $('#anitracker-modal-body').empty();
    const storage = getStorage();
    $(`
    <h4>Manage Episode Feed</h4>
    <div class="anitracker-feed-schedule"></div>
    <label for="anitracker-week-start-dropdown-toggle" style="vertical-align: top;" title="Select which day the schedule should start">Start from:</label>
    <div class="btn-group" style="margin-bottom: 10px;">
      <button class="btn dropdown-toggle btn-dark anitracker-flat-button" id="anitracker-week-start-dropdown-toggle" data-bs-toggle="dropdown" data-toggle="dropdown" title="Select which day the schedule should start">Sunday</button>
      <div class="dropdown-menu anitracker-dropdown-content anitracker-week-start-dropdown"></div>
    </div>
    <div class="anitracker-modal-list-container" style="width: fit-content;margin: auto;">
      <div class="anitracker-modal-list" style="min-height: 100px;min-width: 200px;"></div>
    </div>
    `).appendTo('#anitracker-modal-body');
    [0,1,6].forEach(g => $(`<button>${getDayName(g)}</button>`).appendTo('.anitracker-week-start-dropdown').data('value', g));
    $('#anitracker-week-start-dropdown-toggle').text(getDayName(storage.settings.notifScheduleStart));
    const schedule = [0,1,2,3,4,5,6].map(g => {return {num: g, list:[]}});

    $('.anitracker-week-start-dropdown>button').on('click', function() {
      const storage = getStorage();
      const day = +$(this).data('value');
      storage.settings.notifScheduleStart = day;
      saveData(storage);

      $('#anitracker-week-start-dropdown-toggle').text(getDayName(day));
      makeSchedule(day);
    });

    if (!storage.notifications.anime.length) {
      $(`<span>Use the <i class="fa fa-bell" title="bell"></i> button on an ongoing anime to add it to the feed.</span>`).appendTo('#anitracker-modal-body .anitracker-modal-list');
      makeSchedule(storage.settings.notifScheduleStart);
      openModal(openNotificationsModal);
      return;
    }

    [...storage.notifications.anime].sort((a,b) => a.latest_episode > b.latest_episode ? 1 : -1).forEach(g => {
      const latestEp = new Date(g.latest_episode + " UTC");
      const latestEpString = g.latest_episode !== undefined ? `${getDayName(latestEp.getDay())} ${latestEp.toLocaleTimeString([], {timeStyle:'short'})} (${timeSince(latestEp.getTime())} ago)` : "None found";
      $(`
      <div class="anitracker-modal-list-entry" animeid="${g.id}" animename="${toHtmlCodes(g.name)}">
        <a href="/a/${g.id}" target="_blank" title="${toHtmlCodes(g.name)}">
          ${g.name}
        </a><br>
        <span>
          Latest episode: ${latestEpString}
        </span><br>
        <div class="btn-group">
          <button class="btn btn-secondary anitracker-delete-button anitracker-flat-button" title="Remove this anime from the episode feed">
            <i class="fa fa-trash" aria-hidden="true"></i>
            &nbsp;Remove
          </button>
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary anitracker-get-all-button anitracker-flat-button" title="Add all episodes to the feed" ${g.hasFirstEpisode ? 'disabled=""' : ''}>
            <i class="fa fa-rotate-right" aria-hidden="true"></i>
            &nbsp;Get All
          </button>
        </div>
      </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list');

      const scheduleEntry = schedule.find(a => a.num === latestEp.getDay());
      if (scheduleEntry) scheduleEntry.list.push({
        time: latestEp,
        name: g.name,
        id: g.id,
      });
    });
    makeSchedule(storage.settings.notifScheduleStart);

    $('.anitracker-modal-list-entry .anitracker-get-all-button').on('click', (e) => {
      const elem = $(e.currentTarget);
      const id = +elem.parents().eq(1).attr('animeid');
      const storage = getStorage();

      const found = storage.notifications.anime.find(a => a.id === id);
      if (!found) {
        console.error("[AnimePahe Improvements] Couldn't find feed for anime with ID " + id);
        return;
      }

      found.hasFirstEpisode = true;
      found.updateFrom = 0;
      saveData(storage);

      elem.replaceClass("btn-secondary", "btn-primary");
      setTimeout(() => {
        elem.replaceClass("btn-primary", "btn-secondary");
        elem.prop('disabled', true);
      }, 200);

      showMessage('Added all episodes to feed');
    });

    $('.anitracker-modal-list-entry .anitracker-delete-button').on('click', (e) => {
      const parent = $(e.currentTarget).parents().eq(1);
      const name = parent.attr('animename');
      toggleNotifications(name, +parent.attr('animeid'));
      showMessage('Removed from feed');

      const name2 = getAnimeName();
      if (name2.length > 0 && name2 === name) $('.anitracker-notifications-toggle .anitracker-title-icon-check').hide();

      parent.remove();
      openNotifAnimesModal();
    });

    function makeSchedule(startDay) {
      const today = new Date().getDay();
      $('.anitracker-feed-schedule>div').remove();
      for (let i = 0; i < schedule.length; i++) {
        if (schedule[0].num === startDay) break;
        schedule.push(schedule.shift());
      }
      for (const entry of schedule) {
        entry.list.sort((a,b) => a.time.toLocaleTimeString() > b.time.toLocaleTimeString() ? 1 : -1);
        $(`
        <div>
          <div class="anitracker-feed-schedule-header">${getDayName(entry.num).slice(0,3)}</div>
          <div class="anitracker-feed-schedule-body${entry.num === today ? ' anitracker-feed-schedule-today' : ''}">
            ${entry.list.map(g => `<a href="/a/${g.id}" target="_blank" title="${toHtmlCodes(g.name)} (${g.time.toLocaleTimeString([], {timeStyle:'short'})})">${g.name}</a>`).join('')}
          </div>
        </div>`).appendTo($('.anitracker-feed-schedule'));
      }
    }

    openModal(openNotificationsModal);
  }
  $('.anitracker-view-notif-animes').on('click', openNotifAnimesModal);

  const animeData = [];
  const queue = [...oldStorage.notifications.anime];

  openModal().then(() => {
    if (queue.length > 0) next();
    else done();
  });

  async function next() {
    if (!modalIsOpen() || !$('#anitracker-notifications-list-spinner').length) return;
    $('.anitracker-loaded-amount').text(1 + +$('.anitracker-loaded-amount').text());

    if (!queue.length) done();
    const anime = queue.shift();
    const data = await updateNotifications(anime.name);

    if (data === -1) {
      $('#anitracker-notifications-list-spinner').remove();
      $("<span>An error occurred.</span>").appendTo('#anitracker-modal-body .anitracker-modal-list');
      return;
    }
    animeData.push({
      id: anime.id,
      data: data
    });

    if (queue.length > 0) next();
    else done();
  }

  function done() {
    if (!$('#anitracker-notifications-list-spinner').length) return;
    const storage = getStorage();
    let removedAnime = 0;
    for (const anime of storage.notifications.anime) {
      if (anime.latest_episode === undefined || anime.dont_ask === true) continue;
      const time = Date.now() - new Date(anime.latest_episode + " UTC").getTime();
      if ((time / 1000 / 60 / 60 / 24 / 7) > 2) {
        const remove = confirm(`[AnimePahe Improvements]\n\nThe latest episode for ${anime.name} was more than 2 weeks ago. Remove it from the feed?\n\nThis prompt will not be shown again.`);
        if (remove === true) {
          toggleNotifications(anime.name, anime.id);
          removedAnime++;
          showMessage('Removed from feed');
        }
        else {
          anime.dont_ask = true;
          saveData(storage);
        }
      }
    }
    if (removedAnime > 0) {
      openNotificationsModal();
      return;
    }
    $('#anitracker-notifications-list-spinner').remove();
    storage.notifications.episodes.sort((a,b) => a.time < b.time ? 1 : -1);
    storage.notifications.lastUpdated = Date.now();
    saveData(storage);
    if (!storage.notifications.episodes.length) {
      $("<span>Nothing here yet!</span>").appendTo('#anitracker-modal-body .anitracker-modal-list');
    }
    else addToList(20);
  }

  function addToList(num) {
    const storage = getStorage();
    const index = currentNotificationIndex;
    for (let i = currentNotificationIndex; i < storage.notifications.episodes.length; i++) {
      const ep = storage.notifications.episodes[i];
      if (!ep) break;
      currentNotificationIndex++;
      const data = animeData.find(a => a.id === ep.animeId)?.data;
      if (!data) {
        console.error(`[AnimePahe Improvements] Could not find corresponding anime "${ep.animeName}" with ID ${ep.animeId} (episode ${ep.episode})`);
        continue;
      }

      const releaseTime = new Date(ep.time + " UTC");
      const elem = $(`
      <div class="anitracker-big-list-item anitracker-notification-item${ep.watched ? "" : " anitracker-notification-item-unwatched"} anitracker-temp" anime-data="${data.id}" episode-data="${ep.episode}">
        <a href="/play/${data.session}/${ep.session}" target="_blank" title="${toHtmlCodes(data.title)}">
          <div class="anitracker-image-wrapper">
            <img src="${getSmallPosterUrl(data.poster)}" referrerpolicy="no-referrer" alt="[Thumbnail of ${toHtmlCodes(data.title)}]"}>
          </div>
          <i class="fa ${ep.watched ? 'fa-eye-slash' : 'fa-eye'} anitracker-watched-toggle" tabindex="0" aria-hidden="true" title="Mark this episode as ${ep.watched ? 'unwatched' : 'watched'}"></i>
          <div class="anitracker-main-text">${data.title}</div>
          <div class="anitracker-subtext">Episode <span class="anitracker-episode-text">${ep.episode}</span></div>
          <div class="anitracker-subtext">${timeSince(releaseTime)} ago (${releaseTime.toLocaleDateString()})</div>
        </a>
      </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list');

      if (storage.settings.relativeEpNums) {
        getFirstEpisode(data.session).then(firstEp => {
          elem.find('.anitracker-episode-text').text(getRelativeEpisodeNum(ep.episode, firstEp));
        });
      }
      if (i >= index+num) break;
    }

    $('.anitracker-notification-item.anitracker-temp').on('click', (e) => {
      $(e.currentTarget).find('a').blur();
    });

    $('.anitracker-notification-item.anitracker-temp .anitracker-watched-toggle').on('click keydown', (e) => {
      if (e.type === 'keydown' && e.key !== "Enter") return;
      e.preventDefault();
      const storage = getStorage();
      const elem = $(e.currentTarget);
      const parent = elem.parents().eq(1);
      const animeId = +parent.attr('anime-data');
      const episode = +parent.attr('episode-data');
      const ep = storage.notifications.episodes.find(a => a.animeId === animeId && a.episode === episode);
      if (ep === undefined) {
        console.error("[AnimePahe Improvements] couldn't mark episode as watched/unwatched");
        return;
      }
      parent.toggleClass('anitracker-notification-item-unwatched');
      elem.toggleClass('fa-eye').toggleClass('fa-eye-slash');

      if (e.type === 'click') elem.blur();

      ep.watched = !ep.watched;
      elem.attr('title', `Mark this episode as ${ep.watched ? 'unwatched' : 'watched'}`);

      saveData(storage);

      if (ep.watched) {
        addWatched(animeId, episode, storage);
      }
      else {
        removeWatched(animeId, episode, storage);
      }

      if (isAnime() && getAnimeId(getAnimeSessionFromUrl()) === animeId) updateEpisodePages();
    });

    $('.anitracker-notification-item.anitracker-temp').removeClass('anitracker-temp');

  }

  addModalEvent($('#anitracker-modal-body'), 'scroll', function() {
    if ($(this).scrollTop() < this.scrollTopMax) return;
    if (!$('.anitracker-view-notif-animes').length) return;
    addToList(20);
  });
}

$('.anitracker-header-notifications').on('click', openNotificationsModal);

// Format: [name, bg_color, text_color, ordering]
const statuses = {
  watching: ['Watching', '#109d4e', '#86ccb2', 0],
  planning_to_watch: ['Planning to Watch', '#a95cbd', '#e08ef5', 1],
  on_hold: ['On Hold', '#ca9c30', '#f5d98e', 2],
  completed: ['Completed', 'rgb(62, 62, 176)', '#8383ee', 3],
}
const defaultStatus = 'watching';
function getStatusAttributes(status) {
  return statuses[status] ?? statuses[defaultStatus];
}

function openBookmarksModal() {
  $('#anitracker-modal-body').empty();
  const storage = getStorage();

  function isReversed() {
    return $('.anitracker-reverse-order-button').attr('dir') === 'up';
  }

  let layout = storage.settings.bookmarkLayout;
  let sort = storage.settings.bookmarkSort;
  $(`
  <h4>Bookmarks</h4>
  <div style="display: flex;gap: 8px;flex-wrap: wrap;">
    <div class="btn-group">
      <input autocomplete="off" class="form-control anitracker-text-input-bar anitracker-modal-search" placeholder="Search">
      <button dir="down" class="btn btn-secondary dropdown-toggle anitracker-reverse-order-button anitracker-list-btn" title="Sort direction (down is default)"></button>
    </div>
    <div class="btn-group anitracker-sort-method-btns">
      <button data-sort="recent" class="btn btn-secondary" title="Sort by recently added" ${sort === 'recent' ? 'disabled' : ''}><i class="fa fa-history" aria-hidden="true"></i></button>
      <button data-sort="alphabetical" class="btn btn-secondary" title="Sort alphabetically" ${sort === 'alphabetical' ? 'disabled' : ''}><i class="fa fa-sort-alpha-down" aria-hidden="true"></i></button>
      <button data-sort="status" class="btn btn-secondary" title="Sort by watching status" ${sort === 'status' ? 'disabled' : ''}><i class="fa fa-list-alt" aria-hidden="true"></i></button>
    </div>
    <div class="btn-group anitracker-layout-btns">
      <button data-layout="list" class="btn btn-secondary" title="Use list layout" ${layout === 'list' ? 'disabled' : ''}><i class="fa fa-list" aria-hidden="true"></i></button>
      <button data-layout="grid" class="btn btn-secondary" title="Use grid layout" ${layout === 'grid' ? 'disabled' : ''}><i class="fa fa-th-large" aria-hidden="true"></i></button>
    </div>
    ${storage.bookmarks.length ?`
    <div style="flex-grow: 1;">
      <button class="btn btn-secondary anitracker-share-bookmarks-button" style="height: 40px;float: right;margin-right: 5px;" title="Share the bookmark list"><i aria-hidden="true" class="fa fa-share"></i></button>
    </div>
    <div class="dropdown-menu anitracker-dropdown-content anitracker-share-bookmarks-dropdown" style="display:hidden;">
      <span>Share through</span>
      <button title="Share the bookmark list as an image" data-action="image"><i class="fa fa-image" aria-hidden="true"></i>Image</button>
      <button title="Share the bookmark list as a text file" data-action="text"><i class="fa fa-file" aria-hidden="true"></i>Text</button>
    </div>` : ''}
  </div>
  <div class="anitracker-modal-list-container" style="margin-top: 5px;">
    <div class="anitracker-modal-list" style="min-height: 100px;min-width: 200px;">
    </div>
  </div>
  `).appendTo('#anitracker-modal-body');
  if (!isMobileOrTablet()) setTimeout(() => {
    $('.anitracker-modal-search').focus();
  }, 0);

  function sortEntries(entries) {
    if (sort === 'alphabetical') entries.sort((a,b) => a.name < b.name ? 1 : -1);
    else if (sort === 'status') entries.sort((a, b) => getStatusAttributes(a.status)[3] < getStatusAttributes(b.status)[3] ? 1 : -1)
    if (!isReversed()) entries.reverse();
  }

  function layoutEntries(storage = getStorage(), goToTop = true) {
    $('.anitracker-modal-list').empty();

    const entries = [...storage.bookmarks];
    sortEntries(entries);

    if (layout === 'list') {
      $('.anitracker-modal-list').removeClass('flex');
      entries.forEach(g => {
        const statusAttrs = getStatusAttributes(g.status);

        const elem = $(`
        <div class="anitracker-modal-list-entry anitracker-bookmark-list-entry" animeid="${g.id}">
          ${g.newlyAdded ? '<i class="anitracker-bookmark-new"></i>' : ''}
          <a href="/a/${g.id}" target="_blank" title="${toHtmlCodes(g.name)}">
            ${g.name}
          </a><br>
          <div>
            <button class="anitracker-bookmark-list-status anitracker-change-status-button" style="color:${statusAttrs[2]};" title="Change bookmark watching status">${statusAttrs[0]}</button>
            <button class="btn btn-dark anitracker-flat-button anitracker-remove-bookmark-button" title="Remove this bookmark" style="vertical-align: center;">
              <i class="fa fa-trash" aria-hidden="true"></i>
              <span>Remove</span>
            </button>
          </div>
        </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list');
      });
    }
    else {
      $('.anitracker-modal-list').addClass('flex');
      entries.forEach(g => {
        const statusAttrs = getStatusAttributes(g.status);

        const elem = $(`
        <div class="anitracker-modal-list-entry anitracker-bookmark-grid-entry" animeid="${g.id}">
          <a href="/a/${g.id}" target="_blank" title="${toHtmlCodes(g.name)}">
            ${g.newlyAdded ? '<i class="anitracker-bookmark-new"></i>' : ''}
            <div class="anitracker-big-poster-icon">
              <img src="${g.posterUrl ? `https://i.${window.location.host}/${g.posterUrl}` : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='}" loading="lazy">
            </div>
            ${g.name}
          </a>
          <div style="display: flex;flex-direction: column;gap: 2px;">
            <button class="anitracker-bookmark-grid-status anitracker-change-status-button" style="color:${statusAttrs[2]};" title="Change bookmark watching status">${statusAttrs[0]}</button>
            <button class="btn btn-dark anitracker-flat-button anitracker-remove-bookmark-button" title="Remove this bookmark">
              <i class="fa fa-trash" aria-hidden="true"></i>
              Remove
            </button>
          </div>
        </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list');

        elem.find('img').on('load', function() {$(this).css('opacity', '1')});
        if (g.posterUrl === undefined) {
          getBookmarkImage(elem, g);
          return;
        }
        elem.find('img').on('error', function() {
          getBookmarkImage(elem, g);
          $(this).off('error');
        });

      });
    }

    if (goToTop) scrollModalToTop();

    $(`
    <div class="dropdown-menu anitracker-dropdown-content anitracker-status-dropdown" style="width:13.3em;display:none;"></div>
    `).appendTo('.anitracker-modal-list');

    Object.entries(statuses).forEach(e => { $(`<button class="btn btn-dark anitracker-flat-button anitracker-status-button" title="Change watching status to ${e[1][0]}" style="background-color: ${e[1][1]};width:100%;" data-value="${e[0]}">
      ${e[1][0]}
    </button>`).appendTo('.anitracker-status-dropdown')});

    // Apply button events
    $('.anitracker-modal-list-entry .anitracker-change-status-button').on('click', (e) => {
      openDropdown($(e.currentTarget));
    });

    $('.anitracker-modal-list-entry .anitracker-remove-bookmark-button').on('click', function() {
      removeBookmark(+$(this).parents().eq(1).attr('animeid'));
      layoutEntries(getStorage(), false);
      showMessage('Bookmark removed');
    });

    $('.anitracker-status-dropdown button').on('click', function() {
      const pressed = $(this);
      const status = pressed.data('value');
      const id = +pressed.parent().data('id');

      setBookmarkStatus(id, status);

      layoutEntries(getStorage(), sort === 'status');
    }).on('blur', function() {
      setTimeout(() => {
        if (!$('.anitracker-status-dropdown button').is(':focus')) $(this).parent().hide();
      }, 0);
    });

    $('.anitracker-modal-list-entry').on('mouseenter focus', function() {
      const elem = $(this).find('.anitracker-bookmark-new');
      if (!elem.length) return;
      setTimeout(() => {
        playAnimation(elem, 'fadeIn', 0.5, 'reverse').then(() => {
          elem.remove();
        });
      }, 1500);
    });
  }
  // layoutEntries end

  // Other events
  $('.anitracker-modal-search').on('input', (e) => {
    setTimeout(() => {
      const query = $(e.target).val().toLowerCase();
      for (const entry of $('.anitracker-modal-list-entry')) {
        if ($($(entry).find('a,span')[0]).text().toLowerCase().includes(query)) {
          $(entry).show();
        }
        else $(entry).hide();
      }
    }, 10);
  });

  $('.anitracker-reverse-order-button').on('click', (e) => {
    const btn = $(e.currentTarget);
    if (btn.attr('dir') === 'down') {
      btn.attr('dir', 'up');
      btn.addClass('anitracker-up');
    }
    else {
      btn.attr('dir', 'down');
      btn.removeClass('anitracker-up');
    }

    layoutEntries();
  });

  $('.anitracker-layout-btns>button').on('click', (e) => {
    const elem = $(e.currentTarget);
    layout = elem.data('layout');

    const currentStorage = getStorage();
    currentStorage.settings.bookmarkLayout = layout;
    saveData(currentStorage);
    layoutEntries(currentStorage);

    elem.parent().children().prop('disabled', false);
    elem.prop('disabled', true);
  });

  $('.anitracker-sort-method-btns>button').on('click', (e) => {
    const elem = $(e.currentTarget);
    sort = elem.data('sort');

    const currentStorage = getStorage();
    currentStorage.settings.bookmarkSort = sort;
    saveData(currentStorage);
    layoutEntries(currentStorage);

    elem.parent().children().prop('disabled', false);
    elem.prop('disabled', true);
  });

  $('.anitracker-share-bookmarks-button').on('click', function() {
    const elem = $(this);
    const dropdown = $('.anitracker-share-bookmarks-dropdown');
    const top = elem.position().top + elem.outerHeight(true);
    const left = elem.position().left - (dropdown.width() - elem.outerWidth(true));

    if (dropdown.is(':visible')) {
      dropdown.hide();
      return;
    }
    dropdown.css('top',top).css('left',left);
    dropdown.show();
    dropdown.scrollTop(0);

    elem.on('blur', () => {
      setTimeout(() => {
        if (!$('.anitracker-share-bookmarks-button, .anitracker-share-bookmarks-dropdown button').is(':focus')) dropdown.hide();
      }, 100);
    });
  });

  $('.anitracker-share-bookmarks-dropdown button').on('click', async function() {
    const elem = $(this);
    elem.parent().hide();
    const action = elem.data('action');
    if (action === 'image') {
      if ($('#anitracker-share-bookmarks-spinner').length) return;

      const btn = $('.anitracker-share-bookmarks-button');
      btn.off();
      btn.css('padding', '.2em');
      btn.html(`
      <div id="anitracker-share-bookmarks-spinner" class="anitracker-text-spinner anitracker-spinner">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <span>0%</span>
      </div>`);
      if (layout === 'grid') {
        $('.anitracker-bookmark-grid-entry img').attr('loading', 'eager');
        const total = $('.anitracker-bookmark-grid-entry img').length;
        for (let i = 0; i < total; i++) {
          $('#anitracker-share-bookmarks-spinner>span').text(`${Math.floor((i/total)*99)}%`);
          const img = $('.anitracker-bookmark-grid-entry img')[i];
          if (img.complete) continue;
          await new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
      }

      $.anitrackerCachedScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js', function() {
        if (!modalIsOpen() || !$('.anitracker-share-bookmarks-button').length) return; // If no longer in the right menu

        $('.anitracker-remove-bookmark-button').remove();
        const prevWidth = $('.anitracker-modal-list-container').width();
        if (layout === 'grid') {
          let width = 0;
          for (const elem of $('.anitracker-bookmark-grid-entry')) {
            width += $(elem).width();
          }
          $('.anitracker-modal-list-container').css('width', Math.min(width, 2400) + 'px');
        }
        else if (layout === 'list') {
          $('.anitracker-bookmark-list-entry').css('border', '2px solid var(--secondary)').css('border-radius','5px').css('padding', '5px').css('margin', '2px');
        }
        $('.anitracker-modal-list-container').css('border-radius', '24px');
        $('.anitracker-modal-list a').css('color', '#fff').css('text-decoration', 'none');

        html2canvas($('.anitracker-modal-list-container')[0], { allowTaint:true, scale:0.8, backgroundColor:null }).then(function(canvas) {
          $('.anitracker-spinner').remove();
          $(`
          <h4>Share Result</h4>
          <p class="anitracker-secondary-info">Right-click or hold tap to save</p>
          ${layout === 'list' ? '<p class="anitracker-secondary-info"><i>Grid view is recommended over list view</i></p>' : ''}
          <div id="anitracker-bookmark-share-result"></div>`).appendTo('#anitracker-modal-body');
          $(canvas).css('height', '100%').css('width', '').appendTo('#anitracker-bookmark-share-result');
          $('#anitracker-bookmark-share-result').css('max-width', Math.min($(canvas).width(), prevWidth));
          scrollModalToTop();
        });
        $('#anitracker-modal-body').empty();
        $(`
        <div class="anitracker-spinner">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>`).appendTo('#anitracker-modal-body');
        openModal(openBookmarksModal);
      }).fail(() => {
        console.error("[AnimePahe Improvements] html2canvas failed to load");
        $('#anitracker-modal-body').empty();
        $('<span style="color:var(--danger)">Failed to load!</span>').appendTo('#anitracker-modal-body');
        openModal(openBookmarksModal);
      });
    }
    else if (action === 'text') {
      const storage = getStorage();
      const entries = [...storage.bookmarks];
      sortEntries(entries);

      download('bookmarks-list.txt', entries.map(a => `${a.name} - ${getStatusAttributes(a.status)[0]}\n`).join(''));
    }
  });

  addModalEvent($('#anitracker-modal-body'), 'scroll', () => {
    $('#anitracker-modal-body .anitracker-dropdown-content').hide();
  });

  function openDropdown(elem, currentStatus) {
    $('.anitracker-change-status-button').off('blur').removeClass('active');
    const id = elem.parents().eq(1).attr('animeid');

    const dropdown = $('.anitracker-status-dropdown');
    if (dropdown.is(':visible') && dropdown.data('id') === id) {
      dropdown.hide();
      return;
    }
    elem.addClass('active');

    dropdown.insertAfter(elem);
    const top = Math.min(window.innerHeight - dropdown.outerHeight(true), elem.position().top + elem.outerHeight(true));
    const left = elem.position().left;

    dropdown.css('top',top).css('left',left);
    dropdown.show();
    dropdown.scrollTop(0);
    dropdown.data('id', id);

    elem.on('blur', () => {
      elem.removeClass('active');
      setTimeout(() => {
        if (!$('.anitracker-change-status-button, .anitracker-status-dropdown button').is(':focus')) dropdown.hide();
      }, 100);
    });
  }
  if (!storage.bookmarks.length) {
    $(`<span style="display: block;">No bookmarks yet!</span>`).appendTo('#anitracker-modal-body .anitracker-modal-list');
  }
  else {
    layoutEntries(storage);
    storage.bookmarks.forEach(b => {delete b.newlyAdded;});
    saveData(storage);
  }

  openModal();
}

function getBookmarkImage(elem, g) {
  $(`
  <div class="anitracker-spinner-parent" style="position: relative;">
    <div class="anitracker-spinner anitracker-center-content" style="position: absolute;width: 100%;align-items: center;aspect-ratio: 1;">
      <div class="spinner-border" role="status" style="">
        <span class="sr-only">Loading...</span>
      </div>
  </div></div>`).prependTo(elem);

  setTimeout(async () => {
    let poster;
    const animeData = await asyncGetAnimeData(g.name, g.id);
    elem.find('.anitracker-spinner-parent').remove();
    if (animeData) poster = animeData.poster;
    else {
      const page = await asyncGetPage(`/a/${g.id}`);
      poster = $(page.find('.anime-poster img')[0]).data('src').replace('.md','');
    }

    if (!poster) return;
    poster = poster.split('/').slice(3).join('/').split('.');
    poster.splice(poster.length - 1, 0, 'md');
    poster = poster.join('.');

    elem.find('img').attr('src', `https://i.${window.location.host}/${poster}`);

    const currentStorage = getStorage();
    const found = currentStorage.bookmarks.find(b => b.name === g.name && b.id === g.id);
    if (!found) return;
    found.posterUrl = poster;
    saveData(currentStorage);
  }, 0);
}

function openBookmarkStatusEditModal(id, adding=false) {
  const storage = getStorage();
  const entry = storage.bookmarks.find(a => a.id === id) ?? {
    id: id,
    name: getAnimeName(),
    status: 'watching'
  };
  const limitReached = storage.bookmarks.length >= getStorageLimits().bookmarks;

  $('#anitracker-modal-body').empty();

  const status = entry.status ?? defaultStatus;
  const statusAttrs = getStatusAttributes(entry.status);

  $(`
  <div style="display:flex;gap:10px;">
    <div class="anitracker-bookmark-edit-side" style="max-width:12em;">
      <div><span style="display:inline-block;width:100%;">${entry.name}</span></div>
      <button class="btn dropdown-toggle btn-secondary anitracker-status-dropdown-button" data-bs-toggle="dropdown" data-toggle="dropdown" data-value="${status}" title="Select anime watching status" style="background-color: ${statusAttrs[1]};width:100%;display:block;margin-bottom:16px;">${statusAttrs[0]}</button>
      <div class="dropdown-menu anitracker-dropdown-content anitracker-status-dropdown" style="width:12em;"></div>
    </div>
    <div class="anitracker-image-wrapper anitracker-big-poster-icon" style="width:9em;height:9em;">
      <img src="${entry.posterUrl ? `https://i.${window.location.host}/${entry.posterUrl}` : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='}" loading="lazy">
    </div>
  </div>
  `).appendTo('#anitracker-modal-body');

  Object.entries(statuses).forEach(e => { $(`<button class="btn btn-dark anitracker-flat-button anitracker-status-button" title="Change watching status to ${e[1][0]}" style="background-color: ${e[1][1]};width:100%;" data-value="${e[0]}">
    ${e[1][0]}
  </button>`).appendTo('.anitracker-status-dropdown')});

  $('.anitracker-status-dropdown button').on('click', (e) => {
    const pressed = $(e.target);
    const btn = pressed.parents().eq(1).find('.anitracker-status-dropdown-button');
    btn.data('value', pressed.data('value'));
    btn.text(pressed.text());
    btn.css('background-color', pressed.css('background-color'));

    entry.status = pressed.data('value');
    if (adding) return;

    setBookmarkStatus(id, entry.status);
  });

  if (adding) {
    $(`
    ${limitReached ? '<span style="color: var(--danger);">You already have too many bookmarks</span>' : ''}
    <button class="btn btn-secondary anitracker-flat-button anitracker-confirm-button" title="Add bookmark" style="width:100%;" ${limitReached ? 'disabled' : ''}>
      <i class="fa fa-bookmark" aria-hidden="true"></i>
      &nbsp;Add Bookmark
    </button>`).appendTo('.anitracker-bookmark-edit-side');
    $('#anitracker-modal-body .anitracker-confirm-button').on('click', (e) => {
      if (limitReached) return;
      const obj = {
        status: entry.status
      }
      if (entry.posterUrl) obj.posterUrl = entry.posterUrl;

      addBookmark(id, entry.name, obj);
      showMessage('Bookmark added!');

      closeModal();
    });
  }
  else {
    $(`
    <button class="btn btn-danger anitracker-flat-button anitracker-delete-button" title="Remove this bookmark" style="width:100%;">
      <i class="fa fa-trash" aria-hidden="true"></i>
      &nbsp;Remove
    </button>`).appendTo('.anitracker-bookmark-edit-side');
    $('#anitracker-modal-body .anitracker-delete-button').on('click', (e) => {
      removeBookmark(id);
      showMessage('Bookmark removed');

      closeModal();
    });
  }

  openModal();

  const imgElem = $('.anitracker-image-wrapper');
  imgElem.find('img').on('load', function() {
    $(this).css('opacity', '1');
    entry.posterUrl = new URL($(this).attr('src')).pathname;
  });
  if (entry.posterUrl === undefined) {
    getBookmarkImage(imgElem, entry);
    return;
  }
  imgElem.find('img').on('error', () => {getBookmarkImage(imgElem, entry)});
}

$('.anitracker-header-bookmark').on('click', openBookmarksModal);

function addBookmark(id, name, additionalData = {}) {
  const storage = getStorage();
  if (storage.bookmarks.length >= getStorageLimits().bookmarks) return;
  if (storage.bookmarks.find(g => g.id === +id)) return;

  const obj = {
    id: +id,
    name: name,
    newlyAdded: true,
  }
  for (const [key, value] of Object.entries(additionalData)) {
    obj[key] = value;
  }

  if (isSyncEnabled(storage)) {
    storage.sync.temp.addedData.push({type: 'bookmarks', id: +id});
  }

  storage.bookmarks.push(obj);
  saveData(storage);

  if (!isAnime()) return;
  if (getAnimeId(getAnimeSessionFromUrl()) === +id) {
    $('.anitracker-bookmark-toggle .anitracker-title-icon-check').show();
  }
}

function removeBookmark(id) {
  const storage = getStorage();
  if (!storage.bookmarks.find(g => g.id === +id)) return;

  if (isSyncEnabled(storage)) {
    storage.sync.temp.removedData.push({type: 'bookmarks', id: +id});
  }

  storage.bookmarks = storage.bookmarks.filter(g => g.id !== +id);
  saveData(storage);

  if (!isAnime()) return;
  if (getAnimeId(getAnimeSessionFromUrl()) === +id) {
    $('.anitracker-bookmark-toggle .anitracker-title-icon-check').hide();
  }
}

function setBookmarkStatus(id, status) {
  const storage = getStorage();
  const found = storage.bookmarks.find(a => a.id === id);
  if (!found) return;
  if (found.status === status) return;

  if (isSyncEnabled(storage)) {
    storage.sync.temp.addedData.push({type: 'updated_bookmark', id: id});
  }

  found.status = status;
  saveData(storage);
}

function toggleNotifications(name, id = undefined) {
  const storage = getStorage();
  const found = (() => {
    if (id) return storage.notifications.anime.find(g => g.id === id);
    else return storage.notifications.anime.find(g => g.name === name);
  })();

  if (found) {
    if (isSyncEnabled(storage)) {
      storage.sync.temp.removedData.push({type: 'notification_anime', name: found.name});
    }

    const index = storage.notifications.anime.indexOf(found);
    storage.notifications.anime.splice(index, 1);

    storage.notifications.episodes = storage.notifications.episodes.filter(a => a.animeName !== found.name); // Uses the name, because old data might not be updated to use IDs

    saveData(storage);

    return false;
  }
  if (storage.notifications.anime.length >= getStorageLimits().notifications.anime) return;

  if (isSyncEnabled(storage)) {
    storage.sync.temp.addedData.push({type: 'notification_anime', name: name});
  }

  storage.notifications.anime.push({
    name: name,
    id: getAnimeId(getAnimeSessionFromUrl()),
    updateFrom: Date.now()
  });
  saveData(storage);

  return true;
}

async function updateNotifications(animeName, storage = getStorage()) {
  const nobj = storage.notifications.anime.find(g => g.name === animeName);
  if (nobj === undefined) {
    toggleNotifications(animeName);
    return;
  }
  let data = await asyncGetAnimeData(animeName, nobj.id);
  if (!data) data = await getDataFromAnimeId(nobj.id);
  if (!data) return -1;
  const episodes = await getAllEpisodes(data.session, 'desc');
  if (episodes === undefined) return 0;

  return new Promise((resolve, reject) => {
    if (!episodes.length) resolve(undefined);

    if (storage.settings.relativeEpNums) {
      siteVars.cached.firstEpisode[data.session] = episodes[episodes.length - 1].episode;
    }

    nobj.latest_episode = episodes[0].created_at;

    if (nobj.name !== data.title) {
      for (const ep of storage.notifications.episodes) {
        if (ep.animeName !== nobj.name) continue;
        ep.animeName = data.title;
      }
      nobj.name = data.title;
    }

    const compareUpdateTime = nobj.updateFrom ?? storage.notifications.lastUpdated;
    if (nobj.updateFrom !== undefined) delete nobj.updateFrom;

    const watched = decodeWatched(storage.watched);

    let hasFirstEpisode = false;

    for (const ep of episodes) {
      const epWatched = isWatched(nobj.id, ep.episode, watched);

      const found = storage.notifications.episodes.find(a => a.episode === ep.episode && (a.animeId === nobj.id || a.animeName === data.title));
      if (found) {
        found.session = ep.session;
        if (!found.watched) found.watched = epWatched;
        if (found.animeId === undefined) found.animeId = nobj.id;

        // The list is backwards, so the first episode is at the end of it
        if (ep.episode === episodes[episodes.length - 1].episode) hasFirstEpisode = true;
        continue;
      }

      if (new Date(ep.created_at + " UTC").getTime() < compareUpdateTime) {
        continue;
      }

      storage.notifications.episodes.push({
        animeName: nobj.name,
        animeId: nobj.id, // Anime entries had ID in first iteration, but episode entries did not
        session: ep.session,
        episode: ep.episode,
        time: ep.created_at,
        watched: epWatched
      });
    }

    nobj.hasFirstEpisode = hasFirstEpisode;

    const limit = getStorageLimits().notifications.episodes;
    if (storage.notifications.episodes.length > limit) {
      storage.notifications.episodes = storage.notifications.episodes.slice(0, limit);
    }

    saveData(storage);

    if (!data.id) data.id = nobj.id;
    resolve(data);
  });
}

const paramArray = Array.from(new URLSearchParams(window.location.search));

const refArg01 = paramArray.find(a => a[0] === 'ref');
if (refArg01 !==  undefined) {
  const ref = refArg01[1];
  if (ref === '404') {
    alert('[AnimePahe Improvements]\n\nThe session was outdated, and has been refreshed. Please try that link again.');
  }
  else if (ref === 'customlink' && isEpisode() && initialStorage.settings.autoDelete) {
    const name = getAnimeName();
    const num = getEpisodeNum();
    if (initialStorage.linkList.find(e => e.animeName === name && e.type === 'episode' && e.episodeNum !== num)) { // If another episode is already stored
      $(`
        <span style="display:block;width:100%;text-align:center;" class="anitracker-from-share-warning">
          Due to coming from a share link, the current episode data for this anime was not replaced.
          <br>Refresh this page to replace it.
          <br><span class="anitracker-text-button" tabindex="0">Dismiss</span>
        </span>`).prependTo('.content-wrapper');

      $('.anitracker-from-share-warning>span').on('click keydown', function(e) {
        if (e.type === 'keydown' && e.key !== "Enter") return;
        $(e.target).parent().remove();
      });
    }
  }

  window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  return Math.trunc(month/3);
}

function getFiltersFromParams(params) {
  const filters = [];
  for (const [key, value] of params.entries()) {
    const inputFilters = value.split(',');  // Get all filters of this filter type
    for (const filter of inputFilters) {
      if (filterRules[key] === undefined) continue;

      const exclude = filter.startsWith('!');
      if (key === 'season' && seasonFilterRegex.test(filter)) {
        const parts = seasonFilterRegex.exec(filter);
        if (!parts.includes(undefined) && ![parseInt(parts[2]),parseInt(parts[4])].includes(NaN)) {
          filters.push({
            type: 'season',
            value: {
              from: { season: getSeasonValue(parts[1]), year: parseInt(parts[2]) },
              to: { season: getSeasonValue(parts[3]), year: parseInt(parts[4]) }
            },
            exclude: exclude
          });
        }
        continue;
      }

      filters.push({
        type: key,
        value: filter.replace(/^!/,''),
        exclude: exclude
      });
    }
  }
  return filters;
}

function getSearchParamsString(params) {
  if (!Array.from(params.entries()).length) return '';
  return '?' + decodeURIComponent(params.toString());
}

// MARKER:ANIME INDEX PAGE
function loadIndexPage() {
  const animeList = getAnimeList();
  filterSearchCache['/anime'] = JSON.parse(JSON.stringify(animeList));

  $(`
  <div class="anitracker-index">

    <div class="anitracker-filter-input" data-filter-type="genre">
      <button class="anitracker-filter-rules" title="Change filter logic" data-filter-type="genre"><i class="fa fa-sliders"></i></button>
      <div>
        <div data-filter-type="genre" class="anitracker-applied-filters"></div><span data-filter-type="genre" role="textbox" contenteditable="" spellcheck="false" class="anitracker-text-input"></span>
      </div>
    </div>

    <div class="anitracker-filter-input" data-filter-type="theme">
      <button class="anitracker-filter-rules" title="Change filter logic" data-filter-type="theme"><i class="fa fa-sliders"></i></button>
      <div>
        <div data-filter-type="theme" class="anitracker-applied-filters"></div><span data-filter-type="theme" role="textbox" contenteditable="" spellcheck="false" class="anitracker-text-input"></span>
      </div>
    </div>

    <div class="anitracker-filter-input" data-filter-type="type">
      <button class="anitracker-filter-rules" title="Change filter logic" data-filter-type="type"><i class="fa fa-sliders"></i></button>
      <div>
        <div data-filter-type="type" class="anitracker-applied-filters"></div><span data-filter-type="type" role="textbox" contenteditable="" spellcheck="false" class="anitracker-text-input"></span>
      </div>
    </div>

    <div class="anitracker-filter-input" data-filter-type="demographic">
      <button class="anitracker-filter-rules" title="Change filter logic" data-filter-type="demographic"><i class="fa fa-sliders"></i></button>
      <div>
        <div data-filter-type="demographic" class="anitracker-applied-filters"></div><span data-filter-type="demographic" role="textbox" contenteditable="" spellcheck="false" class="anitracker-text-input"></span>
      </div>
    </div>

    <div style="margin-left: auto;">
      <div class="btn-group">
        <button class="btn dropdown-toggle btn-dark" id="anitracker-status-button" data-bs-toggle="dropdown" data-toggle="dropdown" title="Choose status">All</button>
      </div>

      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-time-search-button" title="Set season filter">
          <svg fill="#ffffff" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" aria-hidden="true">
            <path d="M256,0C114.842,0,0,114.842,0,256s114.842,256,256,256s256-114.842,256-256S397.158,0,256,0z M374.821,283.546H256
                     c-15.148,0-27.429-12.283-27.429-27.429V137.295c0-15.148,12.281-27.429,27.429-27.429s27.429,12.281,27.429,27.429v91.394h91.392
                     c15.148,0,27.429,12.279,27.429,27.429C402.249,271.263,389.968,283.546,374.821,283.546z"/>
          </svg>
        </button>
      </div>
    </div>

  <div id="anitracker-filter-dropdown-container"></div>
  </div>
  <div class="anitracker-index-lower">
    <span style="font-size: 1.2em;color:#ddd;" id="anitracker-filter-result-count">Filter results: <span>${animeList.length}</span></span>
    <div>
      <div class="btn-group">
        <span id="anitracker-reset-filters" title="Reset filters" class="anitracker-text-button" style="margin-right: 10px;" tabindex="0"><i aria-hidden="true" class="fa fa-rotate-right"></i>&nbsp;Reset</span>
      </div>
      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-apply-filters" title="Apply selected filters"><i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Apply</button>
      </div>
      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-random-anime" title="Open a random anime from within the selected filters">
          <i class="fa fa-random" aria-hidden="true"></i>
          &nbsp;Random Anime
        </button>
      </div>
      <div class="btn-group">
        <input id="anitracker-anime-list-search" title="Search within applied filters" disabled="" autocomplete="off" class="form-control anitracker-text-input-bar" style="width: 150px;" placeholder="Loading...">
      </div>
    </div>
  </div>`).insertBefore('.index');

  getTrackerDiv().css('justify-content', 'center').insertAfter('.index');
  addGeneralButtons();

  function getDropdownButtons(filters, type) {
    return filters.sort((a,b) => a.name > b.name ? 1 : -1).concat({value: 'none', name: '(None)'}).map(g => $(`<button data-filter-type="${type}" data-filter-value="${g.value}">${g.name}</button>`));
  }

  $(`<div id="anitracker-genre-dropdown" tabindex="-1" data-filter-type="genre" class="dropdown-menu anitracker-dropdown-content anitracker-filter-dropdown">`).appendTo('#anitracker-filter-dropdown-container');
  getDropdownButtons(filterValues.genre, 'genre').forEach(g => { g.appendTo('#anitracker-genre-dropdown') });

  $(`<div id="anitracker-theme-dropdown" tabindex="-1" data-filter-type="theme" class="dropdown-menu anitracker-dropdown-content anitracker-filter-dropdown">`).appendTo('#anitracker-filter-dropdown-container');
  getDropdownButtons(filterValues.theme, 'theme').forEach(g => { g.appendTo('#anitracker-theme-dropdown') });

  $(`<div id="anitracker-type-dropdown" tabindex="-1" data-filter-type="type" class="dropdown-menu anitracker-dropdown-content anitracker-filter-dropdown">`).appendTo('#anitracker-filter-dropdown-container');
  getDropdownButtons(filterValues.type, 'type').forEach(g => { g.appendTo('#anitracker-type-dropdown') });

  $(`<div id="anitracker-demographic-dropdown" tabindex="-1" data-filter-type="demographic" class="dropdown-menu anitracker-dropdown-content anitracker-filter-dropdown">`).appendTo('#anitracker-filter-dropdown-container');
  getDropdownButtons(filterValues.demographic, 'demographic').forEach(g => { g.appendTo('#anitracker-demographic-dropdown') });

  $(`<div id="anitracker-status-dropdown" tabindex="-1" data-filter-type="status" class="dropdown-menu anitracker-dropdown-content anitracker-filter-dropdown special">`).insertAfter('#anitracker-status-button');
  ['all','airing','completed'].forEach(g => { $(`<button data-filter-type="status" data-filter-value="${g}">${g[0].toUpperCase() + g.slice(1)}</button>`).appendTo('#anitracker-status-dropdown') });
  $(`<button data-filter-type="status" data-filter-value="none">(No status)</button>`).appendTo('#anitracker-status-dropdown');

  const timeframeSettings = {
    enabled: false
  };

  const placeholderTexts = {
    'genre': 'Genre',
    'theme': 'Theme',
    'type': 'Type',
    'demographic': 'Demographic'
  };

  const selectedFilters = [];
  const appliedFilters = [];

  function getElemsFromFilterType(filterType) {
    const elems = {};
    if (filterType === undefined) return elems;
    for (const inp of $('.anitracker-filter-input')) {
      if ($(inp).data('filter-type') !== filterType) continue;
      elems.parent = $(inp);
      elems.filterIcons = Array.from($(inp).find('.anitracker-filter-icon'));
      elems.filterIconContainer = $(inp).find('.anitracker-applied-filters');
      elems.input = $(inp).find('.anitracker-text-input');
      elems.inputPlaceholder = $(inp).find('.anitracker-placeholder');
      elems.scrollingDiv = $(inp).find('>div');
      elems.filterRuleButton = $(inp).find('.anitracker-filter-rules');
      break;
    }
    for (const drop of $('.anitracker-filter-dropdown')) {
      if ($(drop).data('filter-type') !== filterType) continue;
      elems.dropdown = $(drop);
    }
    return elems;
  }

  function getFilterDataFromElem(jquery) {
    return {
      type: jquery.data('filter-type'),
      value: jquery.data('filter-value'),
      exclude: jquery.data('filter-exclude') === true
    };
  }

  function getInputText(elem) {
    return elem.contents().filter(function() {
      return this.nodeType === Node.TEXT_NODE;
    }).text().trim();
  }

  function clearPlaceholder(elem) {
    elem.find('.anitracker-placeholder').remove();
  }

  function addPlaceholder(elem, filterType) {
    if (getInputText(elem) !== '' || elem.find('.anitracker-placeholder').length) return;
    $(`<span data-filter-type="${filterType}" class="anitracker-placeholder">${placeholderTexts[filterType]}</span>`).prependTo(elem);
  }

  function setChangesToApply(on) {
    const elem = $('#anitracker-apply-filters');
    if (on) elem.replaceClass('btn-dark', 'btn-primary');
    else elem.replaceClass('btn-primary', 'btn-dark');
  }

  function updateApplyButton() {
    setChangesToApply(JSON.stringify(selectedFilters) !== JSON.stringify(appliedFilters) || getChangedRulesList(filterRules).length);
  }

  function showDropdown(elem, parentElem) {
    for (const type of Object.keys(filterRules)) {
      const elems = getElemsFromFilterType(type);
      if (!elems.dropdown || !elems.dropdown.length || elems.dropdown.hasClass('special')) continue;
      elems.dropdown.hide();
    }

    const top = $(parentElem).position().top + $(parentElem).outerHeight(true);
    const left = $(parentElem).position().left;
    elem.css('top',top).css('left',left);
    elem.show();
    elem.scrollTop(0);
  }

  function checkCloseDropdown(elems) {
    setTimeout(() => {
      if (elems.dropdown.is(':focus,:focus-within') || elems.input.is(':focus')) return;
      elems.dropdown.hide();
    }, 1);
  }

  function fixSelection(elem) {
    const sel = window.getSelection();
    if (!$(sel.anchorNode).is('div')) return;

    setSelection(elem);
  }

  function setSelection(elem) {
    const sel = window.getSelection();
    elem.focus();

    const index = elem.text().length - 1 - elem.find('.anitracker-placeholder').text().length - 1;
    const range = document.createRange();
    range.setStart(elem[0], index > 0 ? index : 0);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
  }

  function scrollToBottom(elem) {
    elem.scrollTop(9999);
  }

  ['genre','theme','type','demographic'].forEach((type) => {
    const elems = getElemsFromFilterType(type);
    addPlaceholder(elems.input, type);
    elems.input.css('width','100%').css('height','100%');
  });

  function getActiveFilter(filter) {
    return selectedFilters.find(f => f.type === filter.type && f.value === filter.value && f.exclude === filter.exclude);
  }

  function refreshIconSymbol(elem) {
    const excluded = elem.data('filter-exclude');
    elem.find('i').remove();
    if (excluded === undefined) return;
    $(`<i class="fa fa-${excluded ? 'minus' : 'plus'}"></i>`).prependTo(elem);
  }

  function setStatusFilter(filter) {
    for (const filter of selectedFilters.filter(f => f.type === 'status')) {
      selectedFilters.splice(selectedFilters.indexOf(filter), 1);
    }

    for (const btn of $('#anitracker-status-dropdown>button')) {
      const elem = $(btn);
      const filterValue = elem.data('filter-value');
      if (filterValue !== filter.value) {
        elem.removeClass('anitracker-active');
        continue;
      }
      $('#anitracker-status-button').text(elem.text());
      if (filterValue !== 'all') elem.addClass('anitracker-active');
    }

    if (filter.value !== 'all') selectedFilters.push(filter);

    if (filter.value === 'all') $('#anitracker-status-button').removeClass('anitracker-active');
    else $('#anitracker-status-button').addClass('anitracker-active');
  }

  function addFilter(filter) {
    if (filter.type === 'season') {
      addSeasonFilter(filter);
      return;
    }
    if (filter.type === 'status') {
      setStatusFilter(filter);
      return;
    }

    const elems = getElemsFromFilterType(filter.type);
    elems.parent?.addClass('active');
    elems.input?.css('width','').css('height','');
    if (elems.input !== undefined) clearPlaceholder(elems.input);
    if (getActiveFilter(filter) !== undefined || filterValues[filter.type] === undefined) return;
    const filterEntry = filterValues[filter.type].find(f => f.value === filter.value);
    const name = (() => {
      if (filter.value === 'none') return '(None)';
      else return filterEntry !== undefined ? filterEntry.name : filter.value;
    })();

    // Events for filter icons
    const icon = $(`<span class="anitracker-filter-icon ${filter.exclude ? 'excluded' : 'included'}" data-filter-type="${filter.type}" data-filter-value="${filter.value}" data-filter-exclude="${filter.exclude}">${name}</span>`).appendTo(elems.filterIconContainer);
    refreshIconSymbol(icon);
    icon.on('click', (e) => {
      cycleFilter(getFilterDataFromElem($(e.currentTarget)));
    });

    for (const btn of elems.dropdown.find('button')) {
      const elem = $(btn);
      if (elem.data('filter-value') !== filter.value) continue;
      if (filter.exclude !== undefined) elem.data('filter-exclude', filter.exclude);

      if (filter.exclude) elem.replaceClass('included', 'excluded');
      else elem.replaceClass('excluded', 'included');
    }

    if (filter.exclude === undefined) filter.exclude = false;

    selectedFilters.push(filter);
  }

  function removeFilter(filter) {
    const elems = getElemsFromFilterType(filter.type);
    const activeFilter = getActiveFilter(filter);
    if (activeFilter === undefined) return;

    for (const icon of elems.filterIcons) {
      const elem = $(icon);
      if (elem.data('filter-value') !== filter.value) continue;
      elem.remove();
    }

    for (const btn of elems.dropdown.find('button')) {
      const elem = $(btn);
      if (elem.data('filter-value') !== filter.value) continue;
      elem.data('filter-exclude', '');

      elem.removeClass('excluded').removeClass('included');
    }

    selectedFilters.splice(selectedFilters.indexOf(activeFilter), 1);

    // Count remaining filters of the same type
    const remainingFilters = selectedFilters.filter(f => f.type === filter.type);
    if (!remainingFilters.length) {
      elems.parent?.removeClass('active');
      elems.input?.css('width','100%').css('height','100%');
      if (elems.input !== undefined && !elems.input.is(':focus')) addPlaceholder(elems.input, filter.type);
    }
  }

  // Sets the filter to negative, doesn't actually invert it
  function invertFilter(filter) {
    const elems = getElemsFromFilterType(filter.type);
    const activeFilter = getActiveFilter(filter);
    if (activeFilter === undefined) return;

    for (const icon of elems.filterIcons) {
      const elem = $(icon);
      if (elem.data('filter-value') !== filter.value) continue;
      elem.replaceClass('included', 'excluded');
      elem.data('filter-exclude', true);
      refreshIconSymbol(elem);
    }

    for (const btn of elems.dropdown.find('button')) {
      const elem = $(btn);
      if (elem.data('filter-value') !== filter.value) continue;

      elem.replaceClass('included', 'excluded');
      elem.data('filter-exclude', true);
    }

    activeFilter.exclude = true;
  }

  function cycleFilter(filter) {
    if (getActiveFilter(filter) === undefined) addFilter(filter);
    else if (filter.exclude === false) invertFilter(filter);
    else if (filter.exclude === true) removeFilter(filter);
    updateApplyButton();
  }

  function removeSeasonFilters() {
    for (const filter of selectedFilters.filter(f => f.type === 'season')) {
      selectedFilters.splice(selectedFilters.indexOf(filter), 1);
    }
  }

  function addSeasonFilter(filter) {
    $('#anitracker-time-search-button').addClass('anitracker-active');
    timeframeSettings.enabled = true;
    timeframeSettings.inverted = filter.exclude === true;
    timeframeSettings.from = filter.value.from;
    timeframeSettings.to = filter.value.to;
    selectedFilters.push(filter);
  }

  const searchParams = new URLSearchParams(window.location.search);

  function setSearchParam(name, value) {
    if (value === undefined) searchParams.delete(name);
    else searchParams.set(name,value);
  }

  function updateSearchParams() {
    window.history.replaceState({}, document.title, "/anime" + getSearchParamsString(searchParams));
  }

  function layoutTabless(entries) { // Tabless = without tabs
    $('.index>').hide();
    $('#anitracker-search-results').remove();

    $(`<div class="row" id="anitracker-search-results"></div>`).prependTo('.index');

    let elements = entries.map(match => {
      return `
      <div class="col-12 col-md-6">
        ${match.html}
      </div>`;
    });

    if (!entries.length) elements = `<div class="col-12 col-md-6">No results found.</div>`;

    Array.from($(elements)).forEach(a => {$(a).appendTo('#anitracker-search-results').find('a').attr('title',$(a).find('a').text());});
  }

  function layoutAnime(entries) {
    $('#anitracker-filter-result-count>span').text(entries.length);

    const tabs = $('.tab-content>div');
    tabs.find('.col-12').remove();
    $('.nav-link').show();
    $('.index>').show();
    $('#anitracker-search-results').remove();

    const sortedEntries = entries.sort((a,b) => a.name > b.name ? 1 : -1);
    if (entries.length < 100) {
      layoutTabless(sortedEntries);
      $('#anitracker-anime-list-search').trigger('anitracker:search');
      return;
    }

    for (const tab of tabs) {
      const id = $(tab).attr('id');
      const symbol = id.toLowerCase();
      const matchingAnime = (() => {
        if (symbol === 'hash') {
          return sortedEntries.filter(a => /^(?![A-Za-z])./.test(a.name.toLowerCase()));
        }
        else return sortedEntries.filter(a => a.name.toLowerCase().startsWith(symbol));
      })();
      if (!matchingAnime.length) {
        $(`.index .nav-link[href="#${id}"]`).hide();
        continue;
      }

      const row = $(tab).find('.row');
      for (const anime of matchingAnime) {
        const elem = $(`<div class="col-12 col-md-6">
            ${anime.html}
          </div>`).appendTo(row);
        elem.find('a').attr('title',elem.find('a').text());
      }
    }

    if (!$('.index .nav-link.active').is(':visible')) {
      $('.index .nav-link:visible:not([href="#hash"])')[0].click();
    }
    $('#anitracker-anime-list-search').trigger('anitracker:search');
  }

  function updateAnimeEntries(entries) {
    animeList.length = 0;
    animeList.push(...entries);
  }

  function setSpinner(coverScreen) {
    const elem = $(`
    <div class="anitracker-filter-spinner anitracker-spinner ${coverScreen ? 'screen' : 'small'}">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <span>0%</span>
    </div>`);
    if (coverScreen) elem.prependTo(document.body);
    else elem.appendTo('.page-index h1');
  }

  function getSearchParams(filters, rules, inputParams = undefined) {
    const params = inputParams || new URLSearchParams();
    const values = [];
    for (const type of ['genre','theme','type','demographic','status','season']) {
      const foundFilters = filters.filter(f => f.type === type);
      if (!foundFilters.length) {
        params.delete(type);
        continue;
      }

      values.push({filters: foundFilters, type: type});
    }
    for (const entry of values) {
      if (entry.type === 'season') {
        const value = entry.filters[0].value;
        params.set('season', (entry.filters[0].exclude ? '!' : '') + `${getSeasonName(value.from.season)}-${value.from.year}..${getSeasonName(value.to.season)}-${value.to.year}`);
        continue;
      }

      params.set(entry.type, entry.filters.map(g => (g.exclude ? '!' : '') + g.value).join(','));
    }

    const existingRules = getRulesListFromParams(params);
    for (const rule of existingRules) {
      params.delete(`rule-${rule.filterType}-${rule.ruleType}`);
    }
    const changedRules = getChangedRulesList(rules);
    if (changedRules.length === 0) return params;
    for (const rule of changedRules) {
      params.set(`rule-${rule.filterType}-${rule.ruleType}`, rule.value);
    }

    return params;
  }

  function searchWithFilters(filters, screenSpinner) {
    if ($('.anitracker-filter-spinner').length) return; // If already searching
    setSpinner(screenSpinner);

    appliedFilters.length = 0;
    appliedFilters.push(...JSON.parse(JSON.stringify(filters)));

    setChangesToApply(false);

    getFilteredList(filters).then(results => {
      updateAnimeEntries(results);
      layoutAnime(results);
      $('.anitracker-filter-spinner').remove();
      getSearchParams(filters, filterRules, searchParams); // Since a reference is passed, this will set the params
      updateSearchParams();
    });
  }

  const searchParamRuleRegex = /^rule\-(\w+)\-(include|exclude|combined)/;

  function getRulesListFromParams(params) {
    const rulesList = [];
    for (const [key, value] of params.entries()) {
      if (!searchParamRuleRegex.test(key) || !['any','or'].includes(value)) continue;
      const parts = searchParamRuleRegex.exec(key);
      if (filterRules[parts[1]] === undefined) continue;
      rulesList.push({
        filterType: parts[1],
        ruleType: parts[2],
        value: value
      });
    }
    return rulesList;
  }

  function applyRulesList(rulesList) {
    for (const rule of rulesList) {
      filterRules[rule.filterType][rule.ruleType] = rule.value;
    }
  }

  function getChangedRulesList(rules, type = undefined) {
    const changed = [];
    for (const [key, value] of Object.entries(rules)) {
      if (type !== undefined && key !== type) continue;

      if (value.include !== filterDefaultRules[key].include) {
        changed.push({filterType: key, ruleType: 'include', value: value.include});
      }
      if (value.exclude !== filterDefaultRules[key].exclude) {
        changed.push({filterType: key, ruleType: 'exclude', value: value.exclude});
      }
      if (![undefined,'and'].includes(value.combined)) {
        changed.push({filterType: key, ruleType: 'combined', value: value.combined});
      }
    }
    return changed;
  }

  function updateRuleButtons() {
    const changedRules = getChangedRulesList(filterRules);
    for (const type of Object.keys(filterRules)) {
      const elems = getElemsFromFilterType(type);
      const btn = elems.filterRuleButton;
      if (!btn || !btn.length) continue;
      if (changedRules.find(r => r.filterType === type) === undefined) btn.removeClass('anitracker-active');
      else btn.addClass('anitracker-active');
    }
  }

  // Events

  $('.anitracker-text-input').on('focus', (e) => {
    const elem = $(e.currentTarget);
    const filterType = elem.data('filter-type');
    const elems = getElemsFromFilterType(filterType);
    showDropdown(elems.dropdown, elems.parent);
    clearPlaceholder(elems.input);
    elem.css('width','').css('height','');
    scrollToBottom(elems.scrollingDiv);
  })
    .on('blur', (e) => {
    const elem = $(e.currentTarget);
    const filterType = elem.data('filter-type');
    const elems = getElemsFromFilterType(filterType);
    checkCloseDropdown(elems);
    if (!elems.filterIcons.length) {
      addPlaceholder(elems.input, filterType);
      elem.css('width','100%').css('height','100%');
    }
  })
    .on('keydown', (e) => {
    const elem = $(e.currentTarget);
    const filterType = elem.data('filter-type');
    const elems = getElemsFromFilterType(filterType);

    if (e.key === 'Escape') {
      elem.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      elems.dropdown.find('button:visible')[0]?.focus();
      return;
    }
    const filterIcons = elems.filterIcons;
    if (e.key === 'Backspace' && getInputText(elem) === '' && filterIcons.length) {
      removeFilter(getFilterDataFromElem($(filterIcons[filterIcons.length - 1])));
      updateApplyButton();
    }

    setTimeout(() => {
      const text = getInputText(elem).toLowerCase();

      for (const btn of elems.dropdown.find('button')) {
        const jqbtn = $(btn);
        if (jqbtn.text().toLowerCase().includes(text)) {
          jqbtn.show();
          continue;
        }
        jqbtn.hide();
      }
    }, 1);
  }).on('click', (e) => {
    fixSelection($(e.currentTarget));
  });

  $('.anitracker-filter-dropdown:not(.special)>button').on('blur', (e) => {
    const elem = $(e.currentTarget);
    const filterType = elem.data('filter-type');
    checkCloseDropdown(getElemsFromFilterType(filterType));
  }).on('click', (e) => {
    const elem = $(e.currentTarget);
    const filter = getFilterDataFromElem(elem);
    cycleFilter(filter);

    const elems = getElemsFromFilterType(elem.data('filter-type'));
    elems.input?.text('').keydown().blur();
    scrollToBottom(elems.scrollingDiv);
  });

  $('.anitracker-filter-dropdown>button').on('keydown', (e) => {
    const elem = $(e.currentTarget);
    const filterType = elem.data('filter-type');
    const elems = getElemsFromFilterType(filterType);

    if (e.key === 'Escape') {
      elem.blur();
      return;
    }

    const direction = {
      ArrowUp: -1,
      ArrowDown: 1
    }[e.key];
    if (direction === undefined) return;

    const activeButtons = elems.dropdown.find('button:visible');
    let activeIndex = 0;
    for (let i = 0; i < activeButtons.length; i++) {
      const btn = activeButtons[i];
      if (!$(btn).is(':focus')) continue;
      activeIndex = i;
      break;
    }
    const nextIndex = activeIndex + direction;
    if (activeButtons[nextIndex] !== undefined) {
      activeButtons[nextIndex].focus();
      return;
    }
    if (direction === -1 && activeIndex === 0) {
      elems.input?.focus();
      return;
    }
  });

  $('.anitracker-filter-input').on('click', (e) => {
    const elem = $(e.target);
    if (!elem.is('.anitracker-filter-input,.anitracker-applied-filters,.anitracker-filter-input>div')) return;

    const filterType = $(e.currentTarget).data('filter-type');
    const elems = getElemsFromFilterType(filterType);
    setSelection(elems.input);
  });

  $('#anitracker-status-button').on('keydown', (e) => {
    if (e.key !== 'ArrowDown') return;
    const elems = getElemsFromFilterType('status');
    elems.dropdown.find('button')[0]?.focus();
  });

  $('#anitracker-status-dropdown>button').on('click', (e) => {
    const elem = $(e.currentTarget);
    const filter = getFilterDataFromElem(elem);
    addFilter(filter);
    updateApplyButton();
  });

  $('#anitracker-apply-filters').on('click', () => {
    searchWithFilters(selectedFilters, false);
  });

  $('#anitracker-reset-filters').on('click keyup', (e) => {
    if (e.type === 'keyup' && e.key !== "Enter") return;
    window.location.replace(window.location.origin + window.location.pathname);
  });

  $('.anitracker-filter-rules').on('click', (e) => {
    const elem1 = $(e.currentTarget);
    const filterType = elem1.data('filter-type');

    const disableInclude = ['type','demographic'].includes(filterType) ? 'disabled' : '';

    $('#anitracker-modal-body').empty();

    $(`
    <p>Rules for ${filterType} filters</p>
    <div class="anitracker-filter-rule-selection" ${disableInclude} data-rule-type="include" style="background-color: #485057;">
      <i class="fa fa-plus" aria-hidden="true"></i>
      <span>Include:</span>
      <div class="btn-group"><button ${disableInclude} title="Select this rule type">and</button><button ${disableInclude} title="Select this rule type">or</button></div>
    </div>
    <div class="anitracker-filter-rule-selection anitracker-center-content" data-rule-type="combined">
      <span>-</span>
      <div class="btn-group"><button title="Select this rule type">and</button><button title="Select this rule type">or</button></div>
      <span>-</span>
    </div>
    <div class="anitracker-filter-rule-selection" data-rule-type="exclude" style="background-color: #485057;">
      <i class="fa fa-minus" aria-hidden="true"></i>
      <span>Exclude:</span>
      <div class="btn-group"><button title="Select this rule type">and</button><button title="Select this rule type">or</button></div>
    </div>
    <div style="display: flex;justify-content: center; margin-top: 10px;"><button class="btn btn-secondary anitracker-flat-button" id="anitracker-reset-filter-rules" title="Reset to defaults">Reset</button></div>
    `).appendTo('#anitracker-modal-body');

    function refreshBtnStates() {
      const rules = filterRules[filterType];
      for (const selec of $('.anitracker-filter-rule-selection')) {
        const ruleType = $(selec).data('rule-type');
        const rule = rules[ruleType];

        const btns = $(selec).find('button').removeClass('anitracker-active');
        if (rule === 'or') $(btns[1]).addClass('anitracker-active');
        else $(btns[0]).addClass('anitracker-active');
      }
    }

    $('.anitracker-filter-rule-selection button').on('click', (e) => {
      const elem = $(e.currentTarget);
      const ruleType = elem.parents().eq(1).data('rule-type');
      const text = elem.text();
      if (!['and','or'].includes(text)) return;

      filterRules[filterType][ruleType] = text;

      elem.parent().find('button').removeClass('anitracker-active');
      elem.addClass('anitracker-active');
      updateRuleButtons();
      updateApplyButton();
    });

    $('#anitracker-reset-filter-rules').on('click', () => {
      filterRules[filterType] = JSON.parse(JSON.stringify(filterDefaultRules[filterType]));
      refreshBtnStates();
      updateRuleButtons();
      updateApplyButton();
    });

    refreshBtnStates();

    openModal();
  });

  $('#anitracker-time-search-button').on('click', () => {
    $('#anitracker-modal-body').empty();

    $(`
    <h5>Season range</h5>
    <div class="custom-control custom-switch">
      <input type="checkbox" class="custom-control-input" id="anitracker-settings-enable-switch">
      <label class="custom-control-label" for="anitracker-settings-enable-switch" title="Enable season range filter">Enable</label>
    </div>
    <div class="custom-control custom-switch">
      <input type="checkbox" class="custom-control-input" id="anitracker-settings-invert-switch" disabled>
      <label class="custom-control-label" for="anitracker-settings-invert-switch" title="Invert season range">Invert</label>
    </div>
    <br>
    <div class="anitracker-season-group" id="anitracker-season-from">
      <label for="anitracker-from-year-input" title="Select start season year">From:</label>
      <div class="btn-group">
        <input autocomplete="off" id="anitracker-from-year-input" class="form-control anitracker-text-input-bar anitracker-year-input" disabled placeholder="Year" type="number">
      </div>
      <div class="btn-group">
        <button class="btn dropdown-toggle btn-secondary anitracker-season-dropdown-button" disabled data-bs-toggle="dropdown" data-toggle="dropdown" data-value="Spring" title="Select start season quarter">Spring</button>
        <button class="btn btn-secondary" id="anitracker-season-copy-to-lower" title="Copy the 'from' season to the 'to' season">
          <i class="fa fa-arrow-circle-down" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <div class="anitracker-season-group" id="anitracker-season-to">
      <label for="anitracker-to-year-input" title="Select end season year">To:</label>
      <div class="btn-group">
        <input autocomplete="off" id="anitracker-to-year-input" class="form-control anitracker-text-input-bar anitracker-year-input" disabled placeholder="Year" type="number">
      </div>
      <div class="btn-group">
        <button class="btn dropdown-toggle btn-secondary anitracker-season-dropdown-button" disabled data-bs-toggle="dropdown" data-toggle="dropdown" data-value="Spring" title="Select end season quarter">Spring</button>
      </div>
    </div>
    <br>
    <div>
      <div class="btn-group">
        <button class="btn btn-primary" id="anitracker-modal-confirm-button">Save</button>
      </div>
    </div>`).appendTo('#anitracker-modal-body');

    $('.anitracker-year-input').val(new Date().getFullYear());

    $('#anitracker-settings-enable-switch').on('change', () => {
      const enabled = $('#anitracker-settings-enable-switch').is(':checked');
      $('.anitracker-season-group').find('input,button').prop('disabled', !enabled);
      $('#anitracker-settings-invert-switch').prop('disabled', !enabled);
    }).prop('checked', timeframeSettings.enabled).change();

    $('#anitracker-settings-invert-switch').prop('checked', timeframeSettings.inverted);

    $('#anitracker-season-copy-to-lower').on('click', () => {
      const seasonName = $('#anitracker-season-from .anitracker-season-dropdown-button').data('value');
      $('#anitracker-season-to .anitracker-year-input').val($('#anitracker-season-from .anitracker-year-input').val());
      $('#anitracker-season-to .anitracker-season-dropdown-button').data('value', seasonName);
      $('#anitracker-season-to .anitracker-season-dropdown-button').text(seasonName);
    });

    $(`<div class="dropdown-menu anitracker-dropdown-content anitracker-season-dropdown">`).insertAfter('.anitracker-season-dropdown-button');
    ['Winter','Spring','Summer','Fall'].forEach(g => { $(`<button ref="${g.toLowerCase()}">${g}</button>`).appendTo('.anitracker-season-dropdown') });

    $('.anitracker-season-dropdown button').on('click', (e) => {
      const pressed = $(e.target);
      const btn = pressed.parents().eq(1).find('.anitracker-season-dropdown-button');
      btn.data('value', pressed.text());
      btn.text(pressed.text());
    });

    const currentSeason = getCurrentSeason();
    if (timeframeSettings.from) {
      $('#anitracker-season-from .anitracker-year-input').val(timeframeSettings.from.year.toString());
      $('#anitracker-season-from .anitracker-season-dropdown button')[timeframeSettings.from.season].click();
    }
    else $('#anitracker-season-from .anitracker-season-dropdown button')[currentSeason].click();

    if (timeframeSettings.to) {
      $('#anitracker-season-to .anitracker-year-input').val(timeframeSettings.to.year.toString());
      $('#anitracker-season-to .anitracker-season-dropdown button')[timeframeSettings.to.season].click();
    }
    else $('#anitracker-season-to .anitracker-season-dropdown button')[currentSeason].click();

    $('#anitracker-modal-confirm-button').on('click', () => {
      const enabled = $('#anitracker-settings-enable-switch').is(':checked');
      const inverted = $('#anitracker-settings-invert-switch').is(':checked');
      const from = {
        year: +$('#anitracker-season-from .anitracker-year-input').val(),
        season: getSeasonValue($('#anitracker-season-from').find('.anitracker-season-dropdown-button').data('value'))
      };
      const to = {
        year: +$('#anitracker-season-to .anitracker-year-input').val(),
        season: getSeasonValue($('#anitracker-season-to').find('.anitracker-season-dropdown-button').data('value'))
      };
      if (enabled) {
        for (const input of $('.anitracker-year-input')) {
          if (/^\d{4}$/.test($(input).val())) continue;
          alert('[AnimePahe Improvements]\n\nYear values must both be 4 numbers.');
          return;
        }
        if (to.year < from.year || (to.year === from.year && to.season < from.season)) {
          alert('[AnimePahe Improvements]\n\nSeason times must be from oldest to newest.' + (to.season === 0 ? '\n(Winter is the first quarter of the year)' : ''));
          return;
        }
        if (to.year - from.year > 100) {
          alert('[AnimePahe Improvements]\n\nYear interval cannot be more than 100 years.');
          return;
        }
        removeSeasonFilters(); // Put here so it doesn't remove existing filters if input is invalid
        addFilter({
          type: 'season',
          value: {
            from: from,
            to: to
          },
          exclude: inverted
        });
      }
      else {
        removeSeasonFilters();
        $('#anitracker-time-search-button').removeClass('anitracker-active');
      }
      updateApplyButton();
      timeframeSettings.enabled = enabled;
      timeframeSettings.inverted = inverted;
      closeModal();
    });

    openModal();
  });

  $('#anitracker-random-anime').on('click', function(e) {
    const elem = $(e.currentTarget);

    elem.find('i').removeClass('fa-random').addClass('fa-refresh').addClass('anitracker-spin');

    getFilteredList(selectedFilters).then(results => {
      elem.find('i').removeClass('fa-refresh').addClass('fa-random').removeClass('anitracker-spin');

      const storage = getStorage();
      storage.temp = results;
      saveData(storage);

      const params = new URLSearchParams('anitracker-random=1');

      getRandomAnime(results, getSearchParamsString(params));
    });
  });

  $.anitrackerCachedScript('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0', function() {
    let typingTimer;
    const elem = $('#anitracker-anime-list-search');
    elem.prop('disabled', false).attr('placeholder', 'Search');

    elem.on('anitracker:search', function() {
      if ($(this).val() !== '') animeListSearch();
    })
      .on('keyup', function() {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(animeListSearch, 150);
    })
      .on('keydown', function() {
      clearTimeout(typingTimer);
    });

    function animeListSearch() {
      const value = elem.val();
      if (value === '') {
        layoutAnime(JSON.parse(JSON.stringify(animeList)));
        searchParams.delete('search');
      }
      else {
        const matches = searchList(Fuse, animeList, value);

        layoutTabless(matches);
        searchParams.set('search', encodeURIComponent(value));
      }
      updateSearchParams();
    }

    const loadedParams = new URLSearchParams(window.location.search);
    if (loadedParams.has('search')) {
      elem.val(decodeURIComponent(loadedParams.get('search')));
      animeListSearch();
    }
  }).fail(() => {
    console.error("[AnimePahe Improvements] Fuse.js failed to load");
  });

  // From parameters
  const paramRules = getRulesListFromParams(searchParams);
  applyRulesList(paramRules);
  updateRuleButtons();
  const paramFilters = getFiltersFromParams(searchParams);
  if (!paramFilters.length) return;
  for (const filter of paramFilters) {
    addFilter(filter);
  }
  searchWithFilters(selectedFilters, true);
}

// Search/index page
if (/^\/anime\/?$/.test(window.location.pathname)) {
  loadIndexPage();
  return;
}

function getAnimeList(page = $(document)) {
  const animeList = [];

  for (const anime of page.find('.col-12')) {
    if (anime.children[0] === undefined || $(anime).hasClass('anitracker-filter-result') || $(anime).parent().attr('id')) continue;
    animeList.push({
      name: $(anime.children[0]).text(),
      link: anime.children[0].href,
      html: $(anime).html()
    });
  }

  return animeList;
}

function parseUrl(url) {
  const parsed = URL.parse(url);
  if (parsed) return parsed;
  return new URL(url = 'https://google.com' + url);
}

function randint(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isEpisode(url = window.location.toString()) {
  return url.includes('/play/');
}

function isAnime(url = window.location.toString()) {
  return /^\/anime\/[\d\w\-]+$/.test(parseUrl(url).pathname);
}

function isHome(url = window.location.toString()) {
  return parseUrl(url).pathname === '/';
}

// Source - https://stackoverflow.com/a/11381730
// Posted by Michael Zaporozhets, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-21, License - CC BY-SA 4.0
function isMobileOrTablet() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}


function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.click();
}

function deleteEpisodesFromTracker(exclude, nameInput, id = undefined) {
  const storage = getStorage();
  const animeName = nameInput || getAnimeName();

  if (isSyncEnabled(storage)) {
    storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'episode' && ((id && g.animeId === id) || g.animeName === animeName) && g.episodeNum !== exclude).map(g => {return {type: 'linkList', episodeSession: g.episodeSession}}));
    storage.sync.temp.removedData.push(...storage.videoTimes.filter(g => ((id && g.animeId === id) || stringSimilarity(g.animeName, animeName) > 0.81) && g.episodeNum !== exclude).map(g => {return {type: 'videoTimes', animeName: g.animeName, episodeNum: g.episodeNum}}));
  }

  storage.linkList = (() => {
    if (id) {
      const found = storage.linkList.filter(g => g.type === 'episode' && g.animeId === id && g.episodeNum !== exclude);
      if (found.length > 0) return storage.linkList.filter(g => !(g.type === 'episode' && g.animeId === id && g.episodeNum !== exclude));
    }

    return storage.linkList.filter(g => !(g.type === 'episode' && g.animeName === animeName && g.episodeNum !== exclude));
  })();
  storage.videoTimes = (() => {
    if (id) {
      const found = storage.videoTimes.filter(g => g.animeId === id && g.episodeNum !== exclude);
      if (found.length > 0) return storage.videoTimes.filter(g => !(g.animeId === id && g.episodeNum !== exclude));
    }

    return storage.videoTimes.filter(g => !(g.episodeNum !== exclude && stringSimilarity(g.animeName, animeName) > 0.81));
  })();

  if (exclude === undefined && id) {
    storage.videoSpeed = storage.videoSpeed.filter(g => g.animeId !== id);
  }

  saveData(storage);
}

function deleteEpisodeFromTracker(animeName, episodeNum, animeId = undefined) {
  const storage = getStorage();

  if (isSyncEnabled(storage)) {
    storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'episode' && ((animeId && g.animeId === animeId) || g.animeName === animeName) && g.episodeNum === episodeNum).map(g => {return {type: 'linkList', episodeSession: g.episodeSession}}));
    storage.sync.temp.removedData.push(...storage.videoTimes.filter(g => ((animeId && g.animeId === animeId) || stringSimilarity(g.animeName, animeName) > 0.81) && g.episodeNum === episodeNum).map(g => {return {type: 'videoTimes', animeName: g.animeName, episodeNum: g.episodeNum}}));
  }

  storage.linkList = (() => {
    if (animeId) {
      const found = storage.linkList.find(g => g.type === 'episode' && g.animeId === animeId && g.episodeNum === episodeNum);
      if (found) return storage.linkList.filter(g => !(g.type === 'episode' && g.animeId === animeId && g.episodeNum === episodeNum));
    }

    return storage.linkList.filter(g => !(g.type === 'episode' && g.animeName === animeName && g.episodeNum === episodeNum));
  })();
  storage.videoTimes = (() => {
    if (animeId) {
      const found = storage.videoTimes.find(g => g.animeId === animeId && g.episodeNum === episodeNum);
      if (found) return storage.videoTimes.filter(g => !(g.animeId === animeId && g.episodeNum === episodeNum));
    }

    return storage.videoTimes.filter(g => !(g.episodeNum === episodeNum && stringSimilarity(g.animeName, animeName) > 0.81));
  })();

  if (animeId) {
    if (!storage.videoTimes.find(g => g.animeId === animeId)) {
      storage.videoSpeed = storage.videoSpeed.filter(g => g.animeId !== animeId);
    }
  }

  saveData(storage);
}

function deleteVideoTime(animeName, episodeNum) {
  const storage = getStorage();

  if (isSyncEnabled(storage)) {
    storage.sync.temp.removedData.push({type: 'videoTimes', animeName: animeName, episodeNum: +episodeNum});
  }

  storage.videoTimes = storage.videoTimes.filter(a => !(a.episodeNum === +episodeNum && a.animeName === animeName));
  saveData(storage);
}

function getStoredLinkData(storage) {
  if (isEpisode()) {
    return storage.linkList.find(a => a.type == 'episode' && a.animeSession == animeSession && a.episodeSession == episodeSession);
  }
  return storage.linkList.find(a => a.type == 'anime' && a.animeSession == animeSession);
}

function getAnimeName() {
  return isEpisode() ? /Watch (.*) - ([\d\.]+)(?:\-[\d\.]+)? Online/.exec($('.theatre-info h1').text())[1] : $($('.title-wrapper h1 span')[0]).text();
}

function sortAnimesChronologically(animeList) {
  // Animes (plural)
  animeList.sort((a, b) => {return getSeasonValue(a.season) > getSeasonValue(b.season) ? 1 : -1});
  animeList.sort((a, b) => {return a.year > b.year ? 1 : -1});

  return animeList;
}

async function asyncGetPage(qurl) {
  const req = new XMLHttpRequest();
  req.open('GET', qurl, true);
  return new Promise(resolve => {
    req.onload = () => {
      if (req.status === 200) {
        resolve($(req.response));
        return;
      }

      resolve(undefined);
    }
    req.send();
  });
}

async function getResponse(qurl) {
  const req = new XMLHttpRequest();
  req.open('GET', qurl, true);
  return new Promise(resolve => {
    req.onload = () => {
      if (req.status === 200) {
        resolve(JSON.parse(req.response));
        return;
      }

      resolve(undefined);
    }
    req.send();
  });
}

function asyncGetResponseData(qurl) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open('GET', qurl, true);
    req.onload = () => {
      if (req.status === 200) {
        resolve(JSON.parse(req.response).data);
        return;
      }

      reject(undefined);
    };
    try {
      req.send();
    }
    catch (err) {
      console.error(err);
      resolve(undefined);
    }
  });
}

function getResponseData(qurl) {
  let req = new XMLHttpRequest();
  req.open('GET', qurl, false);
  try {
    req.send();
  }
  catch (err) {
    console.error(err);
    return(undefined);
  }

  if (req.status === 200) {
    return(JSON.parse(req.response).data);
  }

  return(undefined);
}

function getAnimeSessionFromUrl(url = window.location.toString()) {
  return new RegExp('^(.*animepahe\.[a-z]+)?/(play|anime)/([^/?#]+)').exec(url)[3];
}

function getEpisodeSessionFromUrl(url = window.location.toString()) {
  return new RegExp('^(.*animepahe\.[a-z]+)?/(play|anime)/([^/]+)/([^/?#]+)').exec(url)[4];
}

function makeSearchable(string) {
  return encodeURIComponent(string.replace(' -',' '));
}

function getAnimeData(name = getAnimeName(), id = undefined, guess = false) {
  const cached = (() => {
    if (id) return siteVars.cached.animeData.find(a => a?.id === id);
    else return siteVars.cached.animeData.find(a => a?.title === name);
  })();
  if (cached) {
    return cached;
  }

  const data = (() => {
    if (!name.length) return undefined;
    const response = getResponseData('/api?m=search&q=' + makeSearchable(name));

    if (response === undefined) return response;

    for (const anime of response) {
      if (id === undefined && anime.title === name) return anime;
      if (id && anime.id === id) return anime;
    }
    if (guess && response.length > 0) return response[0];

    return undefined;
  })();

  siteVars.cached.animeData.push(data);
  return data;
}

async function asyncGetAnimeData(name = getAnimeName(), id = undefined, guess = false) {
  const cached = (() => {
    if (id) return siteVars.cached.animeData.find(a => a?.id === id);
    else return siteVars.cached.animeData.find(a => a?.title === name);
  })();

  return new Promise(async (resolve, reject) => {
    if (cached) {
      resolve(cached);
      return;
    }

    // API pages for search don't work............
    /*let lastPage = 2;
    let page = 1;
    while (page < lastPage) {
      const response = await getResponse(`/api?m=search&page=${page}&q=${makeSearchable(name)}`);
      lastPage = response.last_page;

      if (!response) resolve(response);

      for (const anime of response.data) {
        if (!id && anime.title === name) {
          siteVars.cached.animeData.push(anime);
          resolve(anime);
          page = lastPage;
          break;
        }
        if (id && anime.id === id) {
          siteVars.cached.animeData.push(anime);
          resolve(anime);
          page = lastPage;
          break;
        }
      }

      page++;
    }*/

    const response = await asyncGetResponseData(`/api?m=search&q=${makeSearchable(name)}`);
    if (!response) {
      resolve(response);
      return;
    }
    const data = (() => {
      for (const anime of response) {
        if (!id && anime.title === name) return anime;
        if (id && anime.id === id) return anime;
      }
    })();
    if (data) {
      siteVars.cached.animeData.push(data);
      resolve(data);
      return;
    }
    if (guess && response.length) {
      resolve(response[0]);
      return;
    }

    console.error(`[AnimePahe Improvements] Anime "${name}" not found`);
    resolve(undefined);
  });
}

function getAnimeId(session, animeName = getAnimeName()) {
  const cached = siteVars.cached.animeId[session];
  if (cached) return cached;

  const id = (() => {
    if (isAnime() && animeSession === session) {
      const linkHref = $('[data-target="#modalBookmark"]').attr('href');
      if (linkHref) return +linkHref.split('/')[2];
    }

    const data = getAnimeData(animeName);
    if (data) return data.id;

    if (!session) return undefined;
    const response = getResponseData(`/api?m=release&id=${session}`);
    if (!response) return undefined;
    return response[0].anime_id;
  })();
  if (id) siteVars.cached.animeId[session] = id;
  return id;
}

// Main animepahe page
if (isHome()) {
  getTrackerDiv().css('justify-content', 'center').css('margin-bottom','8px').insertBefore('.latest-release>h2');
  addGeneralButtons();
  updateSwitches();

  $('<i class="fa fa-tv" aria-hidden="true" style="margin: 5px; margin-right: 1rem;"></i>').prependTo('.latest-release h2');

  // Copy styling from existing rules
  const style = Array.from(document.styleSheets).find(s => s.href && s.href.includes('/app/css/style.css'));
  Array.from(style.cssRules).forEach(rule => {
    if (rule.type !== 1) return;
    if (!rule.selectorText.includes('episode-list-wrapper')) return;
    let cssText = rule.cssText.replace(/.episode-list-wrapper/, '.anitracker-episode-list-wrapper');
    if (rule.selectorText.endsWith('.episode')) {
      cssText = cssText.replace(/z\-index:\s?\d+;/,'').replace(/overflow:\s?hidden;/,'');
    }
    $("#anitracker-style")[0].sheet.insertRule(`${cssText}`);
  });

  if (initialStorage.settings.showContinueWatching) setupContinueWatchingSection();

  siteVars.episodePages.push({
    element: $('.episode-list-wrapper'),
    apiLink: '/api?m=airing&page={page_num}',
    mode: 'multi',
    features: {
      date: {
        selector: '.episode'
      },
      episodeOptions: {
        copyLink: true,
        toggleWatched: {
          watched: undefined
        },
        download: true,
      },
      insertEpNum: true,
    }
  });

  new MutationObserver(function(mutationList, observer) {
    updateEpisodePages(false);

    observer.disconnect();
    setTimeout(observer.observe($('.episode-list-wrapper')[0], { childList: true, subtree: false }), 1);
  }).observe($('.episode-list-wrapper')[0], { childList: true, subtree: false });

  return;
}

function setupContinueWatchingSection() {
  if (!isHome()) return;
  const storage2 = getStorage();
  if (!storage2.videoTimes.length) return;

  $(`
  <div id="anitracker-continue-watching-section">
    <h2><i class="fa fa-play" aria-hidden="true" style="margin: 5px; margin-right: 1rem;"></i>Continue Watching</h2>
    <div class="anitracker-episode-list-wrapper">
      <div class="episode-list row"></div>
    </div>
    <div class="anitracker-center-content" style="margin-top:-1.5rem;margin-bottom:5px;">
      <button id="anitracker-continue-watching-show-more-button" class="btn btn-dark" title="View all episodes with saved progress">
        <i class="fa fa-history" aria-hidden="true"></i>&nbsp;Show More...
      </button>
    </div>
  </div>`).prependTo('.latest-release');
  $('#anitracker').css('justify-content', 'end');

  addContinueWatchingEpisodes(storage2, Math.min(6, storage2.videoTimes.length), true);

  $('#anitracker-continue-watching-show-more-button').on('click', () => {
    $('#anitracker-modal-body').empty();
    const storage = getStorage();

    $(`
    <h4>Video Progress</h4>
    <div class="btn-group" style="margin-left: 5px;">
      <input autocomplete="off" class="form-control anitracker-text-input-bar anitracker-modal-search" placeholder="Search">
      <button dir="down" class="btn btn-secondary dropdown-toggle anitracker-reverse-order-button anitracker-list-btn" title="Sort direction (down is default, and means newest first)"></button>
    </div>
    <div class="anitracker-modal-list-container" style="margin-top:5px;">
      <div class="anitracker-modal-list" style="min-height: 100px;min-width: 200px;"></div>
    </div>`).appendTo('#anitracker-modal-body');

    let entries = [...storage.videoTimes].reverse();

    function layoutEntries() {
      $('.anitracker-video-progress-item').remove();
      for (const entry of entries) {
        let img = `<div class="anitracker-video-progress-image-placeholder">
                     <i class="fa fa-play" aria-hidden="true" style="font-size: 2.5em;margin-left: 5px;"></i>
                   </div>`;
        const sessionEntry = (() => {
          let returnVal;
          if (entry.animeId) {
            returnVal = storage.linkList.find(a => a.animeId === entry.animeId && a.type === 'episode' && a.episodeNum === entry.episodeNum);
            if (!returnVal) returnVal = storage.linkList.find(a => a.animeId === entry.animeId && a.type === 'anime');
          }
          else {
            returnVal = storage.linkList.find(a => a.animeName === entry.animeName && a.type === 'episode' && a.episodeNum === entry.episodeNum);
            if (!returnVal) returnVal = storage.linkList.find(a => a.animeName === entry.animeName && a.type === 'anime');
          }
          return returnVal;
        })();
        const animeId = entry.animeId ?? sessionEntry?.animeId;

        if (animeId) {
          const bookmark = storage.bookmarks.find(a => a.id === entry.animeId);
          if (bookmark && bookmark.posterUrl) img = `
          <img src="https://i.${window.location.host}/${bookmark.posterUrl}">`;
        }

        let href = '';
        if (sessionEntry && sessionEntry.type === 'episode') href = `/play/${sessionEntry.animeSession}/${sessionEntry.episodeSession}`;
        else if (animeId) href = `/a/${animeId}`;

        const visibleAnimeName = sessionEntry?.animeName ?? entry.animeName;
        const titleAttr = `${toHtmlCodes(visibleAnimeName)}${sessionEntry?.episodeSession ? ` Episode ${entry.episodeNum}` : ''}`;

        const elem = $(`
        <div class="anitracker-big-list-item anitracker-video-progress-item">
          <${href ? `a href="${href} target="_blank"` : 'div'} class="anitracker-img-section" title="${titleAttr}">
            <div class="anitracker-image-wrapper">
              ${img}
            </div>
          </${href ? 'a' : 'div'}>
          <${href ? `a href="${href}" target="_blank"` : 'div'} class="anitracker-text-section" title="${titleAttr}">
            <span class="anitracker-main-text" style="${href ? 'text-decoration:underline;' : ''}">${visibleAnimeName}</span>
            <span class="anitracker-normal-text">Episode ${entry.episodeNum}</span>
            <span class="anitracker-secondary-info">${secondsToHMS(entry.time)}${entry.duration ? ' / ' + secondsToHMS(entry.duration) : ''}</span>
          </${href ? 'a' : 'div'}>
          <div class="anitracker-button-section">
            ${animeId ? '<button class="btn btn-dark anitracker-mark-watched-button" title="Mark as watched and remove"><i class="fa fa-eye" aria-hidden="true"></i>&nbsp;Watched</button>' : ''}
            <button class="btn btn-dark anitracker-delete-button" title="Remove video progress"><i class="fa fa-trash" aria-hidden="true"></i>&nbsp;Remove</button>
          </div>
        </div>`).appendTo('#anitracker-modal-body .anitracker-modal-list').data('anime-id', animeId).data('title', entry.animeName).data('episode', entry.episodeNum);

        if (entry.duration) elem.css('background-size', `${100 * (entry.time / entry.duration)}% ${elem.css('background-size').split(' ')[1]}`);
      }

      $('.anitracker-video-progress-item .anitracker-mark-watched-button').on('click', function() {
        const elem = $(this).parents(':eq(1)');

        const episode = elem.data('episode');
        const name = elem.data('title');
        // Only remove the video time
        deleteVideoTime(name, episode);
        removeVideoProgressElem(elem);

        const id = elem.data('anime-id');
        if (!id) return;

        addWatched(+id, episode);
        showMessage('Marked as watched');
      });

      $('.anitracker-video-progress-item .anitracker-delete-button').on('click', function() {
        const elem = $(this).parents(':eq(1)');

        const id = elem.data('anime-id');
        const episode = elem.data('episode');
        const name = elem.data('title');

        deleteEpisodeFromTracker(name, episode, id);

        removeVideoProgressElem(elem);
        showMessage('Removed');
      });

      scrollModalToTop();
    }
    layoutEntries();

    if (!isMobileOrTablet()) setTimeout(() => {
      $('.anitracker-modal-search').focus();
    }, 0);

    $('.anitracker-modal-search').on('input', (e) => {
      setTimeout(() => {
        const query = $(e.target).val().toLowerCase();
        for (const entry of $('.anitracker-video-progress-item')) {
          if (Array.from($(entry).find('a,span')).map(el => $(el).text()).join().toLowerCase().includes(query)) {
            $(entry).show();
          }
          else $(entry).hide();
        }
      }, 10);
    });

    // When clicking the reverse order button
    $('.anitracker-reverse-order-button').on('click', (e) => {
      const btn = $(e.currentTarget);
      if (btn.attr('dir') === 'down') {
        btn.attr('dir', 'up');
        btn.addClass('anitracker-up');
      }
      else {
        btn.attr('dir', 'down');
        btn.removeClass('anitracker-up');
      }

      entries.reverse();
      layoutEntries();
    });

    function removeVideoProgressElem(elem) {
      const episode = elem.data('episode');
      const name = elem.data('title');
      entries = entries.filter(a => !(a.animeName === name && a.episodeNum === +episode));

      elem.find('button').off();
      playAnimation(elem, 'fadeIn', 0.2, 'reverse').then(() => {
        elem.remove();
      });

      updateEpisodePages();
    }

    openModal();
  });
}

function updateContinueWatchingEpisodes() {
  const storage = getStorage();

  for (const el of $('.anitracker-episode-list-wrapper .episode-wrap')) {
    const elem = $(el);
    const id = elem.data('animeId');
    const ep = elem.data('ep');
    if (id && isWatched(+id, +ep)) {
      remove(elem, id, undefined, ep);
      continue;
    }

    const videoTimeName = elem.data('videoTimeName');
    const videoTimeEpisode = elem.data('videoTimeEpisode');
    if (!videoTimeName && !videoTimeEpisode) continue;

    const found = storage.videoTimes.find(a => ((id && a.animeId === +id) || a.animeName === videoTimeName) && a.episodeNum === +videoTimeEpisode);
    if (!found) {
      remove(elem, id, videoTimeName, videoTimeEpisode);
      continue;
    }

    const duration = elem.data('duration') || found.duration;
    if (!duration) continue;
    setProgressBar(elem, false, found.time, +duration);
  }

  function remove(elem, id, name, ep) {
    continueWatchingStatus.displayedEps = continueWatchingStatus.displayedEps.filter(a => !(((id && a.animeId === +id) || a.animeName === name) && a.episodeNum === +ep));
    elem.remove();
    addContinueWatchingEpisodes(storage, 1);
  }
}

async function addContinueWatchingEpisodes(storage, episodeCount, clearAll = false) {
  if (continueWatchingStatus.inProgress) {
    continueWatchingStatus.queue.push(episodeCount);
    return;
  }

  continueWatchingStatus.inProgress = true;
  return new Promise(async (resolve) => {
    if (clearAll) {
      $(`
      <div id="anitracker-continue-watching-spinner" class="anitracker-spinner anitracker-center-content" style="align-self:center;width:100%;position:absolute;z-index:2;">
        <div class="spinner-border" role="status" style="width:3rem;height:3rem;">
          <span class="sr-only">Loading...</span>
        </div>
      </div>`).appendTo('.anitracker-episode-list-wrapper .episode-list.row');
    }

    for (let i = 0; i < episodeCount; i++) {
      $(`
      <div class="anitracker-continue-watching-skeleton episode-wrap col-12 col-sm-4">
        <div class="episode">
          ${clearAll ? '' : `
          <div class="anitracker-spinner anitracker-episode-spinner">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>`}
          <div class="episode-snapshot" style="background-color:var(--dark);">
          </div>
        </div>
      </div>`).appendTo('.anitracker-episode-list-wrapper .episode-list.row');
    }

    const processedAnime = [];
    const videoTimes = [...storage.videoTimes].reverse();
    const finalEpisodes = [];

    for (const entry of videoTimes) {
      if (finalEpisodes.length >= episodeCount) break;
      if (processedAnime.includes(entry.animeName) || continueWatchingStatus.displayedEps.find(a => a.animeName === entry.animeName && a.episodeNum === entry.episodeNum)) {
        continue;
      }
      if (entry.animeId && isWatched(entry.animeId, entry.episodeNum)) continue;

      let sessionEntry;

      const data = await asyncGetAnimeData(entry.animeName, entry.animeId);
      if (!data) {
        sessionEntry = (() => {
          let returnVal;
          const linkList = [...storage.linkList].reverse(); // Reverse it so newer entries are prioritized
          if (entry.animeId) {
            returnVal = linkList.find(a => a.animeId === entry.animeId && a.type === 'episode' && a.episodeNum === entry.episodeNum);
            if (!returnVal) returnVal = linkList.find(a => a.animeId === entry.animeId && a.type === 'anime');
          }
          else {
            returnVal = linkList.find(a => a.animeName === entry.animeName && a.type === 'episode' && a.episodeNum === entry.episodeNum);
            if (!returnVal) returnVal = linkList.find(a => a.animeName === entry.animeName && a.type === 'anime');
          }
          return returnVal;
        })();

        // If we have animeId, we can get the session that way later
        if (!sessionEntry && !entry.animeId) continue;
      };

      const id = data?.id || sessionEntry?.animeId || entry.animeId;

      // The sessionEntry is allowed to be invalid ONLY if there is no alternative (no animeId)
      // If there is an animeId, validate the animeSession (faster than failing at the episodes API call)
      if (sessionEntry && id) {
        const aSessionStatus = await getPageStatus(`/anime/${sessionEntry.animeSession}`);
        if (aSessionStatus !== 200) {
          sessionEntry.animeSession = undefined;
          sessionEntry.episodeSession = undefined; // If we throw away the anime session, we have to throw away the episode session as well
        }
      }

      let animeSession = data?.session || sessionEntry?.animeSession;

      // If no data or sessionEntry anime session, get session by visiting the page using ID
      if (!data && !sessionEntry?.animeSession && id) {
        const reqData = await getDataFromAnimeId(id);
        animeSession = reqData.session;
      }

      if (!animeSession) {
        if (id) addEpisode(entry, undefined, undefined, undefined, {animeId: id});
        continue;
      }

      // Check a second time if watched, because ID could be newly available
      if (id && isWatched(id, entry.episodeNum)) continue;

      const episodeData = await getEpisodeData(animeSession, entry.episodeNum);
      const firstEpisode = siteVars.cached.firstEpisode[animeSession]; // If not cached, it will be undefined
      addEpisode(entry, episodeData, sessionEntry, data, {animeSession: animeSession, firstEpisode: firstEpisode});
    }

    $('.anitracker-continue-watching-skeleton').remove();

    for (const ep of finalEpisodes) {
      const img = ep.snapshot ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      const epValue = getEpisodeValue(ep.episode, ep.episode2, storage.settings.relativeEpNums ? ep.firstEpisode : undefined);
      const href = (() => {
        if (ep.animeSession && ep.session) return `/play/${ep.animeSession}/${ep.session}`;
        else if (ep.animeSession) return `/anime/${ep.animeSession}`;
        else if (ep.animeId) return `/a/${ep.animeId}`;
      })();
      const animeHref = ep.animeSession ? `/anime/${ep.animeSession}` : `/a/${ep.animeId}`;

      const elem = $(`
      <div class="episode-wrap col-12 col-sm-4">
        <div class="episode">
          <div class="episode-snapshot">
            <img src="${img}" class="ls-is-cached lazyloaded" alt="">
            <svg class="play-button" viewBox="0 0 150 150" alt="Play Video"><polygon points="20, 20, 20, 140, 120, 80" fill="#fff"></polygon></svg>
            <a href="${href}" class="play">Watch ${ep.title} - <span>${epValue}</span> Online</a>
          </div><div class="episode-label-wrap">
          <div class="episode-label">
            <div class="episode-title-wrap">
              ${ep.duration ? `<span class="episode-duration">${secondsToHMS(ep.duration)}</span>` : ''}
              <span class="episode-title">
                <a href="${animeHref}" title="${toHtmlCodes(ep.title)}">${ep.title}</a>
              </span>
            </div>
            <div class="episode-number-wrap">
              <div class="episode-number"><span class="text-hide">Episode </span>${epValue}</div>
            </div>
          </div>
          </div>
        </div>
      </div>`).appendTo('.anitracker-episode-list-wrapper .episode-list.row')
      .data('ep', ep.episode).data('ep2', ep.episode2).data('firstEp', ep.firstEpisode)
      .data('videoTimeName',ep.videoTimeName).data('videoTimeEpisode',ep.videoTimeEpisode)
      .data('animeId', ep.animeId).data('duration', ep.duration);

      if (ep.duration) setProgressBar(elem, false, ep.time, ep.duration);

      addEpisodeOptions(elem.find('.episode'), {
        copyLink: true,
        addWatched: Boolean(ep.animeId),
        download: true,
        remove: true,
      }, {
        ep: +ep.episode,
        title: ep.title,
        'anime-id': ep.animeId
      });
    }
    applyEpisodeOptionsEvents($('.anitracker-episode-list-wrapper .episode-wrap'));

    function addEpisode(videoTimeEntry, episodeEntry, sessionEntry, animeData, extra) {
      // Piece together anime data based on available info
      const episode = {
        time: videoTimeEntry.time,
        snapshot: episodeEntry?.snapshot,
        episode2: episodeEntry?.episode2,
        duration: episodeEntry?.duration ? HMStoSeconds(episodeEntry.duration) : videoTimeEntry.duration,
        firstEpisode: extra?.firstEpisode,
        videoTimeName: videoTimeEntry.animeName,
        videoTimeEpisode: videoTimeEntry.episodeNum,
      };

      if (animeData) episode.animeSession = animeData.session;
      else if (sessionEntry && sessionEntry.animeSession) episode.animeSession = sessionEntry.animeSession;
      else if (extra?.animeSession) episode.animeSession = extra.animeSession;

      if (episodeEntry) episode.session = episodeEntry.session;
      else if (sessionEntry && sessionEntry.episodeSession) episode.session = sessionEntry.episodeSession;

      if (animeData) episode.animeId = animeData.id;
      else if (sessionEntry && sessionEntry.animeId) episode.animeId = sessionEntry.animeId;
      else if (videoTimeEntry.animeId) episode.animeId = videoTimeEntry.animeId;
      else if (extra?.animeId) episode.animeId = extra.animeId;

      if (animeData) episode.title = animeData.title;
      else if (sessionEntry) episode.title = sessionEntry.animeName;
      else episode.title = videoTimeEntry.animeName;

      if (episodeEntry) episode.episode = episodeEntry.episode;
      else if (sessionEntry && sessionEntry.episodeNum) episode.episode = sessionEntry.episodeNum;
      else episode.episode = videoTimeEntry.episodeNum;

      if (!episode.animeSession && !episode.animeId) return;

      finalEpisodes.push(episode);
      processedAnime.push(videoTimeEntry.animeName);
      continueWatchingStatus.displayedEps.push({animeName: videoTimeEntry.animeName, episodeNum: videoTimeEntry.episodeNum});
    }

    $('#anitracker-continue-watching-spinner').remove();

    continueWatchingStatus.inProgress = false;
    if (continueWatchingStatus.queue.length) addContinueWatchingEpisodes(getStorage(), continueWatchingStatus.queue.shift()); // Advance the queue
    resolve();
  });

  function getPageStatus(qurl) {
    const request = new XMLHttpRequest();
    request.open('GET', qurl, true);
    return new Promise(resolve => {
      request.onload = () => {
        resolve(request.status);
      }
      request.send();
    });
  }
}

function getPageNum(elem = $('.pagination')) {
  if (elem.length == 0) return 1;
  return +/^(\d+)/.exec(elem.find('.page-item.active span').text())[0];
}

const animeSession = getAnimeSessionFromUrl();
let episodeSession = '';
if (isEpisode()) {
  episodeSession = getEpisodeSessionFromUrl();
}

async function getEpisodeData(aSession, episodeNum) {
  return new Promise(async resolve => {
    let episodes = await getResponse(`/api?m=release&sort=episode_asc&id=${aSession}`);
    if (!episodes) {
      resolve(undefined);
      return;
    }
    const firstEpisode = episodes.data[0].episode;
    siteVars.cached.firstEpisode[aSession] = firstEpisode;
    let data = episodes.data.find(a => a.episode === episodeNum);
    if (data) {
      resolve(data);
      return;
    }
    // If the episode wasn't found on the first page, find the page where the episode is
    const episodeOffset = firstEpisode - 1;
    const page = Math.min(episodes.last_page, Math.ceil((episodeNum - episodeOffset) / episodes.per_page));
    episodes = await getResponse(`/api?m=release&sort=episode_asc&id=${aSession}&page=${page}`);
    data = episodes.data.find(a => a.episode === episodeNum);

    resolve(data);
  });
}

/* Return codes:
 * 0: ok!
 * 1: couldn't find stored session at 404 page
 * 2: couldn't get anime data
 * 3: couldn't get episode session
 * 4: idk
*/
async function refreshSession(from404 = false) {
  return new Promise(async (resolve) => {
    const storage = getStorage();
    const bobj = getStoredLinkData(storage);

    let name = '';
    let episodeNum = 0;

    if (!bobj && from404) {
      resolve(1);
      return;
    }

    if (bobj) {
      name = bobj.animeName;
      episodeNum = bobj.episodeNum;
    }
    else {
      name = getAnimeName();
      episodeNum = getEpisodeNum();
    }

    if (isEpisode()) {
      const animeData = await asyncGetAnimeData(name, bobj?.animeId, true);
      let aSession;

      if (animeData && (animeData.title === name || (!bobj?.animeId && refreshGuessWarning(name, animeData.title)))) aSession = animeData.session;
      else if (bobj?.animeId) {
        const data = await getDataFromAnimeId(bobj.animeId);
        if (data) aSession = data.session;
      }

      if (!aSession) {
        resolve(2);
        return;
      }

      const episodeData = await getEpisodeData(aSession, episodeNum);
      const episodeSession = episodeData?.session;
      if (!episodeSession) {
        resolve(3);
        return;
      }

      if (bobj) {
        if (isSyncEnabled(storage)) {
          storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'episode' && g.animeSession === bobj.animeSession && g.episodeSession === bobj.episodeSession).map(g => {return {type: 'linkList', episodeSession: g.episodeSession}}));
        }
        storage.linkList = storage.linkList.filter(g => !(g.type === 'episode' && g.animeSession === bobj.animeSession && g.episodeSession === bobj.episodeSession));
        saveData(storage);
      }

      window.location.replace('/play/' + aSession + '/' + episodeSession + window.location.search);

      resolve(0);
      return;
    }
    else if (bobj && bobj.animeId) {
      if (isSyncEnabled(storage)) {
        storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'anime' && g.animeSession === bobj.animeSession).map(g => {return {type: 'linkList', animeSession: g.animeSession}}));
      }
      storage.linkList = storage.linkList.filter(g => !(g.type === 'anime' && g.animeSession === bobj.animeSession));
      saveData(storage);

      window.location.replace('/a/' + bobj.animeId);
      resolve(0);
      return;
    }
    else {
      if (bobj) {
        if (isSyncEnabled(storage)) {
          storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'anime' && g.animeSession === bobj.animeSession).map(g => {return {type: 'linkList', animeSession: g.animeSession}}));
        }
        storage.linkList = storage.linkList.filter(g => !(g.type === 'anime' && g.animeSession === bobj.animeSession));
        saveData(storage);
      }
      const animeData = await asyncGetAnimeData(name, undefined, true);

      if (!animeData || (animeData.title !== name && !refreshGuessWarning(name, animeData.title))) {
        resolve(2);
        return;
      }

      window.location.replace('/a/' + animeData.id);
      resolve(0);
      return;
    }

    resolve(4);
  });
}

function refreshGuessWarning(name, title) {
  return confirm(`[AnimePahe Improvements]\n\nAn exact match with the anime name "${name}" couldn't be found. Go to "${title}" instead?`);
}

const obj = getStoredLinkData(initialStorage);

if (isEpisode() && !is404) {
  theatreMode(initialStorage.settings.theatreMode);
  $('#downloadMenu').changeElementType('button');

  $('#providerMenu').attr('title','Change video provider');
  $('#episodeMenu').attr('title','Go to episode');
  $('#fansubMenu').attr('title','Change resolution and sub/dub source');
  $('#downloadMenu').attr('title','Download video');
}
else if (isAnime() && !is404) {
  getFirstEpisode(animeSession); // Hopefully pre-cache the API call
}

console.log('[AnimePahe Improvements]', obj, animeSession, episodeSession);

function setSessionData() {
  const animeName = getAnimeName();
  const animeId = getAnimeId(animeSession, animeName);

  const storage = getStorage();
  if (isEpisode()) {
    if (isSyncEnabled(storage)) {
      storage.sync.temp.addedData.push({type: 'linkList', episodeSession: episodeSession});
    }

    storage.linkList.push({
      animeId: animeId,
      animeSession: animeSession,
      episodeSession: episodeSession,
      type: 'episode',
      animeName: animeName,
      episodeNum: getEpisodeNum()
    });
  }
  else {
    if (isSyncEnabled(storage)) {
      storage.sync.temp.addedData.push({type: 'linkList', animeSession: animeSession});
    }

    storage.linkList.push({
      animeId: animeId,
      animeSession: animeSession,
      type: 'anime',
      animeName: animeName
    });
  }
  if (storage.linkList.length > getStorageLimits().linkList) {
    storage.linkList.splice(0,1);
  }

  saveData(storage);
}

if (!obj && !is404) {
  if (!isRandomAnime()) setSessionData();
}
else if (obj && is404) {
  document.title = "Refreshing session... :: animepahe";
  $('.text-center h1').text('Refreshing session, please wait...');
  refreshSession(true).then(code => {
    if (code === 1) {
      $('.text-center h1').text('Couldn\'t refresh session: Link not found in tracker');
    }
    else if (code === 2) {
      $('.text-center h1').text('Couldn\'t refresh session: Couldn\'t get anime data');
    }
    else if (code === 3) {
      $('.text-center h1').text('Couldn\'t refresh session: Couldn\'t get episode data');
    }
    else if (code !== 0) {
      $('.text-center h1').text('Couldn\'t refresh session: An unknown error occurred');
    }

    if ([2,3].includes(code)) {
      if (obj.episodeNum !== undefined) {
        $(`<h3>
            Try finding the episode using the following info:
            <br>Anime name: ${obj.animeName}
            <br>Episode: ${obj.episodeNum}
          </h3>`).insertAfter('.text-center h1');
      }
      else {
        $(`<h3>
          Try finding the anime using the following info:
          <br>Anime name: ${obj.animeName}
        </h3>`).insertAfter('.text-center h1');
      }
    }
  });
  return;
}
else if (obj === undefined && is404) {
  if (document.referrer.length > 0) {
    const bobj = (() => {
      if (!/\/play\/.+/.test(document.referrer) && !/\/anime\/.+/.test(document.referrer)) {
        return true;
      }
      const session = getAnimeSessionFromUrl(document.referrer);
      if (isEpisode(document.referrer)) {
        return initialStorage.linkList.find(a => a.type === 'episode' && a.animeSession === session && a.episodeSession === getEpisodeSessionFromUrl(document.referrer));
      }
      else {
        return initialStorage.linkList.find(a => a.type === 'anime' && a.animeSession === session);
      }
    })();
    if (bobj) {
      const prevUrl = new URL(document.referrer);
      const params = new URLSearchParams(prevUrl);
      params.set('ref','404');
      prevUrl.search = params.toString();
      windowOpen(prevUrl.toString(), '_self');
      return;
    }
  }
  $('.text-center h1').text('Cannot refresh session: Link not stored in tracker');
  return;
}

function getSubInfo(value) {
  if (!value) return;
  if (Array.isArray(value)) return {
    name: value[0],
    quality: value[1],
    other: value[2]
  };
  const match = /^\s*([^·]+)·\s*(\d{2,4})p(.*)$/.exec(value);
  return {
    name: match[1],
    quality: +match[2],
    other: match[3]
  };
}

// Set the quality to best automatically
// Returns whether the quality was set or not
function bestVideoQuality() {
  return new Promise(resolve => {
    if (!isEpisode()) {
      resolve(false);
      return;
    }

    const currentSub = getSubInfo(getStoredLinkData(getStorage())?.subInfo) || getSubInfo($('#resolutionMenu .active').text());

    let index = -1;
    for (let i = 0; i < $('#resolutionMenu').children().length; i++) {
      const sub = $('#resolutionMenu').children()[i];
      const subInfo = getSubInfo($(sub).text());
      if (subInfo.name !== currentSub.name || subInfo.other !== currentSub.other) continue;

      if (subInfo.quality >= currentSub.quality) index = i;
    }

    if (index === -1) {
      resolve(false)
      return;
    }
    const newSub = $('#resolutionMenu').children()[index];

    if (!["","Loading..."].includes($('#fansubMenu').text())) {
      if ($(newSub).text() === $('#resolutionMenu .active').text()) {
        resolve(false);
        return;
      }
      newSub.click();
      resolve(true);
      return;
    }

    new MutationObserver(function(mutationList, observer) {
      newSub.click();
      resolve(true);
      observer.disconnect();
    }).observe($('#fansubMenu')[0], { childList: true });
  });
}

function setIframeUrl(url) {
  $('.embed-responsive-item').remove();
  $(`
  <iframe class="embed-responsive-item" scrolling="no" allowfullscreen="" allowtransparency="" src="${url}"></iframe>
  `).prependTo('.embed-responsive');
  $('.embed-responsive-item')[0].contentWindow.focus();
}

// Fix the quality dropdown buttons
if (isEpisode()) {
  new MutationObserver(function(mutationList, observer) {
    $('.click-to-load').remove();
    $('#resolutionMenu').off('click');
    $('#resolutionMenu').on('click', (el) => {
      const targ = $(el.target).closest('button');

      if (targ.data('src') === undefined) return;

      setIframeUrl(targ.data('src'));

      $('#resolutionMenu .active').removeClass('active');
      targ.addClass('active');

      $('#fansubMenu').html(targ.html());

      const storage = getStorage();
      const data = getStoredLinkData(storage);
      if (data) {
        const subInfo = getSubInfo(targ.text());
        data.subInfo = [subInfo.name, subInfo.quality, subInfo.other];
        saveData(storage);
      }

      Cookies.set('res', targ.data('resolution'), {
        expires: 365,
        path: '/'
      });
      Cookies.set('aud', targ.data('audio'), {
        expires: 365,
        path: '/'
      });
      Cookies.set('av1', targ.data('av1'), {
        expires: 365,
        path: '/'
      });
    });
    observer.disconnect();
  }).observe($('#fansubMenu')[0], { childList: true });

  if (initialStorage.settings.bestQuality === true) {
    bestVideoQuality().then(wasSet => {
      if (!wasSet) $('#resolutionMenu .active').click();
    });
  }
  else if (!["","Loading..."].includes($('#fansubMenu').text())) {
      $('#resolutionMenu .active').click();
  } else {
    new MutationObserver(function(mutationList, observer) {
      $('#resolutionMenu .active').click();
      observer.disconnect();
    }).observe($('#fansubMenu')[0], { childList: true });
  }

  const timeArg = paramArray.find(a => a[0] === 'time');
  if (timeArg !== undefined) {
    applyTimeArg(timeArg);
  }

  if (initialStorage.settings.relativeEpNums) setRelativeEpNums(true);
}

function applyTimeArg(timeArg) {
  const time = timeArg[1];

  function check() {
    if ($('.embed-responsive-item').attr('src')) done();
    else setTimeout(check, 100);
  }
  setTimeout(check, 100);

  function done() {
    setIframeUrl(stripUrl($('.embed-responsive-item').attr('src')) + '?time=' + time);

    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
  }
}

function setRelativeEpNums(on) {
  if (modalIsOpen() && $('.anitracker-view-notif-animes').length) {
    openNotificationsModal(); // The simplest solution
  }

  updateEpisodePages();
  if (isAnime()) {
    if (on) {
      const titleParts = /^(.*) Ep\. ([\d\.]+)\-?([\d\.]+)?( \[Completed\])? :: animepahe$/.exec(document.title);
      if (!titleParts) return;
      siteVars.prevDocumentTitle = document.title;

      const ep = +titleParts[2];
      const ep2 = titleParts[3] ? +titleParts[3] : undefined;

      getFirstEpisode(animeSession).then(firstEp => {
        setDocumentTitle(`${titleParts[1]} Ep. ${getEpisodeValue(ep, ep2, firstEp)}${titleParts[4] ?? ''} :: animepahe`);
      });
    }
    else if (siteVars.prevDocumentTitle) setDocumentTitle(siteVars.prevDocumentTitle);

    return;
  }
  if (isHome()) {
    const continueWatchingEps = $('.anitracker-episode-list-wrapper .episode-wrap');
    if (!continueWatchingEps.length) return;

    for (const entry of continueWatchingEps) {
      const elem = $(entry);
      const firstEp = elem.data('firstEp');
      const ep = elem.data('ep');
      const ep2 = elem.data('ep2');
      const epValue = getEpisodeValue(ep, ep2, on ? firstEp : undefined);
      elem.find('.episode-number').contents().filter(function(){
        return this.nodeType === 3;
      })[0].textContent = epValue;
      elem.find('a.play>span').text(epValue);
    }
    return;
  }

  const currentEpisode = getEpisodeNum();
  const currentEpisode2 = (() => {
    if (originalEpisodeValue && originalEpisodeValue[2]) return +originalEpisodeValue[2];
    else return undefined;
  })();

  const dropdownEpRegex = /Episode ([\d\.]+)\-?([\d\.]+)?/;
  if (on) {
    getFirstEpisode(animeSession).then(firstEp => {
      setEpValue(getEpisodeValue(currentEpisode, currentEpisode2, firstEp));

      for (const dropdownEp of $('.episode-menu .dropdown-menu a.dropdown-item')) {
        const elem = $(dropdownEp);
        const regexExec = dropdownEpRegex.exec(elem.text());
        const ep = regexExec[1];
        const ep2 = regexExec[2];
        elem.data('original-ep', ep).data('original-ep2', ep2).text('Episode ' + getRelativeEpisodeNum(ep, firstEp) + (ep2 ? '-' + getRelativeEpisodeNum(ep2, firstEp) : ''));
      }
    });
  }
  else {
    setEpValue(getEpisodeValue(currentEpisode, currentEpisode2));

    for (const dropdownEp of $('.episode-menu .dropdown-menu a.dropdown-item')) {
      const elem = $(dropdownEp);
      const ep = elem.data('original-ep');
      const ep2 = elem.data('original-ep2');
      if (!ep) continue;
      elem.text('Episode ' + ep + (ep2 ? '-' + ep2 : ''));
    }
  }

  function setEpValue(value) {
    $('#episodeMenu').contents().filter(function(){
      return this.nodeType === 3;
    })[0].textContent = `Episode ${value}`;

    $('.theatre-info h1').contents().filter(function(){
      return this.nodeType === 3;
    })[0].textContent = ` - ${value}`;

    setDocumentTitle(`${getAnimeName()} Ep. ${value} :: animepahe`);
  }

  function setDocumentTitle(title) {
    window.history.replaceState({}, title, window.location);
    document.title = title;
  }
}

function getTrackerDiv() {
  return $(`<div id="anitracker"></div>`);
}

async function getAllEpisodes(session, sort = "asc") {
  const episodeList = [];
  const request = new XMLHttpRequest();
  request.open('GET', `/api?m=release&sort=episode_${sort}&id=` + session, true);

  return new Promise((resolve, reject) => {
    request.onload = async function() {
      if (request.status !== 200) {
        reject("Received response code " + request.status);
        return;
      }

      const response = JSON.parse(request.response);
      if (response.current_page === response.last_page) {
        episodeList.push(...response.data || []);
      }
      else for (let i = 1; i <= response.last_page; i++) {
        const episodes = await asyncGetResponseData(`/api?m=release&sort=episode_${sort}&page=${i}&id=${session}`);
        if (!episodes || !episodes.length) continue;
        episodeList.push(...episodes);
      }
      resolve(episodeList);
    };
    request.send();
  });
}

async function getRelationData(session, relationType) {
  return new Promise(async resolve => {
    const relations = await getRelationList(session);
    for (const rel of relations) {
      if (rel.relation_type !== relationType) continue;

      rel.episodeList = await getAllEpisodes(rel.session);;

      resolve(rel);
      return;
    }
    resolve(undefined);
  });
}

async function getRelationList(session) {
  return new Promise(async resolve => {
    const page = await asyncGetPage('/anime/' + session);
    if (!page.length) {
      resolve(undefined);
      return;
    }

    const relations = [];
    for (const div of page.find('.anime-relation .row .col-12')) {
      const elem = $(div);
      const infoParts = /\s*\- (\d+|\?) Episodes? \(([^\)]+)\)/.exec(getTextContent(elem.find('.col-9.px-1')));
      const seasonParts = /\s*([A-Za-z]+) (\d+)/.exec($(elem.find('.col-9.px-1 a')[2]).text());
      relations.push({
        title: $(elem.find('h5')[0]).text(),
        type: elem.find('strong').text(),
        episodes: infoParts[1] !== '?' ? +infoParts[1] : undefined,
        status: infoParts[2],
        season: seasonParts[1],
        year: +seasonParts[2],
        poster: elem.find('img').attr('data-src').replace('.th',''),
        session: /^.*animepahe\.[a-z]+\/anime\/([^\/]+)/.exec(elem.find('a')[0].href)[1],
        relation_type: elem.parents(':eq(1)').find('h4 span').text(),
      });
    }

    resolve(relations);
  });
}

function hideSpinner(t, parents = 1) {
  $(t).parents(`:eq(${parents})`).find('.anitracker-player-dropup-spinner').hide();
}

// MARKER:PREQUEL & SEQUEL LINKS
if (isEpisode()) {
  getTrackerDiv().appendTo('.anime-note');

  $('.prequel,.sequel').addClass('anitracker-thumbnail');

  $(`
  <span relationType="Prequel" class="dropdown-item anitracker-relation-link" id="anitracker-prequel-link">
    Previous Anime
  </span>`).prependTo('.episode-menu #scrollArea');

  $(`
  <span relationType="Sequel" class="dropdown-item anitracker-relation-link" id="anitracker-sequel-link">
    Next Anime
  </span>`).appendTo('.episode-menu #scrollArea');

  $('.anitracker-relation-link').on('click', function() {
    if (this.href) {
      $(this).off();
      return;
    }

    $(this).parents(':eq(2)').find('.anitracker-player-dropup-spinner').show();

    const relationType = $(this).attr('relationType');
    getRelationData(animeSession, relationType).then((relationData) => {
      if (relationData === undefined) {
        hideSpinner(this, 2);
        showMessage(`No ${relationType.toLowerCase()} found`);
        $(this).remove();
        return;
      }

      const episodes = relationData.episodeList;
      const episodeSession = relationType === 'Prequel' ? episodes[episodes.length-1].session : episodes[0].session;

      windowOpen(`/play/${relationData.session}/${episodeSession}`, '_self');
      hideSpinner(this, 2);
    });

  });

  if (!$('.prequel').length) setRelationPoster('Prequel', 'prequel');
  if (!$('.sequel').length) setRelationPoster('Sequel', 'sequel');
}

if (isAnime()) {
  getTrackerDiv().attr('style', "max-width: 1100px;margin-left: auto;margin-right: auto;margin-bottom: 20px;").insertAfter('.anime-content');
}

async function setRelationPoster(name, type) {
  const relationData = await getRelationData(animeSession, name);
  const linkElem = $(`#anitracker-${type}-link`);
  if (relationData === undefined) {
    linkElem.remove();
    return;
  }
  const index = type === 'prequel' ? relationData.episodeList.length - 1 : 0;
  const relationLink = `/play/${relationData.session}/${relationData.episodeList[index].session}`;
  $(`
  <div class="${type} hidden-sm-down anitracker-thumbnail">
    <a href="${relationLink}" title="Play ${type === 'prequel' ? 'Last Episode' : 'First Episode'} of ${toHtmlCodes(relationData.title)}">
      <img style="filter: none;" src="${relationData.poster}" data-src="${relationData.poster}" alt="">
    </a>
    <i class="fa fa-chevron-${type === 'prequel' ? 'left' : 'right'}" aria-hidden="true"></i>
  </div>`).appendTo('.player');

  linkElem.attr('href', relationLink);
  linkElem.text(relationData.title);
  linkElem.changeElementType('a');

  // If auto-clear is on and the episode is a prequel, delete the episode from the tracker
  if (type === 'prequel' && getStorage().settings.autoDelete === true) {
    deleteEpisodesFromTracker(undefined, relationData.title);
  }
}

if (isEpisode()) {
  // Replace the download buttons with better ones
  // Better download buttons
  if ($('#pickDownload a').length) replaceDownloadButtons();
  else {
    new MutationObserver(function(mutationList, observer) {
      replaceDownloadButtons();
      observer.disconnect();
    }).observe($('#pickDownload')[0], { childList: true });
  }

  $(document).on('blur', () => {
    $('.dropdown-menu.show').removeClass('show');
    $('.form-inline').removeClass('active');
  });

  (() => {
    const storage = getStorage();
    const foundNotifEpisode = storage.notifications.episodes.find(a => a.session === episodeSession);
    if (foundNotifEpisode) {
      foundNotifEpisode.watched = true;
      saveData(storage);
    }
  })();
}

// Return values:
// Link - success
// 1 - failure
async function getDownloadPage(redirectUrl) {
  function load(reqResult) {
    if (reqResult.readyState !== 4 || reqResult.status !== 200) {
      return 1;
    }

    const htmlText = reqResult.response;
    const link = /https:\/\/kwik.\w+\/f\/[^"]+/.exec(htmlText);
    if (link) {
      return link[0];
    }
    else return 1;
  }

  async function with_GM() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: redirectUrl,

        onload: (reqResult) => {resolve(load(reqResult))},
        onerror: () => {resolve(1)},
        ontimeout: () => {resolve(1)}
      });
    });
  }

  return new Promise((resolve) => {
    //request.open('GET', `https://opsalar.000webhostapp.com/animepahe.php?url=${redirectUrl}`, true);

    const request = new XMLHttpRequest();
    request.open('GET', redirectUrl, true);
    request.onload = () => {
      const response = load(request);
      if (response !== 1) {
        resolve(response);
        return;
      }

      with_GM().then((a) => {resolve(a)});
    }

    request.onerror = () => {with_GM().then((a) => {resolve(a)});};
    request.ontimeout = () => {with_GM().then((a) => {resolve(a)});};
    request.send();
  });
}

function replaceDownloadButtons() {
  for (const aTag of $('#pickDownload a')) {
      $(aTag).changeElementType('span');
    }

    $('#pickDownload>span').on('click', function() {
      $(this).parents(':eq(1)').find('.anitracker-player-dropup-spinner').show();

      const dlBtn = $(this);
      const redirectUrl = dlBtn.attr('href');

      getDownloadPage(redirectUrl).then(result => {
        hideSpinner(dlBtn);
        if (result === 1) {
          windowOpen(redirectUrl); // When failed, open the link normally
          return;
        }

        dlBtn.attr('href', result);
        dlBtn.off();
        dlBtn.changeElementType('a');
        windowOpen(result);
      });
    });
}

function stripUrl(url) {
  if (url === undefined) {
    console.error('[AnimePahe Improvements] stripUrl was used with undefined URL');
    return url;
  }
  const loc = new URL(url);
  return loc.origin + loc.pathname;
}

function temporaryHtmlChange(elem, delay, html, timeout = undefined) {
  if (timeout !== undefined) clearTimeout(timeout);
  if ($(elem).attr('og-html') === undefined) {
    $(elem).attr('og-html', $(elem).html());
  }
  elem.html(html);
  return setTimeout(() => {
    $(elem).html($(elem).attr('og-html'));
  }, delay);
}

$(`
<button class="btn btn-dark" id="anitracker-clear-from-tracker" title="Remove this page from the session tracker">
  <i class="fa fa-trash" aria-hidden="true"></i>
  &nbsp;Clear Session
</button>`).appendTo('#anitracker');

$('#anitracker-clear-from-tracker').on('click', function() {
  const animeName = getAnimeName();

  if (isEpisode()) {
    deleteEpisodeFromTracker(animeName, getEpisodeNum(), getAnimeId(animeSession, animeName));

    if ($('.embed-responsive-item').length) {
      const storage = getStorage();
      const videoUrl = stripUrl($('.embed-responsive-item').attr('src'));
      for (const videoData of storage.videoTimes) {
        if (!videoData.videoUrls.includes(videoUrl)) continue;
        if (isSyncEnabled(storage)) {
          storage.sync.temp.removedData.push({type: 'videoTimes', animeName: videoData.animeName, episodeNum: videoData.episodeNum});
        }

        const index = storage.videoTimes.indexOf(videoData);
        storage.videoTimes.splice(index, 1);
        saveData(storage);
        break;
      }
    }
  }
  else {
    const storage = getStorage();
    if (isSyncEnabled(storage)) {
      storage.sync.temp.removedData.push(...storage.linkList.filter(g => g.type === 'anime' && g.animeName === animeName).map(g => {return {type: 'linkList', animeSession: g.animeSession}}));
    }

    storage.linkList = storage.linkList.filter(a => !(a.type === 'anime' && a.animeName === animeName));

    saveData(storage);
  }

  temporaryHtmlChange($('#anitracker-clear-from-tracker'), 1500, 'Cleared!');
});

function improvePoster() {
  if (!$('.anime-poster .youtube-preview').length) {
    $('.anime-poster .poster-image').attr('target','_blank');
    return;
  }
  $('.anime-poster .youtube-preview').removeAttr('href');
  $(`
  <a style="display:block;" target="_blank" href="${$('.anime-poster .youtube-preview img').attr('src').replace('.md','')}">
    View full poster
  </a>`).appendTo('.anime-poster');
}

function setProgressBar(baseElem, epWatched, currentTime, duration) {
  const progress = $(
    `<div class="anitracker-episode-progress"></div>`
  ).appendTo(baseElem.find('.episode-snapshot'));

  if (epWatched) {
    progress.css('width', '100%');
    return;
  }

  progress.css('width', (currentTime / duration) * 100 + '%');
}

function addEpisodeOptions(parentElem, features, data) {
  const featuresHtml = [];
  if (features.copyLink) featuresHtml.push(`<button title="Copy a link to this episode" data-action="copy"><i class="fa fa-copy" aria-hidden="true"></i>Copy link</button>`);
  if (features.toggleWatched) featuresHtml.push(`<button title="Toggle this episode being fully watched" data-action="toggle-watched"><i class="fa fa-${data.watched ? 'eye-slash' : 'eye'}" aria-hidden="true"></i>Mark ${data.watched ? 'unwatched' : 'watched'}</button>`);
  if (features.addWatched) featuresHtml.push(`<button title="Mark this episode as being fully watched" data-action="add-watched"><i class="fa fa-eye" aria-hidden="true"></i>Mark watched</button>`);
  if (features.download) featuresHtml.push(`<button title="Open download page for this episode" data-action="download"><i class="fa fa-download" aria-hidden="true"></i>Download</button>`);
  if (features.remove) featuresHtml.push(`<button title="Remove this progress" data-action="remove"><i class="fa fa-trash" aria-hidden="true"></i>Remove</button>`);

  const elem = $(`
    <button class="anitracker-episode-menu-button" title="View episode options">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
        <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
        <path fill="currentColor" d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"></path>
      </svg>
    </button>
    <div class="dropdown-menu anitracker-dropdown-content anitracker-episode-menu-dropdown">
      ${featuresHtml.join('')}
    </div>
  `).appendTo(parentElem);

  for (const [key, value] of Object.entries(data)) {
    $(elem[2]).data(key, value);
  }
}

function applyEpisodeOptionsEvents(elems) {
  function downloadEpisode(redirectUrl, dropdownElem, resPref, langPref) {
    getDownloadPage(redirectUrl).then(result => {
      dropdownElem.parents().eq(1).find('.anitracker-episode-spinner').remove();
      if (result === 1) {
        windowOpen(redirectUrl);
        return;
      }

      dropdownElem.attr('href', result).data('resPref', resPref).data('langPref', langPref);
      windowOpen(result);
    });
  }

  elems.find('.anitracker-episode-menu-button').off('click').on('click', (e) => {
    const elem = $(e.currentTarget);
    const dropdown = elem.parent().find('.anitracker-episode-menu-dropdown');
    dropdown.toggle();
    if (!dropdown.is(':visible')) elem.blur();
  })
  .off('blur').on('blur', (e) => {
    const dropdown = $(e.currentTarget).parent().find('.anitracker-episode-menu-dropdown');
    const dropdownBtns = dropdown.find('button');
    setTimeout(() => {
      if (dropdownBtns.is(':focus')) return;
      dropdown.hide();
    }, 100);
  });

  elems.find('.anitracker-episode-menu-dropdown>button').off('click').on('click', (e) => {
    const elem = $(e.currentTarget);
    const dropdown = elem.parent();
    const episode = +dropdown.data('ep');
    const animeName = dropdown.data('title');
    const animeId = dropdown.data('anime-id');

    const action = elem.data('action');
    dropdown.hide();

    if (action === 'copy') {
      navigator.clipboard.writeText(window.location.origin + '/customlink?a=' + animeId + '&e=' + episode);
      showMessage('Copied link!');
      return;
    }
    else if (action === 'toggle-watched') {
      const epWatched = dropdown.data('watched');
      dropdown.data('watched', !epWatched);
      const videoTime = getStoredTime(animeName, episode, getStorage(), +animeId);
      if (epWatched) {
        removeWatched(+animeId, episode);
        dropdown.parent().find('.anitracker-episode-progress').remove();
      }
      else {
        addWatched(+animeId, episode);
      }

      // epWatched is the current watched state
      if (!epWatched || videoTime) setProgressBar(dropdown.parent(), !epWatched, videoTime?.time, +dropdown.data('visualDuration'));

      elem.contents().filter(function(){
        return this.nodeType === 3;
      })[0].textContent = 'Mark ' + (epWatched ? 'watched' : 'unwatched');
      elem.find('i').toggleClass('fa-eye').toggleClass('fa-eye-slash');
      return;
    }
    else if (action === 'download') {
      const storage = getStorage();
      const resPref = storage.settings.dlPreferRes;
      const langPref = storage.settings.dlPreferLang;

      if (elem.attr('href') && resPref === elem.data('resPref') && langPref === elem.data('langPref')) {
        windowOpen(elem.attr('href'));
        return;
      }

      const spinner = $(`<div class="anitracker-spinner anitracker-episode-spinner">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>`).prependTo(dropdown.parent());
      const pageLink = dropdown.parent().find('a').attr('href');
      const req = new XMLHttpRequest();
      req.open('GET', pageLink, true);
      req.onload = () => {
        const htmlPage = $(req.response);
        const versions = [];
        for (const item of htmlPage.find('#pickDownload>')) {
          const dlElem = $(item);
          const parts = /^.* · (\d+)p \(\d+[GM]B\)( (\w+))*/.exec(dlElem.text());
          if (!parts) continue;
          const res = +parts[1];
          const lang = (() => {
            if (parts[0].includes('eng')) return 'en';
            if (parts[0].includes('chi')) return 'ch';
            return 'jp';
          })();

          versions.push({
            html: dlElem.html(),
            res: res,
            lang: lang,
            url: dlElem.attr('href')
          });
        }
        const bestCandidates = [];
        for (const ver of versions) {
          if (resPref) {
            const resExists = versions.find(a => a.res === resPref);
            if (ver.res !== resPref && resExists) continue;
            else if (!resExists && resPref === 1080 && versions.find(a => a.res > ver.res)) continue;
          }
          if (langPref && ver.lang !== langPref && versions.find(a => a.lang === langPref)) continue;

          bestCandidates.push(ver);
        }
        const candidates = bestCandidates.length ? bestCandidates : versions;
        if (!candidates.length) showMessage("Couldn't download");
        else if (candidates.length === 1) downloadEpisode(candidates[0].url, elem, resPref, langPref);
        else {
          $('#anitracker-modal-body').empty();
          $(`<span class="anitracker-thin-text">Select which version to download</span>`).appendTo('#anitracker-modal-body');
          candidates.forEach(a => {
            $(`<button href="${a.url}" class="anitracker-download-select-button">${a.html}</button>`).appendTo('#anitracker-modal-body');
          });
          $('.anitracker-download-select-button').on('click', function() {
            const btnElem = $(this);
            downloadEpisode(btnElem.attr('href'), elem, resPref, langPref);
            closeModal();
          });
          openModal();
          addModalEvent($('#anitracker-modal'), 'anitracker:close', () => {spinner.remove()});
        }
      };
      req.onerror = () => {
        showMessage('Downloading failed');
        spinner.remove();
      };
      req.ontimeout = req.onerror;
      req.send();
    }
    else if (action === 'add-watched') {
      if (!animeId) {
        showMessage('Error marking as watched');
        return;
      }
      const storage = getStorage();

      // Only remove the video time
      deleteVideoTime(animeName, episode);

      addWatched(+animeId, episode, storage);

      showMessage('Marked as watched');
      updateContinueWatchingEpisodes();
    }
    else if (action === 'remove') {
      deleteEpisodeFromTracker(animeName, episode, +animeId);
      showMessage('Removed');
      updateContinueWatchingEpisodes();
    }
  })
  .off('blur').on('blur', (e) => {
    const dropdown = $(e.currentTarget).parent();
    const btn = dropdown.parent().find('.anitracker-episode-menu-button');
    const dropdownBtns = dropdown.find('button');
    setTimeout(() => {
      if (btn.is(':focus') || dropdownBtns.is(':focus')) return;
      $(e.currentTarget).parent().hide();
    }, 100);
  });
}

function updateEpisodePages(allowCache = true) {
  if (isHome()) updateContinueWatchingEpisodes();
  siteVars.episodePages.forEach(g => {
    updateEpisodePage(g, allowCache);
  });
}

// MARKER:EPISODE PAGE CHANGES
function updateEpisodePage(entry, allowCache = true) {
  const animeSession = entry.animeSession;
  const pageNum = getPageNum();
  const episodeSort = $('.episode-bar .btn-group-toggle .active').text().trim();

  // Only situation where cache isn't allowed is when the page has changed
  const cachedList = allowCache ? entry.cachedList : undefined;
  const episodes = cachedList ?? getResponseData(entry.apiLink.replace('{page_num}', pageNum).replace('{anime_session}', animeSession).replace('{sort_dir}', episodeSort));
  if (episodes === undefined) return undefined;
  entry.cachedList = episodes;
  if (!episodes.length) return undefined;

  const episodeElements = entry.element.find('.episode-wrap');

  const storage = getStorage();
  let animeId;
  let animeName;
  if (entry.mode === 'single') {
    animeId = episodes[0].anime_id;
    animeName = getAnimeName();
  }
  const watched = decodeWatched(storage.watched);
  const videoTimes = (() => {
    if (entry.mode === 'multi') return storage.videoTimes;
    return storage.videoTimes.filter(a => (a.animeId === animeId || a.animeName === getAnimeName()));
  })();

  for (let i = 0; i < episodeElements.length; i++) {
    const elem = $(episodeElements[i]);

    const date = new Date(episodes[i].created_at + " UTC");
    const episode = episodes[i].episode;
    if (entry.mode === 'multi') {
      animeId = episodes[i].anime_id;
      animeName = episodes[i].anime_title;
    }

    if (entry.features.date && !elem.find('.anitracker-episode-date').length) {
      $(`
        <a class="anitracker-episode-date" href="${$(elem.find('a.play')).attr('href')}" tabindex="-1" title="${date.toDateString() + " " + date.toLocaleTimeString()}">${date.toLocaleDateString()}</a>
      `).appendTo(elem.find(entry.features.date.selector));
    }

    const epWatched = isWatched(animeId, episode, watched);

    elem.find('.anitracker-episode-progress').remove();

    const videoProgress = videoTimes.find(e => e.episodeNum === episode && (entry.mode === 'single' ? true : ((animeId && e.animeId === animeId) || e.animeName === animeName)));
    const duration = (() => {
      if (episodes[i].duration) return HMStoSeconds(episodes[i].duration);
      if (videoProgress) return videoProgress.duration || (videoProgress.time * 2 /*Fake the duration if none is found*/);
      return 0;
    })();

    if (epWatched || videoProgress) setProgressBar(elem, epWatched, videoProgress?.time, duration);

    if (!elem.find('.anitracker-episode-menu-button').length) {
      addEpisodeOptions(elem.find('.episode'), entry.features.episodeOptions,
      {
        ep: episode,
        visualDuration: Math.floor(duration),
        title: animeName,
        'anime-id': animeId,
        watched: epWatched,
      });
    }
    else {
      if (entry.features.episodeOptions.toggleWatched) elem.find('.anitracker-episode-menu-dropdown>button[data-action="toggle-watched"]').contents().filter(function(){
        return this.nodeType === 3;
      })[0].textContent = `Mark ${epWatched ? 'unwatched' : 'watched'}`;
      elem.find('.anitracker-episode-menu-dropdown').data('watched', epWatched);
    }

    elem.find('.episode-duration').text(secondsToHMS(duration));

    if (entry.features.insertEpNum && !elem.find('.episode-number').contents().filter(function(){
      return this.nodeType === 3;
    })[0]) {
      // This HTML text needs to be in one line, otherwise more text nodes will be inserted
      elem.find('.episode-number-wrap').prepend(`
      <div class="episode-number" style="margin-right: 5px;"><span class="text-hide">${animeName} Episode </span>${getEpisodeValue(episode, episodes[i].episode2)}</div>`);
    }
  }

  if (entry.features.navImprovement && !$('.anitracker-page-selection').length && $('.pagination').length) {
    const pageLinks = $('.page-item>.page-link');
    const lastPageElem = $(pageLinks[pageLinks.length - 1]);
    const lastPage = lastPageElem.data('page');
    $(pageLinks[0]).find('span:not(.sr-only)').text('1');
    lastPageElem.find('span:not(.sr-only)').text([] + lastPage);

    $(`<input class="anitracker-page-selection" title="Enter page">`).insertAfter('.page-item.active');
    $('.anitracker-page-selection').on('keydown', function(e) {
      if (e.key !== 'Enter' || $(this).val() === '') return;
      const targetPage = +$(this).val();
      if (isNaN(targetPage)) {
        $(this).val('');
        return;
      }

      $('.page-link:not(.disabled)').data('page', Math.min(targetPage,+lastPage))[0].click();
      $(this).val('');
    });
  }

  applyEpisodeOptionsEvents(episodeElements);

  // Second loop for episode number correction, because otherwise the await could slow down the other visuals
  // Run as another function to make sure that everything else in this function is synchronous
  (async () => {
    let firstEpisode = (entry.mode === 'multi' || !storage.settings.relativeEpNums) ? undefined : await getFirstEpisode(animeSession);

    for (let i = 0; i < episodeElements.length; i++) {
      if (entry.mode === 'multi' && storage.settings.relativeEpNums) firstEpisode = await getFirstEpisode(episodes[i].anime_session);

      if (pageNum !== getPageNum()) break; // If the page has been changed

      const ep = episodes[i].episode;
      const ep2 = episodes[i].episode2;

      const textNode = $(episodeElements[i]).find('.episode-number:not(.text-success)').contents().filter(function(){
        return this.nodeType === 3;
      })[0].textContent = getEpisodeValue(ep, ep2, firstEpisode);
    }
  })();
}

if (isAnime()) {
  if ($($('.anime-poster img')[0]).attr('src')) {
    improvePoster();
  }
  else $($('.anime-poster img')[0]).on('load', function() {
    improvePoster();
    $(this).off('load');
  });

  $(`
  <button class="btn btn-dark" id="anitracker-clear-episodes-from-tracker" title="Clear all episodes from this anime from the session tracker">
    <i class="fa fa-trash" aria-hidden="true"></i>
    <i class="fa fa-window-maximize" aria-hidden="true"></i>
    &nbsp;Clear Episode Sessions
  </button>`).appendTo('#anitracker');

  $('#anitracker-clear-episodes-from-tracker').on('click', function() {
    deleteEpisodesFromTracker(undefined, getAnimeName(), getAnimeId(animeSession));

    temporaryHtmlChange($('#anitracker-clear-episodes-from-tracker'), 1500, 'Cleared!');

    updateEpisodePages();
  });

  if (!isRandomAnime()) {
    const elem = $('.anime-cover');
    if (!elem.css('background-image').startsWith('none')) updateAnimeCover();
    else new MutationObserver(function(mutationList, observer) {
      if (elem.css('background-image').startsWith('none')) return;
      updateAnimeCover();

      observer.disconnect();
    }).observe(elem[0], { attributes: true });
  }
  else { // If random anime
    window.history.replaceState({}, document.title, "/anime/" + animeSession);
    document.title = 'Random result: ' + document.title;

    const storage = getStorage();
    let preparedList = [];
    if (storage.temp) {
      preparedList = storage.temp;
      delete storage.temp;
      saveData(storage);
    }

    $(`
    <div class="anitracker-random-result-buttons">
      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-reroll-button" title="Go to another random anime"><i class="fa fa-random" aria-hidden="true"></i>&nbsp;Reroll Anime</button>
      </div>
      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-save-session-button" title="Save this page's session"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Save Session</button>
      </div>
    </div>`).appendTo('.title-wrapper');

    $('#anitracker-reroll-button').on('click', function() {
      $(this).text('Rerolling...');
      const params = new URLSearchParams('anitracker-random=1');

      if (preparedList.length > 0) {
        const storage = getStorage();
        storage.temp = preparedList;
        saveData(storage);

        getRandomAnime(preparedList, getSearchParamsString(params), '_self');
      }
      else {
        getFilteredList([]).then((animeList) => {
          const storage = getStorage();
          storage.temp = animeList;
          saveData(storage);

          getRandomAnime(animeList, getSearchParamsString(params), '_self');
        });
      }
    });

    $('#anitracker-save-session-button').on('click', function() {
      setSessionData();
      $('#anitracker-save-session-button').off();
      $(this).text('Saved!');

      updateAnimeCover();

      setTimeout(() => {
        $(this).parent().remove();
      }, 1500);
    });
  }

  siteVars.episodePages.push({
    element: $('.episode-list-wrapper'),
    apiLink: '/api?m=release&sort=episode_{sort_dir}&id={anime_session}&page={page_num}',
    mode: 'single',
    features: {
      date: {
        selector: '.episode-title-wrap'
      },
      navImprovement: true,
      episodeOptions: {
        copyLink: true,
        toggleWatched: {
          watched: undefined
        },
        download: true,
      },
    },
    animeSession: animeSession,
  });

  // Show episode upload time & episode progress
  new MutationObserver(function(mutationList, observer) {
    if (!$('.episode-list-wrapper .episode-wrap').length) return;
    updateEpisodePages(false);

    observer.disconnect();
    setTimeout(observer.observe($('.episode-list-wrapper')[0], { childList: true, subtree: false }), 1);
  }).observe($('.episode-list-wrapper')[0], { childList: true, subtree: false });

  // Title icons
  const animename = getAnimeName();
  const animeid = getAnimeId(animeSession, animename); // Pre-cache anime data
  $('h1 .fa').remove();

  const notifIcon = (() => {
    if (initialStorage.debug?.notifs) return true;
    if (initialStorage.notifications.anime.find(a => a.name === animename)) return true;
    for (const info of $('.anime-info p>strong')) {
      if (!$(info).text().startsWith('Status:')) continue;
      return $(info).text().includes("Not yet aired") || $(info).find('a').text().includes("Currently Airing");
    }
    return false;
  })() ?
  `<i title="Add to episode feed" class="fa fa-bell anitracker-title-icon anitracker-notifications-toggle">
    <i style="display: none;" class="fa fa-check anitracker-title-icon-check" aria-hidden="true"></i>
  </i>` : '';

  $(`
  <i title="Bookmark this anime" class="fa fa-bookmark anitracker-title-icon anitracker-bookmark-toggle">
    <i style="display: none;" class="fa fa-check anitracker-title-icon-check" aria-hidden="true"></i>
  </i>${notifIcon}<a href="/a/${animeid}" title="Shortcut Link" class="fa fa-link btn anitracker-title-icon" data-toggle="modal" data-target="#modalBookmark"></a>
  `).appendTo('.title-wrapper>h1');

  if (initialStorage.bookmarks.find(g => g.id === animeid)) {
    $('.anitracker-bookmark-toggle .anitracker-title-icon-check').show();
  }

  if (initialStorage.notifications.anime.find(g => g.id === animeid)) {
    $('.anitracker-notifications-toggle .anitracker-title-icon-check').show();
  }

  $('.anitracker-bookmark-toggle').on('click', (e) => {
    const check = $(e.currentTarget).find('.anitracker-title-icon-check');
    const storage = getStorage();
    const entry = storage.bookmarks.find(g => g.id === animeid);

    openBookmarkStatusEditModal(animeid, !entry, true);
  });

  $('.anitracker-notifications-toggle').on('click', (e) => {
    const check = $(e.currentTarget).find('.anitracker-title-icon-check');
    if (!check.is(':visible') && getStorage().notifications.anime.length >= getStorageLimits().notifications.anime) {
      alert(`[AnimePahe Improvements]\n\nYou already have too many episode feeds (maximum ${getStorageLimits().notifications.anime})`);
      showMessage('Too many feeds!');
      return;
    }

    if (toggleNotifications(animename, animeid)) {
      check.show();
      showMessage('Added to feed!');
      return;
    }
    check.hide();
    showMessage('Removed from feed');

  });

  if (initialStorage.settings.relativeEpNums) setRelativeEpNums(true);
}

function getRandomAnime(list, args, openType = '_blank') {
  if (!list.length) {
    showMessage("No matching anime found!");
    return;
  }
  const random = randint(0, list.length-1);
  windowOpen(list[random].link + args, openType);
}

function isRandomAnime() {
  return new URLSearchParams(window.location.search).has('anitracker-random');
}

function trimHttp(string) {
  return string.replace(/^(https?:)?\/\//,'');
}

function selectElementText(el) {
  const win = window;
  let doc = win.document, sel, range;
  if (win.getSelection && doc.createRange) {
    sel = win.getSelection();
    range = doc.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (doc.body.createTextRange) {
    range = doc.body.createTextRange();
    range.moveToElementText(el);
    range.select();
  }
}

// MARKER:ANIME PAGE COVER
// Update the anime cover at the top of the page
function updateAnimeCover() {
  const storage = getStorage();
  const storedObj = getStoredLinkData(storage);

  if (storedObj?.coverImg === 'default') return;

  if (storedObj && storedObj.coverImg) {
    setAnimeCover(storedObj.coverImg);
    return;
  }

  $(`<div id="anitracker-cover-spinner" class="anitracker-spinner">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`).prependTo('.anime-cover');

  getAnimeCoverUrl().then(src => {
    $('#anitracker-cover-spinner').remove();
    if (!src) {
      const storage = getStorage();
      const storedObj = getStoredLinkData(storage);
      storedObj.coverImg = 'default';
      saveData(storage);
      return;
    }
    setAnimeCover(src);
  });
}

function getBadCovers() {
  const storage = getStorage();
  return ['https://s.pximg.net/www/images/pixiv_logo.png',
          'https://st.deviantart.net/minish/main/logo/card_black_large.png',
          'https://www.wcostream.com/wp-content/themes/animewp78712/images/logo.gif',
          'https://s.pinimg.com/images/default_open_graph',
          'https://share.redd.it/preview/post/',
          'https://i.redd.it/o0h58lzmax6a1.png',
          'https://ir.ebaystatic.com/cr/v/c1/ebay-logo',
          'https://i.ebayimg.com/images/g/7WgAAOSwQ7haxTU1/s-l1600.jpg',
          'https://www.rottentomatoes.com/assets/pizza-pie/head-assets/images/RT_TwitterCard',
          'https://m.media-amazon.com/images/G/01/social_share/amazon_logo',
          'https://zoro.to/images/capture.png',
          'https://cdn.myanimelist.net/img/sp/icon/twitter-card.png',
          'https://s2.bunnycdn.ru/assets/sites/animesuge/images/preview.jpg',
          'https://s2.bunnycdn.ru/assets/sites/anix/preview.jpg',
          'https://cdn.myanimelist.net/images/company_no_picture.png',
          'https://myanimeshelf.com/eva2/handlers/generateSocialImage.php',
          'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon',
          'https://m.media-amazon.com/images/G/01/imdb/images/social',
          'https://forums.animeuknews.net/styles/default/',
          'https://honeysanime.com/wp-content/uploads/2016/12/facebook_cover_2016_851x315.jpg',
          'https://fi.somethingawful.com/images/logo.png',
          'https://static.hidive.com/misc/HIDIVE-Logo',
          'https://static.tvtropes.org/pmwiki/pub/images/logo_light.png',
          'https://sb-drops.s3.amazonaws.com/drop/rmopt-63058b16935f5-960364300-1661307670.png',
          'https://myanimelist.net/img/sp/icon/twitter-card.png',
          ...storage.badCovers];
}

async function getAnimeCoverUrl() {
  return new Promise(async resolve => {
    const anilistId = (() => {
      for (const link of $('.external-links a')) {
        const elem = $(link);
        if (!elem.text().includes('AniList')) continue;
        const regexRes = /\/\/anilist.co\/anime\/(\d+)/.exec(elem.attr('href'));
        if (regexRes) return regexRes[1];
        else return undefined;
      }
      return undefined;
    })();

    if (!anilistId) {
      const googleRes = await withGoogle();
      resolve(googleRes);
      return;
    }

    const request = new XMLHttpRequest();
    request.open('POST', 'https://graphql.anilist.co', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Accept', 'application/json');

    request.onload = async () => {
      let response;
      try {
        response = JSON.parse(request.response);
      }
      catch (err) {
        console.error(err);
        const googleRes = await withGoogle();
        resolve(googleRes);
        return;
      }
      const animeObj = response?.data?.Media;
      if (!animeObj || !animeObj.bannerImage) {
        const googleRes = await withGoogle();
        resolve(googleRes);
        return;
      }

      resolve(animeObj.bannerImage);
    };
    request.onerror = async (err) => {
      console.error(err);
      const googleRes = await withGoogle();
      resolve(googleRes);
    }
    request.ontimeout = request.onerror;

    request.send(JSON.stringify({
      query: `
        query ($id: Int) {
          Media (id: $id, type: ANIME) {
            bannerImage
          }
        }`,
      variables: {
        id: anilistId
      }
    }));
  });

  async function withGoogle() {
    console.log('[AnimePahe Improvements] Could not get anime cover with AniList. Trying Google.');
    return new Promise(resolve => {
      let beforeYear = 2022;
      for (const info of $('.anime-info p')) {
        if (!$(info).find('strong').html().startsWith('Season:')) continue;
        const year = +/(\d+)$/.exec($(info).find('a').text())[0];
        if (year >= beforeYear) beforeYear = year + 1;
      }

      const request = new XMLHttpRequest();
      request.open('GET', 'https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyCzrHsVOqJ4vbjNLpGl8XZcxB49TGDGEFk&cx=913e33346cc3d42bf&tbs=isz:l&q=' + encodeURIComponent(getAnimeName()) + '%20anime%20hd%20wallpaper%20-phone%20-ai%20before:' + beforeYear, true);
      request.onload = async function() {
        if (request.status !== 200) {
          resolve(undefined);
          return;
        }

        const badCovers = getBadCovers();
        const candidates = [];
        let results = [];
        try {
          results = JSON.parse(request.response).items;
        }
        catch (e) {
          console.error(`[AnimePahe Improvements] JSON parse error when trying to find new anime cover: ${e}`);
          resolve(undefined);
          return;
        }
        if (!results) {
          resolve(undefined);
          return;
        }
        for (const result of results) {
          let imgUrl = result['pagemap']?.['metatags']?.[0]?.['og:image'] ||
                result['pagemap']?.['cse_image']?.[0]?.['src'] || result['pagemap']?.['webpage']?.[0]?.['image'] ||
                result['pagemap']?.['metatags']?.[0]?.['twitter:image:src'];

          const width = result['pagemap']?.['cse_thumbnail']?.[0]?.['width'];
          const height = result['pagemap']?.['cse_thumbnail']?.[0]?.['height'];

          if (!imgUrl || height < 100 || badCovers.find(a=> trimHttp(imgUrl).startsWith(trimHttp(a))) || imgUrl.endsWith('.gif')) continue;

          if (imgUrl.startsWith('https://static.wikia.nocookie.net')) {
            imgUrl = imgUrl.replace(/\/revision\/latest.*\?cb=\d+$/, '');
          }

          candidates.push({
            src: imgUrl,
            width: width,
            height: height,
            aspectRatio: width / height
          });
        }

        if (!candidates.length) {
          resolve(undefined);
          return;
        }

        candidates.sort((a, b) => {return a.aspectRatio < b.aspectRatio ? 1 : -1});
        let topCandidate;

        for (const c of candidates) {
          if (c.src.includes('"')) continue;
          topCandidate = c.src;
          break;
        }

        if (!topCandidate) {
          resolve(undefined);
          return;
        }

        const image = new Image();
        image.onload = () => {
          if (image.width >= 250) {
            resolve(topCandidate);
          }
          else resolve(undefined);
        };

        image.addEventListener('error', function() {
          resolve(undefined);
        });

        image.src = topCandidate;
      };

      request.onerror = (e) => {
        console.error(`[AnimePahe Improvements] Network error when trying to find new anime cover: ${e}`);
        resolve(undefined);
        return;
      };
      request.ontimeout = request.onerror;

      request.send();
    });
  }
}

async function setAnimeCover(src, defaultBg = false) {
  const storage = getStorage();
  const bobj = getStoredLinkData(storage);
  bobj.coverImg = src;
  saveData(storage);

  const cover = $('.anime-cover');

  if (!defaultBg) {
    const img = new Image();
    img.onload = () => {
      const ratio = cover.width()/img.width;
      if (ratio <= 1) return;
      cover.css('filter', `blur(${(ratio*Math.max((img.height/img.width)**2, 1))*1.6}px)`);
    };
    img.src = src;
  }

  cover.addClass('anitracker-replaced-cover');
  cover.css('background-image', `url("${src}")`);
  cover.attr('image', src);

  // TODO: Option to better control what the cover is
  /*$('#anitracker-replace-cover').remove();
  $(`<button class="btn btn-dark" id="anitracker-replace-cover" title="Use another cover instead">
    <i class="fa fa-refresh" aria-hidden="true"></i>
  </button>`).appendTo(cover);

  $('#anitracker-replace-cover').on('click', e => {
    const storage = getStorage();
    if (!defaultBg) storage.badCovers.push($(cover).attr('image'));
    saveData(storage);
    updateAnimeCover();
    $(e.target).off();
    playAnimation($(e.target).find('i'), 'spin', 1, 'infinite');
  });*/
}

function hideThumbnails() {
  $('.main').addClass('anitracker-hide-thumbnails');
}

function resetPlayer() {
  setIframeUrl(stripUrl($('.embed-responsive-item').attr('src')));
}

// MARKER:OPTIONS AND MANAGE DATA
function addGeneralButtons() {
  $(`
  <button class="btn btn-dark" id="anitracker-show-data" title="View and handle stored data">
    <i class="fa fa-floppy-o" aria-hidden="true"></i>
    &nbsp;Manage Data...
  </button>
  <button class="btn btn-dark" id="anitracker-options" title="Options">
    <i class="fa fa-sliders" aria-hidden="true"></i>
    &nbsp;Options...
  </button>`).appendTo('#anitracker');

  function openOptionsModal() {
    $('#anitracker-modal-body').empty();

    if (isAnime() || isEpisode())
      $(`<div class="btn-group">
        <button class="btn btn-secondary" id="anitracker-refresh-session" title="Refresh the session for the current page">
          <i class="fa fa-refresh" aria-hidden="true"></i>
          &nbsp;Refresh Session
        </button></div>`).appendTo('#anitracker-modal-body');

    $(`<div class="anitracker-dark-area" id="anitracker-player-options" style="${isAnime() || isEpisode() ? 'margin-top:10px;' : ''}"><span style="display:block;">Video player:</span></div>`).appendTo('#anitracker-modal-body');

    addOptionSwitch('autoPlayVideo', 'Auto-Play Video', 'Automatically play the video when it is loaded. (You might need to tell your browser to allow auto-playing on this website)', '#anitracker-player-options');
    addOptionSwitch('theatreMode', 'Theatre Mode', 'Expand the video player for a better experience on bigger screens.', '#anitracker-player-options');
    addOptionSwitch('bestQuality', 'Default to Best Quality', 'Automatically select the best resolution quality available.', '#anitracker-player-options');
    addOptionSwitch('seekThumbnails', 'Seek Thumbnails', 'Show thumbnail images while seeking through the progress bar. May cause performance issues on weak systems.', '#anitracker-player-options');
    addOptionSwitch('seekPoints', 'Seek Points', 'Show points on the progress bar.', '#anitracker-player-options');
    addOptionSwitch('skipButton', 'Skip Button', 'Show a button to skip sections of episodes.', '#anitracker-player-options');
    addOptionSwitch('copyScreenshots', 'Copy Screenshots', 'Copy screenshots to the clipboard, instead of downloading them.', '#anitracker-player-options');

    if (isEpisode()) {
      $(`
      <div class="btn-group">
        <button class="btn btn-secondary" id="anitracker-reset-player" title="Reset the video player">
          <i class="fa fa-rotate-right" aria-hidden="true"></i>
          &nbsp;Reset Player
        </button>
      </div><br>
      <a class="btn-group" style="margin-top: 5px;" href="https://github.com/Ellivers/open-anime-timestamps/issues/new?title=Anime%20%22${encodeURIComponent(getAnimeName())}%22%20has%20incorrect%20timestamps&body=Anime%20ID:%20${getAnimeId(animeSession)}%0AAffected%20episode(s):%20${getEpisodeNum()}%0A%0A(Add%20more%20info%20here...)" target="_blank">
        <button class="btn btn-secondary anitracker-flat-button" id="anitracker-report-timestamps" title="Open a new issue for incorrect or missing timestamps on this episode">
          <i class="fa fa-external-link"></i>
          &nbsp;Report Timestamp Issue
        </button>
      </a><br>
      <div class="btn-group" style="margin-top: 5px;">
        <button class="btn btn-secondary anitracker-flat-button" id="anitracker-edit-timestamps" title="Edit timestamps for the current episode (advanced & desktop only)">
          <i class="fa fa-edit" aria-hidden="true"></i>
          &nbsp;Edit/add timestamps
        </button>
      </div>`).appendTo('#anitracker-player-options');

      $('#anitracker-reset-player').on('click', function() {
        closeModal();
        resetPlayer();
      });

      $('#anitracker-edit-timestamps').on('click', function() {
        sendMessage({action:'timestamp_edit_mode'});
        closeModal();
        $('.embed-responsive-item')[0].contentWindow.focus();
      });
    }

    $('<div class="anitracker-dark-area" id="anitracker-site-options" style="margin-top:10px;"><span style="display:block;">Site:</span></div>').appendTo('#anitracker-modal-body');
    addOptionSwitch('hideThumbnails', 'Hide Thumbnails', 'Hide thumbnails and preview images.', '#anitracker-site-options');
    addOptionSwitch('relativeEpNums', 'Relative Episode Numbers', 'Don\'t continue episode numbers through sequels.', '#anitracker-site-options');
    addOptionSwitch('autoDelete', 'Auto-Clear Episodes', 'Only one episode of a series is stored in the tracker at a time.', '#anitracker-site-options');
    addOptionSwitch('autoDownload', 'Automatic Download', 'Automatically download the episode when visiting a download page.', '#anitracker-site-options');
    addOptionSwitch('showContinueWatching', 'Watching Section', 'Show the "Continue Watching" section on the homepage.', '#anitracker-site-options');
    addOptionSwitch('reduceMotion', 'Reduce Motion', 'Don\'t show animations for opening/closing modal menus.', '#anitracker-site-options');
    addOptionSwitch('stickyHeader', 'Header Follows', 'Always keep the header at the top of the screen.', '#anitracker-site-options');

    $(`
    <div class="btn-group" style="margin-top: 5px;">
      <button class="btn btn-secondary" id="anitracker-edit-keybinds" title="Edit site keybinds">
        <i class="fa fa-edit" aria-hidden="true"></i>
        &nbsp;Edit Keybinds...
      </button>
    </div>
    <div class="btn-group" style="display:block;margin-top: 5px;">
      <button class="btn btn-secondary anitracker-flat-button" id="anitracker-dl-options" title="Change download options">
        <i class="fa fa-download" aria-hidden="true"></i>
        &nbsp;Download Preferences...
      </button>
    </div>`).appendTo('#anitracker-site-options');

    if (isAnime()) {
      $(`
      <div class="anitracker-dark-area" style="margin-top:10px;">
        <span style="display:block;">This anime:</span>
        <div class="btn-group">
          <button class="btn btn-secondary" id="anitracker-mark-watched" title="Mark all episodes of this anime as fully watched">
            <i class="fa fa-eye" aria-hidden="true"></i>
            &nbsp;Mark As Watched
          </button>
        </div>
        <div class="anitracker-mark-watched-spinner anitracker-spinner" style="display: none;vertical-align: bottom;">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
        </div>
        <div class="btn-group" style="display:block;margin-top: 5px;">
          <button class="btn btn-secondary" id="anitracker-unmark-watched" title="Unmark all fully watched episodes of this anime">
            <i class="fa fa-eye-slash" aria-hidden="true"></i>
            &nbsp;Unmark Watched Episodes
          </button>
        </div>
      </div>`).appendTo('#anitracker-modal-body');

      $('#anitracker-mark-watched').on('click', function(e) {
        $(e.currentTarget).prop('disabled', true);
        $('.anitracker-mark-watched-spinner').css('display','inline');
        getAllEpisodes(animeSession).then((episodes) => {
          $(e.currentTarget).prop('disabled', false);

          if (!episodes.length) {
            $('.anitracker-mark-watched-spinner').css('display','none');
            return;
          }

          const converted = episodes.map(e => e.episode);

          const storage = getStorage();
          const watched = decodeWatched(storage.watched);
          const animeId = episodes[0].anime_id;

          const found = watched.find(a => a.animeId === animeId);
          if (found) {
            found.episodes = converted;
          }
          else {
            watched.push({
              animeId: animeId,
              episodes: converted
            });
          }

          if (isSyncEnabled(storage)) {
            storage.sync.temp.addedData.push({type: 'watched', animeId: animeId, episodes: converted});
          }

          storage.watched = encodeWatched(watched);
          saveData(storage);

          closeModal();
          updateEpisodePages();
        });
      });

      $('#anitracker-unmark-watched').on('click', function() {
        closeModal();
        removeWatchedAnime(getAnimeId(animeSession));
        updateEpisodePages();
      });
    }

    $('#anitracker-refresh-session').on('click', function(e) {
      const elem = $('#anitracker-refresh-session');
      const timeout = temporaryHtmlChange(elem, 10000, '<i class="fa fa-refresh" aria-hidden="true" style="animation: anitracker-spin 1s linear infinite;"></i>&nbsp;&nbsp;Refreshing...');

      refreshSession().then(result => {
        if (result === 0) return;
        else if ([2,3].includes(result)) {
          temporaryHtmlChange(elem, 2200, 'Failed: Couldn\'t find session', timeout);
        }
        else {
          temporaryHtmlChange(elem, 2200, 'Failed.', timeout);
        }
      });
    });

    $('#anitracker-edit-keybinds').on('click', () => {
      $('#anitracker-modal-body').empty();

      const keybindEntries = [
        {title:'Bookmarks',id:'keybindBookmarks'},
        {title:'Episode Feed',id:'keybindNotifications'},
        {title:'Open Search',id:'keybindSearch'},
      ];

      function getKeybindString(keybind) {
        if (keybind === ' ') return 'Space';
        if (keybind.length === 1) return keybind.toUpperCase();
        else return keybind;
      }

      function getKeybindHtml(keybind) {
        if (!keybind || keybind === 'Escape') {
          return '<i class="fa fa-times-circle" aria-hidden="true"></i>';
        }
        return getKeybindString(keybind);
      }

      const storage = getStorage();
      const defaultData = getDefaultData();

      $(`<h4>Edit Keybinds</h4><div class="anitracker-keybinds-section"></div>`).appendTo('#anitracker-modal-body');

      keybindEntries.forEach(g => {
        g.value = storage.settings[g.id];
        const keyHtml = getKeybindHtml(g.value);
        const defValue = getKeybindString(defaultData.settings[g.id]);
        $(`
        <label for="anitracker-${g.id}-button">${g.title}</label>
        <button class="btn btn-secondary anitracker-flat-button anitracker-keybind-button" id="anitracker-${g.id}-button" title="Change this keybind">
          ${keyHtml}
        </button>
        <button class="btn btn-secondary anitracker-flat-button anitracker-reset-keybind-button" title="Reset to ${defValue}">
          <i class="fa fa-undo" aria-hidden="true"></i>
        </button>`).appendTo('.anitracker-keybinds-section').data('id', g.id);
      });

      $('.anitracker-keybind-button').on('keydown', (e) => {
        const key = e.key === 'Escape' ? '' : e.key;
        if (['Tab','Shift'].includes(key)) return;
        const elem = $(e.currentTarget);
        const id = elem.data('id');
        elem.html(getKeybindHtml(key));

        const storage = getStorage();
        storage.settings[id] = key;
        saveData(storage);

        showMessage(key ? `Keybind set to ${getKeybindString(key)}` : 'Keybind unset');
        e.preventDefault();
        e.stopPropagation();
        elem.blur();
      });
      $('.anitracker-reset-keybind-button').on('click', function() {
        const id = $(this).data('id');
        const defValue = getDefaultData().settings[id];
        if (defValue === undefined) return;

        const storage = getStorage();
        storage.settings[id] = defValue;
        saveData(storage);

        $(`#anitracker-${id}-button`).html(getKeybindHtml(defValue));
        showMessage(`Keybind reset to ${getKeybindString(defValue)}`);
        $(this).blur();
      });
      $('.anitracker-keybinds-section').on('anitracker:update', () => {
        const storage = getStorage();
        keybindEntries.forEach(g => {
          const elem = $(`#anitracker-${g.id}-button`);
          elem.html(getKeybindHtml(storage.settings[g.id]));
        });
      });

      openModal(openOptionsModal);
    });

    $('#anitracker-dl-options').on('click', () => {
      $('#anitracker-modal-body').empty();
      const storage = getStorage();
      $(`
        <h4>Download Preferences</h4>
        <p class="anitracker-secondary-info anitracker-thin-text">
          These preferences apply when downloading an episode through its dropdown menu.
        </p>
        <div class="anitracker-dl-options-section">
          <label for="anitracker-res-dropdown-button">Resolution</label>
          <div class="btn-group">
            <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" id="anitracker-res-dropdown-button" title="Change preferred resolution">
              ${storage.settings.dlPreferRes ? storage.settings.dlPreferRes + 'p' : 'No preference'}
            </button>
            <div class="dropdown-menu anitracker-dropdown-content" data-for="res">
              <button class="anitracker-flat-button" data-value="1080">1080p</button>
              <button class="anitracker-flat-button" data-value="720">720p</button>
              <button class="anitracker-flat-button" data-value="360">360p</button>
              <button class="anitracker-flat-button" data-value="">No preference</button>
            </div>
          </div>
        </div>
        <div class="anitracker-dl-options-section" style="margin-top: 5px;">
          <label for="anitracker-lang-dropdown-button">Language</label>
          <div class="btn-group">
            <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" id="anitracker-lang-dropdown-button" title="Change preferred language">
              ${getLangName(storage.settings.dlPreferLang) || 'No preference'}
            </button>
            <div class="dropdown-menu anitracker-dropdown-content" data-for="lang">
              <button class="anitracker-flat-button" data-value="jp">Japanese</button>
              <button class="anitracker-flat-button" data-value="en">English</button>
              <button class="anitracker-flat-button" data-value="ch">Chinese</button>
              <button class="anitracker-flat-button" data-value="">No preference</button>
            </div>
          </div>
        </div>
      `).appendTo('#anitracker-modal-body');

      $('.anitracker-dl-options-section .dropdown-menu>button').on('click', function() {
        const value = $(this).data('value');
        const type = $(this).parent().data('for');
        const storage = getStorage();
        if (type === 'res') storage.settings.dlPreferRes = value ? +value : '';
        if (type === 'lang') storage.settings.dlPreferLang = value;
        saveData(storage);
        $(this).parents().eq(1).find('>button').text($(this).text());
      });

      function getLangName(lang) {
        return ({
          jp: 'Japanese',
          en: 'English',
          ch: 'Chinese'
        })[lang];
      }

      openModal(openOptionsModal);
    });

    openModal();
  }
  $('#anitracker-options').on('click', openOptionsModal);

  function openShowDataModal() {
    $('#anitracker-modal-body').empty();
    $(`
    <div class="anitracker-modal-list-container">
      <div class="anitracker-storage-data" title="Expand or retract the storage entry for page sessions" tabindex="0" key="linkList">
        <span>Session Data</span>
      </div>
    </div>
    <div class="anitracker-modal-list-container">
      <div class="anitracker-storage-data" title="Expand or retract the storage entry for video progress" tabindex="0" key="videoTimes">
        <span>Video Progress</span>
      </div>
    </div>
    <div class="anitracker-modal-list-container">
      <div class="anitracker-storage-data" title="Expand or retract the storage entry for episodes marked as watched" tabindex="0" key="watched">
        <span>Watched Episodes</span>
      </div>
    </div>
    <div class="anitracker-modal-list-container">
      <div class="anitracker-storage-data" title="Expand or retract the storage entry for anime-specific video playback speed" tabindex="0" key="videoSpeed">
        <span>Video Playback Speed</span>
      </div>
    </div>
    <button class="btn btn-secondary" id="anitracker-sync-data" title="Edit data sync settings" style="margin-bottom: 10px;">
      <i class="fa fa-sync" aria-hidden="true"></i>
      &nbsp;Sync Data...
    </button>
    <div class="anitracker-modal-bottom-buttons">
      <div class="btn-group">
        <button class="btn btn-danger" id="anitracker-reset-data" title="Remove stored data and reset all settings">
          <i class="fa fa-undo" aria-hidden="true"></i>
          &nbsp;Reset Data
        </button>
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary" id="anitracker-raw-data" title="View data in JSON format">
          <i class="fa fa-code" aria-hidden="true"></i>
          &nbsp;Raw
        </button>
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary" id="anitracker-export-data" title="Export and download the JSON data">
          <i class="fa fa-download" aria-hidden="true"></i>
          &nbsp;Export Data
        </button>
      </div>
      <label class="btn btn-secondary" id="anitracker-import-data-label" tabindex="0" for="anitracker-import-data" style="margin-bottom:0;" title="Import a JSON file with AnimePahe Improvements data. This does not delete any existing data.">
        <i class="fa fa-upload" aria-hidden="true"></i>
        &nbsp;Import Data
      </label>
      <div class="btn-group">
        <button class="btn btn-dark" id="anitracker-edit-data" title="Edit a data key">
          <i class="fa fa-pencil" aria-hidden="true"></i>
          &nbsp;Edit...
        </button>
      </div>
      <input type="file" id="anitracker-import-data" style="visibility: hidden; width: 0;" accept=".json">
    </div>
    `).appendTo('#anitracker-modal-body');

    const expandIcon = `<i class="fa fa-plus anitracker-expand-data-icon" aria-hidden="true"></i>`;
    const contractIcon = `<i class="fa fa-minus anitracker-expand-data-icon" aria-hidden="true"></i>`;

    $(expandIcon).appendTo('.anitracker-storage-data');

    $('.anitracker-storage-data').on('click keydown', (e) => {
      if (e.type === 'keydown' && e.key !== "Enter") return;
      toggleExpandData($(e.currentTarget));
    });

    function toggleExpandData(elem) {
      if (elem.hasClass('anitracker-expanded')) {
        contractData(elem);
      }
      else {
        expandData(elem);
      }
    }

    $('#anitracker-reset-data').on('click', function() {
      if (confirm('[AnimePahe Improvements]\n\nThis will remove all saved data (including settings) and reset it to its default state.\nAre you sure?') === true) {
        const storage = getStorage();
        if (isSyncEnabled(storage)) {
          syncDisconnectUser(storage.sync.syncCode);
          unsetAutoSync();
        }

        saveData(getDefaultData());
        updatePage();
        openShowDataModal();
      }
    });

    $('#anitracker-raw-data').on('click', function() {
      const blob = new Blob([JSON.stringify(getStorage())], {type : 'application/json'});
      windowOpen(URL.createObjectURL(blob));
    });

    $('#anitracker-edit-data').on('click', openEditDataModal);
    function openEditDataModal() {
      $('#anitracker-modal-body').empty();
      $(`
        <b>Warning: for developer use.<br>Back up your data before messing with this.</b>
        <input autocomplete="off" class="form-control anitracker-text-input-bar anitracker-edit-data-key" placeholder="Key (Path)">
        <input autocomplete="off" class="form-control anitracker-text-input-bar anitracker-edit-data-value" placeholder="Value (JSON)">
        <p>Leave value empty to get the existing value</p>
        <div class="btn-group">
          <button class="btn dropdown-toggle btn-secondary anitracker-edit-mode-dropdown-button" data-bs-toggle="dropdown" data-toggle="dropdown" data-value="replace">Replace</button>
          <div class="dropdown-menu anitracker-dropdown-content anitracker-edit-mode-dropdown"></div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary anitracker-confirm-edit-button">Confirm</button>
        </div>
      `).appendTo('#anitracker-modal-body');

      [{t:'Replace',i:'replace'},{t:'Append',i:'append'},{t:'Delete from list',i:'delList'},{t:'For each',i:'forEach'}].forEach(g => { $(`<button ref="${g.i}">${g.t}</button>`).appendTo('.anitracker-edit-mode-dropdown') });

      $('.anitracker-edit-mode-dropdown button').on('click', (e) => {
        const pressed = $(e.target);
        const btn = pressed.parents().eq(1).find('.anitracker-edit-mode-dropdown-button');
        btn.data('value', pressed.attr('ref'));
        btn.text(pressed.text());
      });

      $('.anitracker-edit-data-key,.anitracker-edit-data-value').on('keydown', e => {
        if (e.currentTarget === e.target && e.key === 'Enter') $('.anitracker-confirm-edit-button').trigger('click');
      });

      $('.anitracker-confirm-edit-button').on('click', () => {
        const storage = getStorage();
        const key = $('.anitracker-edit-data-key').val();
        if (key === 'debug') {
          openDebugModal();
          return;
        }
        let keyValue;

        // lots of evals here because I'm lazy
        try { keyValue = eval("storage." + key); }
        catch (e) {
          console.error(e);
          alert("Nope didn't work");
          return;
        }

        if ($('.anitracker-edit-data-value').val() === '') {
          alert(JSON.stringify(keyValue));
          return;
        }

        const mode = $('.anitracker-edit-mode-dropdown-button').data('value');

        if (keyValue === undefined && mode !== 'replace') {
          alert("Undefined");
          return;
        }

        let value;
        if (['delList','forEach'].includes(mode)) value = $('.anitracker-edit-data-value').val();
        else if ($('.anitracker-edit-data-value').val() !== "undefined") {
          try { value = JSON.parse($('.anitracker-edit-data-value').val()); }
          catch (e) {
            console.error(e);
            alert("Invalid JSON");
            return;
          }
        }

        const delFromListMessage = "Please enter a comparison in the 'value' field, with 'a' being the variable for the element.\neg. 'a.id === \"apple\"'\nWhichever elements that match this will be deleted.";
        const forEachMessage = "Please enter a function in the 'value' field, with 'a' being the variable for the element.\neg. 'a.id = \"apple\"'\nThis would set the 'id' attribute of each element to 'apple'.";

        switch (mode) {
          case 'replace':
            eval(`storage.${key} = value`);
            break;
          case 'append':
            if (keyValue.constructor.name !== 'Array') {
              alert("Not an array");
              return;
            }
            eval(`storage.${key}.push(value)`);
            break;
          case 'delList':
            if (keyValue.constructor.name !== 'Array') {
              alert("Not an array");
              return;
            }
            try { eval(`storage.${key} = storage.${key}.filter(a => !(${value}))`); }
            catch (e) {
              console.error(e);
              alert(delFromListMessage);
              return;
            }
            break;
          case 'forEach':
            if (keyValue.constructor.name !== 'Array') {
              alert("Not an array");
              return;
            }
            try { eval(`storage.${key}.forEach(a => {${value}})`); }
            catch (e) {
              console.error(e);
              alert(forEachMessage);
              return;
            }
            break;
          default:
            alert("This message isn't supposed to show up. Uh...");
            return;
        }
        if (JSON.stringify(storage) === JSON.stringify(getStorage())) {
          alert("Nothing changed.");
          if (mode === 'delList') alert(delFromListMessage);
          if (mode === 'forEach') alert(forEachMessage);
          return;
        }
        else showMessage("Probably worked!");

        saveData(storage);
      });

      openModal(openShowDataModal);

      $('.anitracker-edit-data-key').focus();

      function openDebugModal() {
        $('#anitracker-modal-body').empty();
        const options = getStorage().debug ?? {};

        $(`
        <h4 style="color: var(--warning);max-width: 24rem;">Don't mess with this unless you know what you're doing</h4>
        <p>Version: ${GM_info.script.version}</p>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-dontLeave-input" ${options.dontLeave ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-dontLeave-input">
            Disconnect user without disconnecting sync
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-noSyncSim-input" ${options.noSyncSim ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-noSyncSim-input">
            Disabled sync menus
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-notifs" ${options.notifs ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-notifs">
            Override allowing adding to episode feed
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-anim-input" ${options.anim ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-anim-input">
            Animation debugging
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-sync-input" ${options.sync ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-sync-input">
            Sync debugging
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-msg" ${options.msg ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-msg">
            Message between iframe debugging
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="anitracker-debug-seek-thumbnails" ${options.seekThumbnails ? "checked" : ""}>
          <label class="form-check-label" for="anitracker-debug-seek-thumbnails">
            Seek thumbnails debugging
          </label>
        </div>
        <input id="anitracker-decode-watched-input" placeholder="Decode watched format"><button class="btn btn-secondary anitracker-decode-watched-button">Decode</button>
        <div class="btn-group" style="display:block;">
          <button class="btn btn-primary anitracker-save-button">Save</button>
        </div>`).appendTo('#anitracker-modal-body');

        $('.anitracker-save-button').on('click', () => {
          const storage = getStorage();
          if (!storage.debug) storage.debug = {};

          storage.debug.dontLeave = $('#anitracker-debug-dontLeave-input').prop('checked');
          storage.debug.noSyncSim = $('#anitracker-debug-noSyncSim-input').prop('checked');
          storage.debug.anim = $('#anitracker-debug-anim-input').prop('checked');
          storage.debug.sync = $('#anitracker-debug-sync-input').prop('checked');
          storage.debug.msg = $('#anitracker-debug-msg').prop('checked');
          storage.debug.notifs = $('#anitracker-debug-notifs').prop('checked');
          storage.debug.seekThumbnails = $('#anitracker-debug-seek-thumbnails').prop('checked');
          saveData(storage);

          openShowDataModal();
          showMessage('Saved');
        });

        $('.anitracker-decode-watched-button').on('click', () => {
          const decoded = decodeWatched($('#anitracker-decode-watched-input').val());
          console.log(decoded);
          alert(JSON.stringify(decoded));
        });

        openModal(openEditDataModal);
      }
    }

    $('#anitracker-export-data').on('click', function() {
      const storage = getStorage();

      if (storage.temp) {
        delete storage.temp;
        saveData(storage);
      }
      download('animepahe-tracked-data-' + Date.now() + '.json', JSON.stringify(getStorage(), null, 2));
    });

    $('#anitracker-import-data-label').on('keydown', (e) => {
      if (e.key === "Enter") $("#" + $(e.currentTarget).attr('for')).click();
    });

    $('#anitracker-import-data').on('change', function(event) {
      const file = this.files[0];
      const fileReader = new FileReader();
      $(fileReader).on('load', function() {
        let newData = {};
        try {
          newData = JSON.parse(fileReader.result);
        }
        catch (err) {
          alert('[AnimePahe Improvements]\n\nPlease input a valid JSON file.');
          return;
        }

        const storage = getStorage();
        const diffBefore = importData(storage, newData, false);

        let totalChanged = 0;
        for (const [key, value] of Object.entries(diffBefore)) {
          totalChanged += value;
        }

        if (totalChanged === 0) {
          alert('[AnimePahe Improvements]\n\nThis file contains no changes to import.');
          return;
        }

        $('#anitracker-modal-body').empty();

        $(`
        <h4>Choose what to import</h4>
        <br>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-link-list-check" ${diffBefore.linkListAdded > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-link-list-check">
            Session entries (${diffBefore.linkListAdded})
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-video-times-check" ${(diffBefore.videoTimesAdded + diffBefore.videoTimesUpdated + diffBefore.videoTimeEntryUpdated) > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-video-times-check">
            Video progress data (${diffBefore.videoTimesAdded + diffBefore.videoTimesUpdated + diffBefore.videoTimeEntryUpdated})
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-bookmarks-check" ${(diffBefore.bookmarksAdded + diffBefore.bookmarksUpdated) > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-bookmarks-check">
            Bookmarks (${diffBefore.bookmarksAdded + diffBefore.bookmarksUpdated})
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-notifications-check" ${(diffBefore.notificationsAdded + diffBefore.episodeFeedUpdated) > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-notifications-check">
            Episode feed entries (${diffBefore.notificationsAdded})
            <ul style="margin-bottom:0;margin-left:-24px;"><li>Episode feed entries updated: ${diffBefore.episodeFeedUpdated}</li></ul>
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-watched-check" ${diffBefore.watchedEpisodesAdded > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-watched-check">
            Watched episodes (${diffBefore.watchedEpisodesAdded})
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-video-speed-check" ${(diffBefore.videoSpeedUpdated) > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-video-speed-check">
            Video speed entries (${diffBefore.videoSpeedUpdated})
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input anitracker-import-data-input" type="checkbox" value="" id="anitracker-settings-check" ${diffBefore.settingsUpdated > 0 ? "checked" : "disabled"}>
          <label class="form-check-label" for="anitracker-settings-check">
            Settings (${diffBefore.settingsUpdated})
          </label>
        </div>
        <div class="btn-group" style="float: right;">
          <button class="btn btn-primary" id="anitracker-confirm-import" title="Confirm import">
            <i class="fa fa-upload" aria-hidden="true"></i>
            &nbsp;Import
          </button>
        </div>
        `).appendTo('#anitracker-modal-body');

        $('.anitracker-import-data-input').on('change', (e) => {
          let checksOn = 0;
          for (const elem of $('.anitracker-import-data-input')) {
            if ($(elem).prop('checked')) checksOn++;
          }
          $('#anitracker-confirm-import').attr('disabled', checksOn === 0);
        });

        $('#anitracker-confirm-import').on('click', () => {
          const diffAfter = importData(getStorage(), newData, true, {
            linkList: !$('#anitracker-link-list-check').prop('checked'),
            videoTimes: !$('#anitracker-video-times-check').prop('checked'),
            bookmarks: !$('#anitracker-bookmarks-check').prop('checked'),
            notifications: !$('#anitracker-notifications-check').prop('checked'),
            watchedEpisodes: !$('#anitracker-watched-check').prop('checked'),
            videoSpeed: !$('#anitracker-video-speed-check').prop('checked'),
            settings: !$('#anitracker-settings-check').prop('checked')
          });

          updateFromImport(diffAfter);
          showMessage('Imported!');
          openShowDataModal();
        });

        openModal(openShowDataModal);
      });
      fileReader.readAsText(file);
    });

    function getCleanType(type) {
      if (type === 'linkList') return "Clean up older duplicate entries";
      else if (type === 'videoTimes') return "Remove entries with no progress (0s)";
      else return "[Message not found]";
    }

    function expandData(elem) {
      const storage = getStorage();
      const dataType = elem.attr('key');

      elem.find('.anitracker-expand-data-icon').replaceWith(contractIcon);
      const dataEntries = $('<div class="anitracker-modal-list"></div>').appendTo(elem.parent());

      const cleanButton = ['linkList','videoTimes'].includes(dataType) ?
            `<button class="btn btn-secondary anitracker-clean-data-button anitracker-list-btn" style="text-wrap:nowrap;" title="${getCleanType(dataType)}">
              Clean Up
            </button>` : '';
      $(`
      <div class="btn-group anitracker-storage-filter">
        <input title="Search within this storage entry" autocomplete="off" class="form-control anitracker-text-input-bar anitracker-modal-search" placeholder="Search">
        <button dir="down" class="btn btn-secondary dropdown-toggle anitracker-reverse-order-button anitracker-list-btn" title="Sort direction (down is default, and means newest first)"></button>
        ${cleanButton}
      </div>
      `).appendTo(dataEntries);
      elem.parent().find('.anitracker-modal-search').focus();

      elem.parent().find('.anitracker-modal-search').on('input', (e) => {
        setTimeout(() => {
          const query = $(e.target).val().toLowerCase();
          for (const entry of elem.parent().find('.anitracker-modal-list-entry')) {
            if ($($(entry).find('a,span')[0]).text().toLowerCase().includes(query)) {
              $(entry).show();
            }
            else $(entry).hide();
          }
        }, 10);
      });

      elem.parent().find('.anitracker-clean-data-button').on('click', () => {
        if (!confirm("[AnimePahe Improvements]\n\n" + getCleanType(dataType) + '?')) return;

        const updatedStorage = getStorage();

        const removed = [];
        if (dataType === 'linkList') {
          for (let i = 0; i < updatedStorage.linkList.length; i++) {
            const link = updatedStorage.linkList[i];

            const similar = updatedStorage.linkList.filter(a => a.animeName === link.animeName && a.episodeNum === link.episodeNum);
            if (similar[similar.length-1] !== link) {
              removed.push(link);

              if (isSyncEnabled(updatedStorage)) {
                if (link.type === 'episode') updatedStorage.sync.temp.removedData.push({type: 'linkList', episodeSession: link.episodeSession});
                else if (link.type === 'anime') updatedStorage.sync.temp.removedData.push({type: 'linkList', animeSession: link.animeSession});
              }
            }
          }
          updatedStorage.linkList = updatedStorage.linkList.filter(a => !removed.includes(a));
        }
        else if (dataType === 'videoTimes') {
          for (const timeEntry of updatedStorage.videoTimes) {
            if (timeEntry.time > 5) continue;
            removed.push(timeEntry);

            if (isSyncEnabled(updatedStorage)) {
              updatedStorage.sync.temp.removedData.push({type: 'videoTimes', animeName: timeEntry.animeName, episodeNum: timeEntry.episodeNum});
            }
          }
          updatedStorage.videoTimes = updatedStorage.videoTimes.filter(a => !removed.includes(a));
        }

        showMessage(`Cleaned up ${removed.length} ${removed.length === 1 ? "entry" : "entries"}.`);

        saveData(updatedStorage);
        dataEntries.remove();
        expandData(elem);
      });

      // When clicking the reverse order button
      elem.parent().find('.anitracker-reverse-order-button').on('click', (e) => {
        const btn = $(e.target);
        if (btn.attr('dir') === 'down') {
          btn.attr('dir', 'up');
          btn.addClass('anitracker-up');
        }
        else {
          btn.attr('dir', 'down');
          btn.removeClass('anitracker-up');
        }

        const entries = [];
        for (const entry of elem.parent().find('.anitracker-modal-list-entry')) {
          entries.push(entry.outerHTML);
        }
        entries.reverse();
        elem.parent().find('.anitracker-modal-list-entry').remove();
        for (const entry of entries) {
          $(entry).appendTo(elem.parent().find('.anitracker-modal-list'));
        }
        applyDeleteEvents();
      });

      function applyDeleteEvents() {
        $('.anitracker-modal-list-entry .anitracker-delete-session-button').on('click', function() {
          const storage = getStorage();

          const href = $(this).parent().find('a').attr('href');
          const animeSession = getAnimeSessionFromUrl(href);

          if (isEpisode(href)) {
            const episodeSession = getEpisodeSessionFromUrl(href);
            if (isSyncEnabled(storage)) {
              storage.sync.temp.removedData.push({type: 'linkList', episodeSession: episodeSession});
            }

            storage.linkList = storage.linkList.filter(g => !(g.type === 'episode' && g.animeSession === animeSession && g.episodeSession === episodeSession));
            saveData(storage);
          }
          else {
            if (isSyncEnabled(storage)) {
              storage.sync.temp.removedData.push({type: 'linkList', animeSession: animeSession});
            }

            storage.linkList = storage.linkList.filter(g => !(g.type === 'anime' && g.animeSession === animeSession));
            saveData(storage);
          }

          $(this).parent().remove();
        });

        $('.anitracker-modal-list-entry .anitracker-delete-progress-button').on('click', function() {
          const lookForUrl = $(this).attr('lookForUrl');

          const storage = getStorage();
          const found = storage.videoTimes.find(g => g.videoUrls.includes(lookForUrl));
          if (!found) {
            $(this).parent().remove();
            return;
          }
          if (isSyncEnabled(storage)) {
            storage.sync.temp.removedData.push({type: 'videoTimes', animeName: found.animeName, episodeNum: found.episodeNum});
          }

          storage.videoTimes = storage.videoTimes.filter(g => !g.videoUrls.includes(lookForUrl));
          saveData(storage);
          updateEpisodePages();

          $(this).parent().remove();
        });

        $('.anitracker-modal-list-entry .anitracker-delete-watched-button').on('click', function() {
          const id = +$(this).parent().attr('animeid');
          removeWatchedAnime(id);
          updateEpisodePages();

          $(this).parent().remove();
        });

        $('.anitracker-modal-list-entry .anitracker-delete-speed-entry-button').on('click', function() {
          const storage = getStorage();
          const idString = $(this).attr('animeid');
          if (idString) storage.videoSpeed = storage.videoSpeed.filter(g => g.animeId !== parseInt(idString));
          else storage.videoSpeed = storage.videoSpeed.filter(g => g.animeName !== $(this).attr('animename'));
          saveData(storage);

          $(this).parent().remove();
        });
      }

      if (dataType === 'linkList') {
        [...storage.linkList].reverse().forEach(g => {
          const name = g.animeName + (g.type === 'episode' ? (' - Episode ' + g.episodeNum) : '');
          $(`
          <div class="anitracker-modal-list-entry">
            <a target="_blank" href="/${(g.type === 'episode' ? 'play/' : 'anime/') + g.animeSession + (g.type === 'episode' ? ('/' + g.episodeSession) : '')}" title="${toHtmlCodes(name)}">
              ${toHtmlCodes(name)}
            </a><br>
            <button class="btn btn-danger anitracker-delete-session-button anitracker-flat-button" title="Delete this stored session">
              <i class="fa fa-trash" aria-hidden="true"></i>
              &nbsp;Delete
            </button>
          </div>`).appendTo(elem.parent().find('.anitracker-modal-list'));
        });

        applyDeleteEvents();
      }
      else if (dataType === 'videoTimes') {
        [...storage.videoTimes].reverse().forEach(g => {
          $(`
          <div class="anitracker-modal-list-entry">
            <span title="${toHtmlCodes(g.animeName)}">
              ${g.animeId ? `<a href="/a/${g.animeId}" target="_blank">${toHtmlCodes(g.animeName)}</a>` : toHtmlCodes(g.animeName)} - Episode ${g.episodeNum}
            </span><br>
            <span>
              Current time: ${secondsToHMS(g.time)}
            </span><br>
            <button class="btn btn-danger anitracker-delete-progress-button anitracker-flat-button" lookForUrl="${g.videoUrls[0]}" title="Delete this video progress">
              <i class="fa fa-trash" aria-hidden="true"></i>
              &nbsp;Delete
            </button>
          </div>`).appendTo(elem.parent().find('.anitracker-modal-list'));
        });

        applyDeleteEvents();
      }
      else if (dataType === 'watched') {
        decodeWatched(storage.watched).reverse().forEach(g => {
          const linkListObj = storage.linkList.find(a => a.animeId === g.animeId);
          const episodes = g.episodes;
          $(`
          <div class="anitracker-modal-list-entry" animeid="${g.animeId}">
            <span>
              <a class="anitracker-watched-anime-id" href="/a/${g.animeId}" target="_blank"${ linkListObj ? ` title="${toHtmlCodes(linkListObj.animeName)}"` : ''}>${linkListObj ? toHtmlCodes(linkListObj.animeName) : `ID ${g.animeId}`}</a> - ${episodes.length} episode${episodes.length === 1 ? '' : 's'}
            </span><br>
            <span class="anitracker-watched-episodes-list">
              ${episodes.join()}
            </span><br>
            ${!linkListObj ? `<button class="btn btn-secondary anitracker-get-name-button anitracker-flat-button" title="Get the name for this anime">
              <i class="fa fa-search" aria-hidden="true"></i>
              &nbsp;Get Name
            </button>` : ''}
            <button class="btn btn-danger anitracker-delete-watched-button anitracker-flat-button" title="Delete this video progress">
              <i class="fa fa-trash" aria-hidden="true"></i>
              &nbsp;Delete
            </button>
          </div>`).appendTo(elem.parent().find('.anitracker-modal-list'));
        });

        applyDeleteEvents();

        $('.anitracker-get-name-button').on('click', function() {
          const id = +$(this).parent().attr('animeid');
          const spinner = $(`
          <div class="anitracker-get-name-spinner anitracker-spinner" style="display: inline;vertical-align: bottom;">
              <div class="spinner-border" role="status" style="height: 24px; width: 24px;">
                <span class="sr-only">Loading...</span>
              </div>
          </div>`).insertAfter(this);
          // Get the anime name from its ID
          getDataFromAnimeId(id).then(data => {
            spinner.remove();
            if (!data) {
              alert("[AnimePahe Improvements]\n\nCouldn't get anime name");
            }
            else {
              $(this).parent().find('.anitracker-watched-anime-id').text(data.title).attr('title', data.title);
              const storage = getStorage();
              if (isSyncEnabled(storage)) {
                storage.sync.temp.addedData.push({type: 'linkList', animeSession: data.session});
              }
              storage.linkList.push({
                type: 'anime',
                animeSession: data.session,
                animeName: data.title,
                animeId: id
              });
              if (storage.linkList.length > getStorageLimits().linkList) {
                storage.linkList.splice(0,1);
              }
              saveData(storage);
            }
            $(this).remove();
          });
        });
      }
      else if (dataType === 'videoSpeed') {
        [...storage.videoSpeed].reverse().forEach(g => {
          const identifier = (() => {
            if (g.animeId) return `animeid="${g.animeId}"`;
            else return `animename="${toHtmlCodes(g.animeName)}"`;
          })();
          $(`
          <div class="anitracker-modal-list-entry">
            <span title="${toHtmlCodes(g.animeName)}">
              ${g.animeId ? `<a href="/a/${g.animeId}" target="_blank">${toHtmlCodes(g.animeName)}</a>` : toHtmlCodes(g.animeName)}
            </span><br>
            <span>
              Playback speed: ${g.speed}x
            </span><br>
            <button class="btn btn-danger anitracker-delete-speed-entry-button anitracker-flat-button" ${identifier} title="Delete this video speed entry">
              <i class="fa fa-trash" aria-hidden="true"></i>
              &nbsp;Delete
            </button>
          </div>`).appendTo(elem.parent().find('.anitracker-modal-list'));
        });

        applyDeleteEvents();
      }

      elem.addClass('anitracker-expanded');
    }

    function contractData(elem) {
      elem.find('.anitracker-expand-data-icon').replaceWith(expandIcon);

      elem.parent().find('.anitracker-modal-list').remove();

      elem.removeClass('anitracker-expanded');
      elem.blur();
    }

    function openSyncDataModal() {
      $('#anitracker-modal-body').empty();

      const storage = getStorage();
      const syncEnabled = isSyncEnabled(storage);

      const syncMessage = storage.sync.currentMessage ?
            `<span class="anitracker-sync-message anitracker-dark-area anitracker-thin-text ${storage.sync.currentMessage.type}">${storage.sync.currentMessage.text}</span>` : '<span class="anitracker-sync-message anitracker-dark-area anitracker-thin-text" style="display:none;"></span>';

      function addSpinner(elem, className) {
        return $(`
        <div class="anitracker-spinner anitracker-${className}-spinner" style="display: inline-block;vertical-align: middle; margin-left: 5px;">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
        </div>`).insertAfter(elem);
      }

      let disconnectFailed = false;

      const syncedTime = storage.sync.lastSynced ? new Date(storage.sync.lastSynced).toLocaleString() : 'Not synced yet';

      if (syncEnabled && !storage.debug?.noSyncSim) {
        $(`
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <p class="anitracker-secondary-info anitracker-thin-text" title="${syncedTime}">Last synced: <span class="anitracker-time-since-sync">${storage.sync.lastSynced ? timeSince(storage.sync.lastSynced) + ' ago' : 'Never'}</span></p>
          <div>
            <button class="btn btn-primary anitracker-sync-button" title="Sync data now">
              <i class="fa fa-sync" aria-hidden="true"></i>
              &nbsp;Sync Now
            </button>
          </div>
          <button class="btn btn-secondary anitracker-change-sync-settings-button" title="Change sync settings">
            <i class="fa fa-cog" aria-hidden="true"></i>
            &nbsp;Settings...
          </button>
          <button class="btn btn-secondary anitracker-flat-button anitracker-copy-code-button" data-placement="top" data-content="Copied!">
            <i class="fa fa-copy" aria-hidden="true"></i>
            &nbsp;Copy Code
          </button>
          ${syncMessage}
          <div style="height:10px;"></div>
          <div>
            <button class="btn btn-danger anitracker-flat-button anitracker-disconnect-sync-button" title="Disconnect from sync">
              <i class="fa fa-sign-out" aria-hidden="true"></i>
              &nbsp;Disconnect
            </button>
          </div>
        </div>`).appendTo('#anitracker-modal-body');

        if (storage.sync.inProgress) $('.anitracker-sync-button>i').addClass('anitracker-spin');

        $('.anitracker-sync-button').on('click', () => {
          if ($('.anitracker-sync-button>i').hasClass('anitracker-spin')) return;
          syncData();
        });

        $('.anitracker-copy-code-button').on('click', () => {
          const elem = $('.anitracker-copy-code-button');
          const storage = getStorage();

          navigator.clipboard.writeText(storage.sync.syncCode);

          elem.popover('show');
          setTimeout(() => {
            elem.popover('hide');
          }, 1000);
        });

        $('.anitracker-disconnect-sync-button').on('click', (e) => {
          if ($('.anitracker-disconnect-sync-spinner').length) return;

          const spinner = addSpinner(e.currentTarget, 'disconnect-sync');

          const storage = getStorage();
          syncDisconnectUser(storage.sync.syncCode).then(result => {
            spinner.remove();

            const storage = getStorage();
            if (result === 0) storage.sync.currentMessage = null;
            else if (result === 1 && !disconnectFailed) {
              storage.sync.currentMessage = {
                type: "error",
                text: "Couldn't disconnect. Please check you internet connection.<br>To disconnect anyway, press the Disconnect button again."
              };
              saveData(storage);
              updateSyncMessageElem(storage);
              disconnectFailed = true;
              return;
            }
            else if (result === 2 && !disconnectFailed) {
              storage.sync.currentMessage = {
                type: "error",
                text: "Couldn't disconnect due to unknown error.<br>To disconnect anyway, press the Disconnect button again."
              };
              saveData(storage);
              updateSyncMessageElem(storage);
              disconnectFailed = true;
              return;
            }
            else if (result === 3 && !disconnectFailed) {
              storage.sync.currentMessage.text += "<br>To disconnect anyway, press the Disconnect button again.";
              saveData(storage);
              updateSyncMessageElem(storage);
              disconnectFailed = true;
              return;
            }

            saveData(storage);
            if (storage.debug?.dontLeave === true) return;
            removeSync();

            showMessage('Sync disconnected');
            openSyncDataModal();
          });
        });
      }
      else {
        $(`
        <button class="btn btn-secondary anitracker-change-sync-settings-button" title="Change sync settings" style="float:right;">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <p class="anitracker-secondary-info anitracker-thin-text">Automatically sync data between multiple devices</p>
          <div>
            <button class="btn btn-secondary anitracker-create-sync-code-button" title="Create a new sync code to send to other devices">
              <i class="fa fa-plus" aria-hidden="true"></i>
              &nbsp;Create Sync Code
            </button>
          </div>
          <button class="btn btn-secondary anitracker-enter-sync-code-button" title="Enter an already existing sync code">
            <i class="fa fa-search" aria-hidden="true"></i>
            &nbsp;Enter Sync Code...
          </button>
          ${syncMessage}
        </div>`).appendTo('#anitracker-modal-body');

        $('.anitracker-create-sync-code-button').on('click', () => {
          $('#anitracker-modal-body').empty();
          $(`
          <div style="display:flex;flex-direction:column;align-items:center;">
          <p class="anitracker-thin-text">Create a new sync code?</p>
          <p class="anitracker-thin-text">After creation, you can enter this code on devices/browsers you want to sync your data with.</p>
          <div>
            <button class="btn btn-primary anitracker-create-sync-code-confirm-button" title="Confirm creation of sync code">
              Create
            </button>
          </div></div>`).appendTo('#anitracker-modal-body');

          $('.anitracker-create-sync-code-confirm-button').on('click', (e) => {
            if ($('.anitracker-sync-code-spinner').length) return;
            if (storage.debug?.noSyncSim) {
              openCodeCreationModal();
              return;
            }

            const elem = $(e.currentTarget);
            const spinner = addSpinner(elem, 'sync-code');
            syncGetCode().then(result => {
              spinner.remove();

              if (/^[A-Z0-9]{10}$/.test(result)) {
                setupSync(result);

                showMessage('Sync connected!');
                openCodeCreationModal();
                return;
              }

              const storage = getStorage();
              if (result === 1) storage.sync.currentMessage = {
                  type: 'error',
                  text: 'Could not create code. Check your internet connection.'
                };
              else if (result === 2) storage.sync.currentMessage = {
                  type: 'error',
                  text: 'An unknown error occurred when trying to create a code.'
                };
              else return; // Codes 3, 4, and 5 are already handled by syncGetCode

              saveData(storage);
              updateSyncMessageElem(storage);
            });
          });

          openModal(openSyncDataModal);
        });

        $('.anitracker-enter-sync-code-button').on('click', openCodeEnterModal);
      }

      $('.anitracker-change-sync-settings-button').on('click', () => {
        openSyncSettingsModal(openSyncDataModal);
      });

      openModal(openShowDataModal);

      function openCodeCreationModal() {
        $('#anitracker-modal-body').empty();

        const storage = getStorage();

        $(`
        <p class="anitracker-secondary-info anitracker-thin-text">Copy the following code and send it to the devices you want to sync with.</p>
        <div class="anitracker-sync-code-display">
          <span>${storage.sync.syncCode}</span>
          <i class="fa fa-copy" tabindex="0" title="Copy sync code to clipboard"></i>
        </div>
        <div style="height:2rem;"></div>
        <div class="anitracker-center-content">
          <button class="btn btn-secondary anitracker-done-button" title="Go to the main sync menu">
            Done
          </button>
        </div>`).appendTo('#anitracker-modal-body');

        $('.anitracker-sync-code-display>span').on('click', (e) => {
          selectElementText(e.currentTarget);
        });

        $('.anitracker-sync-code-display>i').on('click keydown', (e) => {
          if (e.type === 'keydown' && e.key !== "Enter") return;

          const elem = $(e.currentTarget);
          navigator.clipboard.writeText(storage.sync.syncCode);

          selectElementText($('.anitracker-sync-code-display>span')[0]);

          elem.replaceClass('fa-copy', 'fa-check');
          setTimeout(() => {
            elem.replaceClass('fa-check', 'fa-copy');
          }, 1000);
        });

        $('.anitracker-done-button').on('click', openSyncDataModal);

        openModal(openSyncDataModal);
      }

      function openCodeEnterModal() {
        $('#anitracker-modal-body').empty();

        $(`
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <p class="anitracker-secondary-info">Enter 10 character sync code.</p>
          <input title="Enter sync code" autocomplete="off" maxlength="10" class="form-control anitracker-text-input-bar anitracker-sync-code-input">
          <p class="anitracker-thin-text anitracker-sync-code-enter-error" style="color:var(--danger);display:none;">Enter 10 character sync code.</p>
          <p class="anitracker-secondary-info anitracker-thin-text">Codes expire after not being used for 30 days.</p>
          <div>
            <button class="btn btn-secondary anitracker-sync-code-enter-button" title="Connect to this code">
              Connect
            </button>
          </div>
        </div>`).appendTo('#anitracker-modal-body');

        $('.anitracker-sync-code-enter-button').on('click', (e) => {
          if ($('.anitracker-sync-code-enter-spinner').length) return;

          const code = $('.anitracker-sync-code-input').val().toUpperCase();
          if (code === '') {
            showError('Please enter a code.');
            return;
          }

          const spinner = addSpinner(e.currentTarget, 'sync-code-enter');

          syncConnectUser(code).then(result => {
            spinner.remove();

            if (result === 0) {
              setupSync(code);

              showMessage('Sync connected!');
              openSyncDataModal();
              return;
            }

            if (result === 1) showError("Couldn't connect. Check your internet connection.");
            else if (result === 2) showError("Code is invalid.");
            else if (result === 3) showError("Please update AnimePahe Improvements.");
            else if (result === 4) showError("Unknown error occurred. Check the log for more info.");
            else if (result === 5) showError("You have sent too many requests. Try again in a few minutes.");
            else if (result === 6) openSyncDataModal();
          });
        });

        openModal(openSyncDataModal);

        function showError(msg) {
          $('.anitracker-sync-code-enter-error').text(msg).show();
        }
      }
    }

    function openSyncSettingsModal(backFunction = undefined, firstTime = false) {
      $('#anitracker-modal-body').empty();

      const storage = getStorage();
      const settings = storage.sync.settings;

      $(`
      <h4 style="text-align:center;margin-bottom:16px;">Choose sync settings</h4>
      ${firstTime ? '<p class="anitracker-secondary-info anitracker-thin-text">Automatically sync data between multiple devices</p>' : ''}
      <div class="form-check">
        <input class="form-check-input anitracker-sync-settings-input" type="checkbox" value="" id="anitracker-video-times-check" ${settings.videoTimes ? "checked" : ""}>
        <label class="form-check-label" for="anitracker-video-times-check" title="Sync video progress entries with other devices">
          Video Progress
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input anitracker-sync-settings-input" type="checkbox" value="" id="anitracker-bookmarks-check" ${settings.bookmarks ? "checked" : ""}>
        <label class="form-check-label" for="anitracker-bookmarks-check" title="Sync bookmarks with other devices">
          Bookmarks
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input anitracker-sync-settings-input" type="checkbox" value="" id="anitracker-watched-check" ${settings.watched ? "checked" : ""}>
        <label class="form-check-label" for="anitracker-watched-check" title="Sync watched episodes with other devices">
          Watched Episodes
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input anitracker-sync-settings-input" type="checkbox" value="" id="anitracker-notifications-check" ${settings.notifications ? "checked" : ""}>
        <label class="form-check-label" for="anitracker-notifications-check" title="Sync episode feed entries (anime that are part of the episode feed) with other devices">
          Episode Feed Entries
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input anitracker-sync-settings-input" type="checkbox" value="" id="anitracker-link-list-check" ${settings.linkList ? "checked" : ""}>
        <label class="form-check-label" for="anitracker-link-list-check" title="Sync stored session entries with other devices. Not recommended due to browser tabs being different between devices.">
          Session Data (not recommended)
        </label>
      </div>
      <label style="margin-top: 10px; max-width: 16rem;" title="Set number of minutes between each auto-sync.">
        Time between syncing, in minutes. Set to 0 to disable auto-sync.
        <div style="display:block;">
          <input autocomplete="off" class="form-control anitracker-text-input-bar anitracker-interval-input" placeholder="${getDefaultData().sync.settings.interval}" type="number" inputmode="numeric" value="${settings.interval}" style="width:6rem;display:inline;">
          <span class="anitracker-secondary-info anitracker-interval-display"></span>
        </div>
      </label>
      <div class="anitracker-sync-settings-bottom"></div>`).appendTo('#anitracker-modal-body');

      if (firstTime) $(`
        <p class="anitracker-secondary-info anitracker-thin-text">You can change this later.</p>
        <button class="btn btn-primary anitracker-save-button" title="Continue to the next page">
          Continue
        </button>
        `).appendTo('.anitracker-sync-settings-bottom');
      else $(`
        <button class="btn btn-primary anitracker-save-button" title="Save settings and go back">
          Save
        </button>`).appendTo('.anitracker-sync-settings-bottom');

      $('.anitracker-interval-input').on('input', function() {
        const defaultInterval = getDefaultData().sync.settings.interval;
        const inputInterval = $(this).val();
        let val = /^\d+$/.test(inputInterval) ? +inputInterval : defaultInterval;
        if (val !== 0 && val < 60) val = 60;
        if (val === 0) {
          $('.anitracker-interval-display').text('= disabled');
        }
        else {
          const hrs = Math.floor(val/60);
          const mins = Math.floor(val % 60);
          $('.anitracker-interval-display').text(`= ${hrs > 0 ? hrs + 'h' : ''}${mins}m${val === defaultInterval ? ' (default)' : ''}`);
        }
      }).trigger('input');

      $('.anitracker-save-button').on('click', () => {
        const storage = getStorage();
        storage.sync.settings.entered = true;

        const previousSettings = JSON.parse(JSON.stringify(storage.sync.settings));

        storage.sync.settings.linkList = $('#anitracker-link-list-check').prop('checked');
        storage.sync.settings.videoTimes = $('#anitracker-video-times-check').prop('checked');
        storage.sync.settings.bookmarks = $('#anitracker-bookmarks-check').prop('checked');
        storage.sync.settings.notifications = $('#anitracker-notifications-check').prop('checked');
        storage.sync.settings.watched = $('#anitracker-watched-check').prop('checked');

        if (isSyncEnabled(storage) && !storage.sync.temp.addedData.length) {
          for (const setting of ['linkList','videoTimes','bookmarks','notifications','watched']) {
            if (!storage.sync.settings[setting] || storage.sync.previousSettings.includes(setting)) continue;
            bumpSyncDiff(storage, 'syncSettingChanged');
            break;
          }
        }

        const inputInterval = $('.anitracker-interval-input').val();
        if (/^\d+$/.test(inputInterval)) {
          const interval = (+inputInterval === 0 || +inputInterval >= 60) ? +inputInterval : 60;
          const previousInterval = storage.sync.settings.interval;
          storage.sync.settings.interval = interval;
          saveData(storage);

          if (isSyncEnabled(storage)) {
            if (previousInterval !== 0) broadcastTabMessage('anitracker_update_auto_sync', interval);
            else if (interval !== 0 && previousInterval === 0) setupAutoSync(interval);
          }
        }
        else {
          if (inputInterval === '') storage.sync.settings.interval = getDefaultData().sync.settings.interval;
          saveData(storage);
        }

        if (firstTime) openSyncDataModal();
        else if (backFunction) backFunction();
        else closeModal();
      });

      openModal(backFunction);
    }

    $('#anitracker-sync-data').on('click', () => {
      const storage = getStorage();
      if (storage.sync.settings.entered) openSyncDataModal();
      else openSyncSettingsModal(openShowDataModal, true);
    });

    openModal();
  }

  $('#anitracker-show-data').on('click', openShowDataModal);
}

function isOutdatedClient(request) {
  return request.status === 445 || request.statusText === 'Unsupported Client Version';
}

function showOutdatedClientMessage(request, storage = getStorage()) {
  const properVersion = request.getResponseHeader('Anitracker-Version-Required') || '[unspecified]';
  storage.sync.currentMessage = {
    type: 'error',
    text: `Could not sync data due to outdated AnimePahe Improvements script. Please update to at least version ${properVersion}.<br>(Current version: ${GM_info.script.version})`
  };
  saveData(storage);
  updateSyncMessageElem(storage);
}

function showRateLimitMessage(storage = getStorage()) {
  storage.sync.currentMessage = {
    type: 'error',
    text: "You have sent too many requests. Try again in a few minutes."
  };
  saveData(storage);
  updateSyncMessageElem(storage);
}

function showServiceUnavailableMessage(request, storage = getStorage()) {
  let extraMsg = '';
  if (request.response) extraMsg += ' Message from server:<br>' + request.response;
  else {
    const retryAfter = request.getResponseHeader('Retry-After');
    if (!isNaN(+retryAfter)) {
      let time = Math.floor(+retryAfter / 60);
      if (time >= 60) {
        time = Math.floor(time / 60);
        extraMsg += `<br>Try again in about ${time} hour${time !== 1 ? 's' : ''}.`;
      }
      else extraMsg += `<br>Try again in about ${time} minute${time !== 1 ? 's' : ''}.`;
    }
    else if (retryAfter) extraMsg += ' Try again after:<br>' + retryAfter;
  }
  storage.sync.currentMessage = {
    type: 'error',
    text: "Server is unavailable at the moment." + extraMsg ? extraMsg : '<br>No information was given.'
  };
  saveData(storage);
  updateSyncMessageElem(storage);
}

function updateSyncMessageElem(storage = getStorage()) {
  const elem = $('.anitracker-sync-message');
  if (!elem) return;

  const messageObj = storage.sync.currentMessage;
  if (!messageObj) elem.hide();
  else {
    elem.removeClass('info').removeClass('warning').removeClass('error');
    elem.addClass(messageObj.type);
    elem.html(messageObj.text);
    elem.show();
  }
}

function setupSync(code) {
  const storage = getStorage();
  storage.sync.syncCode = code;
  storage.sync.lastSynced = 0; // Make sure it's reset
  storage.sync.currentMessage = null;
  saveData(storage);

  if (storage.sync.settings.interval) setupAutoSync();
}

// MARKER:SYNC
// Gets a new sync code.
// Returned statuses:
// Code - success
// 1 - network error
// 2 - unknown request error
// 3 - outdated client error
// 4 - rate limited
// 5 - service unavailable
async function syncGetCode() {
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.open('GET', syncApi + '/new-sync', true);
    req.setRequestHeader('Anitracker-Version', GM_info.script.version);

    req.onload = () => {
      if (isOutdatedClient(req)) {
        showOutdatedClientMessage(req);
        resolve(3);
        return;
      }
      else if (req.status === 503) {
        showServiceUnavailableMessage(req);
        resolve(5);
        return;
      }
      else if (req.status === 429) {
        showRateLimitMessage();
        resolve(4);
        return;
      }
      else if (req.status !== 200) {
        console.error(`[AnimePahe Improvements] Got status code ${req.status} when attempting to get sync code: ${req.response}`);
        resolve(2);
        return;
      }

      resolve(req.response);
    };
    req.onerror = (() => {
      resolve(1);
      return;
    });
    req.ontimeout = (() => {
      resolve(1);
      return;
    });

    req.send();
  });
}

// Connects a user to the sync code.
// Returned statuses:
// 0 - success
// 1 - network error
// 2 - code is invalid
// 3 - outdated client error
// 4 - unknown error
// 5 - rate limited
// 6 - service unavailable
async function syncConnectUser(code) {
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.open('POST', syncApi + '/add-user', true);
    req.setRequestHeader('Anitracker-Version', GM_info.script.version);
    req.setRequestHeader('Anitracker-Auth', code);

    req.onload = () => {
      if (isOutdatedClient(req)) {
        showOutdatedClientMessage(req);
        resolve(3);
        return;
      }
      else if (req.status === 503) {
        showServiceUnavailableMessage(req);
        resolve(6);
        return;
      }
      else if ([404, 401].includes(req.status)) {
        resolve(2);
        return;
      }
      else if (req.status === 429) {
        resolve(5);
        return;
      }
      else if (req.status !== 200) {
        console.error(`[AnimePahe Improvements] Got status code ${req.status} when attempting to add user to sync: ${req.response}`);
        resolve(4);
        return;
      }

      const etag = req.getResponseHeader('ETag');
      if (etag) {
        const storage = getStorage();
        storage.sync.temp.requiredHash = etag;
        saveData(storage);
      }

      resolve(0);
    };
    req.onerror = (() => {
      resolve(1);
      return;
    });
    req.ontimeout = (() => {
      resolve(1);
      return;
    });

    req.send();
  });
}

// Disconnects a user from the sync code.
// Returned statuses:
// 0 - success
// 1 - network error
// 2 - unknown error
// 3 - outdated client error
// 4 - rate limited
// 5 - service unavailable
async function syncDisconnectUser(code) {
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.open('POST', syncApi + '/remove-user', true);
    req.setRequestHeader('Anitracker-Version', GM_info.script.version);
    req.setRequestHeader('Anitracker-Auth', code);

    req.onload = () => {
      if (isOutdatedClient(req)) {
        showOutdatedClientMessage(req);
        resolve(3);
        return;
      }
      else if (req.status === 503) {
        showServiceUnavailableMessage(req);
        resolve(5);
        return;
      }
      else if ([404, 401].includes(req.status)) {
        resolve(0);
        return;
      }
      else if (req.status === 429) {
        showRateLimitMessage();
        resolve(4);
        return;
      }
      else if (req.status !== 204) {
        console.error(`[AnimePahe Improvements] Got status code ${req.status} when attempting to remove user from sync: ${req.response}`);
        resolve(2);
        return;
      }

      resolve(0);
    };
    req.onerror = (() => {
      resolve(1);
      return;
    });
    req.ontimeout = (() => {
      resolve(1);
      return;
    });

    req.send();
  });
}

function setAutoSync(timeBetweenChecks) {
  timeBetweenChecks = Math.min(Math.max(timeBetweenChecks, 60), 10080); // Just make sure the number isn't causing issues

  clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    const storage = getStorage();
    if (siteVars.syncErrorCooldown > 0) {
      siteVars.syncErrorCooldown--; // Decreases once per minute
      return;
    }
    if (Date.now() - storage.sync.lastSynced < (timeBetweenChecks * 60 * 1000)) return;

    syncData();
  }, 60 * 1000);
}

function unsetAutoSync() {
  clearInterval(syncInterval);
  syncInterval = undefined;
}

function removeSync() {
  unsetAutoSync();

  const storage = getStorage();
  storage.sync.syncCode = '';
  storage.sync.lastSynced = 0;
  storage.sync.previousSettings = [];
  storage.sync.temp = getDefaultData().sync.temp;
  saveData(storage);
}

async function syncData() {
  const storage = getStorage();
  if (storage.sync.temp.inProgress) return;

  // Functions for finding various data entries with parameters a and b
  // excl = exclude data type check, since all entries in that list are of the same type
  const dataFindFuncs = {
    linkList: (a,b,excl) => {return (excl || a.type === 'linkList') && a.episodeSession === b.episodeSession && (!b.animeSession || a.animeSession === b.animeSession);},
    videoTimes: (a,b,excl) => {return (excl || a.type === 'videoTimes') && a.animeName === b.animeName && a.episodeNum === b.episodeNum;},
    bookmarks: (a,b,excl) => {return (excl || a.type === 'bookmarks') && a.id === b.id;},
    notification_anime: (a,b,excl) => {return (excl || a.type === 'notification_anime') && a.name === b.name;}
  };

  storage.sync.temp.inProgress = true;
  saveData(storage);

  broadcastTabMessage('anitracker_auto_sync_started', 1);

  const storageBefore = JSON.parse(JSON.stringify(storage));
  const syncDiffs = {};

  return new Promise(resolve => {
    runSync(storage.sync.syncCode).then((result) => {
      const storage = getStorage();
      storage.sync.temp.inProgress = false;

      broadcastTabMessage('anitracker_auto_sync_ended', JSON.stringify({
        lastSynced: storage.sync.lastSynced,
        imported: syncDiffs.imported,
        removed: syncDiffs.removed
      }));

      switch (result) {
        case 0:
          storage.sync.currentMessage = null;
          break;
        case 1:
          storage.sync.currentMessage = {
            type: 'error',
            text: 'Could not sync due to network error. Check your internet connection.'
          };
          break;
        case 2:
          storage.sync.currentMessage = {
            type: 'warning',
            text: 'The sync code is no longer valid (possibly due to being unused for a long time).<br>Please create or enter a new code.'
          };
          saveData(storage);
          removeSync();
          updateSyncMessageElem(storage);
          resolve();
          return;
          break;
        case 3:
          storage.sync.currentMessage = {
            type: 'error',
            text: 'Could not sync due to unknown error.<br>See the log for more info.'
          };
          break;
        case 4:
          storage.sync.currentMessage = {
            type: 'error',
            text: 'Last sync was not able to send data to the server.<br>See the log for more info.'
          };
          break;
        // 5 is skipped due to not needing a message
        case 6:
          storage.sync.currentMessage = {
            type: 'error',
            text: 'Last sync was not able to send data to the server.<br>See the log for more info.'
          };
          break;
        // 7 and 8 are skipped due to already being handled in runSync
        case 9:
          storage.sync.currentMessage = {
            type: 'error',
            text: 'Last sync was not able to send data to the server.<br>Try again in a few minutes.'
          };
          break;
        // 10 is skipped due to already being handled in runSync
        case 11:
          storage.sync.currentMessage = {
            type: 'info',
            text: 'Nothing is currently being synced.<br>Check settings.'
          };
          break;
      }

      saveData(storage);
      updateSyncMessageElem(storage);

      if (syncDiffs.removed) {
        const watchedBefore = decodeWatched(storageBefore.watched);
        const ratios = {
          linkList: storageBefore.linkList.length > 1 ? storage.linkList.length / storageBefore.linkList.length : 1,
          videoTimes: storageBefore.videoTimes.length > 1 ? storage.videoTimes.length / storageBefore.videoTimes.length : 1,
          bookmarks: storageBefore.bookmarks.length > 1 ? storage.bookmarks.length / storageBefore.bookmarks.length : 1,
          notificationAnime: storageBefore.notifications.anime.length > 1 ? storage.notifications.anime.length / storageBefore.notifications.anime.length : 1,
          watched: watchedBefore.length > 1 ? decodeWatched(storage.watched).length / watchedBefore.length : 1
        };
        if (storage.debug?.sync) console.log(ratios.linkList,ratios.videoTimes,ratios.bookmarks,ratios.notificationAnime,ratios.watched);

        const a = 0.1; // Lowest acceptable percentage of data left (10%)
        if (ratios.linkList < a || ratios.videoTimes < a || ratios.bookmarks < a || ratios.notificationAnime < a || ratios.watched < a) {
          broadcastTabMessage('anitracker_sync_deletion_confirmation', JSON.stringify(syncDiffs.removed));
        }
      }

      resolve();
    });
  });

  // Returned statuses:
  // 0 - success
  // 1 - network error when getting data
  // 2 - code is invalid
  // 3 - unknown error when getting data
  // 4 - error when putting data
  // 5 - data mismatch after adding user
  // 6 - data mismatch during sync
  // 7 - outdated client error
  // 8 - rate limited due to GET
  // 9 - rate limited due to PUT
  // 10 - service unavailable
  // 11 - no need to sync due to no enabled settings
  async function runSync(code) {
    /*syncing order of operations:
    1. get data from server
    2. go through removed log and remove matches in the requested data
    3. go through local data and remove everything that 1) doesn't exist in the requested data, and 2) isn't in the added log (this is skipped the first time this client syncs)
    4. import requested data
    5. PUT request with the current local data into the server
    6. done
    */

    return new Promise(resolve => {
      let storage = getStorage();
      const settings = storage.sync.settings;
      if (![settings.linkList,settings.videoTimes,settings.bookmarks,settings.notifications,settings.watched].includes(true)) {
        resolve(11);
        return;
      }

      let req = new XMLHttpRequest();
      req.open('GET', syncApi + '/data', true);
      req.setRequestHeader('Anitracker-Version', GM_info.script.version);
      req.setRequestHeader('Anitracker-Auth', code);

      req.onload = afterGet;
      req.onerror = (() => {
        resolve(1);
        return;
      });
      req.ontimeout = (() => {
        resolve(1);
        return;
      });
      req.send();

      function afterGet() {
        if (isOutdatedClient(req)) {
          siteVars.syncErrorCooldown = 30; // Wait 30 minutes on auto-sync if the version is incorrect
          showOutdatedClientMessage(req);
          resolve(7);
          return;
        }
        else if (req.status === 503) {
          siteVars.syncErrorCooldown = 20; // Wait 20 minutes on auto-sync if the server is down
          showServiceUnavailableMessage(req);
          resolve(10);
          return;
        }
        if (req.status === 404) {
          resolve(2);
          return;
        }
        else if (req.status === 429) {
          showRateLimitMessage();
          resolve(8);
          return;
        }
        else if (req.status !== 200) {
          console.error(`[AnimePahe Improvements] Got status code ${req.status} when attempting to get sync data: ${req.response}`);
          resolve(3);
          return;
        }

        const etag = req.getResponseHeader('ETag');
        if (!etag) {
          console.error(`[AnimePahe Improvements] Got no ETag alongside sync data. Headers: ${req.getAllResponseHeaders()}`);
          resolve(3);
          return;
        }

        let storage = getStorage();

        if (storage.sync.temp.requiredHash !== '' && etag !== storage.sync.temp.requiredHash) {
          storage.sync.temp.requiredHash = '';
          saveData(storage);
          resolve(5);
          return;
        }
        storage.sync.temp.requiredHash = '';

        const dbResponse = JSON.parse(req.response);

        // If the database data hasn't been changed and there are no changes to save, do nothing
        if (storage.sync.lastSynced > dbResponse.lastUpdated && (storage.sync.temp.removedData.length + storage.sync.temp.addedData.length) === 0) {
          storage.sync.lastSynced = Date.now();
          saveData(storage);
          resolve(0);
          return;
        }

        let dbData = dbResponse.data;
        if (dbData.version !== getDefaultData().version) {
          upgradeData(dbData, dbData.version);
        }

        if (!settings.linkList) delete dbData.linkList;
        if (!settings.videoTimes) delete dbData.videoTimes;
        if (!settings.bookmarks) delete dbData.bookmarks;
        if (!settings.notifications) delete dbData.notifications;
        if (!settings.watched) delete dbData.watched;

        // If first time syncing (lastSynced is 0), skip these steps
        if (storage.sync.lastSynced !== 0) {
          fixDataDiff(storage);
          dbData = deleteMatchingSyncedData(dbData, storage);
          storage = deleteMatchingLocalData(dbData, storage);
        }

        syncDiffs.imported = importData(storage, dbData, true, {settings:true}, true); // Imports synced data and saves storage data

        storage = getStorage();

        const toPut = JSON.parse(JSON.stringify(storage));
        if (!settings.linkList) delete toPut.linkList;
        if (!settings.videoTimes) delete toPut.videoTimes;
        if (!settings.bookmarks) delete toPut.bookmarks;
        if (!settings.notifications) delete toPut.notifications;
        if (!settings.watched) delete toPut.watched;

        const putReasons = [];
        for (const entry of storage.sync.temp.removedData) {
          const str = '-' + entry.type;
          if (!putReasons.includes(str)) putReasons.push(str);
        }
        for (const entry of storage.sync.temp.addedData) {
          const str = '+' + (entry.bump ?? entry.type);
          if (!putReasons.includes(str)) putReasons.push(str);
        }
        if (storage.debug?.sync) console.log('putreasons:', putReasons, storage.sync.temp.removedData, storage.sync.temp.addedData);

        req = new XMLHttpRequest();
        req.open('PUT', syncApi + '/data', true);
        req.setRequestHeader('Anitracker-Version', GM_info.script.version);
        req.setRequestHeader('Anitracker-Auth', code);
        req.setRequestHeader('Anitracker-PUT-Reasons', putReasons.join(', '));
        req.setRequestHeader('If-Match', etag);

        req.onload = afterPut;

        try {
          $.anitrackerCachedScript('https://cdn.jsdelivr.net/npm/js-base64@3.7.8/base64.min.js', function() {
            req.send(Base64.encode(JSON.stringify(toPut)));
          }).fail((jqXHR, textStatus) => {
            console.error(`[AnimePahe Improvements] Error when putting sync data: ${textStatus} ${jqXHR.status}`);
            resolve(4);
            return;
          });
        }
        catch (err) {
          console.error(`[AnimePahe Improvements] Error when putting sync data: ${err}`);
          resolve(4);
          return;
        }
      }

      function afterPut() {
        if (req.status === 412) {
          console.error(`[AnimePahe Improvements] Data mismatch when attempting to put sync data. ${etag} vs ${req.getResponseHeader('ETag')}`);
          resolve(6);
          return;
        }
        else if (req.status === 429) {
          resolve(9);
          return;
        }
        else if (req.status !== 204) {
          console.error(`[AnimePahe Improvements] Got status code ${req.status} when attempting to put sync data: ${req.response}`);
          resolve(4);
          return;
        }

        storage = getStorage();
        storage.sync.temp.removedData = [];
        storage.sync.temp.addedData = [];
        storage.sync.lastSynced = Date.now();
        storage.sync.previousSettings = [];
        for (const [key,value] of Object.entries(storage.sync.settings)) {
          if (!['interval','entered'].includes(key) && value) storage.sync.previousSettings.push(key);
        }
        saveData(storage);

        resolve(0);
      }
    });
  }

  function fixDataDiff(storage) {
    const removedDataCopy = JSON.parse(JSON.stringify(storage.sync.temp.removedData));
    for (const entry of removedDataCopy) {
      if (!entry) storage.sync.temp.removedData = storage.sync.temp.removedData.filter(a => a);
      else if (entry.type === 'watched') {
        const epsToRemove = [];
        const addedIndicesToRemove = [];
        for (const found of storage.sync.temp.addedData) {
          if (found.animeId !== entry.animeId || !found.episodes.some(a => entry.episodes.includes(a))) continue;
          for (const ep of entry.episodes) {
            if (found.episodes.find(a => a === ep) === undefined) continue;
            found.episodes.splice(found.episodes.indexOf(ep), 1);
            epsToRemove.push(ep);
          }
          if (!found.episodes.length) addedIndicesToRemove.push(storage.sync.temp.addedData.indexOf(found));
        }
        if (storage.debug?.sync) console.log('toremovee:', epsToRemove);
        if (storage.debug?.sync) console.log('toremove:', addedIndicesToRemove, addedIndicesToRemove.map(a => storage.sync.temp.addedData[a]));
        const realEntry = storage.sync.temp.removedData.find(a => a.animeId === entry.animeId && a.episodes.every(g => entry.episodes.includes(g)));
        for (const ep of epsToRemove) {
          realEntry?.episodes.splice(entry.episodes.indexOf(ep), 1);
        }
        for (const i of addedIndicesToRemove) {
          storage.sync.temp.addedData.splice(i, 1);
        }
      }
      else {
        if (!dataFindFuncs[entry.type]) continue;
        const index = storage.sync.temp.addedData.findIndex(a => dataFindFuncs[entry.type](a,entry));
        if (index === -1) continue;
        storage.sync.temp.addedData.splice(index, 1);
        storage.sync.temp.removedData.splice(storage.sync.temp.removedData.findIndex(a => dataFindFuncs[entry.type](a,entry)), 1);
      }
    }
    if (storage.debug?.sync) console.log('resultremove:', storage.sync.temp.removedData);
  }

  // Delete database data that is marked to be deleted
  function deleteMatchingSyncedData(dbData, storage) {
    const deleteList = storage.sync.temp.removedData;
    const syncSettings = storage.sync.settings;

    let decodedDBWatched = dbData.watched ? decodeWatched(dbData.watched) : [];

    for (const entry of deleteList) {
      if (syncSettings.linkList && entry.type === 'linkList' && dbData.linkList) {
        dbData.linkList = dbData.linkList.filter(g => !dataFindFuncs.linkList(g,entry,true));
        continue;
      }
      if (syncSettings.videoTimes && entry.type === 'videoTimes' && dbData.videoTimes) {
        dbData.videoTimes = dbData.videoTimes.filter(g => !dataFindFuncs.videoTimes(g,entry,true));
        continue;
      }
      if (syncSettings.bookmarks && entry.type === 'bookmarks' && dbData.bookmarks) {
        dbData.bookmarks = dbData.bookmarks.filter(g => !dataFindFuncs.bookmarks(g,entry,true));
        continue;
      }
      if (syncSettings.notifications && entry.type === 'notification_anime' && dbData.notifications?.anime) {
        dbData.notifications.anime = dbData.notifications.anime.filter(g => !dataFindFuncs.notification_anime(g,entry,true));
        continue;
      }
      if (syncSettings.watched && entry.type === 'watched' && dbData.watched) {
        const foundAnime = decodedDBWatched.find(g => g.animeId === entry.animeId);
        if (!foundAnime) continue;
        for (const ep of entry.episodes) {
          const found = foundAnime.episodes.find(g => g === ep);
          // Important to do !== undefined here since episode numbers can be falsy
          if (found !== undefined) foundAnime.episodes.splice(foundAnime.episodes.indexOf(found), 1);
        }
        if (foundAnime.episodes.length === 0) decodedDBWatched = decodedDBWatched.filter(g => !(g.animeId === entry.animeId));
        continue;
      }
    }

    if (dbData.watched) dbData.watched = encodeWatched(decodedDBWatched);

    return dbData;
  }

  // Delete local data that doesn't exist in the database
  function deleteMatchingLocalData(dbData, storage) {
    const addedList = storage.sync.temp.addedData;
    const prevSettings = storage.sync.previousSettings;
    const syncSettings = storage.sync.settings;

    const storageCopy = JSON.parse(JSON.stringify(storage));

    let decodedLocalWatched = decodeWatched(storage.watched);
    const decodedDBWatched = dbData.watched ? decodeWatched(dbData.watched) : [];

    const deleteLog = {linkList:[],videoTimes:[],bookmarks:[],notifications:{anime:[]},watched:[]};

    if (syncSettings.linkList && prevSettings.includes('linkList') && dbData.linkList) storageCopy.linkList.forEach(g => {
      if (dbData.linkList.find(a => dataFindFuncs.linkList(a,g,true))) return;
      if (addedList.find(a => dataFindFuncs.linkList(a,g))) return;
      deleteLog.linkList.push(g);
      storage.linkList = storage.linkList.filter(a => !dataFindFuncs.linkList(a,g,true));
    });
    if (syncSettings.videoTimes && prevSettings.includes('videoTimes') && dbData.videoTimes) storageCopy.videoTimes.forEach(g => {
      if (dbData.videoTimes.find(a => dataFindFuncs.videoTimes(a,g,true))) return;
      if (addedList.find(a => dataFindFuncs.videoTimes(a,g))) return;
      deleteLog.videoTimes.push(g);
      storage.videoTimes = storage.videoTimes.filter(a => !dataFindFuncs.videoTimes(a,g,true));
    });
    if (syncSettings.bookmarks && prevSettings.includes('bookmarks') && dbData.bookmarks) storageCopy.bookmarks.forEach(g => {
      if (dbData.bookmarks.find(a => dataFindFuncs.bookmarks(a,g,true))) return;
      if (addedList.find(a => dataFindFuncs.bookmarks(a,g))) return;
      deleteLog.bookmarks.push(g);
      storage.bookmarks = storage.bookmarks.filter(a => !dataFindFuncs.bookmarks(a,g,true));
    });
    if (syncSettings.notifications && prevSettings.includes('notifications') && dbData.notifications?.anime) storageCopy.notifications.anime.forEach(g => {
      if (dbData.notifications.anime.find(a => dataFindFuncs.notification_anime(a,g,true))) return;
      if (addedList.find(a => dataFindFuncs.notification_anime(a,g))) return;
      deleteLog.notifications.anime.push(g);
      storage.notifications.anime = storage.notifications.anime.filter(a => !dataFindFuncs.notification_anime(a,g,true));
      storage.notifications.episodes = storage.notifications.episodes.filter(a => !(a.animeName === g.name)); // notifications.episodes uses "animeName," so the comparison function won't work
    });
    if (syncSettings.watched && prevSettings.includes('watched') && dbData.watched !== undefined) decodedLocalWatched.forEach(anime => {
      const found = decodedDBWatched.find(a => a.animeId === anime.animeId);
      if (!found) {
        if (!addedList.find(a => a.type === 'watched' && a.animeId === anime.animeId)) {
          deleteLog.watched.push({animeId: anime.animeId, episodes: anime.episodes});
          decodedLocalWatched = decodedLocalWatched.filter(a => !(a.animeId === anime.animeId));
        }
        return;
      }
      const deletedEpisodes = [];
      const episodesCopy = JSON.parse(JSON.stringify(anime.episodes));
      episodesCopy.forEach(g => {
        if (found.episodes.find(a => a === g) !== undefined) return; // Important to do !== undefined here since episode numbers can be falsy
        if (addedList.find(a => a.type === 'watched' && a.animeId === anime.animeId && a.episodes.includes(g))) return;
        deletedEpisodes.push(g);
        anime.episodes.splice(anime.episodes.indexOf(g), 1);
      });
      if (deletedEpisodes.length) deleteLog.watched.push({animeId: anime.animeId, episodes: deletedEpisodes});
    });

    if ((deleteLog.linkList.length + deleteLog.videoTimes.length + deleteLog.bookmarks.length + deleteLog.notifications.anime.length + deleteLog.watched.length) > 0) {
      console.log('[AnimePahe Improvements] The following local data was removed during sync:', deleteLog);
    }
    else console.log('[AnimePahe Improvements] No local data was removed during sync.');
    syncDiffs.removed = deleteLog;

    storage.watched = encodeWatched(decodedLocalWatched);

    return storage;
  }
}


addGeneralButtons();
if (isEpisode()) {
  $(`
  <span style="margin-left: 30px;"><i class="fa fa-files-o" aria-hidden="true"></i>&nbsp;Copy:</span>
  <div class="btn-group">
    <button class="btn btn-dark anitracker-copy-button" copy="link" data-placement="top" data-content="Copied!">Link</button>
  </div>
  <div class="btn-group" style="margin-right:30px;">
    <button class="btn btn-dark anitracker-copy-button" copy="link-time" data-placement="top" data-content="Copied!">Link &amp; Time</button>
  </div>`).appendTo('#anitracker');
  addOptionSwitch('autoPlayNext','Auto-Play Next','Automatically go to the next episode when the current one has ended.','#anitracker');

  $('.anitracker-copy-button').on('click', (e) => {
    const targ = $(e.currentTarget);
    const type = targ.attr('copy');
    const id = getAnimeId(animeSession);
    const episode = getEpisodeNum();
    if (['link','link-time'].includes(type)) {
      navigator.clipboard.writeText(window.location.origin + '/customlink?a=' + id + '&e=' + episode + (type !== 'link-time' ? '' : ('&t=' + currentEpisodeTime.toString())));
    }
    targ.popover('show');
    setTimeout(() => {
      targ.popover('hide');
    }, 1000);
  });
}

if (initialStorage.settings.autoDelete === true && isEpisode() && paramArray.find(a => a[0] === 'ref' && a[1] === 'customlink') === undefined) {
  deleteEpisodesFromTracker(getEpisodeNum(), getAnimeName(), getAnimeId(animeSession));
}

function updateSwitches() {
  const storage = getStorage();

  for (const s of optionSwitches) {
    const different = s.value !== storage.settings[s.optionId];
    if (!different) continue;

    s.value = storage.settings[s.optionId];
    $(`#anitracker-${s.switchId}-switch`).prop('checked', s.value === true);

    if (s.value === true) {
      if (s.onEvent !== undefined) s.onEvent();
    }
    else if (s.offEvent !== undefined) {
      s.offEvent();
    }
  }
}

updateSwitches();

function addOptionSwitch(optionId, name, desc = '', parent = '#anitracker-modal-body') {
  const option = optionSwitches.find(s => s.optionId === optionId);

  $(`
  <div class="custom-control custom-switch anitracker-switch" id="anitracker-${option.switchId}" title="${toHtmlCodes(desc)}">
    <input type="checkbox" class="custom-control-input" id="anitracker-${option.switchId}-switch">
    <label class="custom-control-label" for="anitracker-${option.switchId}-switch">${name}</label>
  </div>`).appendTo(parent);
  const switc = $(`#anitracker-${option.switchId}-switch`);
  switc.prop('checked', option.value);

  const events = [option.onEvent, option.offEvent];

  switc.on('change', (e) => {
    const checked = $(e.currentTarget).is(':checked');
    const storage = getStorage();

    if (checked !== storage.settings[optionId]) {
      storage.settings[optionId] = checked;
      option.value = checked;
      saveData(storage);
    }

    if (checked) {
      if (events[0] !== undefined) events[0]();
    }
    else if (events[1] !== undefined) events[1]();
  });
}

$(`
<div class="anitracker-player-dropup-spinner anitracker-spinner" style="display: none;">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
</div>`).prependTo('#downloadMenu,#episodeMenu');
$('.prequel img,.sequel img').attr('loading','');
}