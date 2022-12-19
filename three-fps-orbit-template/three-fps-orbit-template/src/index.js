//import './styles/index.scss';
import * as SceneSetup from './js/utils/sceneSetup';
import * as ReactCube from './js/box/group';
import * as ThreeMeshUI from 'three-mesh-ui';
import ncuLogo from './images/logos/The_NorthCap_University_logo.png';
import FontJSON from '../src/fonts/Roboto-Regular-msdf/Roboto-Regular-msdf.json';
import FontImage from '../src/fonts/Roboto-Regular-msdf/Roboto-Regular.png';
import { TextureLoader, Vector3 } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as CANNON from "cannon-es"
import * as dat from 'dat.gui';


/* Define DOM elements */
const rootElement = document.querySelector('#root');
const contentElement = document.querySelector('#content-wrapper');

/* Define Three variables */
let camera, controls, scene, renderer, aspectHeight, aspectWidth, gridHelper, textureLoader;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

let isFPS = true;
let audioPlaying = true;


var gui = new dat.GUI();
gui.domElement.style.marginTop = '100px';
gui.domElement.id = 'datGUI';


const loader = new GLTFLoader().setPath("Models/");

const fontName = 'Roboto';
function preload(){
    textureLoader = new TextureLoader();

    textureLoader.load(FontImage, (texture) =>{
        ThreeMeshUI.FontLibrary.addFont(fontName, FontJSON, texture);
    });
}

function makeTextPanel()
{
    const container = new ThreeMeshUI.Block({
        width: 1.2,
        height : 1.8,
        padding : 0.05,
        justifyContent : 'center',
        textAlign: 'left',
        fontFamily: FontJSON,
        fontTexture : FontImage
    }) ;

    container.position.set(0, 2, 0);
    container.rotation.x = -0.55;
    scene.add(container);

    // image
    const imageBlock = new ThreeMeshUI.Block({
        height : 0.5,
        width : 1,
        offset : 0.01
    });

    textureLoader.load(ncuLogo, (texture) =>{
        imageBlock.set({backgroundTexture : texture});
    })


    // text
    const textBlock = new ThreeMeshUI.Block({
        height : 0.2,
        width : 1,
        offset : 0.01
    });

    textBlock.add(new ThreeMeshUI.Text({
        content : 'Hello NCU',
        fontSize : 0.15,
        textAlign : 'center'
    }));

    container.add(imageBlock, textBlock);

}


const onResize = () => {
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - contentElement.getBoundingClientRect().bottom;
    camera.aspect = aspectWidth / aspectHeight;
    camera.updateProjectionMatrix();

    if(isFPS){
        controls.handleResize();
    }

    renderer.setSize(aspectWidth, aspectHeight);
};

const initThreeJS = async () => {

    preload();

    /* Define aspect */
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - contentElement.getBoundingClientRect().bottom;

    /* Define camera */
    //camera = SceneSetup.camera(aspectWidth, aspectHeight);
    camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,1,10000);

    /* Configurate camera */
    camera.position.set(0, 5, -50);

    /* Define scene */
    scene = SceneSetup.scene();

    /* Define grid helper */
    gridHelper = SceneSetup.gridHelper(20);

    /* Configurate grid helper */
    gridHelper.material.opacity = 0;
    gridHelper.material.transparent = true;

    /* Add grid helper to scene */
    scene.add(gridHelper);

    /* Add react cube to scene */
    // scene.add(await ReactCube.group());

    /* Define renderer */
    renderer = SceneSetup.renderer({ antialias: true });

    /* Configure renderer */
    renderer.setSize(aspectWidth, aspectHeight);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.3;

    /* Define controls */
    controls = SceneSetup.controls(isFPS,camera, renderer.domElement);

    /* Configurate controls */
    if(isFPS){
        rootElement.addEventListener( 'click', function () {
            controls.lock();
        } );
    
        scene.add( controls.getObject() );
        setInputKeys();
        addFloor();
    }
    else{
        controls.maxPolarAngle = (0.9 * Math.PI) / 2;
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
    }


    /* Add event listener on resize */
    window.addEventListener('resize', onResize, false);

    /* Append canvas to DOM */
    rootElement.appendChild(renderer.domElement);

    //makeTextPanel();

    LoadModel('garage.glb', new Vector3(0,0,0), new Vector3(0.6,0.6,0.6), scene);
    light();
    skybox();
    
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const soundbike = new THREE.Audio( listener );
const soundcar = new THREE.Audio( listener );
const audioLoader = new THREE.AudioLoader();

