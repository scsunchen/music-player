<template>
  <div class="webgpu-visualizer" ref="containerRef">
    <canvas ref="canvasRef" class="visualizer-canvas"></canvas>
    <div v-if="!isSupported" class="fallback-text">WebGPU 不支持</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  themeColor: {
    type: String,
    default: '#667eea'
  }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const isSupported = ref(false)
const playerStore = usePlayerStore()

// WebGPU 相关变量
let device = null
let context = null
let renderPipeline = null
let computePipeline = null
let particleBuffer = null
let uniformBuffer = null
let bindGroup = null
let animationId = null
let analyser = null

// 粒子配置
const PARTICLE_COUNT = 8192 // 8K 粒子
const PARTICLES_PER_ROW = 128
const ROWS = PARTICLE_COUNT / PARTICLES_PER_ROW

// 检测 WebGPU 支持
const checkWebGPUSupport = async () => {
  if (!navigator.gpu) {
    return false
  }
  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) return false
    device = await adapter.requestDevice()
    return true
  } catch {
    return false
  }
}

// 初始化 WebGPU
const initWebGPU = async () => {
  if (!canvasRef.value || !device) return

  const canvas = canvasRef.value
  const container = containerRef.value
  
  // 设置 canvas 尺寸
  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr
  canvas.style.width = container.clientWidth + 'px'
  canvas.style.height = container.clientHeight + 'px'

  // 获取 WebGPU 上下文
  context = canvas.getContext('webgpu')
  if (!context) return

  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied'
  })

  // 创建粒子数据
  const particleData = new Float32Array(PARTICLE_COUNT * 4)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (i % PARTICLES_PER_ROW) / PARTICLES_PER_ROW * 2 - 1
    const z = Math.floor(i / PARTICLES_PER_ROW) / ROWS * 2 - 1
    particleData[i * 4] = x     // x
    particleData[i * 4 + 1] = 0 // y (高度，由音频驱动)
    particleData[i * 4 + 2] = z // z
    particleData[i * 4 + 3] = 0 // 速度
  }

  // 创建粒子缓冲区
  particleBuffer = device.createBuffer({
    size: particleData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  })
  new Float32Array(particleBuffer.getMappedRange()).set(particleData)
  particleBuffer.unmap()

  // 创建 Uniform 缓冲区
  uniformBuffer = device.createBuffer({
    size: 32, // time(4) + intensity(4) + color(12) + padding(12)
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })

  // 计算着色器
  const computeShaderCode = `
    @group(0) @binding(0) var<storage, read_write> particles: array<vec4<f32>>;
    @group(0) @binding(1) var<uniform> params: vec4<f32>;
    @group(0) @binding(2) var<storage, read> audioData: array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let idx = global_id.x;
      if (idx >= ${PARTICLE_COUNT}u) { return; }
      
      let time = params.x;
      let intensity = params.y;
      
      var particle = particles[idx];
      let x = particle.x;
      let z = particle.z;
      
      // 计算音频影响的位置
      let audioIdx = u32((x + 1.0) * 0.5 * 64.0) % 64u;
      let audioValue = audioData[audioIdx] * intensity;
      
      // 波浪效果
      let wave1 = sin(x * 3.14159 * 4.0 + time * 2.0) * 0.1;
      let wave2 = cos(z * 3.14159 * 3.0 + time * 1.5) * 0.08;
      let wave3 = sin((x + z) * 3.14159 * 2.0 + time) * 0.05;
      
      // 综合高度
      particle.y = wave1 + wave2 + wave3 + audioValue * 0.5;
      
      // 添加一些随机扰动
      let noise = sin(idx as f32 * 0.1 + time) * 0.02 * intensity;
      particle.y += noise;
      
      particles[idx] = particle;
    }
  `

  // 顶点着色器
  const vertexShaderCode = `
    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) height: f32,
    }

    @group(0) @binding(1) var<uniform> params: vec4<f32>;

    @vertex
    fn main(@location(0) particle: vec4<f32>) -> VertexOutput {
      var output: VertexOutput;
      
      let time = params.x;
      let intensity = params.y;
      
      // 3D 位置
      var pos = particle.xyz;
      
      // 相机变换（简单透视）
      let viewZ = pos.z * 0.5 + 2.0;
      let scale = 1.0 / viewZ;
      
      output.position = vec4<f32>(
        pos.x * scale * 0.8,
        pos.y * scale * 0.5 - 0.2,
        0.0,
        1.0
      );
      
      // 根据高度计算颜色
      let heightNorm = clamp((pos.y + 0.3) * 1.5, 0.0, 1.0);
      
      // 主题色（从 uniform 传入，这里简化处理）
      let themeR = 0.4; // 简化，实际应从 uniform 读取
      let themeG = 0.48;
      let themeB = 0.92;
      
      // 颜色渐变：低处暗，高处亮
      output.color = vec3<f32>(
        themeR * (0.3 + heightNorm * 0.7),
        themeG * (0.3 + heightNorm * 0.7),
        themeB * (0.5 + heightNorm * 0.5)
      );
      
      output.height = heightNorm;
      
      return output;
    }
  `

  // 片段着色器
  const fragmentShaderCode = `
    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) height: f32,
    }

    @fragment
    fn main(input: VertexOutput) -> @location(0) vec4<f32> {
      // 发光效果
      let glow = 1.0 + input.height * 0.5;
      var color = input.color * glow;
      
      // 边缘淡化
      let dist = length(input.position.xy);
      let fade = 1.0 - smoothstep(0.8, 1.2, dist);
      
      return vec4<f32>(color * fade, fade * 0.9);
    }
  `

  // 创建着色器模块
  const computeModule = device.createShaderModule({ code: computeShaderCode })
  const vertexModule = device.createShaderModule({ code: vertexShaderCode })
  const fragmentModule = device.createShaderModule({ code: fragmentShaderCode })

  // 创建计算管线
  computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: computeModule, entryPoint: 'main' }
  })

  // 创建音频数据缓冲区
  const audioBuffer = device.createBuffer({
    size: 64 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  })

  // 创建 Bind Group
  bindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: uniformBuffer } },
      { binding: 2, resource: { buffer: audioBuffer } }
    ]
  })

  // 创建渲染管线
  renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: vertexModule,
      entryPoint: 'main',
      buffers: [{
        arrayStride: 16,
        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }]
      }]
    },
    fragment: {
      module: fragmentModule,
      entryPoint: 'main',
      targets: [{ format, blend: {
        color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
        alpha: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }
      }}]
    },
    primitive: { topology: 'point-list' }
  })

  // 获取音频分析器
  const audio = playerStore.getAudioElement ? playerStore.getAudioElement() : null
  if (audio && !analyser) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaElementSource(audio)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    source.connect(analyser)
    analyser.connect(audioContext.destination)
  }

  // 开始渲染循环
  startRenderLoop(audioBuffer)
}

