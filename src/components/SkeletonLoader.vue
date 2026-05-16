<template>
  <div class="skeleton">
    <div class="skeleton-banner">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
    <div class="skeleton-section">
      <div class="skeleton-title"></div>
      <div class="skeleton-grid">
        <div class="skeleton-card-sm" v-for="i in 4" :key="i"></div>
      </div>
    </div>
    <div class="skeleton-section">
      <div class="skeleton-title"></div>
      <div class="skeleton-list">
        <div class="skeleton-row" v-for="i in 4" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  padding: 24px;
}

.skeleton-banner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.skeleton-card {
  height: 100px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-section {
  margin-bottom: 32px;
}

.skeleton-title {
  width: 120px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 16px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.skeleton-card-sm {
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-row {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
