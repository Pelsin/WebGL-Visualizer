var camera, scene, renderer;
var geometry, material, cubeVisualizer;
var cubeHolder = [];
var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var cubeQuantity = 127;

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/user8585647/power-of-darkness-2"
};

function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    scene = new THREE.Scene();

    for (var i = cubeQuantity - 1; i >= 0; i--) {

        geometry = new THREE.CircleGeometry(5, 32);
        material = new THREE.MeshBasicMaterial({
            color: shadeColor('ff0000', i),
            wireframe: false
        });

        cubeVisualizer = new THREE.Mesh(geometry, material);
        cubeVisualizer.position.x = -2000 + i * 50 ;

        cubeHolder.push(cubeVisualizer);

        scene.add(cubeVisualizer);
    };
   

    renderer = new THREE.WebGLRenderer({canvas: visualizer, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xfffffff, 1);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function render() {
    requestAnimationFrame(render);
    camera.position.x += ( - mouseX - camera.position.x ) * .20;
    camera.position.y += ( mouseY - camera.position.y ) * .20;

    camera.lookAt(scene.position);

    for(i in cubeHolder){
        cubeHolder[i].scale.y = 0.1 + audioSource.streamData[i];
    }

    renderer.render(scene, camera);
    
}

function onDocumentMouseMove(event) {

    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;
}

SC.initialize({
    client_id: soundcloud.client_id
});

SC.get('/resolve', { url: soundcloud.request_url }, function (response) {
    if (response.errors) {
        console.log(response.errors);
    } else {
        console.log(response);
        player.setAttribute('src', response.stream_url + '?client_id=' + soundcloud.client_id);
        player.crossOrigin = "anonymous";
        player.play();
    }
});

var SoundCloudAudioSource = function (player) {
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = function () {
        analyser.getByteFrequencyData(self.streamData);
        var total = 0;
        for (var i = 0; i < 80; i++) {
            total += self.streamData[i];
        }
        self.volume = total;
    };
    setInterval(sampleAudioStream, 20);
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128);
};

function shadeColor(color, percent) {  
    var num = parseInt(color,16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255));
}

var audioSource = new SoundCloudAudioSource(player);

init();
render();