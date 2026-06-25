// Load slide into container
function loadSlide(path) {
  console.log("Loading:", path); // Debugging helper
  fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load " + path + " (" + response.status + ")");
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('slide-container').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('slide-container').innerHTML = "<p>Error loading slide.</p>";
      console.error(err);
    });
}

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

// Load dashboard by default
window.onload = () => loadSlide('slides/dashboard_1.html');

function loadSlide(path) {
  console.log("Trying to load:", path);
  fetch(path)
    .then(response => {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.text();
    })
    .then(html => {
      document.getElementById('slide-container').innerHTML = html;

      // Run slide-specific JS after loading
      if (path.includes("traffic_map_2.html")) {
        if (typeof initTrafficMap === "function") {
          initTrafficMap();
        }
      }
    })
    .catch(err => {
      document.getElementById('slide-container').innerHTML = "<p>Error loading slide.</p>";
      console.error(err);
    });
}