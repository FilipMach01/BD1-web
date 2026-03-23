/* BD Kutná Hora - Shared functionality */
(function() {
  'use strict';

  // ===== SETTINGS BUTTON (dropdown with Nastavení) =====
  document.querySelectorAll('button').forEach(function(btn) {
    if (btn.textContent.trim().includes('Nastavení')) {
      // Create dropdown
      var dropdown = document.createElement('div');
      dropdown.className = 'hidden absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-[60]';
      dropdown.innerHTML = [
        '<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">Nastavení</div>',
        '<a href="index.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
        '<span class="material-symbols-outlined text-lg">home</span><span>Úvodní strana</span></a>',
        '<a href="admin.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
        '<span class="material-symbols-outlined text-lg">admin_panel_settings</span><span>Administrace</span></a>',
        '<div class="border-t border-gray-100 my-1"></div>',
        '<div class="px-4 py-2.5 text-xs text-gray-400">Verze portálu: 1.0</div>'
      ].join('');

      btn.style.position = 'relative';
      btn.parentElement.style.position = 'relative';
      btn.parentElement.appendChild(dropdown);

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', function() {
        dropdown.classList.add('hidden');
      });
    }
  });

  // ===== DOWNLOAD BUTTONS - show toast feedback =====
  document.querySelectorAll('[data-icon="download"], .material-symbols-outlined').forEach(function(icon) {
    if (icon.textContent.trim() === 'download') {
      var clickable = icon.closest('a, button, div[class*="cursor"], div[class*="group"]');
      if (clickable) {
        clickable.style.cursor = 'pointer';
        clickable.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          showToast('Soubor bude dostupný po připojení backendu.');
        });
      }
    }
  });

  // Also handle "Zobrazit archiv" and similar action buttons
  document.querySelectorAll('button').forEach(function(btn) {
    var text = btn.textContent.trim();
    if (text.includes('Zobrazit archiv') || text.includes('Navigovat')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        showToast('Tato funkce bude dostupná v další verzi.');
      });
    }
  });

  // ===== TOAST NOTIFICATION =====
  function showToast(message) {
    // Remove existing toast
    var existing = document.getElementById('bd-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'bd-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a5f7a;color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;opacity:0;transition:all 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;font-family:Public Sans,sans-serif;';
    toast.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">info</span>' + message;
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }

  // ===== BACK BUTTON (left side arrow) =====
  var backBtn = document.querySelector('button[title*="Zpět"]');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }

  // ===== CHEVRON_LEFT BUTTONS =====
  document.querySelectorAll('.material-symbols-outlined').forEach(function(icon) {
    if (icon.textContent.trim() === 'chevron_left') {
      var clickable = icon.closest('a, button, div');
      if (clickable) {
        clickable.style.cursor = 'pointer';
        clickable.addEventListener('click', function() {
          window.location.href = 'index.html';
        });
      }
    }
  });

  // ===== DYNAMIC YEAR in footers =====
  var year = new Date().getFullYear();
  document.querySelectorAll('footer').forEach(function(footer) {
    footer.innerHTML = footer.innerHTML.replace(/© 20\d{2}/g, '© ' + year);
  });

})();
