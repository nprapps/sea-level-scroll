var $ = require("./lib/qsa");
// var trackEvent = require("./lib/tracking");
var element = $.one(".autoplay");

// Videos that are not slide backgrounds, i.e., those within text sections
var textVideos = $("video:not(.backdrop)");

// var isSafari = navigator.userAgent.match(/i(phone|pad)/i);

// // in ms
// var ADSR = {
//   attack: 200,
//   release: 1000
// };

var Player = function (element) {
  this.element = element;
  this.autoplay = $.one("#video-play", element);
  // this.playButton = $.one(".play-pause", element);
  // this.progress = $.one(".ring", element);
  // this.title = $.one(".label .content", element);
  // this.bug = $.one(".scroll-bug", element);
  // this.proxy = $.one("audio", element);
  // this.fades = new Map();

  // "onTime onPlay onPause onEnd"
  //   .split(" ")
  //   .forEach(m => (this[m] = this.wrapProxyEvents(this[m]).bind(this)));

  "onTime onPlay onPause onEnd"
    .split(" ")
    .forEach(m => (this[m] = this[m].bind(this)));

  // "onAutoplay onClickedPlay"
  //   .split(" ")
  //   .forEach(m => this[m] = this[m].bind(this));

  this.onAutoplay = this.onAutoplay.bind(this);

  this.autoplay.checked = false;
  this.autoplay.addEventListener("change", this.onAutoplay);
  // this.playButton.addEventListener("click", this.onClickedPlay);

  // if (isSafari) {
  //   console.log("Safari detected - using proxy audio track for playback");
  // }

  // this.bindTrack(this.proxy);

  // document.addEventListener("keyup", e => {
  //   if (e.code == "KeyP") this.playButton.click();
  //   if (e.code == "KeyA") this.autoplay.click();
  // });
};

Player.prototype = {
  // fades: null,
  // fadeTimeout: null,
  track: null,
  element: null,
  autoplay: null,
  // playButton: null,
  // progress: null,
  // title: null,
  // bug: null,
  // proxy: null,

  get paused() {
    if (!this.track) return true;
    // return isSafari ? this.proxy.paused : this.track.paused;
    return this.track.paused;
  },

  play(track) {
    this.cue(track);
    // this.bug.classList.remove("show");
    if (track.paused) {
      this.startVideo(track);
    }
    // this.playButton.setAttribute("aria-pressed", "true");
  },

  startVideo(track) {
    // track.dataset.played = true;
    // if (isSafari) {
    //   this.proxy.src = track.src;
    //   track = this.proxy;
    // }
    // track.currentTime = 0;
    var promise = track.play();
    if (promise) {
      promise.catch(err => console.log(err));
    }
  },

  startTextVideos() {
    var promise = Promise.all(
      [...textVideos].map(v => {
        if (v.paused) return v.play();
      })
    );
    if (promise) {
      // Not perfect, but works for now
      promise.catch(err => {});
    }
  },

  stopTextVideos() {
    textVideos.forEach(v => {
      if (!v.paused) v.pause();
    });
  },

  cue(track) {
    if (track != this.track) {
      this.stop();
      // if (!isSafari) {
      //   if (this.track) this.unbindTrack(this.track);
      //   this.bindTrack(track);
      // }
      if (this.track) this.unbindTrack(this.track);
      this.bindTrack(track);
    }
    this.track = track;
    // track.volume = 1;

    // set the metadata
    // this.title.innerHTML = track.dataset.title;
  },

  stop() {
    if (!this.track) return;
    // this.element.classList.remove("playing");
    this.track.pause();
    // this.proxy.pause();
    // this.title.innerHTML = "";
    // this.playButton.setAttribute("aria-pressed", "false");
  },

  show() {
    // this.bug.classList.remove("show");
    this.element.classList.remove("hidden");
  },

  hide() {
    this.element.classList.add("hidden");
    // this.bug.classList.remove("show");
  },

  bindTrack(track) {
    track.addEventListener("timeupdate", this.onTime);
    track.addEventListener("play", this.onPlay);
    track.addEventListener("pause", this.onPause);
    track.addEventListener("ended", this.onEnd);
  },

  unbindTrack(track) {
    track.removeEventListener("timeupdate", this.onTime);
    track.removeEventListener("play", this.onPlay);
    track.removeEventListener("pause", this.onPause);
    track.removeEventListener("ended", this.onEnd);
  },

  // onClickedPlay() {
  //   if (!this.track) return;
  //   var track = isSafari ? this.proxy : this.track;
  //   trackEvent("play-button", track.paused ? "play" : "pause");
  //   if (!track.paused) {
  //     track.pause();
  //     this.playButton.setAttribute("aria-pressed", "false");
  //     // autoplay.checked = false;
  //   } else {
  //     track.volume = 1;
  //     track.play();
  //     this.playButton.setAttribute("aria-pressed", "true");
  //   }
  // },

  onAutoplay() {
    var checked = this.autoplay.checked;
    document.body.classList.toggle("autoplay-on", checked);
    // trackEvent("autoplay-toggled", checked);
    if (!checked) {
      this.stop();
      this.stopTextVideos();
    } else if (this.track && this.track.paused) {
      this.play(this.track);
      this.startTextVideos();
    } else {
      this.startTextVideos();
    }
  },

  onTime() {
    // var track = isSafari ? this.proxy : this.track;
    // var track = this.track;
    // var ratio = track.currentTime / track.duration;
    // this.progress.style.strokeDashoffset = ratio * Math.PI * 30;
  },

  onPlay() {
    // this.element.classList.add("playing");
    // this.show();
  },

  onPause() {},

  onEnd() {
    // this.element.classList.remove("playing");
    // this.bug.classList.add("show");
  },

  // wrapProxyEvents(f) {
  //   if (!isSafari) return f;
  //   return function (event) {
  //     f.call(this, event);
  //     var e = new CustomEvent(event.type);
  //     this.track.currentTime = this.proxy.currentTime;
  //     this.track.dispatchEvent(e);
  //   };
  // },
};

module.exports = new Player(element);
