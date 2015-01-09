var camera, scene, renderer;
var geometry, material, mesh;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/ahmed-gado-1/piano-nay-solo-turkish-music"
};

function init() {

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(200, 200, 200);
    material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({canvas: visualizer});
    renderer.setSize(window.innerWidth, window.innerHeight);


}

function render() {
    requestAnimationFrame(render);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    mesh.scale.x = audioSource.volume / 1500;

    renderer.render(scene, camera);
    console.log(audioSource);
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