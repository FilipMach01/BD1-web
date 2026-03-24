/* BD Kutná Hora - Shared functionality v2.0 */
(function() {
  'use strict';

  // ===== ADMIN AUTH SYSTEM (localStorage) =====
  var ADMIN_CREDENTIALS = {
    email: 'admin@bdkutnahora.cz',
    password: 'admin123'
  };

  window.BDAdmin = {
    isLoggedIn: function() {
      return localStorage.getItem('bd-admin-logged') === 'true';
    },
    login: function(email, password) {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('bd-admin-logged', 'true');
        return true;
      }
      return false;
    },
    logout: function() {
      localStorage.removeItem('bd-admin-logged');
    }
  };

  // ===== BULLETIN BOARD DATA (localStorage) =====
  var DEFAULT_POSTS = [
    {
      id: '1',
      title: 'Odstávka vody - Strakoschova 123',
      text: 'Informujeme nájemníky o plánované odstávce teplé a studené vody z důvodu havarijní opravy hlavního uzávěru.',
      date: '15. března 2024',
      time: '08:00 - 16:00',
      type: 'urgent',
      icon: 'water_damage',
      attachment: 'Plán opravy a zákres.pdf',
      attachmentSize: '840 KB'
    },
    {
      id: '2',
      title: 'Modernizace osvětlení společných prostor',
      text: 'V průběhu příštího týdne dojde k výměně stávajících svítidel v chodbách za úsporné LED panely s pohybovými senzory. Prosíme o strpění zvýšeného pohybu řemeslníků.',
      date: '22. - 26. března 2024',
      time: '',
      type: 'info',
      icon: 'lightbulb',
      attachment: 'Harmonogram_praci.docx',
      attachmentSize: '1.2 MB'
    },
    {
      id: '3',
      title: 'Přistavení kontejneru na objemný odpad',
      text: 'Město Kutná Hora zajistilo přistavení velkoobjemového kontejneru pro jarní úklid sklepů a domácností. Kontejner bude umístěn u zadního vchodu do objektu.',
      date: '5. dubna 2024',
      time: '',
      type: 'notice',
      icon: 'delete_sweep',
      location: 'Strakoschova - parkoviště',
      attachment: 'Seznam_povolenych_odpadu.pdf',
      attachmentSize: '320 KB'
    }
  ];

  window.BDBulletin = {
    getPosts: function() {
      var stored = localStorage.getItem('bd-bulletin-posts');
      if (stored) {
        try { return JSON.parse(stored); } catch(e) { /* fallthrough */ }
      }
      localStorage.setItem('bd-bulletin-posts', JSON.stringify(DEFAULT_POSTS));
      return JSON.parse(JSON.stringify(DEFAULT_POSTS));
    },
    savePosts: function(posts) {
      localStorage.setItem('bd-bulletin-posts', JSON.stringify(posts));
    },
    addPost: function(post) {
      var posts = this.getPosts();
      post.id = Date.now().toString();
      posts.unshift(post);
      this.savePosts(posts);
      return post;
    },
    updatePost: function(id, data) {
      var posts = this.getPosts();
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) {
          for (var key in data) { posts[i][key] = data[key]; }
          this.savePosts(posts);
          return posts[i];
        }
      }
      return null;
    },
    deletePost: function(id) {
      var posts = this.getPosts().filter(function(p) { return p.id !== id; });
      this.savePosts(posts);
    },
    getPostCount: function() {
      return this.getPosts().length;
    }
  };

  // ===== SETTINGS DROPDOWN (subpages without explicit IDs) =====
  function initSettingsDropdown() {
    // Skip if index.html already has its own inline handler
    if (document.getElementById('settings-button') && document.getElementById('settings-menu')) {
      return;
    }

    var allButtons = document.querySelectorAll('button');
    var btn = null;
    allButtons.forEach(function(b) {
      var icon = b.querySelector('.material-symbols-outlined');
      if (icon && icon.textContent.trim() === 'settings' && b.textContent.indexOf('Nastavení') !== -1) {
        btn = b;
      }
    });

    if (!btn) return;

    var existingDd = btn.parentElement.querySelector('div.absolute');
    if (existingDd) existingDd.remove();

    var dropdown = document.createElement('div');
    dropdown.className = 'hidden absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-[60]';
    
    var adminLabel = window.BDAdmin.isLoggedIn() ? 'Administrace ✓' : 'Administrace';
    
    dropdown.innerHTML = [
      '<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">Nastavení</div>',
      '<a href="index.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
      '<span class="material-symbols-outlined text-lg">home</span><span>Úvodní strana</span></a>',
      '<a href="nastenka.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
      '<span class="material-symbols-outlined text-lg">dashboard</span><span>Nástěnka</span></a>',
      '<a href="kontakty.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
      '<span class="material-symbols-outlined text-lg">contact_phone</span><span>Kontakty</span></a>',
      '<a href="zakladni-info.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
      '<span class="material-symbols-outlined text-lg">info</span><span>Základní info</span></a>',
      '<div class="border-t border-gray-100 my-1"></div>',
      '<a href="admin.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline">',
      '<span class="material-symbols-outlined text-lg">admin_panel_settings</span><span>' + adminLabel + '</span></a>',
      '<div class="border-t border-gray-100 my-1"></div>',
      '<div class="px-4 py-2.5 text-xs text-gray-400">Verze portálu: 2.0</div>'
    ].join('');

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

  // ===== BACK BUTTONS =====
  function initBackButtons() {
    document.querySelectorAll('.material-symbols-outlined').forEach(function(icon) {
      var txt = icon.textContent.trim();
      if (txt === 'chevron_left' || txt === 'arrow_back') {
        var clickable = icon.closest('a, button');
        if (clickable && !clickable.hasAttribute('data-nav-init')) {
          clickable.setAttribute('data-nav-init', 'true');
          clickable.style.cursor = 'pointer';
          clickable.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
          });
        }
      }
    });
  }

  // ===== DOWNLOAD BUTTONS =====
  function initDownloadButtons() {
    document.querySelectorAll('.material-symbols-outlined').forEach(function(icon) {
      if (icon.textContent.trim() === 'download') {
        var clickable = icon.closest('a, button, div[class*="cursor"], div[class*="group"]');
        if (clickable && !clickable.hasAttribute('data-dl-init')) {
          clickable.setAttribute('data-dl-init', 'true');
          clickable.style.cursor = 'pointer';
          clickable.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showToast('Soubor bude dostupný po připojení backendu.');
          });
        }
      }
    });
  }

  // ===== MAP BUTTON =====
  function initActionButtons() {
    document.querySelectorAll('button').forEach(function(btn) {
      var text = btn.textContent.trim();
      if (text.indexOf('Zobrazit na mapě') !== -1) {
        if (!btn.hasAttribute('data-action-init')) {
          btn.setAttribute('data-action-init', 'true');
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://maps.google.com/?q=Strakoschova,+Kutná+Hora', '_blank');
          });
        }
      }
      if (text.indexOf('Zobrazit archiv') !== -1) {
        if (!btn.hasAttribute('data-action-init')) {
          btn.setAttribute('data-action-init', 'true');
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Tato funkce bude dostupná v další verzi.');
          });
        }
      }
    });
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(message, type) {
    var existing = document.getElementById('bd-toast');
    if (existing) existing.remove();

    var bg = type === 'error' ? '#ba1a1a' : type === 'success' ? '#1a7a3a' : '#1a5f7a';
    var iconName = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';

    var toast = document.createElement('div');
    toast.id = 'bd-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:' + bg + ';color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;opacity:0;transition:all 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;font-family:Public Sans,sans-serif;max-width:90vw;';
    toast.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">' + iconName + '</span>' + message;
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
  window.showToast = showToast;

  // ===== DYNAMIC YEAR =====
  function initFooterYear() {
    var year = new Date().getFullYear();
    document.querySelectorAll('footer').forEach(function(footer) {
      footer.innerHTML = footer.innerHTML.replace(/© 20\d{2}/g, '© ' + year);
    });
  }

  // ===== ADMIN INDICATOR =====
  function initAdminIndicator() {
    if (!window.BDAdmin.isLoggedIn()) return;
    var container = document.getElementById('settings-container');
    if (!container) {
      var nav = document.querySelector('nav');
      if (nav) container = nav.querySelector('.flex.items-center.gap-4');
    }
    if (!container) return;

    var indicator = document.createElement('div');
    indicator.className = 'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold';
    indicator.style.cssText = 'background:#dcfce7;color:#166534;cursor:pointer;';
    indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">admin_panel_settings</span><span class="hidden sm:inline">Admin</span>';
    indicator.title = 'Kliknutím se odhlásíte';
    indicator.addEventListener('click', function() {
      if (confirm('Odhlásit se z administrace?')) {
        window.BDAdmin.logout();
        showToast('Odhlášení proběhlo úspěšně.', 'success');
        setTimeout(function() { location.reload(); }, 500);
      }
    });
    container.insertBefore(indicator, container.firstChild);
  }

  // ===== UPDATE POST COUNT BADGE ON INDEX =====
  function initPostCountBadge() {
    var badge = document.querySelector('[data-post-count]');
    if (badge) {
      var count = window.BDBulletin.getPostCount();
      badge.textContent = count + ' ' + (count === 1 ? 'Příspěvek' : count < 5 ? 'Nové' : 'Příspěvků');
    }
  }

  // ===== INIT =====
  function initAll() {
    initSettingsDropdown();
    initBackButtons();
    initDownloadButtons();
    initActionButtons();
    initFooterYear();
    initAdminIndicator();
    initPostCountBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
