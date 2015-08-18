var camera, scene, renderer;
var geometry, material, cubeVisualizer, particle;
var cubeHolder = [];
var particleHolder = [];
var mouseX = 0, mouseY = 0;
var radiansHeight, radiansWidth;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var cubeQuantity = 127;
var sphereRadius = 1000;

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/virtual-riot/1-virtual-riot-were-not-alone?in=virtual-riot/sets/virtual-riot-were-not-alone-remixes-out-now"
};

function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 7000);
    camera.position.z = 800;
    
    scene = new THREE.Scene();
   
    for (var i = cubeQuantity - 1; i >= 0; i--) {

        particleGeometry = new THREE.CircleGeometry(30, 30);
        particleMaterial = new THREE.MeshBasicMaterial({
            color: shadeColor('ff0000', i),
            wireframe: false,
            reflection: 1
        });

        cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
        cubeMaterial = new THREE.MeshBasicMaterial({
            color: shadeColor('ff0000', i),
            wireframe: true
        });

        particleVisualizer = new THREE.Mesh(particleGeometry, particleMaterial);
        cubeVisualizer = new THREE.Mesh(cubeGeometry, cubeMaterial);

            particleVisualizer.position.y = Math.random() * (10 - 2000) + 1000;

            radiansHeight = (Math.random() * 360) * Math.PI / 180;
            radiansWidth = (Math.random() * 360) * Math.PI / 180;

            particleVisualizer.position.x = sphereRadius * Math.cos(radiansHeight) * Math.sin(radiansWidth);
            particleVisualizer.position.y = sphereRadius * Math.sin(radiansHeight) * Math.sin(radiansWidth);
            particleVisualizer.position.z = sphereRadius * Math.cos(radiansWidth);
            particleVisualizer.radiansWidth = radiansWidth;
            particleVisualizer.radiansHeight = radiansHeight;

            cubeVisualizer.position.x = -500 + i * 10;
            cubeVisualizer.position.y = -1000;


        particleHolder.push(particleVisualizer);
        cubeHolder.push(cubeVisualizer);

        scene.add(particleVisualizer);
        scene.add(cubeVisualizer);
       
    };

    renderer = new THREE.WebGLRenderer({canvas: visualizer, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 10);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function render() {
    
    requestAnimationFrame(render);
    camera.position.x += ( - mouseX - camera.position.x ) * .20;
    camera.position.y += ( mouseY - camera.position.y ) * .20;

    camera.lookAt(scene.position);

    for(i in cubeHolder){
        cubeHolder[i].scale.y = 0.1 + audioSource.streamData[i] * 1.2;
        cubeHolder[i].scale.x = 0.1 + audioSource.streamData[i] / 40;
        cubeHolder[i].scale.z = 0.1 + audioSource.streamData[i] / 40;
    }

    for(i in particleHolder){
        particle = particleHolder[i];

        particle.scale.y = particle.scale.x = particle.scale.z = 0.1 + audioSource.streamData[i] / 80;
        particle.radiansHeight = particle.radiansHeight + (Math.random() ) / 200;
        particle.radiansWidth = particle.radiansWidth + (Math.random() - 0.5) / 200;

        particle.position.x = (sphereRadius - audioSource.volume / 100) * Math.cos(particle.radiansHeight) * Math.sin(particle.radiansWidth);
        particle.position.y = (sphereRadius - audioSource.volume / 100) * Math.sin(particle.radiansHeight) * Math.sin(particle.radiansWidth);
        particle.position.z = (sphereRadius - audioSource.volume / 100) * Math.cos(particle.radiansWidth);
        particle.lookAt(camera.position);
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