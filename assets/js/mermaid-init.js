document.addEventListener('DOMContentLoaded', function () {
  if (typeof mermaid === 'undefined') {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
  });

  // Render code fences marked as Mermaid
  document.querySelectorAll('pre code.language-mermaid, pre code.lang-mermaid').forEach(function (codeBlock) {
    var pre = codeBlock.closest('pre');
    if (!pre) {
      return;
    }

    var graphCode = codeBlock.textContent;
    var mermaidWrapper = document.createElement('div');
    mermaidWrapper.className = 'mermaid';
    mermaidWrapper.textContent = graphCode;

    pre.parentNode.replaceChild(mermaidWrapper, pre);

    try {
      mermaid.init(undefined, mermaidWrapper);
    } catch (err) {
      console.error('Mermaid diagram failed to render:', err);
    }
  });
});

// Modal logic to view larger Mermaid diagrams
(function () {
  function ensureModal() {
    if (document.querySelector('.mermaid-modal-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'mermaid-modal-overlay';

    var wrapper = document.createElement('div');
    wrapper.className = 'mermaid-modal-wrapper';

    var content = document.createElement('div');
    content.className = 'mermaid-modal-content';

    // toolbar for zoom controls
    var toolbar = document.createElement('div');
    toolbar.className = 'mermaid-modal-toolbar';
    toolbar.setAttribute('aria-hidden', 'false');

    var btnZoomIn = document.createElement('button');
    btnZoomIn.type = 'button';
    btnZoomIn.className = 'mermaid-modal-zoom-in';
    btnZoomIn.textContent = '+';
    btnZoomIn.title = 'Zoom in';

    var btnZoomOut = document.createElement('button');
    btnZoomOut.type = 'button';
    btnZoomOut.className = 'mermaid-modal-zoom-out';
    btnZoomOut.textContent = '−';
    btnZoomOut.title = 'Zoom out';

    var btnFit = document.createElement('button');
    btnFit.type = 'button';
    btnFit.className = 'mermaid-modal-fit';
    btnFit.textContent = 'Fit';
    btnFit.title = 'Fit to view';

    var btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'mermaid-modal-reset';
    btnReset.textContent = 'Reset';
    btnReset.title = 'Reset zoom/pan';

    toolbar.appendChild(btnZoomOut);
    toolbar.appendChild(btnZoomIn);
    toolbar.appendChild(btnFit);
    toolbar.appendChild(btnReset);

    var close = document.createElement('button');
    close.className = 'mermaid-modal-close';
    close.innerHTML = '&times;';
    close.setAttribute('type', 'button');
    close.setAttribute('aria-label', 'Close diagram viewer');

    wrapper.appendChild(close);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(content);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // Close handlers
    close.addEventListener('click', function () { closeModal(); });
    // Toolbar button handlers (delegated later from openModal)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Setup pan/zoom for appended svg inside modal content
  function setupPanZoom(content) {
    teardownPanZoom(content);
    var viewport = document.createElement('div');
    viewport.className = 'mermaid-modal-viewport';
    var panwrap = document.createElement('div');
    panwrap.className = 'mermaid-modal-panwrap';

    // Move existing children (svg) into panwrap
    while (content.firstChild) {
      panwrap.appendChild(content.firstChild);
    }
    viewport.appendChild(panwrap);
    content.appendChild(viewport);

    var state = {
      scale: 1,
      tx: 0,
      ty: 0,
      dragging: false,
      lastX: 0,
      lastY: 0
    };
    content.__panState = state;

    function apply() {
      panwrap.style.transform = 'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.scale + ')';
    }

    function fit() {
      var svg = panwrap.querySelector('svg');
      if (!svg) return;
      var bbox;
      try {
        bbox = svg.getBBox();
      } catch (e) {
        // fallback to bounding client rect
        var r = svg.getBoundingClientRect();
        bbox = { x: 0, y: 0, width: r.width, height: r.height };
      }
      var vw = viewport.clientWidth;
      var vh = viewport.clientHeight;
      if (bbox.width === 0 || bbox.height === 0) return;
      var s = Math.min(vw / bbox.width, vh / bbox.height) * 0.95;
      state.scale = s;
      state.tx = (vw - bbox.width * s) / 2 - bbox.x * s;
      state.ty = (vh - bbox.height * s) / 2 - bbox.y * s;
      apply();
    }

    function onWheel(e) {
      e.preventDefault();
      var delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      var rect = viewport.getBoundingClientRect();
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      var newScale = Math.max(0.1, Math.min(10, state.scale * delta));
      // keep point under cursor stationary
      state.tx = state.tx - (cx) * (newScale / state.scale - 1);
      state.ty = state.ty - (cy) * (newScale / state.scale - 1);
      state.scale = newScale;
      apply();
    }

    function onDown(e) {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      viewport.style.cursor = 'grabbing';
      e.preventDefault();
    }
    function onMove(e) {
      if (!state.dragging) return;
      var dx = e.clientX - state.lastX;
      var dy = e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.tx += dx;
      state.ty += dy;
      apply();
    }
    function onUp() {
      state.dragging = false;
      viewport.style.cursor = 'grab';
    }

    // Buttons wired via delegation on overlay when open
    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // expose helpers
    content.__panHelpers = { fit: fit, apply: apply };
    // initial fit
    setTimeout(fit, 30);
  }

  function teardownPanZoom(content) {
    if (!content) return;
    var state = content.__panState;
    if (state) {
      // remove listeners: best-effort - rely on content being replaced on close
      content.__panState = null;
    }
    // If viewport exists, unwrap its children back into content (will be cleared by open/close)
    var viewport = content.querySelector('.mermaid-modal-viewport');
    if (viewport) {
      var panwrap = viewport.querySelector('.mermaid-modal-panwrap');
      if (panwrap) {
        while (panwrap.firstChild) content.appendChild(panwrap.firstChild);
      }
      viewport.remove();
    }
  }

  function openModal(svgNode) {
    ensureModal();
    var overlay = document.querySelector('.mermaid-modal-overlay');
    var content = document.querySelector('.mermaid-modal-content');
    content.innerHTML = '';
    // Safer approach: use outerHTML so namespace and inner <style>/<defs> remain intact
    try {
      var html = svgNode.outerHTML || svgNode.cloneNode(true).outerHTML;
      content.insertAdjacentHTML('beforeend', html);
      var appended = content.querySelector('svg');
      if (appended) {
        // Remove hard width/height to allow transform-based pan/zoom
        appended.removeAttribute('width');
        appended.removeAttribute('height');
        appended.style.display = 'block';
        if (!appended.getAttribute('xmlns')) appended.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (!appended.getAttribute('xmlns:xlink')) appended.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }
    } catch (err) {
      // fallback to cloneNode if outerHTML isn't available
      var clone = svgNode.cloneNode(true);
      if (clone.nodeName && clone.nodeName.toLowerCase() === 'svg') {
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      } else if (clone.querySelectorAll) {
        var svgs = clone.querySelectorAll('svg');
        svgs.forEach(function (s) { s.removeAttribute('width'); s.removeAttribute('height'); });
      }
      content.appendChild(clone);
    }
    overlay.classList.add('open');
    // prevent body scroll when open
    document.documentElement.style.overflow = 'hidden';
    // focus the close button for keyboard users
    var closeBtn = document.querySelector('.mermaid-modal-close');
    if (closeBtn && closeBtn.focus) {
      closeBtn.focus();
    }
    
    // Setup pan/zoom on content
    try {
      setupPanZoom(content);
    } catch (err) {
      console.warn('Pan/zoom setup failed:', err);
    }

    // wire toolbar buttons
    var overlayRoot = document.querySelector('.mermaid-modal-overlay');
    try {
      overlayRoot.querySelector('.mermaid-modal-zoom-in').addEventListener('click', function () {
        var contentEl = document.querySelector('.mermaid-modal-content');
        if (!contentEl || !contentEl.__panState) return;
        contentEl.__panState.scale = Math.min(10, contentEl.__panState.scale * 1.2);
        contentEl.__panHelpers.apply();
      });
      overlayRoot.querySelector('.mermaid-modal-zoom-out').addEventListener('click', function () {
        var contentEl = document.querySelector('.mermaid-modal-content');
        if (!contentEl || !contentEl.__panState) return;
        contentEl.__panState.scale = Math.max(0.1, contentEl.__panState.scale / 1.2);
        contentEl.__panHelpers.apply();
      });
      overlayRoot.querySelector('.mermaid-modal-fit').addEventListener('click', function () {
        var contentEl = document.querySelector('.mermaid-modal-content');
        if (!contentEl || !contentEl.__panHelpers) return;
        contentEl.__panHelpers.fit();
      });
      overlayRoot.querySelector('.mermaid-modal-reset').addEventListener('click', function () {
        var contentEl = document.querySelector('.mermaid-modal-content');
        if (!contentEl || !contentEl.__panState) return;
        contentEl.__panState.scale = 1; contentEl.__panState.tx = 0; contentEl.__panState.ty = 0; contentEl.__panHelpers.apply();
      });
    } catch (e) {
      // ignore button wiring errors
    }

    // keyboard + / - for zoom
    function onKey(e) {
      var contentEl = document.querySelector('.mermaid-modal-content');
      if (!contentEl || !contentEl.__panState) return;
      if (e.key === '+') {
        contentEl.__panState.scale = Math.min(10, contentEl.__panState.scale * 1.2);
        contentEl.__panHelpers.apply();
      } else if (e.key === '-') {
        contentEl.__panState.scale = Math.max(0.1, contentEl.__panState.scale / 1.2);
        contentEl.__panHelpers.apply();
      }
    }
    document.addEventListener('keydown', onKey);
    // store to remove later
    overlayRoot.__onKey = onKey;
  }

  function closeModal() {
    var overlay = document.querySelector('.mermaid-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    var content = document.querySelector('.mermaid-modal-content');
    if (content) {
      teardownPanZoom(content);
      content.innerHTML = '';
    }
    document.documentElement.style.overflow = '';
    // restore focus to the triggering element if present
    try {
      if (window.__lastMermaidTrigger && window.__lastMermaidTrigger.focus) {
        window.__lastMermaidTrigger.focus();
      }
    } catch (e) {
      // ignore
    }
    window.__lastMermaidTrigger = null;
    // remove keyboard handler if any
    try {
      if (overlay && overlay.__onKey) {
        document.removeEventListener('keydown', overlay.__onKey);
        overlay.__onKey = null;
      }
    } catch (e) {
      // ignore
    }
  }

  // Attach click handlers to rendered Mermaid diagrams (delegation to handle dynamically added content)
  document.addEventListener('click', function (e) {
    // Ignore clicks inside the modal overlay (so cloned content won't re-trigger)
    if (e.target.closest && e.target.closest('.mermaid-modal-overlay')) return;

    var target = e.target;
    if (target.closest) {
      var mermaidDiv = target.closest('.mermaid');
      if (mermaidDiv) {
        var svg = mermaidDiv.querySelector('svg');
        mermaidDiv.classList.add('mermaid-figure');
        // store trigger for focus restoration
        window.__lastMermaidTrigger = mermaidDiv;
        if (svg) {
          openModal(svg);
        } else {
          // Fallback: clone the whole mermaid container
          openModal(mermaidDiv);
        }
        return;
      }
    }
  });

})();
