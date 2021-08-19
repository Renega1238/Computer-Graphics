function createShader(gl, str, type)
{
    let shader;
    
    if (type == "fragment") 
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);
    else
        return null;

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl, vertexShaderSource, fragmentShaderSource)
{
    const vertexShader = createShader(gl, vertexShaderSource, "vertex");
    const fragmentShader = createShader(gl, fragmentShaderSource, "fragment");

    let shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return shaderProgram;
}

export {initShader};