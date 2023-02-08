import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(7)
renderer.render(scene, camera)

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight)

const pointLight1 = new THREE.SpotLight(0xd1fbff);
pointLight1.intensity = 13
pointLight1.rotation.y = -1.4
pointLight1.position.set(-500, -100, -300);
pointLight1.angle = 0.01

scene.add(pointLight1)

// const lightHelper = new THREE.SpotLightHelper(pointLight1)
// scene.add(lightHelper)

window.addEventListener("load", () => {
    window.scrollTo(0, 0)
})


let planetProto1 = {
    sphere: function (size) {
        let sphere = new THREE.SphereGeometry(size, 64, 64);
        return sphere;
    },
    material: function (options) {
        let material = new THREE.MeshBasicMaterial();
        if (options) {
            for (var property in options) {
                material[property] = options[property];
            }
        }

        return material;
    },
    glowMaterial: function (intensity, fade, color) {
        let glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                'c': {
                    type: 'f',
                    value: intensity
                },
                'p': {
                    type: 'f',
                    value: fade
                },
                glowColor: {
                    type: 'c',
                    value: new THREE.Color(color)
                },
                viewVector: {
                    type: 'v3',
                    value: camera.position
                }
            },
            vertexShader: `
          uniform vec3 viewVector;
          uniform float c;
          uniform float p;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewVector );
            intensity = pow( c - dot(vNormal, vNormel), p );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }`
            ,
            fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() 
          {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4( glow, 1.0 );
          }`
            ,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        return glowMaterial;
    },
    texture: function (material, property, uri) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = true;
        textureLoader.load(
            uri,
            function (texture) {
                material[property] = texture;
                material.needsUpdate = true;
            }
        );
    }
};


let createPlanet1 = function (options) {
    // Create the planet's Surface
    let surfaceGeometry = planetProto1.sphere(options.surface.size);
    let surfaceMaterial = planetProto1.material(options.surface.material);
    let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

    // Create the planet's Atmosphere
    let atmosphereGeometry = planetProto1.sphere(options.surface.size + options.atmosphere.size);
    let atmosphereMaterialDefaults = {
        side: THREE.DoubleSide,
        transparent: true
    }
    let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
    let atmosphereMaterial = planetProto1.material(atmosphereMaterialOptions);
    let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

    // Create the planet's Atmospheric glow
    let atmosphericGlowGeometry = planetProto1.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
    let atmosphericGlowMaterial = planetProto1.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
    let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

    // Nest the planet's Surface and Atmosphere into a planet object
    let planet = new THREE.Object3D();
    surface.name = 'surface';
    atmosphere.name = 'atmosphere';
    atmosphericGlow.name = 'atmosphericGlow';
    planet.add(surface);
    planet.add(atmosphere);
    planet.add(atmosphericGlow);

    // Load the Surface's textures
    for (let textureProperty in options.surface.textures) {
        planetProto1.texture(
            surfaceMaterial,
            textureProperty,
            options.surface.textures[textureProperty]
        );
    }

    // Load the Atmosphere's texture
    for (let textureProperty in options.atmosphere.textures) {
        planetProto1.texture(
            atmosphereMaterial,
            textureProperty,
            options.atmosphere.textures[textureProperty]
        );
    }

    return planet;
};
let planetProto = {
    sphere: function (size) {
        let sphere = new THREE.SphereGeometry(size, 64, 64);
        return sphere;
    },
    material: function (options) {
        let material = new THREE.MeshStandardMaterial();
        if (options) {
            for (var property in options) {
                material[property] = options[property];
            }
        }

        return material;
    },
    glowMaterial: function (intensity, fade, color) {
        let glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                'c': {
                    type: 'f',
                    value: intensity
                },
                'p': {
                    type: 'f',
                    value: fade
                },
                glowColor: {
                    type: 'c',
                    value: new THREE.Color(color)
                },
                viewVector: {
                    type: 'v3',
                    value: camera.position
                }
            },
            vertexShader: `
          uniform vec3 viewVector;
          uniform float c;
          uniform float p;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewVector );
            intensity = pow( c - dot(vNormal, vNormel), p );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }`
            ,
            fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() 
          {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4( glow, 1.0 );
          }`
            ,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        return glowMaterial;
    },
    texture: function (material, property, uri) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = true;
        textureLoader.load(
            uri,
            function (texture) {
                material[property] = texture;
                material.needsUpdate = true;
            }
        );
    }
};


let createPlanet = function (options) {
    // Create the planet's Surface
    let surfaceGeometry = planetProto.sphere(options.surface.size);
    let surfaceMaterial = planetProto.material(options.surface.material);
    let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

    // Create the planet's Atmosphere
    let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
    let atmosphereMaterialDefaults = {
        side: THREE.DoubleSide,
        transparent: true
    }
    let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
    let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
    let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

    // Create the planet's Atmospheric glow
    let atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
    let atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
    let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

    // Nest the planet's Surface and Atmosphere into a planet object
    let planet = new THREE.Object3D();
    surface.name = 'surface';
    atmosphere.name = 'atmosphere';
    atmosphericGlow.name = 'atmosphericGlow';
    planet.add(surface);
    planet.add(atmosphere);
    planet.add(atmosphericGlow);

    // Load the Surface's textures
    for (let textureProperty in options.surface.textures) {
        planetProto.texture(
            surfaceMaterial,
            textureProperty,
            options.surface.textures[textureProperty]
        );
    }

    // Load the Atmosphere's texture
    for (let textureProperty in options.atmosphere.textures) {
        planetProto.texture(
            atmosphereMaterial,
            textureProperty,
            options.atmosphere.textures[textureProperty]
        );
    }

    return planet;
};

