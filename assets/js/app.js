var camera, scene, renderer;
var geometry, material, mesh;
var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/stasoline/bring-it-on-wip"
};

var modelName = 'SpaceFighter01';
var assets_url = document.URL + 'assets';

// Download Handlers
THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
var objLoader = new THREE.OBJMTLLoader();

// Download Handlers
var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
};

var onError = function (xhr) {
};

function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 250;

    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1).normalize();
    scene.add(directionalLight);

    geometry = new THREE.BoxGeometry(200, 200, 200);
    material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -400;

    scene.add(mesh);

    // --- Continue from here ---
    objLoader.load(assets_url + '/models/' + modelName + '/' + modelName + '.obj', assets_url + '/models/' + modelName + '/' + modelName + '.mtl', function (object) {
        object.position.y = -80;
        scene.add(object);

    }, onProgress, onError);

    renderer = new THREE.WebGLRenderer({canvas: visualizer});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x5FB6C9, 1);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function render() {
    requestAnimationFrame(render);
    camera.position.x += ( - mouseX - camera.position.x ) * .20;
    camera.position.y += ( mouseY - camera.position.y ) * .20;

    camera.lookAt(scene.position);

    mesh.scale.x = audioSource.volume / 2000;
    renderer.render(scene, camera);
    console.log(audioSource);
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

var audioSource = new SoundCloudAudioSource(player);

init();
render();