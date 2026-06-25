function initTrafficMap() {
  const nodeData = [
    { x: 150, y: 100, status: 'green' },
    { x: 350, y: 100, status: 'orange' },
    { x: 550, y: 100, status: 'green' },
    { x: 150, y: 250, status: 'green' },
    { x: 350, y: 250, status: 'red' },
    { x: 550, y: 250, status: 'orange' },
    { x: 150, y: 400, status: 'orange' },
    { x: 350, y: 400, status: 'green' },
    { x: 550, y: 400, status: 'green' }
  ];

  const roadPaths = [
    { start: { x: 50, y: 100 }, end: { x: 750, y: 100 }, duration: 8000 },
    { start: { x: 750, y: 250 }, end: { x: 50, y: 250 }, duration: 10000 },
    { start: { x: 50, y: 400 }, end: { x: 750, y: 400 }, duration: 7000 }
  ];

  let vehicles = [];
  let vehicleIdCounter = 0;
  let lastTime = 0;
  let spawnTimer = 0;

  function createNodes() {
    const container = document.getElementById('nodes-container');
    if (!container) return;
    container.innerHTML = "";
    nodeData.forEach(node => {
      const el = document.createElement('div');
      el.className = "absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer";
      el.style.left = `${(node.x / 800) * 100}%`;
      el.style.top = `${(node.y / 500) * 100}%`;
      updateNodeStyle(el, node.status);

      // Click to toggle status
      el.addEventListener('click', () => {
        const statuses = ['green', 'orange', 'red'];
        const currentIndex = statuses.indexOf(node.status);
        node.status = statuses[(currentIndex + 1) % statuses.length];
        updateNodeStyle(el, node.status);
        updateFlowRate();
        checkAlerts();
      });

      container.appendChild(el);
    });
  }

  function updateNodeStyle(el, status) {
    el.classList.remove('bg-green-500', 'bg-orange-400', 'bg-red-500');
    if (status === 'green') el.classList.add('bg-green-500');
    if (status === 'orange') el.classList.add('bg-orange-400');
    if (status === 'red') el.classList.add('bg-red-500');
  }

  function updateFlowRate() {
    const greenCount = nodeData.filter(n => n.status === 'green').length;
    const orangeCount = nodeData.filter(n => n.status === 'orange').length;
    const totalScore = (greenCount * 100 + orangeCount * 50) / nodeData.length;
    const flowRate = document.getElementById('flow-rate');
    if (flowRate) flowRate.textContent = Math.round(totalScore) + '%';
  }

  function checkAlerts() {
    const redCount = nodeData.filter(n => n.status === 'red').length;
    const flowRate = parseInt(document.getElementById('flow-rate').textContent);
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
      if (redCount >= 3 || flowRate < 40) {
        alertBox.classList.remove('hidden');
      } else {
        alertBox.classList.add('hidden');
      }
    }
  }

  function createVehicle() {
    const path = roadPaths[Math.floor(Math.random() * roadPaths.length)];
    const container = document.getElementById('vehicles-container');
    if (!container) return;
    const vehicle = document.createElement('div');
    vehicle.className = 'absolute w-2 h-2 rounded-full bg-pink-500';
    vehicle.id = `vehicle-${vehicleIdCounter++}`;
    vehicle.style.left = (path.start.x / 800) * 100 + '%';
    vehicle.style.top = (path.start.y / 500) * 100 + '%';
    container.appendChild(vehicle);
    vehicles.push({ el: vehicle, path, progress: 0, duration: path.duration });
    updateVehicleCount();
  }

  function updateVehicles(deltaTime) {
    vehicles = vehicles.filter(v => {
      v.progress += deltaTime / v.duration;
      if (v.progress >= 1) {
        v.el.remove();
        updateVehicleCount();
        return false;
      }
      const currentX = v.path.start.x + (v.path.end.x - v.path.start.x) * v.progress;
      const currentY = v.path.start.y + (v.path.end.y - v.path.start.y) * v.progress;
      v.el.style.left = (currentX / 800) * 100 + '%';
      v.el.style.top = (currentY / 500) * 100 + '%';
      return true;
    });
  }

  function updateVehicleCount() {
    const vc = document.getElementById('vehicle-count');
    if (vc) vc.textContent = vehicles.length;
  }

  function updateTimestamp() {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const ts = document.getElementById('timestamp');
    if (ts) ts.textContent = time;
  }

  // Animation loop
  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    updateVehicles(deltaTime);

    spawnTimer += deltaTime;
    if (spawnTimer > 1500 && vehicles.length < 10) {
      createVehicle();
      spawnTimer = 0;
    }

    requestAnimationFrame(animate);
  }

  // Initialize everything
  createNodes();
  updateFlowRate();
  checkAlerts();
  setInterval(updateTimestamp, 1000);
  updateTimestamp();
  requestAnimationFrame(animate);
}