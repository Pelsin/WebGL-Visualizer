var camera, scene, renderer;
var geometry, material, cubeVisualizer;
var lineHolderArr = [];
var cubeHolderArr = [];
var mouseX = 0, mouseY = 0;

var time = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var visualizerElement = {
    quantity: 100,
    radius: 5,
    segments: 10,
    material: new THREE.MeshBasicMaterial({color: 0x605d5d, wireframe: true})
};
var visualizerEleQuantity = 100;
var lineCreateFPS = 3;
var lineDistance = 25;

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/stephan-ls-caretrey/john-dreamer-becoming-a-legend"
};

function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2400);
    camera.position.z = 400;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas: visualizer, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xfffffff, 1);

    geometry = new THREE.CircleGeometry( visualizerElement.radius, visualizerElement.segments );

    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function render() {

    requestAnimationFrame(render);
    camera.position.x += ( - mouseX - camera.position.x ) * .20;
    camera.position.y += ( mouseY - camera.position.y ) * .20;
    camera.position.z = -400 + (time / lineCreateFPS) * lineDistance;
    camera.lookAt({x: 0, y: 0, z: (time / lineCreateFPS) * lineDistance});

    if( time % lineCreateFPS == 0 ) {
        cubeHolderArr = []

        for (i = 0; i < visualizerElement.quantity; i++) {

            cubeVisualizer = new THREE.Mesh(geometry, visualizerElement.material);
            
            // Line visualizer
            //cubeVisualizer.position.x = -750 + i * 15 ;

            // Circle visualizer
            cubeVisualizer.position.x = 100 * Math.cos(2 * Math.PI * i / visualizerElement.quantity);
            cubeVisualizer.position.y = 100 * Math.sin(2 * Math.PI * i / visualizerElement.quantity);
            cubeVisualizer.rotation.z = (((Math.PI * 2) / visualizerElement.quantity) * i) + Math.PI / 2;

            cubeVisualizer.position.z = (time / lineCreateFPS) * lineDistance ;
            cubeVisualizer.scale.y = 0.1 + audioSource.streamData[i] / 25;

            cubeHolderArr.push(cubeVisualizer);

            scene.add(cubeVisualizer);

        };

        lineHolderArr.push(cubeHolderArr);

        if(lineHolderArr.length > 24) {
            for(i in lineHolderArr[0]){
                scene.remove(lineHolderArr[0][i]);                
            }
            lineHolderArr.shift();
        }
        
    }

    renderer.render(scene, camera);
    time++;
    
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