audioLoader.load('audio/BGMusic.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
    audioPlaying = true;
});

audioLoader.load( 'audio/Bike Sounds.mp3', function( buffer ) {
	soundbike.setBuffer( buffer );
	soundbike.setLoop(true);
    soundbike.setVolume(0.5);
	soundbike.play();
});

audioLoader.load( 'audio/Car.mp3', function( buffer ) {
	soundcar.setBuffer( buffer );
	soundcar.setLoop(true);
    soundcar.setVolume(0.5);
	soundcar.play();
});

var BackgroundAudio = gui.addFolder('Audio');

var AudioButton = {

    'Play/Pause': function() {
        if(audioPlaying) {
            sound.pause();
            audioPlaying = false;
        }
        else
        {
            sound.play();
            audioPlaying = true;
        }
    }
}

var AudioButtonBike = {

    'Bike': function() {
        if(audioPlaying) {
            soundbike.pause();
            audioPlaying = false;
        }
        else
        {
            soundbike.play();
            audioPlaying = true;
        }
    }
}

var AudioButtonCar = {

    'Car': function() {
        if(audioPlaying) {
            soundcar.pause();
            audioPlaying = false;
        }
        else
        {
            soundcar.play();
            audioPlaying = true;
        }
    }
}

BackgroundAudio.add(AudioButton, 'Play/Pause');
BackgroundAudio.add(AudioButtonBike, 'Bike');
BackgroundAudio.add(AudioButtonCar, 'Car');

};


function skybox(){
    
    let materialArray = [];
textureLoader = new TextureLoader();
let texture_ft = textureLoader.load('arid2_ft.jpg');
let texture_bk = textureLoader.load('arid2_bk.jpg');
let texture_up = textureLoader.load('arid2_up.jpg');
let texture_dn = textureLoader.load('arid2_dn.jpg');
let texture_rt = textureLoader.load('arid2_rt.jpg');
let texture_lf = textureLoader.load('arid2_lf.jpg');
  
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
   
for (let i = 0; i < 6; i++)
  materialArray[i].side = THREE.BackSide;
   
let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
const skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add( skybox );
}

function setInputKeys(){

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true ) velocity.y += 200;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
}

function addFloor(){
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -20, 0 ), 0, 10 );

    // floor
    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );
    const floorMaterial = new THREE.MeshBasicMaterial( { color : 'white' , visible: false} );

    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floor );
}

// function loadModel()
// {
    
//     loader.load('city2-edit.glb', function OnLoad(gltf){
     
//      gltf.scene.scale.set(5,5,5);
//      gltf.scene.position.set(0,0,0);
//      gltf.scene.rotation.set(0,90,0);
//      gltf.castShadow = true;
//      scene.add(gltf.scene);
     
//     });

   
// }

export function LoadModel(ModelName, ModelPosition, ModelScale, scene) {

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' );
    loader.setDRACOLoader( dracoLoader );

    loader.load(ModelName, function OnLoad(gltf) {
        gltf.scene.scale.set(ModelScale.x, ModelScale.y, ModelScale.z);
        gltf.scene.position.set(ModelPosition.x, ModelPosition.y, ModelPosition.z);
        gltf.scene.receiveShadow = true;
        scene.add(gltf.scene);
        console.log('imported');
    });
}

function light()
{
    const lightColor = 0xFFFFFF;
    const intensity = 4;
    const light = new THREE.AmbientLight(lightColor , intensity);
    const light2 = new THREE.HemisphereLight(lightColor, intensity);
    const light3 = new THREE.DirectionalLight(lightColor, intensity);
    const light4 = new THREE.SpotLight(lightColor, 15);

    light.position.set(-1, 2, 4);
    light2.position.set(10,10,10);
    light3.position.set(20, 50, 20);
    light4.position.set(-700,-500,0);
    
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(light4);
}


function updateFPS()
{
    const time = performance.now();

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects( objects, false );
        const intersects = raycaster.intersectObjects(objects, false)
    if (intersects.length > 0) {
        if (
            intersects[0].distance < controls.target.distanceTo(camera.position)
        ) {
            camera.position.copy(intersects[0].point)
        }
    }

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;
}

const animate = () => {
    requestAnimationFrame(animate);


    ThreeMeshUI.update();

    if(isFPS)
    {
        updateFPS();
    }else{
         /* Update controls when damping */
    controls.update();
    }

    /* Render scene */
    renderer.render(scene, camera);
};

/* Run */
initThreeJS().then(() => animate());
