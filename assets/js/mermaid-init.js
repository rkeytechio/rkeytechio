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
