(async function () {
  const url = `./data/games.json?ts=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  const rows = Array.isArray(data.rows) ? data.rows : [];

  const qEl = document.getElementById('q');
  const pfEl = document.getElementById('platform');
  const sortEl = document.getElementById('sort');
  const grid = document.getElementById('grid');

  // プラットフォーム選択肢を生成
  const platforms = [...new Set(rows.map(r => r.platform).filter(Boolean))].sort();
  for (const p of platforms) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    pfEl.appendChild(opt);
  }

  function render(list) {
    grid.innerHTML = '';
    for (const r of list) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="title">${escape(r.title)}</div>
        <div class="meta">
          <span class="badge">${escape(r.platform || '')}</span>
          ${r.genre ? `<span class="badge">${escape(r.genre)}</span>` : ''}
          ${r.ownedStatus ? `<span class="badge">${escape(r.ownedStatus)}</span>` : ''}
          ${r.condition ? `<span class="badge">${escape(r.condition)}</span>` : ''}
        </div>
        <div class="meta">
          ${r.acquiredAt ? `入手日: ${escape(r.acquiredAt)} ` : ''}
          ${Number.isFinite(r.priceJpy) ? `価格: ¥${r.priceJpy.toLocaleString()}` : ''}
        </div>
        ${Array.isArray(r.tags) && r.tags.length ? `<div class="meta">タグ: ${r.tags.map(t => `<span class="badge">${escape(t)}</span>`).join('')}</div>` : ''}
        ${r.notes ? `<div>${escape(r.notes)}</div>` : ''}
      `;
      grid.appendChild(card);
    }
  }

  function apply() {
    const q = (qEl.value || '').trim().toLowerCase();
    const pf = pfEl.value;
    const sortKey = sortEl.value;

    let list = rows.filter(r => {
      if (pf && r.platform !== pf) return false;
      if (!q) return true;
      const hay = [
        r.title || '',
        r.genre || '',
        r.ownedStatus || '',
        r.condition || '',
        r.notes || '',
        ...(Array.isArray(r.tags) ? r.tags : [])
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });

    const dir = sortKey.startsWith('-') ? -1 : 1;
    const key = sortKey.replace(/^-/, '');
    list.sort((a, b) => {
      const va = a[key], vb = b[key];
      if (key === 'title') return String(va || '').localeCompare(String(vb || ''), 'ja') * dir;
      if (key === 'acquiredAt') return String(va || '').localeCompare(String(vb || '')) * dir;
      if (key === 'priceJpy') return ((va ?? Infinity) - (vb ?? Infinity)) * dir;
      return 0;
    });

    render(list);
  }

  function escape(s){ return String(s).replace(/[&<>"'`=\/]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','=':'&#61;','/':'&#47;'}[c])); }

  qEl.addEventListener('input', apply);
  pfEl.addEventListener('change', apply);
  sortEl.addEventListener('change', apply);

  apply();
})();
