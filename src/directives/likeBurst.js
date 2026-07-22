/**
 * v-like-burst 自定义指令
 * 点击收藏爱心时，生成迷你爱心粒子上浮 + 涟漪光环动画
 *
 * 用法：在 .like-btn 按钮上加 v-like-burst
 *   <button class="like-btn" v-like-burst :class="{ liked: ... }" @click="toggleLike">
 */

const heartPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

function createHeartSVG(size, color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', size)
  svg.setAttribute('height', size)
  svg.style.overflow = 'visible'
  svg.style.position = 'absolute'
  svg.style.pointerEvents = 'none'
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', heartPath)
  path.setAttribute('fill', color)
  svg.appendChild(path)
  return svg
}

function createRipple() {
  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(245, 87, 108, 0.5);
    pointer-events: none;
    animation: vlb-ripple 0.5s ease-out forwards;
  `
  return ripple
}

function injectKeyframes() {
  if (document.getElementById('vlb-keyframes')) return
  const style = document.createElement('style')
  style.id = 'vlb-keyframes'
  style.textContent = `
    @keyframes vlb-ripple {
      0% { opacity: 0.6; transform: scale(0.6); }
      100% { opacity: 0; transform: scale(1.8); }
    }
  `
  document.head.appendChild(style)
}

function spawnFloatingHearts(el) {
  const rect = el.getBoundingClientRect()
  const count = 5

  for (let i = 0; i < count; i++) {
    const size = 8 + Math.random() * 8
    const hue = 340 + Math.random() * 30
    const color = `hsl(${hue}, 85%, ${58 + Math.random() * 12}%)`

    const svg = createHeartSVG(size, color)

    const offsetX = (Math.random() - 0.5) * 24
    const floatDist = 28 + Math.random() * 22
    const sway = (Math.random() - 0.5) * 18
    const rotate = (Math.random() - 0.5) * 30
    const delay = i * 50

    // 用 fixed 定位，基于按钮位置
    svg.style.position = 'fixed'
    svg.style.left = `${rect.left + rect.width / 2 + offsetX - size / 2}px`
    svg.style.top = `${rect.top + rect.height / 2 - size / 2}px`
    svg.style.zIndex = '9999'
    svg.style.opacity = '0'
    svg.style.transition = 'none'

    document.body.appendChild(svg)

    // 触发动画
    requestAnimationFrame(() => {
      svg.style.transition = `all 0.55s ${delay}ms cubic-bezier(0.2, 0.8, 0.3, 1)`
      svg.style.opacity = '0.85'
      svg.style.transform = `translate(${sway}px, ${-floatDist}px) rotate(${rotate}deg) scale(0.3)`

      setTimeout(() => {
        svg.style.transition = 'opacity 0.2s'
        svg.style.opacity = '0'
        setTimeout(() => svg.remove(), 220)
      }, 400 + delay)
    })
  }

  // 涟漪
  const ripple = createRipple()
  el.style.position = el.style.position || 'relative'
  el.appendChild(ripple)
  setTimeout(() => ripple.remove(), 550)
}

const LikeBurstDirective = {
  mounted(el, binding) {
    injectKeyframes()

    el._likeBurstHandler = (e) => {
      // 等下一帧检查按钮是否变为 liked 状态
      requestAnimationFrame(() => {
        // 检查按钮或其父元素是否有 liked class
        const btn = e.target.closest('.like-btn') || e.currentTarget
        if (btn && btn.classList.contains('liked')) {
          spawnFloatingHearts(btn)
        }
      })
    }

    el.addEventListener('click', el._likeBurstHandler)
  },

  unmounted(el) {
    if (el._likeBurstHandler) {
      el.removeEventListener('click', el._likeBurstHandler)
      delete el._likeBurstHandler
    }
  },
}

export default LikeBurstDirective
