var camera, scene, renderer;
var geometry, material, particle, line;
var lineHolder = [];
var particleHolder = [];
//var mouseX = 0, mouseY = 0;
var controls;
var radiansHeight, radiansWidth;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var catVisualizer;

var visualizer = document.getElementById("visualizer");
var player = document.getElementById('player');

var particleQuantity = 127;
var sphereRadius = 1000;

// Soundcloud settings
var soundcloud = {
    client_id: "87ee0a4c261efe6aebf22dfc94777af3",
    request_url: "https://soundcloud.com/feral84/two-steps-from-hell-strength"
};
    var lineHolderArr = [];
    var cubeHolderArr = [];
    var visualizerElement = {
    quantity: 100,
    radius: 5,
    segments: 10,
    material: new THREE.MeshBasicMaterial({color: 0x605d5d, wireframe: true})
    };
    var visualizerEleQuantity = 100;
    var lineCreateFPS = 3;
    var lineDistance = 25;
    var time = 0;

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 7000);
    camera.position.z = 800;
    
    scene = new THREE.Scene();

    geometry = new THREE.CircleGeometry( visualizerElement.radius, visualizerElement.segments );

    particleGeometry = new THREE.CircleGeometry(10, 10);
    geometry = new THREE.Geometry();
    line = new THREE.Line(geometry, material);

    var catGeometry = new THREE.PlaneGeometry(30, 30);
    var catMaterial = new THREE.MeshBasicMaterial( {side:THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('assets/textures/cat.png'), depthWrite: false, depthTest: false, transparent: true, opacity: 0.9 });
    catVisualizer = new THREE.Mesh(catGeometry, catMaterial);
    catVisualizer.position.x = 1100 * Math.cos(360 * Math.PI / 180) * Math.sin(360 * Math.PI / 180);
    catVisualizer.position.y = 1100 * Math.sin(360 * Math.PI / 180) * Math.sin(360 * Math.PI / 180);
    catVisualizer.position.z = 1100 * Math.cos(360 * Math.PI / 180);

    scene.add(catVisualizer);

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


    //document.addEventListener('mousemove', onDocumentMouseMove, false);
}

var catDegree = 360;
var catPosition = 1;

var catDegreeChangeValue;
var catPositionChangeValue;

function render() {
    
    requestAnimationFrame(render);
    //camera.position.x += ( - mouseX - camera.position.x ) * .20;
    //camera.position.y += ( mouseY - camera.position.y ) * .20;

    camera.lookAt(scene.position);

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

    time++;

    if(catDegree >= 360) {
        catDegreeChangeValue = -2;
    } else if(catDegree <= 0) {
        catDegreeChangeValue = 2;
    }

    if(catPosition >= 1100) {
        catPositionChangeValue = -2;
    } else if(catPosition <= 1) {
        catPositionChangeValue = 2;
    }

    catPosition =  catPosition + catPositionChangeValue;
    catDegree = catDegree + catDegreeChangeValue;


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

        catVisualizer.position.x = (sphereRadius - catPosition) * Math.cos(catDegree * Math.PI / 180) * Math.sin(catDegree * Math.PI / 180);
        catVisualizer.position.y = (sphereRadius - catPosition) * Math.sin(catDegree * Math.PI / 180) * Math.sin(catDegree * Math.PI / 180);
        catVisualizer.position.z = (sphereRadius - catPosition) * Math.cos(catDegree * Math.PI / 180);

        catVisualizer.scale.x = catVisualizer.scale.y = audioSource.volume / 1200;


    catVisualizer.lookAt(camera.position);
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