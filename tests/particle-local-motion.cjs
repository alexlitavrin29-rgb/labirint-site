const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('v2/hero-object.js','utf8');
 const shader=source.match(/vertexShader:`([^`]+)`/)[1];
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage();
  const result=await page.evaluate(shader=>{
   const gl=document.createElement('canvas').getContext('webgl2');if(!gl)throw Error('WebGL2 unavailable');
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
   const vertex='#version 300 es\nin vec3 position;uniform mat4 projectionMatrix;uniform mat4 modelViewMatrix;out vec4 sampledPosition;\n'+shader.replace('varying float vSeed;','out float vSeed;').replace('gl_Position=projected;','gl_Position=projected;sampledPosition=projected;');
   const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;out vec4 color;void main(){color=vec4(1.);}'));
   gl.transformFeedbackVaryings(program,['sampledPosition'],gl.INTERLEAVED_ATTRIBS);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
   const identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
   for(const name of ['projectionMatrix','modelViewMatrix'])gl.uniformMatrix4fv(gl.getUniformLocation(program,name),false,identity);
   for(const [name,value] of Object.entries({uAspect:1,uTime:.5,uSize:1,uSpread:0}))gl.uniform1f(gl.getUniformLocation(program,name),value);
   gl.uniform2f(gl.getUniformLocation(program,'uPointer'),0,0);
   const positions=[];for(const radius of [.001,.01,.02,.04,.05,.08,.15])for(let i=0;i<16;i++){const angle=i*Math.PI/8;positions.push(radius*Math.cos(angle),radius*Math.sin(angle),.1);}
   const input=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,input);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
   const attribute=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,3,gl.FLOAT,false,0,0);
   const count=positions.length/3,output=gl.createBuffer();gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,output);gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER,count*16,gl.DYNAMIC_READ);gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,output);
   function sample(jitter){gl.uniform1f(gl.getUniformLocation(program,'uJitter'),jitter);gl.enable(gl.RASTERIZER_DISCARD);gl.beginTransformFeedback(gl.POINTS);gl.drawArrays(gl.POINTS,0,count);gl.endTransformFeedback();gl.disable(gl.RASTERIZER_DISCARD);const values=new Float32Array(count*4);gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER,0,values);return values;}
   const before=sample(0),after=sample(.12);let radialError=0,movement=0,outsideMovement=0;
   for(let i=0;i<count;i++){const x=before[i*4],y=before[i*4+1],a=after[i*4],b=after[i*4+1],radius=Math.hypot(x,y),distance=Math.hypot(a-x,b-y);radialError=Math.max(radialError,Math.abs(Math.hypot(a,b)-radius));movement=Math.max(movement,distance);if(radius>=.06)outsideMovement=Math.max(outsideMovement,distance);}
   return {radialError,movement,outsideMovement,error:gl.getError()};
  },shader);
  assert.equal(result.error,0);assert(result.radialError<1e-6,'Hover preserves every particle distance from the cursor: no radial hole or ring');assert(result.movement>.0001&&result.movement<.01,'Local motion is visible but subtle');assert(result.outsideMovement<1e-6,'Particles beyond the small cursor area stay untouched');
  console.log('PASS: actual GPU shader preserves radial density, moves particles locally, and leaves the outside area unchanged',JSON.stringify(result));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
