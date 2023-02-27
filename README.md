<!-- github -->
![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/kylebakerio/a-dynamic-reflection)

To use:

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/kylebakerio/a-dynamic-reflection@1.1.0/dynamic-reflection.js"></script>
</head>
```

notes:

- breaks if you use two at the same time for some reason
  - seems that the last cube camera will then be used by the original cuberendertarget...
  - seems like this may be a three js bug? I can't see any evidence of my code causing this to occur right now

- breaks in VR
  - it is almost like it's trying to render the cube camera view out of one of the eye pieces...?
    - todo: see if colin's component demo renders in VR? but I think the version is too old...

- todo: add ability to effect materials of gltfs
  - probably just need to traverse the gltf and add env map to materials, and to listen for gltf loaded event instead of regular loaded event

- colin's old component:
  - note: the old component from colin used to do this, see: https://colinfizgig.github.io/aframe_Components/
  - https://github.com/colinfizgig/aframe_Components/blob/master/components/camera-cube-env.js

- add custom cube camera that allows specifying fov and/or camera positions? current one can have 'wrong zoom' appearance on, for example, a cube that is too small

- when using for a reflective floor, probably would be ideal to have a mode that generates an env map with only one camera instead of all 6; 
  - since we're rendering to a plane, we can probably leave 5/6 as black squares? experimentation needed.
- would also be nice to be able to specify multiple planes, possible at multiple heights, as part of a floor system. this isn't possible with current implementation, but could be if I modify this component to allow multiple instances to share the same camera. 

- you can also try sticking a mirror below a translucent floor, instead of sticking a translucent surface on top of your floor, which should be
more performant than this library's reflective floor implementation. That seems to produce a less reliable result, though, because of transparency issues. :/
You can see that demonstrated here: https://aframe-mirror-floor.glitch.me/diarmid-floor.html

![Screenshot from 2023-02-24 03-26-48](https://user-images.githubusercontent.com/6391152/221391833-52139802-b55a-4b03-ac21-6cd1169cc40b.png)
![Screenshot from 2023-02-25 21-49-24](https://user-images.githubusercontent.com/6391152/221391837-b245b256-0e6e-4f7d-a0ff-80ddea6b7c9b.png)
