
Vue.component('camera', {
  data: function () {
    return {
      count: 0,
      message: "hello",
      show: true,
      interval: null,
      imageBytes: null,
      imageBlob: null,
      notinitialized: true,
      snackbarContainer: document.querySelector('#toast'),
      pc: null,
      ws: null,
      detectedClasses: [],
      followClass: null,
      showDetectionsCheck: false
    }
  },
  props: {
    currentProject: null
  },
  methods: {
    negotiate() {
        pc.addTransceiver('video', {direction: 'recvonly'});
        return pc.createOffer().then(function(offer) {
            return pc.setLocalDescription(offer);
        }).then(function() {
            // wait for ICE gathering to complete
            return new Promise(function(resolve) {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    function checkState() {
                        if (pc.iceGatheringState === 'complete') {
                            pc.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    }
                    pc.addEventListener('icegatheringstatechange', checkState);
                }
            });
        }).then(function() {
            var offer = pc.localDescription;

            return fetch('https://'+window.location.host+'/offer', {

                body: JSON.stringify({
                    sdp: offer.sdp,
                    type: offer.type,
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        }).then(function(response) {
            return response.json();
        }).then(function(answer) {
            console.log(answer)
            return pc.setRemoteDescription(answer);
        }).catch(function(e) {
            alert(e);
        });
    },

    start() {
        var config = {
            sdpSemantics: 'unified-plan'
        };
        //config.iceServers = [{urls: ['stun:stun.l.google.com:19302']}];
        pc = new RTCPeerConnection(config);
    
        // connect audio / video
        pc.addEventListener('track', function(evt) {
            if (evt.track.kind == 'video') {
                console.log(evt)
                stream = evt.streams[0];
                //window.stream = stream;
                video=document.getElementById('video')
                video.srcObject = stream;
            }
        });
    
        this.negotiate();
        this.showStats();
    },

    stop() {
        setTimeout(function() {
            pc.close();
        }, 500);

        this.hideStats();
    },
    capture() {
      	var data = {
        	message: 'Image captured',
	        timeout: 100
      	};
 
	    axios.post("https://"+window.location.host+"/api/video/capture", {
	      bucketName: this.$props.currentProject,
	      objectName: Date.now().toString()+".jpg",
	      contentType: "image/jpg"
	    }).then(response => {
	    	console.log(response);
	    });

      	this.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    },
    groupBy(xs, key) {
          return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
    },
    handleStats(event) {
        data=JSON.parse(event.data);
        this.detectedClasses=data
    },
    showStats() {
        this.ws = new WebSocket("wss://"+window.location.host+"/ws");
        this.ws.onmessage = this.handleStats;
    },
    hideStats() {
        this.ws.close();
        this.ws=null;
    },
    up(){
        this.telloCommand('up',60);
    },
    down(){
        this.telloCommand('down',60);
    },
    forward(){
        this.telloCommand('forward',60);
    },
    backward(){
        this.telloCommand('back',60);
    },
    left(){
        this.telloCommand('left',60);
    },
    right(){
        this.telloCommand('right',60);
    },
    rotateLeft(){
        this.telloCommand('ccw',60);
    },
    rotateRight(){
        this.telloCommand('cw',60);
    },
    takeoff(){
        this.telloCommand('takeoff',0);
    },
    land(){
        this.telloCommand('land',0);
    },
    battery(){
        this.telloCommand('battery',0);
    },
    follow(){
        this.telloCommand('follow',this.followClass);
    },
    setFollow(className){
        this.followClass=className;
    },
    drawDetections({type, target}){
        this.telloCommand('draw_detections',target.checked);
    },
    telloCommand(command, value){
        axios.post("https://"+window.location.host+"/api/tello", {
  	      command: command,
          value: value
  	    }).then(async response => {
            console.log(response);
  	    });
    }
  },
  template: `
  <main class="mdl-layout__content mdl-color--grey-100" v-if="show">

  <div class="mdl-grid demo-content">
  </div>

  <div class="mdl-grid">
      <div class="mdl-layout-spacer"></div> 
      <div class="mdl-cell mdl-cell--6-col">
          <div class="demo-card-wide mdl-card camera mdl-shadow--2dp">
            <video id="video" autoplay muted playsinline></video>
            <!--<div class="mdl-card__actions mdl-card--border"></div>-->
          </div>
      </div>
      <div class="mdl-layout-spacer"></div>

      <div class="mdl-cell mdl-cell--6-col">
          <div class="demo-card-wide mdl-card camera mdl-shadow--2dp">
                <br/>
                <center>
                  <button id="start" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="start">
                      <i class="material-icons">play_arrow</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="start">start video stream</div>
                  <button id="stop" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="stop">
                      <i class="material-icons">stop</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="stop">stop video stream</div>
                  <!--<button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="capture">
                    <i class="material-icons">add</i>
                  </button>-->
                  <button id="takeoff" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="takeoff">
                    <i class="material-icons">vertical_align_top</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="takeoff">takeoff</div>
                  <button id="land" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="land">
                    <i class="material-icons">vertical_align_bottom</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="land">land</div>
                  <!--<button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="battery">
                    <i class="material-icons">battery_full</i>
                  </button>-->


                 <br/>
                 <br/>
                 <br/>
                 <div style="float: left; margin-left: 100px;">
                  <button id="up" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="up">
                    <i class="material-icons">arrow_circle_up</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="up">up</div>
                  <br/>
                  <button id="cw" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="rotateRight">
                    <i class="material-icons">call_missed</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="cw">rotate right</div>
                  &nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;
                  <button id="ccw" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="rotateLeft">
                    <i class="material-icons">call_missed_outgoing</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="ccw">rotate left</div>
                  <br/>
                  <button id="down" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="down">
                    <i class="material-icons">arrow_circle_down</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="down">down</div>
                 </div>

                 <div style="float: right; margin-right: 100px;">
                  <button id="forward" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="forward">
                    <i class="material-icons">keyboard_arrow_up</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="forward">forward</div>
                  <br/>
                  <button id="left" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="left">
                    <i class="material-icons">keyboard_arrow_left</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="left">left</div>
                  &nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;
                  <button id="right" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="right">
                    <i class="material-icons">keyboard_arrow_right</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="right">right</div>
                  <br/>
                  <button id="backward" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" v-on:click="backward">
                    <i class="material-icons">keyboard_arrow_down</i>
                  </button>
                  <div class="mdl-tooltip" data-mdl-for="backward">backward</div>
                 </div>
                </center>
                <br/>

            <div class="mdl-card__actions mdl-card--border">

                <label id="drawBoxes" class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
                  <input type="checkbox" id="switch-2" @change="drawDetections"class="mdl-switch__input">
                  <span class="mdl-switch__label">draw detections</span>
                </label>
                <div class="mdl-tooltip" data-mdl-for="drawBoxes">draw detection boxes</div>
                <br/><br/>

                <span>DETECTED CLASSES:</span><br/>
                <button v-for="name in detectedClasses" class="mdl-button mdl-js-button eval-button" v-on:click="setFollow(name)">{{name}}</button>
                <!--<input class="mdl-textfield__input" type="text" v-model="followClass">
                <button class="mdl-button mdl-js-button mdl-button--raised" v-on:click="follow()">FOLLOW</button>-->
            </div>
          </div>
      </div>
  </div>
</main>
  `
});
