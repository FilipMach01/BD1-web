/**
 * BD Kutná Hora – Strakoschova
 * Hlavní aplikační skript v2
 */
(function () {
    'use strict';

    // Detekce aktuální stránky přes URL
    var PAGE = (function () {
        var path = window.location.pathname.toLowerCase();
        var href = window.location.href.toLowerCase();
        if (path.endsWith('nastenka.html') || href.includes('nastenka')) return 'nastenka';
        if (path.endsWith('kontakty.html') || href.includes('kontakty')) return 'kontakty';
        if (path.endsWith('zakladni-info.html') || href.includes('zakladni-info')) return 'zakladni-info';
        if (path.endsWith('admin.html') || href.includes('admin')) return 'admin';
        return 'index';
    })();

    // =========================================================================
    // AUTH
    // =========================================================================
    var ADMIN_EMAIL = 'admin@bdkutnahora.cz';
    var ADMIN_PASS = 'admin123';

    var Auth = {
        isLoggedIn: function () {
            return localStorage.getItem('bd_admin_logged') === 'true';
        },
        login: function (email, password) {
            if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                localStorage.setItem('bd_admin_logged', 'true');
                localStorage.setItem('bd_admin_email', email);
                return true;
            }
            return false;
        },
        logout: function () {
            localStorage.removeItem('bd_admin_logged');
            localStorage.removeItem('bd_admin_email');
        },
        getEmail: function () {
            return localStorage.getItem('bd_admin_email') || '';
        }
    };

    // =========================================================================
    // PŘÍSPĚVKY
    // =========================================================================
    var DEFAULT_POSTS = [
        { id: 'post-1', title: 'Odstávka vody - Táborská 940/31', content: 'Informujeme nájemníky o plánované odstávce teplé a studené vody z důvodu havarijní opravy hlavního uzávěru.', date: '15. března 2025', time: '08:00 - 16:00', icon: 'water_damage', type: 'urgent', attachment: { name: 'Plán opravy a zákres.pdf', size: '840 KB' } },
        { id: 'post-2', title: 'Modernizace osvětlení společných prostor', content: 'V průběhu příštího týdne dojde k výměně stávajících svítidel v chodbách za úsporné LED panely s pohybovými senzory.', date: '22. - 26. března 2025', time: '', icon: 'lightbulb', type: 'info', attachment: { name: 'Harmonogram_praci.docx', size: '1.2 MB' } },
        { id: 'post-3', title: 'Přistavení kontejneru na objemný odpad', content: 'Město Kutná Hora zajistilo přistavení velkoobjemového kontejneru pro jarní úklid sklepů a domácností.', date: '5. dubna 2025', time: '', location: 'Táborská - parkoviště', icon: 'delete_sweep', type: 'notice', attachment: { name: 'Seznam_povolenych_odpadu.pdf', size: '320 KB' } }
    ];

    var Posts = {
        _key: 'bd_nastenka_posts',
        getAll: function () {
            var stored = localStorage.getItem(this._key);
            if (!stored) { this.saveAll(DEFAULT_POSTS); return JSON.parse(JSON.stringify(DEFAULT_POSTS)); }
            return JSON.parse(stored);
        },
        saveAll: function (posts) { localStorage.setItem(this._key, JSON.stringify(posts)); },
        add: function (post) { var posts = this.getAll(); post.id = 'post-' + Date.now(); posts.unshift(post); this.saveAll(posts); return post; },
        remove: function (id) { var posts = this.getAll().filter(function (p) { return p.id !== id; }); this.saveAll(posts); }
    };

    // =========================================================================
    // NAVIGACE
    // =========================================================================
    function initNavigation() {
        // Šipky zpět
        document.querySelectorAll('button.fixed.left-0, button[title="Zpět na hlavní stranu"]').forEach(function (btn) {
            btn.onclick = function () { window.location.href = 'index.html'; };
        });
        // Logo div (ne <a>)
        document.querySelectorAll('nav .text-xl.font-bold').forEach(function (el) {
            if (el.tagName === 'DIV') { el.style.cursor = 'pointer'; el.onclick = function () { window.location.href = 'index.html'; }; }
        });
        // Mapa tlačítka
        document.querySelectorAll('button').forEach(function (btn) {
            var txt = btn.textContent.trim();
            if (txt.includes('Zobrazit na mapě')) btn.onclick = function () { window.open('https://maps.google.com/?q=Táborská+940/31,+Praha+4-Nusle', '_blank'); };
            if (txt.includes('Navigovat')) btn.onclick = function () { window.open('https://maps.google.com/maps/dir/?api=1&destination=Táborská+940/31,+Praha+4-Nusle', '_blank'); };
        });
    }

    // =========================================================================
    // SETTINGS DROPDOWN
    // =========================================================================
    function initSettings() {
        if (PAGE === 'index') { enhanceIndexSettings(); return; }

        var settingsBtn = findSettingsButton();
        if (!settingsBtn) return;

        var menu = document.createElement('div');
        menu.style.cssText = 'display:none;position:fixed;width:220px;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.12);border:1px solid #e0e3e2;padding:8px 0;z-index:9999;';

        var is = 'display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;color:#181c1c;cursor:pointer;border:none;background:none;width:100%;text-align:left;text-decoration:none;';

        menu.innerHTML = '<div style="padding:8px 16px;font-size:10px;font-weight:700;color:#70787d;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e0e3e2;margin-bottom:4px;">Volby</div>' +
            '<button data-action="theme" style="' + is + '"><span class="material-symbols-outlined" style="font-size:20px;">dark_mode</span>Tmavý režim</button>' +
            '<a href="admin.html" style="' + is + '"><span class="material-symbols-outlined" style="font-size:20px;">admin_panel_settings</span>Administrace</a>' +
            (Auth.isLoggedIn() ? '<div style="border-top:1px solid #e0e3e2;margin:4px 0;"></div><button data-action="logout" style="' + is + 'color:#b91c1c;"><span class="material-symbols-outlined" style="font-size:20px;">logout</span>Odhlásit se</button>' : '');

        document.body.appendChild(menu);

        function positionMenu() {
            var rect = settingsBtn.getBoundingClientRect();
            menu.style.top = (rect.bottom + 8) + 'px';
            menu.style.left = Math.max(8, rect.right - 220) + 'px';
        }

        settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (menu.style.display === 'none') {
                positionMenu();
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
            }
        });
        document.addEventListener('click', function () { menu.style.display = 'none'; });
        menu.addEventListener('click', function (e) { e.stopPropagation(); });

        // Hover efekt
        menu.querySelectorAll('button, a').forEach(function (item) {
            item.addEventListener('mouseenter', function () { this.style.background = '#f1f4f3'; });
            item.addEventListener('mouseleave', function () { this.style.background = 'none'; });
        });

        var themeBtn = menu.querySelector('[data-action="theme"]');
        if (themeBtn) themeBtn.addEventListener('click', function () { document.documentElement.classList.toggle('dark'); });

        var logoutBtn = menu.querySelector('[data-action="logout"]');
        if (logoutBtn) logoutBtn.addEventListener('click', function () { Auth.logout(); window.location.reload(); });
    }

    function findSettingsButton() {
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
            var icons = btns[i].querySelectorAll('.material-symbols-outlined');
            for (var j = 0; j < icons.length; j++) {
                if (icons[j].textContent.trim() === 'settings') return btns[i];
            }
        }
        return null;
    }

    function enhanceIndexSettings() {
        var menu = document.getElementById('settings-menu');
        if (!menu || !Auth.isLoggedIn()) return;
        var item = document.createElement('button');
        item.className = 'w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors';
        item.innerHTML = '<span class="material-symbols-outlined text-lg">logout</span><span>Odhlásit se</span>';
        item.addEventListener('click', function () { Auth.logout(); window.location.reload(); });
        menu.appendChild(item);
    }

    // =========================================================================
    // ADMIN PAGE
    // =========================================================================
    function initAdminPage() {
        if (PAGE !== 'admin') return;

        var form = document.querySelector('form');
        if (!form) return;

        if (Auth.isLoggedIn()) { showAdminDashboard(); return; }

        var emailInput = document.getElementById('email');
        var passInput = document.getElementById('password');
        if (!emailInput || !passInput) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (Auth.login(emailInput.value.trim(), passInput.value)) {
                window.location.href = 'nastenka.html';
            } else {
                showLoginError(form);
            }
        });
    }

    function showLoginError(form) {
        var ex = form.querySelector('.login-error');
        if (ex) ex.remove();
        var d = document.createElement('div');
        d.className = 'login-error';
        d.style.cssText = 'background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:12px 16px;border-radius:8px;font-size:14px;display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        d.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">error</span><span>Nesprávný e-mail nebo heslo.</span>';
        form.insertBefore(d, form.firstChild);
    }

    function showAdminDashboard() {
        var main = document.querySelector('main');
        if (!main) return;
        main.innerHTML =
            '<div style="text-align:center;margin-bottom:2.5rem;">' +
            '<div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:#dcfce7;border-radius:12px;margin-bottom:1.5rem;">' +
            '<span class="material-symbols-outlined" style="color:#15803d;font-size:2rem;font-variation-settings:\'FILL\' 1;">check_circle</span></div>' +
            '<h1 style="font-size:1.875rem;font-weight:700;color:#111;margin-bottom:0.5rem;">Přihlášen jako admin</h1>' +
            '<p style="color:#6b7280;font-size:0.875rem;">' + esc(Auth.getEmail()) + '</p></div>' +
            '<div style="display:flex;flex-direction:column;gap:1rem;max-width:24rem;margin:0 auto;">' +
            '<a href="nastenka.html" style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1rem 1.5rem;background:#00475e;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;">' +
            '<span class="material-symbols-outlined">dashboard</span>Přejít na nástěnku</a>' +
            '<button id="adm-dash-logout" style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1rem 1.5rem;background:#fef2f2;color:#b91c1c;font-weight:700;border-radius:8px;border:none;cursor:pointer;">' +
            '<span class="material-symbols-outlined">logout</span>Odhlásit se</button></div>';
        document.getElementById('adm-dash-logout').addEventListener('click', function () { Auth.logout(); window.location.reload(); });
    }

    // =========================================================================
    // NÁSTĚNKA
    // =========================================================================
    function initNastenkaPage() {
        if (PAGE !== 'nastenka') return;

        var feed = document.getElementById('post-feed');
        if (!feed) return;

        var isAdmin = Auth.isLoggedIn();

        if (isAdmin) {
            injectAdminBar(feed);
        } else {
            injectAdminLink();
        }

        renderPosts(feed, isAdmin);
    }

    function injectAdminLink() {
        var header = document.querySelector('header');
        if (!header || header.querySelector('.admin-login-link')) return;
        var a = document.createElement('a');
        a.href = 'admin.html';
        a.className = 'admin-login-link';
        a.style.cssText = 'display:inline-flex;align-items:center;gap:8px;margin-top:1rem;padding:10px 20px;background:#00475e;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;';
        a.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">lock</span>Přihlášení do administrace';
        header.appendChild(a);
    }

    function injectAdminBar(feed) {
        if (feed.querySelector('.admin-toolbar')) return;
        var bar = document.createElement('div');
        bar.className = 'admin-toolbar';
        bar.style.cssText = 'background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1.5rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;';
        bar.innerHTML =
            '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span class="material-symbols-outlined" style="color:#15803d;font-size:1.5rem;font-variation-settings:\'FILL\' 1;">admin_panel_settings</span>' +
            '<div><div style="font-weight:700;color:#14532d;font-size:14px;">Administrátorský režim</div>' +
            '<div style="color:#15803d;font-size:12px;">Přihlášen jako ' + esc(Auth.getEmail()) + '</div></div></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button id="btn-add-post" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#00475e;color:#fff;border-radius:8px;font-weight:700;font-size:14px;border:none;cursor:pointer;">' +
            '<span class="material-symbols-outlined" style="font-size:18px;">add_circle</span>Nový příspěvek</button>' +
            '<button id="btn-admin-logout" style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:#fff;border:1px solid #fecaca;color:#b91c1c;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;">' +
            '<span class="material-symbols-outlined" style="font-size:18px;">logout</span>Odhlásit</button></div>';
        feed.insertBefore(bar, feed.firstChild);
        document.getElementById('btn-add-post').addEventListener('click', openPostModal);
        document.getElementById('btn-admin-logout').addEventListener('click', function () { Auth.logout(); window.location.reload(); });
    }

    function renderPosts(container, isAdmin) {
        container.querySelectorAll('section').forEach(function (s) { s.remove(); });
        var em = container.querySelector('.empty-state');
        if (em) em.remove();

        var posts = Posts.getAll();
        posts.forEach(function (post) { container.appendChild(createPostEl(post, isAdmin)); });

        if (posts.length === 0) {
            var e = document.createElement('div');
            e.className = 'empty-state';
            e.style.cssText = 'text-align:center;padding:4rem 0;color:#9ca3af;';
            e.innerHTML = '<span class="material-symbols-outlined" style="font-size:3.5rem;display:block;margin-bottom:1rem;">inbox</span><p style="font-size:1.125rem;font-weight:500;">Zatím žádné příspěvky</p>';
            container.appendChild(e);
        }
    }

    function createPostEl(post, isAdmin) {
        var c = { urgent: { b: '#ef4444', ib: '#fef2f2', ic: '#dc2626', l: 'Důležité', lb: '#fef2f2', lc: '#991b1b' }, info: { b: '#1a5f7a', ib: '#eff6ff', ic: '#1a5f7a', l: 'Informace', lb: '#eff6ff', lc: '#1e40af' }, notice: { b: '#415d9b', ib: '#eef2ff', ic: '#415d9b', l: 'Oznámení', lb: '#eef2ff', lc: '#3730a3' } }[post.type] || { b: '#1a5f7a', ib: '#eff6ff', ic: '#1a5f7a', l: 'Info', lb: '#eff6ff', lc: '#1e40af' };

        var s = document.createElement('section');
        s.style.cssText = 'background:#fff;padding:2rem;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,0.05);border-left:4px solid ' + c.b + ';position:relative;overflow:hidden;';

        var meta = '';
        if (post.date) meta += '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="material-symbols-outlined" style="font-size:14px;">calendar_today</span>' + esc(post.date) + '</span>';
        if (post.time) meta += '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="material-symbols-outlined" style="font-size:14px;">schedule</span>' + esc(post.time) + '</span>';
        if (post.location) meta += '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="material-symbols-outlined" style="font-size:14px;">location_on</span>' + esc(post.location) + '</span>';

        var att = '';
        if (post.attachment && post.attachment.name) {
            var pdf = post.attachment.name.endsWith('.pdf');
            att = '<div style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:8px;background:#f9fafb;border:1px solid #e5e7eb;max-width:25rem;cursor:pointer;margin-top:0.5rem;"><div style="background:#fff;padding:8px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);color:' + (pdf ? '#dc2626' : '#1a5f7a') + ';"><span class="material-symbols-outlined">' + (pdf ? 'picture_as_pdf' : 'description') + '</span></div><div style="flex:1;"><div style="font-weight:700;font-size:14px;color:#111;">' + esc(post.attachment.name) + '</div><div style="font-size:10px;color:#6b7280;">' + esc(post.attachment.size) + '</div></div><span class="material-symbols-outlined" style="color:#9ca3af;">download</span></div>';
        }

        var del = isAdmin ? '<button class="btn-del" data-id="' + post.id + '" style="position:absolute;top:12px;right:12px;padding:8px;background:#fef2f2;color:#dc2626;border-radius:8px;border:none;cursor:pointer;opacity:0;transition:opacity 0.2s;"><span class="material-symbols-outlined">delete</span></button>' : '';

        s.innerHTML = del +
            '<div style="position:absolute;top:12px;' + (isAdmin ? 'right:56px' : 'right:12px') + ';"><span style="background:' + c.lb + ';color:' + c.lc + ';padding:4px 12px;border-radius:9999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">' + c.l + '</span></div>' +
            '<div style="display:flex;align-items:flex-start;gap:1.5rem;margin-top:12px;flex-wrap:wrap;">' +
            '<div style="background:' + c.ib + ';padding:1rem;border-radius:9999px;flex-shrink:0;"><span class="material-symbols-outlined" style="color:' + c.ic + ';font-size:1.75rem;">' + (post.icon || 'info') + '</span></div>' +
            '<div style="flex:1;min-width:200px;"><h2 style="font-size:1.25rem;font-weight:700;color:#111;margin-bottom:0.5rem;">' + esc(post.title) + '</h2><p style="color:#4b5563;margin-bottom:1rem;">' + esc(post.content) + '</p><div style="display:flex;flex-wrap:wrap;gap:1.5rem;font-size:14px;font-weight:500;margin-bottom:1rem;">' + meta + '</div>' + att + '</div></div>';

        s.addEventListener('mouseenter', function () { var b = s.querySelector('.btn-del'); if (b) b.style.opacity = '1'; });
        s.addEventListener('mouseleave', function () { var b = s.querySelector('.btn-del'); if (b) b.style.opacity = '0'; });

        var db = s.querySelector('.btn-del');
        if (db) {
            db.addEventListener('click', function () {
                if (!confirm('Opravdu chcete smazat tento příspěvek?')) return;
                Posts.remove(post.id);
                s.style.transition = 'all 0.3s ease';
                s.style.opacity = '0';
                s.style.transform = 'translateX(-20px)';
                setTimeout(function () {
                    s.remove();
                    var f = document.getElementById('post-feed');
                    if (f && Posts.getAll().length === 0) renderPosts(f, true);
                }, 300);
            });
        }
        return s;
    }

    // =========================================================================
    // MODAL – nový příspěvek
    // =========================================================================
    function openPostModal() {
        var ex = document.getElementById('post-modal-overlay');
        if (ex) ex.remove();

        var ov = document.createElement('div');
        ov.id = 'post-modal-overlay';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;';

        var icons = ['info', 'warning', 'water_damage', 'lightbulb', 'delete_sweep', 'construction', 'campaign', 'event', 'engineering', 'local_parking', 'electric_bolt', 'thermostat'];
        var ib = icons.map(function (ic, i) {
            return '<button type="button" class="ip" data-icon="' + ic + '" style="padding:10px;border-radius:8px;border:1px solid ' + (i === 0 ? '#00475e' : '#e5e7eb') + ';background:' + (i === 0 ? '#eff6ff' : 'none') + ';cursor:pointer;display:inline-flex;"><span class="material-symbols-outlined">' + ic + '</span></button>';
        }).join('');

        var inp = 'width:100%;padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:16px;box-sizing:border-box;font-family:inherit;';
        var lbl = 'display:block;font-size:14px;font-weight:600;color:#4b5563;margin-bottom:6px;';

        ov.innerHTML =
            '<div style="background:#fff;border-radius:16px;box-shadow:0 25px 50px rgba(0,0,0,0.15);width:100%;max-width:28rem;max-height:90vh;overflow-y:auto;">' +
            '<div style="padding:1.5rem;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;"><h2 style="font-size:1.25rem;font-weight:700;color:#111;display:flex;align-items:center;gap:8px;"><span class="material-symbols-outlined" style="color:#00475e;">edit_note</span>Nový příspěvek</h2><button id="mc" style="padding:8px;border-radius:8px;border:none;cursor:pointer;background:none;"><span class="material-symbols-outlined">close</span></button></div>' +
            '<div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">' +
            '<div><label style="' + lbl + '">Nadpis *</label><input type="text" id="pt" placeholder="Název oznámení" style="' + inp + '"></div>' +
            '<div><label style="' + lbl + '">Obsah *</label><textarea id="pc" rows="4" placeholder="Text oznámení..." style="' + inp + 'resize:none;"></textarea></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;"><div><label style="' + lbl + '">Datum</label><input type="text" id="pd" placeholder="1. dubna 2025" style="' + inp + 'font-size:14px;"></div><div><label style="' + lbl + '">Čas</label><input type="text" id="ptm" placeholder="08:00 - 16:00" style="' + inp + 'font-size:14px;"></div></div>' +
            '<div><label style="' + lbl + '">Typ</label><select id="pty" style="' + inp + 'font-size:14px;"><option value="info">Informace</option><option value="urgent">Důležité</option><option value="notice">Oznámení</option></select></div>' +
            '<div><label style="' + lbl + '">Ikona</label><div style="display:flex;flex-wrap:wrap;gap:6px;" id="ipk">' + ib + '</div><input type="hidden" id="pi" value="info"></div></div>' +
            '<div style="padding:1.5rem;border-top:1px solid #f3f4f6;display:flex;gap:12px;justify-content:flex-end;">' +
            '<button id="mca" style="padding:10px 20px;background:#f3f4f6;color:#374151;font-weight:700;border-radius:8px;border:none;cursor:pointer;font-size:14px;">Zrušit</button>' +
            '<button id="ms" style="display:flex;align-items:center;gap:8px;padding:10px 24px;background:#00475e;color:#fff;font-weight:700;border-radius:8px;border:none;cursor:pointer;font-size:14px;"><span class="material-symbols-outlined" style="font-size:18px;">publish</span>Publikovat</button></div></div>';

        document.body.appendChild(ov);

        var iconIn = ov.querySelector('#pi');
        ov.querySelectorAll('.ip').forEach(function (b) {
            b.addEventListener('click', function () {
                ov.querySelectorAll('.ip').forEach(function (x) { x.style.borderColor = '#e5e7eb'; x.style.background = 'none'; });
                b.style.borderColor = '#00475e'; b.style.background = '#eff6ff';
                iconIn.value = b.dataset.icon;
            });
        });

        var close = function () { ov.remove(); };
        ov.querySelector('#mc').addEventListener('click', close);
        ov.querySelector('#mca').addEventListener('click', close);
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

        ov.querySelector('#ms').addEventListener('click', function () {
            var t = ov.querySelector('#pt').value.trim();
            var co = ov.querySelector('#pc').value.trim();
            if (!t || !co) { alert('Vyplňte nadpis a obsah.'); return; }
            Posts.add({ title: t, content: co, date: ov.querySelector('#pd').value.trim() || new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }), time: ov.querySelector('#ptm').value.trim(), icon: iconIn.value, type: ov.querySelector('#pty').value, attachment: null });
            close();
            var f = document.getElementById('post-feed');
            if (f) renderPosts(f, true);
        });
    }

    // =========================================================================
    // MOBILNÍ MENU
    // =========================================================================
    function initMobileMenu() {
        var nav = document.querySelector('nav');
        if (!nav) return;

        var hamburger = document.createElement('button');
        hamburger.style.cssText = 'display:none;padding:8px;border-radius:8px;border:none;cursor:pointer;background:none;';
        hamburger.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.5rem;">menu</span>';

        var areas = nav.querySelectorAll('div');
        var lastDiv = areas[areas.length - 1];
        if (lastDiv) lastDiv.insertBefore(hamburger, lastDiv.firstChild);

        var mq = window.matchMedia('(max-width: 767px)');
        function toggle(e) { hamburger.style.display = e.matches ? 'block' : 'none'; }
        mq.addEventListener('change', toggle); toggle(mq);

        var overlay = document.createElement('div');
        overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:90;';
        var drawer = document.createElement('div');
        drawer.style.cssText = 'background:#fff;width:280px;height:100%;box-shadow:0 25px 50px rgba(0,0,0,0.15);padding:1.5rem;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform 0.3s ease;';

        var ls = Auth.isLoggedIn() ? '<div style="margin-top:auto;padding-top:1.5rem;border-top:1px solid #f3f4f6;"><div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Přihlášen jako</div><div style="font-size:14px;font-weight:700;color:#111;margin-bottom:12px;">' + esc(Auth.getEmail()) + '</div><button id="ml" style="width:100%;display:flex;align-items:center;gap:8px;padding:10px 16px;background:#fef2f2;color:#b91c1c;border-radius:8px;font-weight:700;font-size:14px;border:none;cursor:pointer;"><span class="material-symbols-outlined" style="font-size:18px;">logout</span>Odhlásit se</button></div>' : '';

        var ls2 = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:8px;color:#111;text-decoration:none;font-size:15px;';
        drawer.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;"><a href="index.html" style="font-size:1.25rem;font-weight:700;color:#00475e;text-decoration:none;">BD Kutná Hora</a><button id="mclose" style="padding:8px;border-radius:8px;border:none;cursor:pointer;background:none;"><span class="material-symbols-outlined">close</span></button></div>' +
            '<nav style="display:flex;flex-direction:column;gap:4px;">' +
            '<a href="index.html" style="' + ls2 + '"><span class="material-symbols-outlined">home</span>Domů</a>' +
            '<a href="nastenka.html" style="' + ls2 + '"><span class="material-symbols-outlined">dashboard</span>Nástěnka</a>' +
            '<a href="zakladni-info.html" style="' + ls2 + '"><span class="material-symbols-outlined">info</span>Základní info</a>' +
            '<a href="kontakty.html" style="' + ls2 + '"><span class="material-symbols-outlined">contact_phone</span>Kontakty</a>' +
            '<a href="admin.html" style="' + ls2 + '"><span class="material-symbols-outlined">admin_panel_settings</span>Administrace</a></nav>' + ls;

        overlay.appendChild(drawer);
        document.body.appendChild(overlay);

        hamburger.addEventListener('click', function () { overlay.style.display = 'block'; requestAnimationFrame(function () { drawer.style.transform = 'translateX(0)'; }); });
        var cd = function () { drawer.style.transform = 'translateX(-100%)'; setTimeout(function () { overlay.style.display = 'none'; }, 300); };
        var cb = drawer.querySelector('#mclose');
        if (cb) cb.addEventListener('click', cd);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) cd(); });
        var mlb = drawer.querySelector('#ml');
        if (mlb) mlb.addEventListener('click', function () { Auth.logout(); window.location.reload(); });
    }

    // =========================================================================
    // HELPER
    // =========================================================================
    function esc(t) { if (!t) return ''; var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    // =========================================================================
    // INIT
    // =========================================================================
    function init() { initNavigation(); initSettings(); initAdminPage(); initNastenkaPage(); initMobileMenu(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
