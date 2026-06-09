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

    var close = document.createElement('button');
    close.className = 'mermaid-modal-close';
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Close diagram viewer');

    wrapper.appendChild(close);
    wrapper.appendChild(content);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // Close handlers
    close.addEventListener('click', function () { closeModal(); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openModal(svgNode) {
    ensureModal();
    var overlay = document.querySelector('.mermaid-modal-overlay');
    var content = document.querySelector('.mermaid-modal-content');
    content.innerHTML = '';
    // Clone the SVG so original remains in place
    var clone = svgNode.cloneNode(true);
    // Remove any width/height attributes that may restrict scaling
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    content.appendChild(clone);
    overlay.classList.add('open');
    // prevent body scroll when open
    document.documentElement.style.overflow = 'hidden';
  }

  function closeModal() {
    var overlay = document.querySelector('.mermaid-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    var content = document.querySelector('.mermaid-modal-content');
    if (content) content.innerHTML = '';
    document.documentElement.style.overflow = '';
  }

  // Attach click handlers to rendered Mermaid diagrams (delegation to handle dynamically added content)
  document.addEventListener('click', function (e) {
    var target = e.target;
    // If clicked directly inside an SVG element produced by mermaid
    if (target.closest) {
      var mermaidDiv = target.closest('.mermaid');
      if (mermaidDiv) {
        var svg = mermaidDiv.querySelector('svg');
        if (svg) {
          // Mark the mermaid div as figure-like for styling
          mermaidDiv.classList.add('mermaid-figure');
          openModal(svg);
          return;
        }
      }
    }
  });

})();
