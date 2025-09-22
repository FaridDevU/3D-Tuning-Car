
import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import Stats from 'three/examples/jsm/libs/stats.module';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { EXR_FILE, EXR_PATH } from './config';
import { MathUtils } from './utilities';

const IS_DEBUG = false;
const SCENE_COLOR = 0x000000;
const LIGHT_SIZE = new THREE.Vector2(12, 6);
const LIGHT_INTENSITY = 8;
const LIGHT_COLOR = 0xffffff;
const LIGHT_POS_LEFT = new THREE.Vector3(0, 16, -18);
const LIGHT_ROT_LEFT = MathUtils.vector3DegToRadian({ x: -135, y: 0, z: -180 });
const LIGHT_POS_RIGHT = new THREE.Vector3(0, 16, 18);
const LIGHT_ROT_RIGHT = MathUtils.vector3DegToRadian({ x: -45, y: 0, z: 0 });

const createAreaLight = (color, intensity, size, visible) => {
    var rectLight = new THREE.RectAreaLight(color, intensity, size.x, size.y);
    if (visible) {
        const rectHelper = new RectAreaLightHelper(rectLight, 0xffffff);
        rectLight.add(rectHelper);
    }
    return rectLight;
}

export default class BaseEngine {
    constructor() {
        RectAreaLightUniformsLib.init();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(SCENE_COLOR, 1);
        this.renderer.sortObjects = false;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(SCENE_COLOR, 30, 100);
        [LIGHT_POS_LEFT, LIGHT_POS_RIGHT].forEach((pos, i) => {
            const light = createAreaLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_SIZE, IS_DEBUG);
            light.position.copy(pos);
            light.rotation.copy(i === 0 ? LIGHT_ROT_LEFT : LIGHT_ROT_RIGHT);
            this.scene.add(light);
        });
        this.manager = new THREE.LoadingManager();
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        new EXRLoader(this.manager)
            .setDataType(THREE.UnsignedByteType)
            .setPath(EXR_PATH)
            .load(EXR_FILE, exr => {
                this.scene.environment = pmremGenerator.fromEquirectangular(exr).texture;
                exr.dispose();
                pmremGenerator.dispose();
            });
        if (IS_DEBUG) {
            this.profiler = Stats();
            document.body.appendChild(this.profiler.dom);
        }
    }

    update() {
        IS_DEBUG && this.profiler?.update();
    }
}

