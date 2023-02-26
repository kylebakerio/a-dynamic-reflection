/* globals AFRAME, THREE */
//basic implementation based on https://threejs.org/examples/#webgl_materials_cubemap_dynamic  

AFRAME.registerComponent('dynamic-reflection', {
  schema: {
    "allow-vr": {type:"bool", default: false}, 
    fps: {type:'number', default: 30},    // set target (max) fps for the reflection to update (lower produces better performance; 60-75 is generally the max you should consider)
    floor: {type:"bool", default: false}, // use if making a reflective floor
    moving: {type:"bool", default: true}, // use if the reflective object itself moves (floor overrides this setting)
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
  tick(a,b) {
    if (this.data.floor) {
      this.d2.forEach(dimension => {
        this.cubeCamera.position[dimension] = AFRAME.scenes[0].camera.el.object3D.position[dimension]
      });
      this.cubeCamera.position.y = -AFRAME.scenes[0].camera.el.object3D.position.y;
    }
    else if (this.data.moving) {
      this.d3.forEach(dimension => {
        this.cubeCamera.position[dimension] = this.el.object3D.position[dimension];              
      });
    }
    if (this.el.id==="the-box") {
      // cubeCamera = this.cubeCamera
      console.log(this.cubeCamera.position.y, this.el.object3D.position.y)
    }
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