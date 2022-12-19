import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export const camera = (width, height) => {
    const _FOV = 70;
    const _ASPECT = width / height;
    const _NEAR = 0.1;
    const _FAR = 100;
    return new THREE.PerspectiveCamera(_FOV, _ASPECT, _NEAR, _FAR);
};

export const controls = (isFPS,camera, element) => {
    if(isFPS){
        return new PointerLockControls( camera, element );
    }
    else{
        return new OrbitControls(camera, element);
    }
};

export const gridHelper = (size) => {
    return new THREE.GridHelper(size, size);
};

export const scene = () => {
    return new THREE.Scene();
};

export const renderer = (options) => {
    return new THREE.WebGLRenderer(options || {});
};
