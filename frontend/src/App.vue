<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1>Asset Management</h1>
        <button class="btn btn-primary" @click="openCreateModal">
          <span class="icon">+</span> Tambah Asset
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Notification Alerts -->
      <div v-if="successMessage" class="alert alert-success">
        <span>{{ successMessage }}</span>
        <button class="alert-close" @click="successMessage = ''">&times;</button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        <span>{{ errorMessage }}</span>
        <button class="alert-close" @click="errorMessage = ''">&times;</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data asset...</p>
      </div>

      <!-- Asset Table Card -->
      <div v-else class="card">
        <div class="card-header">
          <h2>Daftar Asset</h2>
          <span class="badge badge-info">Total: {{ assets.length }} asset</span>
        </div>

        <!-- Empty State -->
        <div v-if="assets.length === 0" class="empty-state">
          <p class="empty-title">Belum ada asset</p>
          <p class="empty-subtitle">Database saat ini belum memiliki data asset. Klik tombol di bawah untuk menambahkan.</p>
          <button class="btn btn-primary" @click="openCreateModal">Tambah Asset Baru</button>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">ID</th>
                <th>Nama Asset</th>
                <th style="width: 140px;">Jumlah Stok</th>
                <th style="width: 180px;">Kategori</th>
                <th style="width: 180px; text-align: center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in assets" :key="asset.asset_id">
                <td class="font-mono">#{{ asset.asset_id }}</td>
                <td class="font-medium">{{ asset.asset_name }}</td>
                <td>{{ asset.stock_quantity.toLocaleString('id-ID') }}</td>
                <td>
                  <span
                    :class="[
                      'badge',
                      asset.category === 'Consumable' ? 'badge-consumable' : 'badge-non-consumable'
                    ]"
                  >
                    {{ asset.category }}
                  </span>
                </td>
                <td class="action-cell">
                  <button
                    class="btn btn-sm btn-outline"
                    @click="openEditModal(asset)"
                    title="Edit Asset"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="openDeleteModal(asset)"
                    title="Hapus Asset"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal Form (Tambah / Edit) -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Asset' : 'Tambah Asset Baru' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalError" class="alert alert-danger mb-4">
              {{ modalError }}
            </div>

            <div v-if="isEditing" class="form-group">
              <label for="asset_id">ID Asset</label>
              <input
                id="asset_id"
                type="text"
                class="form-control bg-disabled"
                :value="form.asset_id"
                disabled
              />
              <small class="form-hint">ID dibuat secara otomatis oleh database.</small>
            </div>

            <div class="form-group">
              <label for="asset_name">Nama Asset <span class="text-danger">*</span></label>
              <input
                id="asset_name"
                v-model.trim="form.asset_name"
                type="text"
                class="form-control"
                placeholder="Contoh: Pulpen Gel, Meja Kerja"
                required
              />
            </div>

            <div class="form-group">
              <label for="stock_quantity">Jumlah Stok <span class="text-danger">*</span></label>
              <input
                id="stock_quantity"
                v-model.number="form.stock_quantity"
                type="number"
                min="0"
                step="1"
                class="form-control"
                placeholder="0"
                required
              />
            </div>

            <div class="form-group">
              <label for="category">Kategori <span class="text-danger">*</span></label>
              <select id="category" v-model="form.category" class="form-control" required>
                <option value="Consumable">Consumable</option>
                <option value="Non-Consumable">Non-Consumable</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Asset' : 'Simpan Asset') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
      <div class="modal-dialog modal-sm">
        <div class="modal-header">
          <h3>Konfirmasi Hapus</h3>
          <button class="modal-close" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Apakah Anda yakin ingin menghapus asset
            <strong>"{{ assetToDelete?.asset_name }}"</strong> (ID: #{{ assetToDelete?.asset_id }})?
          </p>
          <p class="text-muted text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDeleteModal" :disabled="isDeleting">
            Batal
          </button>
          <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="isDeleting">
            {{ isDeleting ? 'Menghapus...' : 'Hapus Asset' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const assets = ref([]);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const modalError = ref('');

const form = ref({
  asset_id: null,
  asset_name: '',
  stock_quantity: 0,
  category: 'Consumable',
});

const showDeleteModal = ref(false);
const assetToDelete = ref(null);
const isDeleting = ref(false);

const showSuccess = (msg) => {
  successMessage.value = msg;
  setTimeout(() => {
    if (successMessage.value === msg) {
      successMessage.value = '';
    }
  }, 4000);
};

const fetchAssets = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const res = await fetch(`${API_BASE_URL}/assets`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data asset (Status: ${res.status})`);
    }
    const data = await res.json();
    assets.value = Array.isArray(data) ? data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat memuat data.';
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  modalError.value = '';
  form.value = {
    asset_id: null,
    asset_name: '',
    stock_quantity: 0,
    category: 'Consumable',
  };
  showModal.value = true;
};

const openEditModal = (asset) => {
  isEditing.value = true;
  modalError.value = '';
  form.value = {
    asset_id: asset.asset_id,
    asset_name: asset.asset_name,
    stock_quantity: asset.stock_quantity,
    category: asset.category,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = '';
};

const handleSubmit = async () => {
  modalError.value = '';

  if (!form.value.asset_name.trim()) {
    modalError.value = 'Nama asset wajib diisi.';
    return;
  }

  if (form.value.stock_quantity < 0 || !Number.isInteger(form.value.stock_quantity)) {
    modalError.value = 'Jumlah stok harus berupa bilangan bulat dan tidak boleh negatif.';
    return;
  }

  if (!['Consumable', 'Non-Consumable'].includes(form.value.category)) {
    modalError.value = 'Kategori hanya boleh Consumable atau Non-Consumable.';
    return;
  }

  isSubmitting.value = true;

  try {
    let res;
    if (isEditing.value) {
      res = await fetch(`${API_BASE_URL}/assets/${form.value.asset_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_name: form.value.asset_name,
          stock_quantity: form.value.stock_quantity,
          category: form.value.category,
        }),
      });
    } else {
      res = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_name: form.value.asset_name,
          stock_quantity: form.value.stock_quantity,
          category: form.value.category,
        }),
      });
    }

    const data = await res.json();

    if (!res.ok) {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(errMsg || 'Gagal menyimpan data asset.');
    }

    closeModal();
    showSuccess(isEditing.value ? 'Asset berhasil diperbarui!' : 'Asset baru berhasil ditambahkan!');
    await fetchAssets();
  } catch (err) {
    modalError.value = err.message || 'Terjadi kesalahan sistem.';
  } finally {
    isSubmitting.value = false;
  }
};

