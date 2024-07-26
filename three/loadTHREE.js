import * as THREE from './build/three.module.js'

document.dispatchEvent(new CustomEvent('ThreeLoaded', {detail: THREE}))
