import * as THREE from './build/three.module.js';

function shaderMaterial(uniforms, vertexShader, fragmentShader, onInit) {
  const entries = Object.entries(uniforms);
  class Material extends THREE.ShaderMaterial {
    constructor(parameters) {
      super({
        uniforms: entries.reduce((acc, [name, value]) => {
          const uniform = THREE.UniformsUtils.clone({
            [name]: {
              value
            }
          });
          return {
            ...acc,
            ...uniform
          };
        }, {}),
        vertexShader,
        fragmentShader
      });
      for (const [name] of entries) {
        Object.defineProperty(this, name, {
          get: () => this.uniforms[name].value,
          set: v => this.uniforms[name].value = v
        });
      }
      Object.assign(this, parameters);
      onInit == null ? void 0 : onInit(this);
    }
  }
  Material.key = THREE.MathUtils.generateUUID();
  return Material;
}

export { shaderMaterial };