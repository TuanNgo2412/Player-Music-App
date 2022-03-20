// Render songs --> Ok
// Scroll top --> Ok
// Play / Pause /Seek --> Ok
// CD rotate --> Ok
// Next / Previous --> Ok
// Random --> Ok
// Next / Repeat when ended --> Ok
// Active song --> Ok
// Scroll active song into view --> Ok
// Play song when click --> Ok


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'TN_player';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
          name: "Nevada",
          singer: "Vicetone x Cozi Zuehlsdorff",
          path: "https://aredir.nixcdn.com/Monstercat_Audio1/Nevada-Monstercat-6983746.mp3?st=iXQPvHJjQcGFkW_Gi4EAzw&e=1647779427",
          image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_webp/cover/2/3/1/1/2311971204a1e383f86c97706a8ecda9.jpeg"
        },
        {
          name: "Summer Time",
          singer: "K391",
          path: "https://aredir.nixcdn.com/NhacCuaTui970/Summertime-K391-3549537.mp3?st=6vR4m2hdFMGuzqWi8N-ubA&e=1647789522",
          image:"https://photo-resize-zmp3.zadn.vn/w240_r1x1_webp/cover/8/2/9/9/82998293f8c34d7999339490d0b90118.jpg"
        },
        {
          name: "Alone",
          singer: "Alane Walker",
          path: "https://tainhacmienphi.biz/get/song/api/2556",
          image: "https://i1.sndcdn.com/artworks-000117999746-91l56z-t200x200.jpg"
        },
        {
          name: "Unstoppable",
          singer: "Sia",
          path: "https://tainhacmienphi.biz/get/song/api/31391",
          image: "https://i1.sndcdn.com/artworks-000190723014-nolvp9-t200x200.jpg"
        },
        {
          name: "La la la",
          singer: "Naughty Boy",
          path: "https://tainhacmienphi.biz/get/song/api/2589",
          image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_webp/covers/f/e/feea25ea97f8e4079fbb687ce20f290f_1369411487.jpg"
        },
        {
          name: "Ignite",
          singer: "Alan Walker x Julie Bergan x K-391 x Seung Ri",
          path: "https://tainhacmienphi.biz/get/song/api/3934",
          image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_webp/cover/b/5/8/b/b58b13be6eb72985b4511b327b9fcbb5.jpg"
        },
        {
          name: "Titanium",
          singer: "David Guetta x Sia",
          path: "https://tainhacmienphi.biz/get/song/api/2891",
          image: "https://i1.sndcdn.com/artworks-000091581765-p7kpps-t200x200.jpg"
        }
    ],
    setConfig: function (key, value) {
      this.config[key] = value;
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        var htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url(${song.image})">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })

        playList.innerHTML = htmls.join('');

    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Handling CD play and stop
        const cdThumbAnimate = cdThumb.animate([
          { transform: 'rotate(360deg)'}
        ], {
          duration: 10000, // 10seconds
          iterations: Infinity
        })
        cdThumbAnimate.pause();

        // Handling zoom in / zoom out CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Handling when click play
        playBtn.onclick = function() {
          if (_this.isPlaying) {
            audio.pause();
          } else {
            audio.play();
          }
        }

        // When song was played
        audio.onplay = function () {
          _this.isPlaying = true;
          player.classList.add('playing');
          cdThumbAnimate.play();
        }

        // When song was paused
        audio.onpause = function () {
          _this.isPlaying = false;
          player.classList.remove('playing');
          cdThumbAnimate.pause();
        }

        // when progress of song was changed
        audio.ontimeupdate = function () {
          if (audio.duration) {
            const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
            progress.value = progressPercent;
          }
        }
        
        // Handling when tua song
        progress.oninput = function (e) {
          const seekTime = ((audio.duration * e.target.value) / 100);
          audio.currentTime = seekTime;
        }

        // When Next song
        nextBtn.onclick = function () {
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.nextSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        }

        // When Prev song
        prevBtn.onclick = function () {
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.prevSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        }

        // Handle of Turn on / Turn of the random button
        randomBtn.onclick = function (e) {
          _this.isRandom = !_this.isRandom;
          _this.setConfig('isRandom', _this.isRandom);
          randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Handle repeat song
        repeatBtn.onclick = function (e) {
          _this.isRepeat = !_this.isRepeat;
          _this.setConfig('isRepeat', _this.isRepeat);
          repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        //  Handle next song when audio ended
        audio.onended = function() {
          if (_this.isRepeat) {
            audio.play();
          }else {
            nextBtn.click();
          }
        }

        // Listening behavior click on playlist
        playList.onclick = function (e) {
          const songNode = e.target.closest('.song:not(.active)');

          if (songNode || e.target.closest('.option')) {
            
            // Handling when click on song
            if (songNode) {
              _this.currentIndex = Number(songNode.dataset.index);
              _this.loadCurrentSong();
              _this.render();
              audio.play();
            }

            // Handling when click option button
            if (e.target.closest('.option')) {

            }
            
          }
        }
    },
    scrollToActiveSong: function () {
      setTimeout(function () {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 1000)
    },
    loadCurrentSong: function () {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        
    },
    loadConfig: function () {
      this.isRandom = this.config.isRandom;
      this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
      this.currentIndex++;
      if (this.currentIndex > this.songs.length - 1) {
        this.currentIndex = 0;
      }
      this.loadCurrentSong();
    },
    prevSong: function () {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1;
      }

      this.loadCurrentSong();
    },
    playRandomSong: function () {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * this.songs.length);
      } while(newIndex === this.currentIndex)

      this.currentIndex = newIndex;
      this.loadCurrentSong();
    },
    start: function () {
        // Assigning configure from config to object
        this.loadConfig();

        // Defined properties for object
        this.defineProperties();

        // Listen / Handle events (DOM events)
        this.handleEvents();

        // Load the information of first song into UI when the app running
        this.loadCurrentSong();

        // Render the playlist
        this.render();

        // Display initial state of random and repeat buttons
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

    }
}

app.start();


