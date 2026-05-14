/**
 * AIOnboardingFlowCreator — Embeddable Flow Runner SDK
 *
 * Usage:
 *   <script
 *     src="https://yourapp.com/flow-sdk.js"
 *     data-site-key="YOUR_SITE_KEY"
 *     data-user-id="optional-end-user-id"
 *     data-api-base="https://yourapp.com/api"   <!-- optional override -->
 *   ></script>
 *
 * The SDK:
 *  1. On load, fetches the active flow for the site key.
 *  2. Renders step-by-step modals or element-anchored tooltips.
 *  3. Posts step-completion events back to /api/sdk/events.
 *  4. Supports step types: modal, tooltip, spotlight, checklist.
 */
(function (window, document) {
  'use strict';

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var SITE_KEY   = currentScript.getAttribute('data-site-key');
  var USER_ID    = currentScript.getAttribute('data-user-id') || null;
  var API_BASE   = (currentScript.getAttribute('data-api-base') || window.location.origin + '/api').replace(/\/$/, '');

  if (!SITE_KEY) {
    console.warn('[FlowSDK] data-site-key attribute is missing. SDK disabled.');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  var state = {
    flow: null,
    steps: [],
    currentIndex: 0,
    overlay: null,
    modal: null,
    tooltip: null,
    spotlight: null
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('__flow-sdk-styles__')) return;
    var style = document.createElement('style');
    style.id = '__flow-sdk-styles__';
    style.textContent = [
      '.__flow-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147483640;display:flex;align-items:center;justify-content:center}',
      '.__flow-modal{background:#fff;border-radius:12px;padding:32px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.25);position:relative;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
      '.__flow-modal h2{margin:0 0 12px;font-size:20px;font-weight:700;color:#1e293b}',
      '.__flow-modal p{margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6}',
      '.__flow-btn-row{display:flex;justify-content:flex-end;gap:10px}',
      '.__flow-btn{padding:9px 20px;border:none;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}',
      '.__flow-btn:hover{opacity:.85}',
      '.__flow-btn-primary{background:#6366f1;color:#fff}',
      '.__flow-btn-secondary{background:#e2e8f0;color:#1e293b}',
      '.__flow-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer;line-height:1}',
      '.__flow-progress{height:4px;background:#e2e8f0;border-radius:2px;margin-bottom:20px;overflow:hidden}',
      '.__flow-progress-bar{height:100%;background:#6366f1;border-radius:2px;transition:width .3s ease}',
      '.__flow-tooltip{position:absolute;background:#1e293b;color:#f8fafc;padding:10px 14px;border-radius:8px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:280px;z-index:2147483645;box-shadow:0 8px 24px rgba(0,0,0,.25)}',
      '.__flow-tooltip::after{content:"";position:absolute;border:6px solid transparent}',
      '.__flow-tooltip.top::after{bottom:-12px;left:50%;transform:translateX(-50%);border-top-color:#1e293b}',
      '.__flow-tooltip.bottom::after{top:-12px;left:50%;transform:translateX(-50%);border-bottom-color:#1e293b}',
      '.__flow-spotlight{position:fixed;inset:0;z-index:2147483639;pointer-events:none}',
      '.__flow-spotlight-ring{position:absolute;border-radius:6px;box-shadow:0 0 0 9999px rgba(0,0,0,.5);pointer-events:none}',
      '.__flow-step-label{font-size:12px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}'
    ].join('');
    document.head.appendChild(style);
  }

  // ── API helpers ────────────────────────────────────────────────────────────

  function apiFetch(path, options) {
    return fetch(API_BASE + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, options));
  }

  function postEvent(eventType, stepId, extra) {
    var payload = {
      siteKey: SITE_KEY,
      eventType: eventType,
      userId: USER_ID,
      flowId: state.flow && state.flow.id,
      stepId: stepId || null,
      properties: extra || {}
    };
    apiFetch('/sdk/events', { method: 'POST', body: JSON.stringify(payload) })
      .catch(function (e) { console.warn('[FlowSDK] event post failed:', e); });
  }

  // ── DOM helpers ────────────────────────────────────────────────────────────

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html) node.innerHTML = html;
    return node;
  }

  function removeAll() {
    ['overlay', 'tooltip', 'spotlight'].forEach(function (k) {
      if (state[k] && state[k].parentNode) state[k].parentNode.removeChild(state[k]);
      state[k] = null;
    });
    state.modal = null;
  }

  // ── Progress bar ───────────────────────────────────────────────────────────

  function buildProgressBar(current, total) {
    var pct = total > 0 ? Math.round((current / total) * 100) : 0;
    var wrap = el('div', '__flow-progress');
    var bar  = el('div', '__flow-progress-bar');
    bar.style.width = pct + '%';
    wrap.appendChild(bar);
    return wrap;
  }

  // ── Modal renderer ─────────────────────────────────────────────────────────

  function showModal(step, idx, total) {
    removeAll();

    var overlay = el('div', '__flow-overlay');
    var modal   = el('div', '__flow-modal');

    // Close button
    var closeBtn = el('button', '__flow-close', '&times;');
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.addEventListener('click', dismiss);
    modal.appendChild(closeBtn);

    // Step label
    var label = el('div', '__flow-step-label');
    label.textContent = 'Step ' + (idx + 1) + ' of ' + total;
    modal.appendChild(label);

    // Progress
    modal.appendChild(buildProgressBar(idx + 1, total));

    // Title
    var title = el('h2');
    title.textContent = step.title || 'Welcome';
    modal.appendChild(title);

    // Content
    var content = el('p');
    content.textContent = step.content || '';
    modal.appendChild(content);

    // Buttons
    var btnRow = el('div', '__flow-btn-row');

    if (idx > 0) {
      var prevBtn = el('button', '__flow-btn __flow-btn-secondary', 'Back');
      prevBtn.addEventListener('click', function () { goTo(idx - 1); });
      btnRow.appendChild(prevBtn);
    }

    var nextLabel = idx === total - 1 ? 'Finish' : 'Next';
    var nextBtn = el('button', '__flow-btn __flow-btn-primary', nextLabel);
    nextBtn.addEventListener('click', function () { completeStep(idx); });
    btnRow.appendChild(nextBtn);

    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });

    state.overlay = overlay;
    state.modal   = modal;
  }

  // ── Tooltip renderer ───────────────────────────────────────────────────────

  function showTooltip(step, idx, total) {
    removeAll();

    var selector = step.element_selector;
    var anchor   = selector ? document.querySelector(selector) : null;

    // Fallback: no matching element → render as modal
    if (!anchor) {
      showModal(step, idx, total);
      return;
    }

    // Highlight anchor
    var origOutline = anchor.style.outline;
    anchor.style.outline = '3px solid #6366f1';
    anchor.style.outlineOffset = '3px';

    var tip       = el('div', '__flow-tooltip ' + (step.position || 'top'));
    var titleEl   = el('strong');
    titleEl.textContent = step.title || '';
    var contentEl = el('p');
    contentEl.style.margin = '6px 0 10px';
    contentEl.textContent = step.content || '';
    var nextBtn   = el('button', '__flow-btn __flow-btn-primary', idx === total - 1 ? 'Finish' : 'Next →');
    nextBtn.style.fontSize = '12px';
    nextBtn.style.padding  = '6px 12px';
    nextBtn.addEventListener('click', function () {
      anchor.style.outline = origOutline;
      completeStep(idx);
    });

    tip.appendChild(titleEl);
    tip.appendChild(contentEl);
    tip.appendChild(nextBtn);
    document.body.appendChild(tip);

    // Position the tooltip relative to the anchor
    positionTooltip(tip, anchor, step.position || 'top');

    state.tooltip = tip;

    // Cleanup outline on dismiss
    var origDismiss = dismiss;
    dismiss = function () {
      anchor.style.outline = origOutline;
      dismiss = origDismiss;
      origDismiss();
    };
  }

  function positionTooltip(tip, anchor, position) {
    var rect = anchor.getBoundingClientRect();
    var scrollX = window.scrollX || 0;
    var scrollY = window.scrollY || 0;

    tip.style.position = 'absolute';

    switch (position) {
      case 'bottom':
        tip.style.top  = (rect.bottom + scrollY + 12) + 'px';
        tip.style.left = (rect.left + scrollX + rect.width / 2 - 140) + 'px';
        break;
      case 'left':
        tip.style.top  = (rect.top + scrollY + rect.height / 2 - 20) + 'px';
        tip.style.left = (rect.left + scrollX - 300) + 'px';
        break;
      case 'right':
        tip.style.top  = (rect.top + scrollY + rect.height / 2 - 20) + 'px';
        tip.style.left = (rect.right + scrollX + 12) + 'px';
        break;
      default: // top
        tip.style.top  = (rect.top + scrollY - tip.offsetHeight - 12) + 'px';
        tip.style.left = (rect.left + scrollX + rect.width / 2 - 140) + 'px';
        break;
    }
  }

  // ── Spotlight renderer ─────────────────────────────────────────────────────

  function showSpotlight(step, idx, total) {
    removeAll();

    var selector = step.element_selector;
    var anchor   = selector ? document.querySelector(selector) : null;

    if (!anchor) {
      showModal(step, idx, total);
      return;
    }

    var rect   = anchor.getBoundingClientRect();
    var pad    = 8;
    var ring   = el('div', '__flow-spotlight-ring');
    ring.style.top    = (rect.top - pad) + 'px';
    ring.style.left   = (rect.left - pad) + 'px';
    ring.style.width  = (rect.width + pad * 2) + 'px';
    ring.style.height = (rect.height + pad * 2) + 'px';

    var spotWrap = el('div', '__flow-spotlight');
    spotWrap.appendChild(ring);
    document.body.appendChild(spotWrap);
    state.spotlight = spotWrap;

    // Also show tooltip anchored below the ring
    showTooltip(step, idx, total);
  }

  // ── Checklist renderer ─────────────────────────────────────────────────────

  function showChecklist(step, idx, total) {
    // Parse action_config for checklist items if available
    var items = [];
    try {
      var cfg = step.action_config;
      if (typeof cfg === 'string') cfg = JSON.parse(cfg);
      items = (cfg && cfg.items) ? cfg.items : [];
    } catch (e) { /* ignore */ }

    removeAll();

    var overlay = el('div', '__flow-overlay');
    var modal   = el('div', '__flow-modal');

    var closeBtn = el('button', '__flow-close', '&times;');
    closeBtn.addEventListener('click', dismiss);
    modal.appendChild(closeBtn);

    var label = el('div', '__flow-step-label');
    label.textContent = 'Checklist · Step ' + (idx + 1) + ' of ' + total;
    modal.appendChild(label);
    modal.appendChild(buildProgressBar(idx + 1, total));

    var title = el('h2');
    title.textContent = step.title || 'Checklist';
    modal.appendChild(title);

    if (step.content) {
      var desc = el('p');
      desc.textContent = step.content;
      modal.appendChild(desc);
    }

    // Render checklist items
    var list = el('ul');
    list.style.cssText = 'list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:8px';
    var checkStates = items.map(function () { return false; });

    items.forEach(function (item, i) {
      var li  = el('li');
      li.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;background:#f8fafc;border-radius:6px;cursor:pointer';
      var cb  = el('input');
      cb.type = 'checkbox';
      cb.style.cssText = 'width:16px;height:16px;accent-color:#6366f1;cursor:pointer;flex-shrink:0';
      var text = el('span');
      text.textContent = typeof item === 'string' ? item : (item.label || item.text || JSON.stringify(item));
      text.style.fontSize = '14px';
      li.appendChild(cb);
      li.appendChild(text);
      cb.addEventListener('change', function () {
        checkStates[i] = cb.checked;
        text.style.textDecoration = cb.checked ? 'line-through' : 'none';
        text.style.color = cb.checked ? '#94a3b8' : '#1e293b';
      });
      list.appendChild(li);
    });

    if (items.length > 0) modal.appendChild(list);

    var btnRow = el('div', '__flow-btn-row');
    var nextBtn = el('button', '__flow-btn __flow-btn-primary', idx === total - 1 ? 'Finish' : 'Next');
    nextBtn.addEventListener('click', function () { completeStep(idx); });
    btnRow.appendChild(nextBtn);
    modal.appendChild(btnRow);

    overlay.appendChild(modal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
    document.body.appendChild(overlay);

    state.overlay = overlay;
    state.modal   = modal;
  }

  // ── Step dispatcher ────────────────────────────────────────────────────────

  function renderStep(idx) {
    if (idx >= state.steps.length) {
      finish();
      return;
    }

    var step  = state.steps[idx];
    var total = state.steps.length;

    switch ((step.step_type || 'modal').toLowerCase()) {
      case 'tooltip':   showTooltip(step, idx, total);   break;
      case 'spotlight': showSpotlight(step, idx, total); break;
      case 'checklist': showChecklist(step, idx, total); break;
      default:          showModal(step, idx, total);     break;
    }

    postEvent('step_view', step.id, { stepOrder: step.step_order });
  }

  function goTo(idx) {
    state.currentIndex = idx;
    renderStep(idx);
  }

  function completeStep(idx) {
    var step = state.steps[idx];
    postEvent('step_complete', step.id, { stepOrder: step.step_order });

    var next = idx + 1;
    if (next >= state.steps.length) {
      finish();
    } else {
      goTo(next);
    }
  }

  function dismiss() {
    var step = state.steps[state.currentIndex];
    if (step) postEvent('flow_dismissed', step.id, { atStep: state.currentIndex });
    removeAll();
  }

  function finish() {
    postEvent('flow_complete', null, { totalSteps: state.steps.length });
    removeAll();

    // Show a brief completion toast
    var toast = el('div');
    toast.style.cssText = [
      'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff',
      'padding:12px 20px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(16,185,129,.4)',
      'z-index:2147483647;animation:__flow-fadein .3s ease'
    ].join(';');
    toast.textContent = '✓ Onboarding complete!';

    var toastStyle = el('style');
    toastStyle.textContent = '@keyframes __flow-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}';
    document.head.appendChild(toastStyle);
    document.body.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3500);
  }

  // ── Initialisation ─────────────────────────────────────────────────────────

  function init() {
    injectStyles();

    apiFetch('/sdk/flow?siteKey=' + encodeURIComponent(SITE_KEY))
      .then(function (res) {
        if (!res.ok) throw new Error('No active flow for site key: ' + SITE_KEY);
        return res.json();
      })
      .then(function (data) {
        state.flow  = data.flow;
        state.steps = data.steps || [];

        if (state.steps.length === 0) {
          console.info('[FlowSDK] Flow loaded but has no steps.');
          return;
        }

        postEvent('flow_start', null, { flowId: state.flow.id });
        renderStep(0);
      })
      .catch(function (err) {
        console.warn('[FlowSDK] Could not load flow:', err.message);
      });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a minimal public API on window for host-page integration
  window.FlowSDK = {
    /** Programmatically jump to a step index */
    goTo: goTo,
    /** Dismiss the current flow UI */
    dismiss: dismiss,
    /** Reload the flow from scratch */
    restart: function () {
      removeAll();
      state.currentIndex = 0;
      init();
    },
    /** Get current state (read-only copy) */
    getState: function () {
      return {
        flowId: state.flow && state.flow.id,
        currentStep: state.currentIndex,
        totalSteps: state.steps.length
      };
    }
  };

}(window, document));
