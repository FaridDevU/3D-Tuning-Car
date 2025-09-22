
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MathUtils } from './utilities';

const ORBIT_CAM_POS = new Vector3(-27, 5, 10);
const ORBIT_CAM_TARGET = new Vector3(0, 3, 0);
const CINE_SEQUENCE_POINTS =
    [
        {
            sP: { x: -28, y: -26, z: 3.5 },
            eP: { x: -25, y: -23, z: 3.5 },
            cR: { x: 0.0, y: -45, z: 5.0 },
            tD: 9500
        },
        {
            sP: { x: -18, y: 0, z: 2.5 },
            eP: { x: -18, y: 0, z: 5.5 },
            cR: { x: 0.0, y: -90, z: 0.0 },
            tD: 5000
        },
        {
            sP: { x: -13.50, y: -3.75, z: 3.75 },
            eP: { x: -12.00, y: -5.50, z: 4.50 },
            cR: { x: -41.79, y: -42.36, z: -19.55 },
            tD: 7000
        },
        {
            sP: { x: -10.50, y: -8.0, z: 1.50 },
            eP: { x: -14.00, y: -12.0, z: 1.00 },
            cR: { x: 10.12, y: -43.88, z: -7.06 },
            tD: 7000
        },
        {
            sP: { x: -13, y: -14, z: 14 },
            eP: { x: 11, y: -14, z: 14 },
            cR: { x: -38.28, y: 0.0, z: 0.0 },
            tD: 12000
        },
        {
            sP: { x: 12.85, y: -1.0, z: 4.35 },
            eP: { x: 12.85, y: 0.70, z: 4.35 },
            cR: { x: 47.34, y: 50.53, z: -33.90 },
            tD: 7000
        },
        {
            sP: { x: 13, y: -4.5, z: 2.5 },
            eP: { x: 13, y: -4.5, z: 5.0 },
            cR: { x: 0, y: 58, z: 5.35 },
            tD: 7000
        },
        {
            sP: { x: -3.3, y: -6.5, z: 5.0 },
            eP: { x: 1.2, y: -6.5, z: 5.35 },
            cR: { x: -30.65, y: -55.53, z: -1.88 },
            tD: 5000
        },
        {
            sP: { x: -13.85, y: -0.35, z: 3.15 },
            eP: { x: -14.50, y: -1.1, z: 3.75 },
            cR: { x: -35.54, y: -35.16, z: -15.17 },
            tD: 8000
        }
    ];

export class CameraController {
    constructor(renderer, aspect) {
        this.onCineComplete = () => void 0;
        this.mCineShotsList = [];
        this.cineCamera = new PerspectiveCamera(45, aspect, 0.1, 100);
        this.cineCamera.position.copy(CINE_SEQUENCE_POINTS[0].sP)
        this.cineCamera.rotation.copy(MathUtils.vector3DegToRadian(CINE_SEQUENCE_POINTS[0].cR))
        this.orbitCamera = new PerspectiveCamera(45, aspect, 0.1, 100);
        this.orbitCamera.position.copy(ORBIT_CAM_POS);
        this.orbitControls = new OrbitControls(this.orbitCamera, renderer.domElement);
        this.orbitControls.target = ORBIT_CAM_TARGET;
        this.orbitControls.enablePan = false;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enableDamping = true;
        this.orbitControls.minPolarAngle = 0.75;
        this.orbitControls.maxPolarAngle = 1.6;
        this.orbitControls.dampingFactor = 0.07;
        this.orbitControls.rotateSpeed = this.isMobile() ? 0.5 : 0.07;
        this.orbitControls.minDistance = 16;
        this.orbitControls.maxDistance = 32;
        this.orbitControls.autoRotate = !this.isMobile();
        this.orbitControls.autoRotateSpeed = 0.05;

        if (this.isMobile()) {
            let touchTimeout;
            renderer.domElement.addEventListener('touchstart', () => {
                this.orbitControls.autoRotate = false;
                clearTimeout(touchTimeout);
            });
            renderer.domElement.addEventListener('touchend', () => {
                touchTimeout = setTimeout(() => {
                    this.orbitControls.autoRotate = true;
                }, 3000);
            });
        }
        this.orbitControls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        this.mainCamera = this.cineCamera;
        CINE_SEQUENCE_POINTS.forEach((point, i) => {
            const startPoint = MathUtils.coordR2L(point.sP);
            const endPoint = MathUtils.coordR2L(point.eP);
            const tween = new TWEEN.Tween(startPoint)
                .to(endPoint, point.tD)
                .easing(TWEEN.Easing.Linear.None)
                .onStart(() => this.cineCamera.rotation.copy(MathUtils.vector3DegToRadian(point.cR)))
                .onUpdate(pos => this.cineCamera.position.set(pos.x, pos.y, pos.z));
            this.mCineShotsList.push(tween);
            if (i > 0) this.mCineShotsList[i - 1].chain(tween);
        });
        this.mCineShotsList[this.mCineShotsList.length - 1].onComplete(() => this.onCineComplete());
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    }

    setOnCineComplete = (cb) => this.onCineComplete = cb;

    update() {
        if (this.mainCamera === this.orbitCamera) this.orbitControls.update();
        TWEEN.update();
    }

    setAspect(aspect) {
        this.mainCamera.aspect = aspect;
        this.mainCamera.updateProjectionMatrix();
    }

    startCinematic() {
        this.stopCinematic();
        this.mCineShotsList[0].start();
    }

    stopCinematic() {
        this.mCineShotsList.forEach(shot => shot.stop());
    }
}