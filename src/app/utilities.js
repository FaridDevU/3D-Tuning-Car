
import { Color, Euler } from "three";

export const ColorUtils = {
    webColorToHex: (webColor) => new Color(parseInt(webColor.replace("#", "0x"))).convertSRGBToLinear()
}

export const NetworkUtils = {
    fetchMeta: (path, onSuccess) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', `${path}meta.json`, true);
        xhr.onload = () => xhr.status === 200 && xhr.response ? onSuccess(xhr.response) : console.error('Error loading meta JSON');
        xhr.send();
    }
}

const DEG_TO_RAD = Math.PI / 180;
export const MathUtils = {
    coordR2L: (point) => ({ x: point.x, y: point.z, z: -point.y }),
    vector3DegToRadian: (point) => new Euler(point.x * DEG_TO_RAD, point.y * DEG_TO_RAD, point.z * DEG_TO_RAD, 'XYZ')
}

export const AnimUtils = {
    fadeElementIn: (element, duration = 500, options = { display: 'block' }, callback) => {
        if (!element) return;
        Object.assign(element.style, { display: options.display, visibility: 'visible', opacity: 0 });
        let opacity = 0;
        const step = 50 / duration;
        const timer = setInterval(() => {
            opacity += step;
            if (opacity >= 0.95) {
                clearInterval(timer);
                element.style.opacity = 1;
                callback?.(element);
            } else {
                element.style.opacity = opacity;
            }
        }, 50);
    },
    fadeElementOut: (element, duration = 500, callback) => {
        if (!element) return;
        let opacity = 1;
        const step = 50 / duration;
        const timer = setInterval(() => {
            opacity -= step;
            if (opacity <= 0) {
                clearInterval(timer);
                Object.assign(element.style, { opacity: 0, display: 'none', visibility: 'hidden' });
                callback?.(element);
            } else {
                element.style.opacity = opacity;
            }
        }, 50);
    },
    fadeAudioIn: (audio, duration = 1000, options = { max: 1 }, callback) => {
        if (!audio) return;
        let vol = 0;
        audio.volume = vol;
        if (audio.paused) audio.play();
        const step = 50 / duration;
        const timer = setInterval(() => {
            vol += step;
            if (vol >= options.max) {
                clearInterval(timer);
                audio.volume = options.max;
                callback?.(audio);
            } else {
                audio.volume = vol;
            }
        }, 50);
    },
    fadeAudioOut: (audio, duration = 1000, callback) => {
        if (!audio) return;
        let vol = audio.volume;
        const step = 50 / duration;
        const timer = setInterval(() => {
            vol -= step;
            if (vol <= 0) {
                clearInterval(timer);
                audio.volume = 0;
                callback?.(audio);
            } else {
                audio.volume = vol;
            }
        }, 50);
    }
}