let earth = createPlanet({
    surface: {
        size: 3,
        material: {
            bumpScale: 0.05,
            specular: new THREE.Color('white'),
            shininess: 5
        },
        textures: {
            map: '/imgs/8k_earth_nightmap.jpg',
            bumpMap: '/imgs/earth_normal.tif',
        }
    },
    atmosphere: {
        size: 0.003,
        material: {
            opacity: 0.4
        },
        textures: {
            map: '',
            alphaMap: '/imgs/clouds_transparent.jpg'
        },
        glow: {
            size: 0,
            intensity: 0.3,
            fade: 1,
            color: 0x93cfef
        }
    },
});

let mars = createPlanet1({
    surface: {
        size: 2,
        material: {
            bumpScale: 0.05,
            specular: new THREE.Color('white'),
            shininess: 5
        },
        textures: {
            map: '/imgs/8k_mars.jpg',
            bumpMap: '',
        }
    },
    atmosphere: {
        size: 0.003,
        material: {
            opacity: 0.4
        },
        textures: {
            map: '',
            alphaMap: ''
        },
        glow: {
            size: 0,
            intensity: 0.3,
            fade: 1,
            color: 0x93cfef
        }
    },
});

mars.position.set(20, -3, 20)
mars.frustumCulled = false
earth.frustumCulled = false
scene.add(mars)




const spaceTexture = new THREE.TextureLoader().load('./imgs/bg.jpg');
scene.background = spaceTexture;
earth.rotation.x = 0
earth.rotation.y = 4.4
earth.rotation.z = 0.2
earth.position.y = -3
scene.add(earth);

earth.receiveShadow = true;
earth.castShadow = true;
earth.getObjectByName('surface').geometry.center();
const assetLoader = new GLTFLoader();

let rocket
assetLoader.load('./models/rocket.glb', (gltf) => {
    rocket = gltf.scene
    rocket.scale.set(0.03, 0.03, 0.03)
    rocket.position.set(-1, -1.98, 18)
    rocket.rotation.set(0, -0.17, -1.57)
    scene.add(rocket)

}, undefined, (error) => console.log(error))

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    if (Math.abs(t) < 301) {
        camera.position.y = t * 0.01
        camera.rotation.y = 0
        camera.position.x = 0
        // model.position.x = 0
    } else if (Math.abs(t) >= 301 && Math.abs(t) < 1100) {
        camera.rotation.y = (t + 301) * 0.002

        if (t * -0.02 < 7) {
            camera.position.z = 7
        } else if (t * - 0.02 > 20) {
            camera.position.z = 20
        } else {
            camera.position.z = t * - 0.02
        }
    } else if (Math.abs(t) >= 1100 && Math.abs(t) < 2101) {
        if (Math.abs(t) >= 1100 && Math.abs(t) < 1801) {
            camera.position.x = (t + 1100) * -0.02

        }
        rocket.rotation.set(0 + (t + 1100) * -0.01, 0, -1.57)
        if (Math.abs(t) < 1500) {
            rocket.position.set(-1 + (t + 1100) * -0.04, -1.98 + (t + 1100) * 0.009, 18 + (t + 1100) * -0.01)
        } else if (Math.abs(t) >= 1500 && Math.abs(t) <= 1700) {
            rocket.position.set(-1 + (t + 1100) * -0.04, -5.56 + (t + 1500) * -0.009, 18 + (t + 1100) * -0.01)
        } else {
            rocket.position.set(-1 + (t + 1100) * -0.04, -5.56 + (t + 1500) * -0.009, 42 + (t + 1100) * 0.03)
        }
    }

    if (Math.abs(t) >= 1801) {
        camera.position.y = -2.78 + ((t + 1801) * 0.008)
    }
    if (Math.abs(t) >= 2101) {
        rocket.rotation.set(0, -1.57, 0)
        rocket.position.set(15.1, -14, 20.6)
    }
}

document.body.onscroll = moveCamera;
moveCamera();
// const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
    requestAnimationFrame(animate)
    earth.rotation.y -= 0.0005
    mars.rotation.y += 0.0007
    // controls.update()
    renderer.render(scene, camera);
}

animate()





document.querySelectorAll('.logo').forEach(el => el.addEventListener("mouseenter", () => {
    el.children[0].src = "./imgs/logo_red.svg"
}))
document.querySelectorAll('.logo').forEach(el => el.addEventListener("mouseleave", () => {
    el.children[0].src = "./imgs/logo.svg"
}))

