import * as THREE from '../libs/three.js/r125/three.module.js'
import {OrbitControls} from '../libs/three.js/r125/controls/OrbitControls.js'
import {GLTFLoader} from '../libs/three.js/r125/loaders/GLTFLoader.js'

let renderer = null, scene = null, camera = null, robot = null, orbitControls = null;

let robot_actions = {};

let currentTime = Date.now();
let animation = "idle";
let spotLight = null;
let ambientLight = null;

const mapUrl = "../images/checker_large.gif";

const SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function changeAnimation()
{
    const animationText = document.querySelector('input[name=animationsGroup]:checked').value;
    robot_actions[animation].reset();
    animation = animationText;
}

function initControls()
{
    document.querySelector('#animationsGroup').addEventListener('change', (event)=>{
        changeAnimation();
    });
}

async function loadGLTF()
{
    try
    {
        const gltfLoader = new GLTFLoader();

        const result = await gltfLoader.loadAsync("../models/gltf/raptoid/scene.gltf");

        robot = result.scene.children[0];

        robot.scale.set(0.09, 0.09, 0.09);
        robot.position.y -= 3.8;
        robot.traverse(child =>{
            if(child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(robot);

        result.animations.forEach(element => {
            robot_actions[element.name] = new THREE.AnimationMixer( scene ).clipAction(element, robot);
            robot_actions[element.name].play();
        });   
    }
    catch(err)
    {
        console.error(err);
    }
}

function animate()
{
    const now = Date.now();
    const deltat = now - currentTime;
    currentTime = now;

    if(robot && robot_actions[animation])
    {
        robot_actions[animation].getMixer().update(deltat * 0.001);
    }
}

function run() 
{
    requestAnimationFrame(()=>run());
    
    renderer.render( scene, camera );

    animate();

    orbitControls.update();
}

function createScene(canvas)
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(30, 10, 20);

    orbitControls = new OrbitControls(camera, renderer.domElement);
           
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 15, -10);
    spotLight.target.position.set(0,0,0);

    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    scene.add(spotLight);

    ambientLight = new THREE.AmbientLight ( 0xbbbbbb, 1.5 );
    scene.add(ambientLight);

    loadGLTF();

    const map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.02;
    
    floor.castShadow = false;
    floor.receiveShadow = true;
    
    scene.add( floor );
}

function resize()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    camera.aspect = canvas.width / canvas.height;

    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    initControls();

    resize(); 
    
    run();
};

window.addEventListener('resize', resize, false);