// 渲染循环
const startRenderLoop = (audioBuffer) => {
  const audioData = new Float32Array(64)
  const uniformData = new Float32Array(8)
  let startTime = Date.now()

  const render = () => {
    if (!device || !context) return

    const time = (Date.now() - startTime) * 0.001
    const intensity = playerStore.isPlaying ? 1.0 : 0.3

    // 获取音频数据
    if (analyser && playerStore.isPlaying) {
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      for (let i = 0; i < 64; i++) {
        audioData[i] = data[i] / 255.0
      }
    } else {
      audioData.fill(0)
    }

    // 更新 Uniform
    uniformData[0] = time
    uniformData[1] = intensity
    device.queue.writeBuffer(uniformBuffer, 0, uniformData)
    device.queue.writeBuffer(audioBuffer, 0, audioData)

    // 计算阶段
    const computeEncoder = device.createCommandEncoder()
    const computePass = computeEncoder.beginComputePass()
    computePass.setPipeline(computePipeline)
    computePass.setBindGroup(0, bindGroup)
    computePass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64))
    computePass.end()
    device.queue.submit([computeEncoder.finish()])

    // 渲染阶段
    const renderEncoder = device.createCommandEncoder()
    const renderPass = renderEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    })
    renderPass.setPipeline(renderPipeline)
    renderPass.setBindGroup(0, bindGroup)
    renderPass.setVertexBuffer(0, particleBuffer)
    renderPass.draw(PARTICLE_COUNT)
    renderPass.end()
    device.queue.submit([renderEncoder.finish()])

    animationId = requestAnimationFrame(render)
  }

  render()
}

// 清理
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (particleBuffer) {
    particleBuffer.destroy()
    particleBuffer = null
  }
  if (uniformBuffer) {
    uniformBuffer.destroy()
    uniformBuffer = null
  }
  device = null
  context = null
}

onMounted(async () => {
  isSupported.value = await checkWebGPUSupport()
  if (isSupported.value) {
    await initWebGPU()
  }
})

onUnmounted(() => {
  cleanup()
})

// 监听主题色变化
watch(() => props.themeColor, () => {
  // 主题色更新逻辑
})
</script>

<style scoped>
.webgpu-visualizer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.visualizer-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.fallback-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}
</style>
