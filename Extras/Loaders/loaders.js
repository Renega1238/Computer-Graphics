import * as THREE from '../../libs/three.js/r125/three.module.js'
import { OrbitControls } from '../../libs/three.js/r125/controls/OrbitControls.js';
import { OBJLoader } from '../../libs/three.js/r125/loaders/OBJLoader.js';
import { MTLLoader } from '../../libs/three.js/r125/loaders/MTLLoader.js';
import { FBXLoader } from '../../libs/three.js/r125/loaders/FBXLoader.js';
import { GLTFLoader } from '../../libs/three.js/r125/loaders/GLTFLoader.js'

let renderer = null, scene = null, camera = null, root = null, orbitControls = null;

let directionalLight = null, spotLight = null, ambientLight = null;

const mapUrl = "../../images/checker_large.gif";

const objMtlModel = {
        obj : "../../models/obj/Penguin_obj/penguin.obj",
        mtl : "../../models/obj/Penguin_obj/penguin.mtl"
};

let objModel = {
    obj:'../../models/obj/cerberus/Cerberus.obj', 
    map:'../../models/obj/cerberus/Cerberus_A.jpg', 
    normalMap:'../../models/obj/cerberus/Cerberus_N.jpg', 
    specularMap: '../../models/obj/cerberus/Cerberus_M.jpg'
};

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

function setVectorValue(vector, configuration, property, initialValues)
{
    if(configuration !== undefined)
    {
        if(property in configuration)
        {
            console.log("setting:", property, "with", configuration[property]);
            vector.set(configuration[property].x, configuration[property].y, configuration[property].z);
            return;
        }
    }

    console.log("setting:", property, "with", initialValues);
    vector.set(initialValues.x, initialValues.y, initialValues.z);
}

async function loadObj(objModelUrl, configuration)
{
    try {
        const object = await new OBJLoader().loadAsync(objModelUrl.obj, onProgress, onError);
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        console.log(object);
        
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));

        scene.add(object);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadFBX(fbxModelUrl, configuration)
{
    try{
        let object = await new FBXLoader().loadAsync(fbxModelUrl);

        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        
        scene.add( object );
    }
    catch(err)
    {
        console.error( err );
    }
}

async function load3dModel(objModelUrl, mtlModelUrl, configuration)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(mtlModelUrl, onProgress, onError);
        
        materials.preload();
        
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl, onProgress, onError);
        
        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        
        scene.add(object);
    }
    catch(err)
    {
        console.log('Error loading 3d Model:', err);
    }
}

async function loadGLTF(gltfModelUrl, configuration)
{
    try
    {
        const gltfLoader = new GLTFLoader();

        const result = await gltfLoader.loadAsync(gltfModelUrl);

        const object = result.scene;

        console.log(object);

        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        
        scene.add(object);       
    }
    catch(err)
    {
        console.error(err);
    }
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Update the camera controller
    orbitControls.update();
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 5, 50);
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0,0,0);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set(0, 5, 100);

    root.add(directionalLight);
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(0, 8, 100);
    root.add(spotLight);

    ambientLight = new THREE.AmbientLight ( 0xffffff, 1);
    root.add(ambientLight);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    root.add( mesh );
    
    scene.add( root );
}

function loadObjects()
{
    // loadObj(objModel, {position: new THREE.Vector3(-8, 0, 0), scale: new THREE.Vector3(3, 3, 3), rotation: new THREE.Vector3(0, 1.58, 0) });
    
    // load3dModel(objMtlModel.obj, objMtlModel.mtl, {position: new THREE.Vector3(0, -3, 0), scale:new THREE.Vector3(0.25, 0.25, 0.25)});
    
    loadGLTF('../../models/gltf/equipo1_IntroductionMapDup.glb', {position: new THREE.Vector3(0, -2, 0), scale:new THREE.Vector3(5, 5, 5), rotation: new THREE.Vector3(0,0,0)  });
    // loadGLTF('../../models/gltf/Soldier.glb', {position: new THREE.Vector3(10, -4, 0), scale:new THREE.Vector3(0.05, 0.05, 0.05), rotation: new THREE.Vector3(1.58, 3.1415,0)  });

    // loadFBX('../../models/fbx/Robot/robot_idle.fbx', {position: new THREE.Vector3(0, -4, -20), scale:new THREE.Vector3(0.05, 0.05, 0.05) })
}

function main()
{
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    loadObjects();

    update();
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
    main();
    resize(); 
};

window.addEventListener('resize', resize, false);
