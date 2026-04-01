function showLoader(skeletonId = null) {
  if (skeletonId) {
    const container = document.getElementById(skeletonId);
    if (container) {
      container.innerHTML = `
        <div class="skeleton-active">
          <div class="skel-media"></div>
          <div class="skel-line skel-title"></div>
          <div class="skel-line skel-p"></div>
          <div class="skel-line skel-p"></div>
        </div>
      `;
    }
  } else {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
}