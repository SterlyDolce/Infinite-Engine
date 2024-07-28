import { Group, PlaneGeometry, InstancedBufferAttribute, DynamicDrawUsage, InstancedMesh, Quaternion, Vector3, MeshLambertMaterial, Color, Matrix4, REVISION } from './build/three.module.js';
import { setUpdateRange } from './deprecated.js';

const CLOUD_URL = 'https://rawcdn.githack.com/pmndrs/drei-assets/9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png';
const parentMatrix = /* @__PURE__ */new Matrix4();
const translation = /* @__PURE__ */new Vector3();
const rotation = /* @__PURE__ */new Quaternion();
const cPos = /* @__PURE__ */new Vector3();
const cQuat = /* @__PURE__ */new Quaternion();
const scale = /* @__PURE__ */new Vector3();
const CloudMaterialMaker = material => {
  return class extends material {
    constructor() {
      super();
      const opaque_fragment = parseInt(REVISION.replace(/\D+/g, '')) >= 154 ? 'opaque_fragment' : 'output_fragment';
      this.onBeforeCompile = shader => {
        shader.vertexShader = `attribute float opacity;
               varying float vOpacity;
              ` + shader.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
                 vOpacity = opacity;
                `);
        shader.fragmentShader = `varying float vOpacity;
              ` + shader.fragmentShader.replace(`#include <${opaque_fragment}>`, `#include <${opaque_fragment}>
                 gl_FragColor = vec4(outgoingLight, diffuseColor.a * vOpacity);
                `);
      };
    }
  };
};
class Clouds extends Group {
  constructor({
    limit = 200,
    range,
    material = MeshLambertMaterial,
    texture,
    frustumCulled = true
  } = {}) {
    super();
    this.name = 'Clouds';
    this.ref = this;
    const ref = this;
    const planeGeometry = new PlaneGeometry(1, 1);
    const opacities = new Float32Array(Array.from({
      length: limit
    }, () => 1));
    const colors = new Float32Array(Array.from({
      length: limit
    }, () => [1, 1, 1]).flat());
    const opAttr = new InstancedBufferAttribute(opacities, 1);
    opAttr.setUsage(DynamicDrawUsage);
    planeGeometry.setAttribute('opacity', opAttr);
    const CloudMaterial = CloudMaterialMaker(material);
    const cloudMaterial = new CloudMaterial();
    cloudMaterial.map = texture;
    cloudMaterial.transparent = true;
    cloudMaterial.depthWrite = false;
    cloudMaterial.needsUpdate = true;
    this.cloudMaterial = cloudMaterial;
    this.instance = new InstancedMesh(planeGeometry, cloudMaterial, limit);
    const instance = this.instance;
    instance.matrixAutoUpdate = false;
    instance.frustumCulled = frustumCulled;
    instance.instanceColor = new InstancedBufferAttribute(colors, 3);
    instance.instanceColor.setUsage(DynamicDrawUsage);
    ref.add(instance);
    const clouds = [];
    const getCloudArray = () => {
      const oldCount = clouds.length;
      let currentCount = 0;
      for (let index = 0; index < this.ref.children.length; index++) {
        const mesh = this.ref.children[index];
        if (!mesh.cloudStateArray) continue;
        currentCount += mesh.cloudStateArray.length;
      }
      if (oldCount === currentCount) {
        return clouds;
      }
      clouds.length = 0;
      for (let index = 0; index < this.ref.children.length; index++) {
        const mesh = this.ref.children[index];
        if (!mesh.cloudStateArray) continue;
        clouds.push(...mesh.cloudStateArray);
      }
      updateInstancedMeshDrawRange();
      return clouds;
    };
    const updateInstancedMeshDrawRange = () => {
      const count = Math.min(limit, range !== undefined ? range : limit, clouds.length);
      instance.count = count;
      setUpdateRange(instance.instanceMatrix, {
        offset: 0,
        count: count * 16
      });
      if (instance.instanceColor) {
        setUpdateRange(instance.instanceColor, {
          offset: 0,
          count: count * 3
        });
      }
      setUpdateRange(instance.geometry.attributes.opacity, {
        offset: 0,
        count: count
      });
    };
    let t = 0;
    let index = 0;
    let config;
    const qat = new Quaternion();
    const dir = new Vector3(0, 0, 1);
    const pos = new Vector3();
    this.update = (camera, elapsedTime, delta) => {
      t = elapsedTime;
      parentMatrix.copy(instance.matrixWorld).invert();
      camera.matrixWorld.decompose(cPos, cQuat, scale);
      const clouds = getCloudArray();
      for (index = 0; index < clouds.length; index++) {
        config = clouds[index];
        config.ref.matrixWorld.decompose(translation, rotation, scale);
        translation.add(pos.copy(config.position).applyQuaternion(rotation).multiply(scale));
        rotation.copy(cQuat).multiply(qat.setFromAxisAngle(dir, config.rotation += delta * config.rotationFactor));
        scale.multiplyScalar(config.volume + (1 + Math.sin(t * config.density * config.speed)) / 2 * config.growth);
        config.matrix.compose(translation, rotation, scale).premultiply(parentMatrix);
        config.dist = translation.distanceTo(cPos);
      }

      // Depth-sort. Instances have no specific draw order, w/o sorting z would be random
      clouds.sort((a, b) => b.dist - a.dist);
      for (index = 0; index < clouds.length; index++) {
        config = clouds[index];
        opacities[index] = config.opacity * (config.dist < config.fade - 1 ? config.dist / config.fade : 1);
        instance.setMatrixAt(index, config.matrix);
        instance.setColorAt(index, config.color);
      }

      // Update instance
      instance.geometry.attributes.opacity.needsUpdate = true;
      instance.instanceMatrix.needsUpdate = true;
      if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    };
  }
}
let cloudCount = 0;

class Cloud extends Group {
  constructor({
    opacity = 1,
    speed = 0,
    bounds = new Vector3().fromArray([5, 1, 1]),
    segments = 20,
    color = new Color('#ffffff'),
    fade = 10,
    volume = 6,
    smallestVolume = 0.25,
    distribute = null,
    growth = 4,
    concentrate = 'inside',
    seed = Math.random()
  } = {}) {
    super();
    this.name = 'cloud_' + cloudCount++;
    this.seed = seed;
    this.segments = segments;
    this.bounds = bounds;
    this.concentrate = concentrate;
    this.volume = volume;
    this.smallestVolume = smallestVolume;
    this.distribute = distribute;
    this.growth = growth;
    this.speed = speed;
    this.fade = fade;
    this.opacity = opacity;
    this.color = color;
    this.ref = this;
    this.cloudStateArray = [];
    this.updateCloud();
  }

  /**
   * @private
   */
  updateCloudStateArray() {
    if (this.cloudStateArray.length === this.segments) return;
    const {
      segments,
      uuid
    } = this;
    if (this.cloudStateArray.length > this.segments) {
      this.cloudStateArray.splice(0, this.cloudStateArray.length - this.segments);
    } else {
      for (let index = this.cloudStateArray.length; index < segments; index++) {
        this.cloudStateArray.push({
          segments,
          bounds: new Vector3(1, 1, 1),
          position: new Vector3(),
          uuid,
          index,
          ref: this,
          dist: 0,
          matrix: new Matrix4(),
          volume: 0,
          length: 0,
          speed: 0,
          growth: 0,
          opacity: 1,
          fade: 0,
          density: 0,
          rotation: index * (Math.PI / segments),
          rotationFactor: 0,
          // Add rotationFactor property
          color: new Color()
        });
      }
    }
  }
  updateCloud() {
    const {
      volume,
      color,
      speed,
      growth,
      opacity,
      fade,
      bounds,
      seed,
      cloudStateArray,
      distribute,
      segments,
      concentrate,
      smallestVolume
    } = this;
    this.updateCloudStateArray();
    let seedInc = 0;
    function random() {
      const x = Math.sin(seed + seedInc) * 10000;
      seedInc++;
      return x - Math.floor(x);
    }
    cloudStateArray.forEach((cloud, index) => {
      // Only distribute randomly if there are multiple segments
      cloud.segments = segments;
      cloud.volume = volume;
      cloud.color = color;
      cloud.speed = speed;
      cloud.growth = growth;
      cloud.opacity = opacity;
      cloud.fade = fade;
      cloud.bounds.copy(bounds);
      cloud.density = Math.max(0.5, random());
      cloud.rotationFactor = Math.max(0.2, 0.5 * random()) * speed;

      // Only distribute randomly if there are multiple segments

      const distributed = distribute == null ? void 0 : distribute(cloud, index);
      if (distributed || segments > 1) {
        var _distributed$point;
        cloud.position.copy(cloud.bounds).multiply((_distributed$point = distributed == null ? void 0 : distributed.point) !== null && _distributed$point !== void 0 ? _distributed$point : {
          x: random() * 2 - 1,
          y: random() * 2 - 1,
          z: random() * 2 - 1
        });
      }
      const xDiff = Math.abs(cloud.position.x);
      const yDiff = Math.abs(cloud.position.y);
      const zDiff = Math.abs(cloud.position.z);
      const max = Math.max(xDiff, yDiff, zDiff);
      cloud.length = 1;
      if (xDiff === max) cloud.length -= xDiff / cloud.bounds.x;
      if (yDiff === max) cloud.length -= yDiff / cloud.bounds.y;
      if (zDiff === max) cloud.length -= zDiff / cloud.bounds.z;
      cloud.volume = ((distributed == null ? void 0 : distributed.volume) !== undefined ? distributed.volume : Math.max(Math.max(0, smallestVolume), concentrate === 'random' ? random() : concentrate === 'inside' ? cloud.length : 1 - cloud.length)) * volume;
    });
  }
}

export { CLOUD_URL, Cloud, Clouds };