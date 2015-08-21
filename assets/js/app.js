var camera, scene, renderer;
var geometry, material, particle, line;
var lineHolder = [];
var particleHolder = [];
var avatar = new Object();
//var mouseX = 0, mouseY = 0;
var controls;
var radiansHeight, radiansWidth;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var particleQuantity = 127;
var sphereRadius = 1000;

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: ""//"https://soundcloud.com/virtual-riot/1-virtual-riot-were-not-alone?in=virtual-riot/sets/virtual-riot-were-not-alone-remixes-out-now"
};

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 7000);
    camera.position.z = 800;
    
    scene = new THREE.Scene();

    particleGeometry = new THREE.CircleGeometry(30, 30);
    geometry = new THREE.Geometry();
    line = new THREE.Line(geometry, material);

    var ambient = new THREE.AmbientLight( 0x555555 );
    scene.add(ambient);

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position = camera.position;
    scene.add(light);

    for (var i = particleQuantity - 1; i >= 0; i--) {

        particleMaterial = new THREE.MeshBasicMaterial( {side:THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('assets/img/flare.png'), depthWrite: false, depthTest: false, transparent: true, opacity: 0.9 });

        particleVisualizer = new THREE.Mesh(particleGeometry, particleMaterial);

        particleVisualizer.radiansWidth = (Math.random() * 360) * Math.PI / 180;
        particleVisualizer.radiansHeight = (Math.random() * 360) * Math.PI / 180;

        particleVisualizer.position.x = sphereRadius * Math.cos(radiansHeight) * Math.sin(radiansWidth);
        particleVisualizer.position.y = sphereRadius * Math.sin(radiansHeight) * Math.sin(radiansWidth);
        particleVisualizer.position.z = sphereRadius * Math.cos(radiansWidth);

        line.geometry.vertices[i] = new THREE.Vector3(-950 + i * 15, 0, 0);

        particleHolder.push(particleVisualizer);
        lineHolder.push(line.geometry.vertices[i]);

        scene.add(particleVisualizer);  
    };

    scene.add(line);

    renderer = new THREE.WebGLRenderer({canvas: visualizer, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 10);

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    initAvatar();
    //document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function render() {
    
    requestAnimationFrame(render);
    //camera.position.x += ( - mouseX - camera.position.x ) * .20;
    //camera.position.y += ( mouseY - camera.position.y ) * .20;

    camera.lookAt(scene.position);

    for(i in lineHolder){
        line.geometry.vertices[i].y = audioSource.streamData[i];
    }

    for(i in particleHolder){
        particle = particleHolder[i];

        particle.scale.y = particle.scale.x = particle.scale.z = 0.1 + audioSource.streamData[i] / 80;

        if(audioSource.streamData[i] != 0) {
            particle.radiansHeight = particle.radiansHeight + (Math.random() ) / 200;
            particle.radiansWidth = particle.radiansWidth + (Math.random() - 0.5) / 200;
        }


        particle.position.x = (sphereRadius - audioSource.streamData[i] / 100) * Math.cos(particle.radiansHeight) * Math.sin(particle.radiansWidth);
        particle.position.y = (sphereRadius - audioSource.streamData[i] / 100) * Math.sin(particle.radiansHeight) * Math.sin(particle.radiansWidth);
        particle.position.z = (sphereRadius - audioSource.streamData[i] / 100) * Math.cos(particle.radiansWidth);

        particle.lookAt(camera.position);
    }

    avatarAnimation();
    line.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
}

/*
function onDocumentMouseMove(event) {

    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;
}
*/


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

//Testing avatar

var avatarLegsArr = [];
var avatarHead;
var avatarArmsArr = [];
var avatarLegs;


var initAvatar = function() {
    initAvatarLegs();
    initAvatarHead();
    initAvatarArms();
    initAvatarBody();
};

var initAvatarLegs = function() {

    for(var i = 0; i < 2; i++) {
        var legGeometry = new THREE.BoxGeometry(10, 30, 10);
        legGeometry.applyMatrix(new THREE.Matrix4().makeTranslation( 0, 30/2, 0 ))
        var legMaterial = new THREE.MeshBasicMaterial({wireframe: true});
        var legVisualizer = new THREE.Mesh(legGeometry, legMaterial);

        avatarLegsArr.push(legVisualizer);
        scene.add(legVisualizer);
    }

    avatarLegsArr[0].position.x = 15;
    avatarLegsArr[1].position.x = -15;
    avatarLegsArr[0].position.y = avatarLegsArr[1].position.y = -15;
}

var initAvatarHead = function() {
    var headGeometry = new THREE.BoxGeometry(10, 10, 10);
    var headMaterial = new THREE.MeshBasicMaterial({wireframe: true});
    var headVisualizer = new THREE.Mesh(headGeometry, headMaterial);

    scene.add(headVisualizer);

    headVisualizer.position.y = 25;
}

var initAvatarArms = function() {

    for(var i = 0; i < 2; i++) {
        var armsGeometry = new THREE.BoxGeometry(7, 7, 30);
        var armsMaterial = new THREE.MeshBasicMaterial({wireframe: true});
        var armsVisualizer = new THREE.Mesh(armsGeometry, armsMaterial);

        avatarArmsArr.push(armsVisualizer);
        scene.add(armsVisualizer);
    }

    avatarArmsArr[0].position.x = 13;
    avatarArmsArr[1].position.x = -13;
    avatarArmsArr[0].position.y = avatarArmsArr[1].position.y = 10;
    avatarArmsArr[0].position.z = avatarArmsArr[1].position.z = 10;

}

var initAvatarBody = function () {
    var bodyGeometry = new THREE.BoxGeometry(20, 40, 10);
    var bodyMaterial = new THREE.MeshBasicMaterial({wireframe: true});
    var bodyVisualizer = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(bodyVisualizer);
}

var avatarAnimation = function() {

   avatarLegsArr[1].rotation.x = 3.7;
   var legRotationValue;

    if(avatarLegsArr[1].rotation.x >= 3.6) {
        legRotationValue = -0.1;
    } else if(avatarLegsArr[1].rotation.x <= 2.6) {
        legRotationValue = 0.1;
    }

    avatarLegsArr[1].rotation.x += legRotationValue;
}

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