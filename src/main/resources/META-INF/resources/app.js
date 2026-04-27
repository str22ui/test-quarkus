const API_URL = '/products';

// ── State ────────────────────────────────────────────────────────
let editingId = null; // null = add mode, number = edit mode

// ── Toast Notification ──────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = ''; }, 3000);
}

// ── Custom Confirm Modal ─────────────────────────────────────────
function showConfirm(onConfirm) {
  const overlay  = document.getElementById('modal-overlay');
  const btnOk    = document.getElementById('modal-confirm');
  const btnClose = document.getElementById('modal-cancel');

  overlay.classList.add('show');

  const cleanup = () => {
    overlay.classList.remove('show');
    btnOk.removeEventListener('click', handleOk);
    btnClose.removeEventListener('click', handleCancel);
    overlay.removeEventListener('click', handleOverlay);
  };

  const handleOk      = () => { cleanup(); onConfirm(); };
  const handleCancel  = () => cleanup();
  const handleOverlay = (e) => { if (e.target === overlay) cleanup(); };

  btnOk.addEventListener('click', handleOk);
  btnClose.addEventListener('click', handleCancel);
  overlay.addEventListener('click', handleOverlay);
}

// ── Format Rupiah ────────────────────────────────────────────────
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

// ── XSS Guard ────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Edit Mode Helpers ────────────────────────────────────────────
function enterEditMode(product) {
  editingId = product.id;

  document.getElementById('input-name').value  = product.name;
  document.getElementById('input-price').value = product.price;

  document.getElementById('form-title').textContent = '✏️ Edit Produk';
  document.getElementById('btn-submit').textContent  = 'Update';
  document.getElementById('btn-submit').classList.add('update-mode');
  document.getElementById('btn-cancel').style.display = 'inline-flex';
  document.getElementById('form-card').classList.add('edit-mode');

  // Highlight editing row
  document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('editing'));
  const row = document.getElementById(`row-${product.id}`);
  if (row) row.classList.add('editing');

  document.getElementById('input-name').focus();

  showToast(`✏️ Mengedit: ${product.name}`, 'info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;

  document.getElementById('input-name').value  = '';
  document.getElementById('input-price').value = '';

  document.getElementById('form-title').textContent = '➕ Tambah Produk';
  document.getElementById('btn-submit').textContent  = 'Tambah';
  document.getElementById('btn-submit').classList.remove('update-mode');
  document.getElementById('btn-cancel').style.display = 'none';
  document.getElementById('form-card').classList.remove('edit-mode');

  document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('editing'));
}

// ── Skeleton Loading ─────────────────────────────────────────────
function showSkeleton() {
  const tbody = document.getElementById('product-list');
  tbody.innerHTML = Array.from({ length: 3 }, () => `
    <tr class="skeleton">
      <td><div class="skel" style="width:36px"></div></td>
      <td><div class="skel" style="width:140px"></div></td>
      <td><div class="skel" style="width:90px"></div></td>
      <td><div class="skel" style="width:100px"></div></td>
    </tr>
  `).join('');
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('product-table').style.display = 'table';
}

// ── Load Products ────────────────────────────────────────────────
async function loadProducts() {
  showSkeleton();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Gagal memuat data');
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    document.getElementById('product-list').innerHTML = '';
    document.getElementById('empty-state').style.display = 'block';
    showToast('Gagal memuat produk: ' + err.message, 'error');
  }
}

// ── Render Rows ──────────────────────────────────────────────────
function renderProducts(products) {
  const tbody = document.getElementById('product-list');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('product-count');

  count.textContent = `${products.length} produk`;

  if (products.length === 0) {
    tbody.innerHTML = '';
    document.getElementById('product-table').style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  document.getElementById('product-table').style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = products.map(p => `
    <tr id="row-${p.id}" class="${editingId === p.id ? 'editing' : ''}">
      <td><code style="color:#8892b0;font-size:0.82rem">#${p.id}</code></td>
      <td>${escapeHtml(p.name)}</td>
      <td class="price">${formatRupiah(p.price)}</td>
      <td>
        <div class="action-cell">
          <button class="btn-edit"   onclick="startEdit(${p.id}, '${escapeHtml(p.name)}', ${p.price})">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑 Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Start Edit (from table button) ──────────────────────────────
function startEdit(id, name, price) {
  enterEditMode({ id, name, price });
}

// ── Submit (Add or Update) ───────────────────────────────────────
async function submitForm() {
  if (editingId !== null) {
    await updateProduct();
  } else {
    await addProduct();
  }
}

// ── Add Product ──────────────────────────────────────────────────
async function addProduct() {
  const nameInput  = document.getElementById('input-name');
  const priceInput = document.getElementById('input-price');
  const name  = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name) { showToast('Nama produk tidak boleh kosong.', 'error'); nameInput.focus(); return; }
  if (isNaN(price) || price < 0) { showToast('Harga harus berupa angka positif.', 'error'); priceInput.focus(); return; }

  const btn = document.getElementById('btn-submit');
  btn.textContent = 'Menyimpan…';
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan produk');
    nameInput.value = ''; priceInput.value = '';
    showToast(`✅ Produk "${name}" berhasil ditambahkan!`, 'success');
    await loadProducts();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.textContent = 'Tambah';
    btn.disabled = false;
  }
}

// ── Update Product ───────────────────────────────────────────────
async function updateProduct() {
  const nameInput  = document.getElementById('input-name');
  const priceInput = document.getElementById('input-price');
  const name  = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name) { showToast('Nama produk tidak boleh kosong.', 'error'); nameInput.focus(); return; }
  if (isNaN(price) || price < 0) { showToast('Harga harus berupa angka positif.', 'error'); priceInput.focus(); return; }

  const btn = document.getElementById('btn-submit');
  btn.textContent = 'Mengupdate…';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price }),
    });
    if (!res.ok) throw new Error('Gagal mengupdate produk');
    showToast(`✅ Produk "${name}" berhasil diupdate!`, 'success');
    cancelEdit();
    await loadProducts();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.textContent = 'Update';
    btn.disabled = false;
  }
}

// ── Delete Product ───────────────────────────────────────────────
async function deleteProduct(id) {
  showConfirm(async () => {
    // If currently editing this product, cancel edit mode
    if (editingId === id) cancelEdit();

    const row = document.getElementById(`row-${id}`);
    if (row) row.style.opacity = '0.4';

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        showToast(`🗑 Produk #${id} berhasil dihapus.`, 'success');
        await loadProducts();
      } else if (res.status === 404) {
        showToast(`Produk #${id} tidak ditemukan.`, 'error');
        if (row) row.style.opacity = '1';
      } else {
        throw new Error('Gagal menghapus produk');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      if (row) row.style.opacity = '1';
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('input-price').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitForm();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editingId !== null) cancelEdit();
  });
  loadProducts();
});
