/* globals AFRAME, THREE */
//basic implementation based on https://threejs.org/examples/#webgl_materials_cubemap_dynamic  

AFRAME.registerComponent('dynamic-reflection', {
  schema: {
    "allow-vr": {type:"bool", default: false}, 
    fps: {type:'number', default: 30},    // set target (max) fps for the reflection to update (lower produces better performance; 60-75 is generally the max you should consider)
    floor: {type:"bool", default: false}, // use if making a reflective floor
    "using-rig": {type:"bool", default: true}, // is floor=true, and your camera is within a rig, this computes camera world position; set it to false if you move the camera directly to get a performance improvement
    moving: {type:"bool", default: false}, // use if the reflective object itself moves (floor overrides this setting)
    size: {type:'number', default: 256},  // power-of-2, beyond 1024 doesn't seem to continue sharpening
  },
  d3: ['x','y','z'],
  d2: ['x','z'],
  init() {
    if (AFRAME.utils.device.checkHeadsetConnected() && !this.data['allow-vr']) {
      this.tick = () => {};
      console.error("dynamic reflections disabled because VR headset detected; this component is not (yet) VR compatible");
      return;
    }
    this.tick = AFRAME.utils.throttleTick(this.tick, 1000/this.data.fps, this)
    // make a camera that takes 360 pictures of the environment that will be 
    // the reflection from the perspective of this entity
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget( this.data.size );
    this.cubeRenderTarget.texture.type = THREE.HalfFloatType;
    if (this.cubeRenderTarget || this.cubeCamera) {
      console.warn("ALREADY CAMERA")
    }
    this.cubeCamera = new THREE.CubeCamera(1, 1000, this.cubeRenderTarget);
    // window.cubeCamera = this.cubeCamera; // for debugging stuff

    this.d3.forEach(dimension => {
      this.cubeCamera.position[dimension] = this.el.object3D.position[dimension];              
    });

    this.el.addEventListener('loaded', (evt) => {
      this.el.components.material.material.envMap = this.cubeRenderTarget.texture
    });
  },
  cameraWorldPosition: new THREE.Vector3(),
  /*
var cameraEl = document.querySelector('#camera');
var worldPos = new THREE.Vector3();
worldPos.setFromMatrixPosition(cameraEl.object3D.matrixWorld);
console.log(worldPos.x);
*/
  tick(a,b) {
    if (this.data.floor) {
      // if we're making a reflective floor, it's different than making e.g. a reflect sphere; we need a different env map
      // that matches the user's position in relation to the floor. To create this illusion, we make the cube camera that's
      // taking the reflection pictures match the user's position in the forward/backward/left/right position, but for the 
      // up/down dimension we invert the user's position--this is because the reflection is the equivalent to the perspective
      // of being under the floor--the higher you are, the further underneath it should be.
      if (this.data['using-rig']) {
        this.cameraWorldPosition.setFromMatrixPosition(AFRAME.scenes[0].camera.el.object3D.matrixWorld)
      } else {
        this.cameraWorldPosition.clone(AFRAME.scenes[0].camera.el.object3D.position)
      }
      
      this.d2.forEach(dimension => {
        this.cubeCamera.position[dimension] = this.cameraWorldPosition[dimension]
      });
      
      // read as:
      // let the cubeCamera's Y position be equal to
      //   the position of the floor, minus
      //     the camera's position above the floor
      // effectively: stick the cubecamera as far under the floor as the active user camera is above the floor
      this.cubeCamera.position.y = 
        this.el.object3D.position.y - (
          this.cameraWorldPosition.y - this.el.object3D.position.y
        );
    }
    else if (this.data.moving) {
      // in the case of a normal moving sphere, we need the reflection envmap to be taken from a camera that continuously 
      // matches the position of the object that is displaying the reflection.
      this.d3.forEach(dimension => {
        this.cubeCamera.position[dimension] = this.el.object3D.position[dimension];              
      });
    }
    // if (this.el.id==="the-box") {
      // debugging stuff
      // cubeCamera = this.cubeCamera
      // console.log(this.cubeCamera.position.y, this.el.object3D.position.y)
    // }
    this.cubeCamera.update( 
      AFRAME.scenes[0].renderer, // renderer
      AFRAME.scenes[0].object3D // scene
    );
  }
})

/*
<!--
      // this seems to not be necessary, even though code equivalent to this is featured in the three js example
      // AFRAME.registerComponent('scene-env-map', {
      //   schema: {
      //     src: {type:'string'},
      //     mapping: {type:'string'},
      //   },
      //   init() {
      //     (new THREE.Loader())
      //       .load(
      //         this.data.src
      //         , texture => {
      //           console.log("loaded texture", texture)
      //           texture.mapping = THREE[this.data.mapping];
      //           AFRAME.scenes[0].object3D.environment = texture;
      //           AFRAME.scenes[0].object3D.background = texture;
      //           // AFRAME.scenes[0].object3D.rotation.y = 0.5;
      //         }
      //     )
      //   }
      // })
-->
*/