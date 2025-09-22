import $ from 'jquery';
import BaseEngine from "./baseEngine";
import { CameraController } from "./cameraController";
import { ACTIVE_PATH } from "./config";
import { Interface } from './interface';
import { SceneManager } from './sceneManager';
import { AnimUtils, NetworkUtils } from "./utilities";

class App extends BaseEngine {
    constructor() {
        super();
        this.loadErrorSet = false;
        this.demoStarted = false;
        this.meta = {};
        this.audioTrack = new Audio('assets/audio_track.mp3');
        this.audioTrack.volume = 0;
        this.cameraController = new CameraController(this.renderer, window.innerWidth / window.innerHeight);
        SceneManager.init(this.manager);
        this.manager.onProgress = this.onLoadProgress.bind(this);
        this.manager.onError = this.onLoadError.bind(this);
        this.manager.onLoad = this.onLoadCompleted.bind(this);
        window.addEventListener('resize', this.onContextResized.bind(this), true);
        $('#btn-start-demo')[0].addEventListener('click', this.startDemo.bind(this));
        $('#btn-skip-intro')[0].addEventListener('click', this.skipIntro.bind(this));
        this.cameraController.setOnCineComplete(this.skipIntro.bind(this));
        Interface.setOnEntityColor(SceneManager.setEntityColor);
        Interface.setOnEntityVisible(SceneManager.setEntityVisible);
        this.setupScene();
        this.onContextResized();
        this.update();
    }

    setupScene() {
        SceneManager.loadStage(this.scene);
        NetworkUtils.fetchMeta(ACTIVE_PATH, meta => {
            this.meta = meta;
            SceneManager.loadActiveModel(this.scene, this.meta)
        })
    }

    onLoadError(item) {
        $('#preloader .icon').remove();
        $('#preloader .title').text("ERROR LOADING");
        $('#preloader .desc').text(item);
        this.loadErrorSet = true;
    }

    onLoadProgress(item, loaded, total) {
        if (this.loadErrorSet)
            return;
        $('#preloader .desc').text(item);
    }

    onLoadCompleted() {
        if (this.loadErrorSet)
            return;
        $('#preloader .icon').remove();
        $('#preloader .title').text('Automotive Configurator');
        $('#preloader .desc').html('A ThreeJS based car configurator. This app is intended for demo purposes only.');
        $('#preloader .btn-main').show();
    }

    onContextResized() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cameraController.setAspect(window.innerWidth / window.innerHeight);
    }

    startDemo() {
        if (this.loadErrorSet || this.demoStarted) return;
        this.demoStarted = true;
        AnimUtils.fadeElementOut($('#preloader')[0], 900, element => {
            element.remove();
            AnimUtils.fadeElementIn($('#welcome-screen')[0], 900, { display: 'flex' });
        });
        this.cameraController.startCinematic();
        AnimUtils.fadeAudioIn(this.audioTrack, 2000, { max: 0.5 })
    }

    skipIntro() {
        AnimUtils.fadeAudioOut(this.audioTrack, 2000, audio => audio.remove());
        AnimUtils.fadeElementIn($('#screen-fader')[0], 900, { display: 'flex' }, (fader) => {
            this.cameraController.stopCinematic();
            this.cameraController.mainCamera = this.cameraController.orbitCamera;
            this.cameraController.setAspect(window.innerWidth / window.innerHeight);
            $('#welcome-screen').remove();
            Interface.initialize(this.meta);
            AnimUtils.fadeElementOut(fader, 900);
        })
    }

    update() {
        super.update();
        this.cameraController.update();
        this.renderer.render(this.scene, this.cameraController.mainCamera)
        requestAnimationFrame(this.update.bind(this));
    }
}

export default new App();
