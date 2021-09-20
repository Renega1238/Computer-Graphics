let mouseDown = false, pageX = 0;

function rotateScene(deltax, group)
{
    group.rotation.y += deltax / 100;
    document.querySelector("#rotation").innerHTML = "rotation: 0," + group.rotation.y.toFixed(2) + ",0";
}

function scaleScene(scale, group)
{
    group.scale.set(scale, scale, scale);
    document.querySelector("#scale").innerHTML = "scale: " + scale;
}

function onMouseMove(evt, group)
{
    if (!mouseDown)
        return;

    evt.preventDefault();
    
    const deltax = evt.pageX - pageX;
    pageX = evt.pageX;
    rotateScene(deltax, group);
}

function onMouseDown(evt)
{
    evt.preventDefault();
    
    mouseDown = true;
    pageX = evt.pageX;
}

function onMouseUp(evt)
{
    evt.preventDefault();
    
    mouseDown = false;
}

function addMouseHandler(canvas, group)
{
    canvas.addEventListener( 'mousemove', e => onMouseMove(e, group));
    canvas.addEventListener( 'mousedown', e => onMouseDown(e));
    canvas.addEventListener( 'mouseup', e => onMouseUp(e));

    document.querySelector("#slider").oninput = (e) => scaleScene(e.target.value, group);
}

function changeMaterial(setMaterial)
{
    const id = document.querySelector("input[name=materialRBGroup]:checked");
    const textureOn = document.querySelector("#textureCheckbox").checked;

    if (textureOn)
        setMaterial(id.value + "-textured");
    else
        setMaterial(id.value); 
}

function toggleTexture(setMaterial)
{
    const textureOn = document.querySelector("#textureCheckbox").checked;
    const id = document.querySelector("input[name=materialRBGroup]:checked");

    if (!textureOn)
        setMaterial(id.value);
    else
        setMaterial(id.value + "-textured");
}

function toggleWireframe(materials)
{
    materials["basic"].wireframe = !materials["basic"].wireframe;
    materials["phong"].wireframe = !materials["phong"].wireframe;
    materials["lambert"].wireframe = !materials["lambert"].wireframe;
    materials["basic-textured"].wireframe = !materials["basic-textured"].wireframe;
    materials["phong-textured"].wireframe = !materials["phong-textured"].wireframe;
    materials["lambert-textured"].wireframe = !materials["lambert-textured"].wireframe;
}

// Changes the diffuse color of the material. The material’s diffuse color specifies how much the object reflects lighting sources that cast rays in a direction — directional, point, and spotlights.
function setMaterialDiffuse(materials, color)
{    
    materials["basic"].color.set(color)
    materials["phong"].color.set(color)
    materials["lambert"].color.set(color)
    materials["basic-textured"].color.set(color)
    materials["phong-textured"].color.set(color)
    materials["lambert-textured"].color.set(color)
}

// The specular color combines with scene lights to create reflected highlights from any of the object's vertices facing toward light sources.
function setMaterialSpecular(materials, color)
{    
    materials["phong"].specular.set(color);
    materials["phong-textured"].specular.set(color);
}

function initControls(materials, setMaterial)
{
    document.querySelector("#wireframeCheckbox").addEventListener('change', () => toggleWireframe(materials) );

    document.querySelector('#diffuseColor').addEventListener('change', (event)=>{
        setMaterialDiffuse(materials, event.target.value);
    });
    document.querySelector('#diffuseColor').addEventListener('input', (event)=>{
        setMaterialDiffuse(materials, event.target.value);
    });
        
    document.querySelector('#specularColor').addEventListener('change', (event)=>{
        setMaterialSpecular(materials, event.target.value);
    });
    document.querySelector('#specularColor').addEventListener('input', (event)=>{
        setMaterialSpecular(materials, event.target.value);
    });
    
    document.querySelector("#textureCheckbox").addEventListener('change', () => toggleTexture(setMaterial) );

    document.querySelectorAll('input[name="materialRBGroup"').forEach(element =>{
        console.log(element);
        element.addEventListener('change', () => changeMaterial(setMaterial) );
    });
}

export {initControls, addMouseHandler};