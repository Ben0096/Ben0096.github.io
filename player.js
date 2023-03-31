let bg_image = document.querySelector(".bg-image");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".play-button");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer = false;

seek_slider.addEventListener("touchend", seekChange);
seek_slider.addEventListener("mouseup", seekChange);
volume_slider.addEventListener("mouseup", setVolume);

document.body.addEventListener("keydown", (e) => {
    if (e.keyCode == 32) {
        playpauseTrack();
    } else if (e.keyCode == 37) {
        jumpBack();
    } else if (e.keyCode == 39) {
        jumpForward();
    }
    //    else console.log(`down:  key: ${e.key}, code: ${e.keyCode}\n`);
});

// create an audio tag for the player
let curr_track = document.createElement('audio');

curr_track.addEventListener("loadedmetadata", onmetadata);
let curr_track_duration = 0;
let curr_track_duration_string = "00:00";

function onmetadata() {
    curr_track_duration = curr_track.duration;

    let dmin = Math.floor(curr_track_duration / 60);
    let dsec = Math.floor(curr_track_duration % 60);

    // add leading zeroes
    if (dsec < 10) dsec = "0" + dsec;
    if (dmin < 10) dmin = "0" + dmin;

    curr_track_duration_string = dmin + ":" + dsec;

    // display
    total_duration.textContent = curr_track_duration_string;
}

function loadTrack(track_index) {

    document.title = track_list[track_index].name;

    curr_track_duration = 0;
    stopUpdateTimer()
    updateSeek();

    // load track
    curr_track.src = track_list[track_index].path;
    curr_track.load();

    // track_list info
    bg_image.style.backgroundImage =
        "URL(" + track_list[track_index].image + ")";
    track_art.style.backgroundImage =
        "URL(" + track_list[track_index].image + ")";
    track_name.textContent = track_list[track_index].name;
    track_artist.textContent = track_list[track_index].artist;

    startUpdateTimer();

    // when curr_track ends, nextTrack()
    curr_track.addEventListener("ended", nextTrack);
}

function startUpdateTimer() {
    // update the track slider every .5 seconds
    if (!updateTimer) updateTimer = setInterval(updateSeek, 500);
}

function stopUpdateTimer() {
    clearInterval(updateTimer);
    updateTimer = false;
}

function playpauseTrack() {
    if (!isPlaying) playTrack();
    else pauseTrack();
}

function playTrack() {
    if (curr_track.readyState != 4) {
        setTimeout(playTrack, 500);
    } else {
        curr_track.play();
        isPlaying = true;
        playpause_btn.className = "pause-button";

        startUpdateTimer();
    }
}

function pauseTrack() {

    curr_track.pause();
    isPlaying = false;

    playpause_btn.className = "play-button";
}

function resetDisplay() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

function resetTrack() {
    curr_track.currentTime = 0;
    curr_time.textContent = "00:00";
    seek_slider.value = 0;
}

function nextTrack() {
    if (!track_list.length) return;
    if (track_list.length == 1) {
        pauseTrack();
        resetTrack();
        return;
    }
    resetDisplay();

    // increment track_index
        track_index = ++track_index % track_list.length;

    loadTrack(track_index);
    if (isPlaying) playTrack();
}

function prevTrack() {
    if (curr_track_duration && .011 < curr_track.currentTime / curr_track_duration) { // jump to beginning of track
        resetTrack();
    } else { // change to previous track
        resetDisplay();

        // decrement track_index
        if (track_index > 0)
            track_index -= 1;
        else track_index = track_list.length - 1;

        loadTrack(track_index);
        if (isPlaying) playTrack();
    }
}

function jumpBack() {
    curr_track.currentTime = Math.max(curr_track.currentTime - 10, 0);
    updateSeek();
}

function jumpForward() {
    curr_track.currentTime = Math.min(curr_track.currentTime + 10, curr_track_duration - .1);
    updateSeek();
}

function seekMouseDown() {
    if (isPlaying) curr_track.pause();
    stopUpdateTimer();
}

function seekChange() {
    curr_track.currentTime = curr_track_duration * seek_slider.value / 1000;
    if (isPlaying) curr_track.play();
    startUpdateTimer();
}

function seekInput() {
    updateSeekTime();
}

function updateSeekTime() {
    if (curr_track_duration) {
        let seekTime = curr_track_duration * seek_slider.value / 1000;
        let mins = Math.floor(seekTime / 60);
        let secs = Math.floor(seekTime % 60);
        if (mins < 10) mins = "0" + mins;
        if (secs < 10) secs = "0" + secs;
        curr_time.textContent = mins + ":" + secs;
        total_duration.textContent = curr_track_duration_string;
    } else resetDisplay();
}

function updateSeekSlider() {
    let seekTime = 0;
    if (curr_track_duration) {
        seekTime = 1000 * curr_track.currentTime / curr_track_duration;
    }
    seek_slider.value = seekTime;
}

function updateSeek() {
    updateSeekSlider();
    updateSeekTime();
}

function setVolume() {
    curr_track.volume = volume_slider.value / 100.0;
}

if (track_list.length == 1) {
    document.querySelector(".prev-track-button").className = "";
    document.querySelector(".next-track-button").className = "";
}

// load the first track
loadTrack(track_index);