const openDeleteModal = (asset) => {
  assetToDelete.value = asset;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  assetToDelete.value = null;
};

const handleDelete = async () => {
  if (!assetToDelete.value) return;

  isDeleting.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/assets/${assetToDelete.value.asset_id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Gagal menghapus asset.');
    }

    closeDeleteModal();
    showSuccess('Asset berhasil dihapus!');
    await fetchAssets();
  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat menghapus asset.';
    closeDeleteModal();
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  fetchAssets();
});
</script>

<style>
/* CSS Reset & Variables */
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --danger: #dc2626;
  --danger-hover: #b91c1c;
  --success: #16a34a;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-900: #0f172a;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: #f1f5f9;
  color: var(--gray-900);
  line-height: 1.5;
}

/* Layout */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--gray-200);
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.main-content {
  max-width: 1100px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
  flex: 1;
}

/* Card */
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-200);
}

.card-header h2 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--gray-700);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--gray-200);
}

.btn-danger {
  background-color: var(--danger);
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--danger-hover);
}

.btn-outline {
  background-color: transparent;
  border-color: var(--gray-300);
  color: var(--gray-700);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--gray-100);
  border-color: var(--gray-400);
}

.btn-sm {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
}

.icon {
  margin-right: 0.35rem;
  font-weight: bold;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-info {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.badge-consumable {
  background-color: #dcfce7;
  color: #15803d;
}

.badge-non-consumable {
  background-color: #e0e7ff;
  color: #4338ca;
}

/* Table */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

.data-table th {
  background-color: var(--gray-50);
  color: var(--gray-600);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.data-table tr:hover {
  background-color: #fafbfc;
}

.font-mono {
  font-family: monospace;
  color: var(--gray-600);
}

.font-medium {
  font-weight: 600;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Alerts */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.alert-success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}

.empty-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 1rem;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

.modal-dialog.modal-sm {
  max-width: 400px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-600);
}

.modal-body {
  padding: 1.25rem 1.5rem;
}

.modal-footer {
  padding: 0.85rem 1.5rem;
  background-color: var(--gray-50);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--gray-200);
}

/* Form Controls */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: var(--gray-700);
}

.form-control {
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.bg-disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
}

.text-danger {
  color: var(--danger);
}

.text-muted {
  color: var(--gray-600);
}

.text-sm {
  font-size: 0.85rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
