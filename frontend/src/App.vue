<template>
  <div class="container">
    <!-- Header Aplikasi -->
    <header class="app-header">
      <h1>Asset Management</h1>
    </header>

    <!-- alertMessage Sukses / Error -->
    <div v-if="alertMessage" :class="['alert', alertType === 'danger' ? 'alert-danger' : 'alert-success']">
      {{ alertMessage }}
    </div>

    <!-- Form Input (Satu form untuk Tambah dan Edit Asset) -->
    <section class="card">
      <div class="card-header">
        <h2>{{ isEditing ? `Edit Asset #${form.asset_id}` : 'Tambah Asset Baru' }}</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nama Asset *</label>
              <input id="name" v-model="form.asset_name" type="text" class="form-control" placeholder="Contoh: Laptop" required />
            </div>
            <div class="form-group">
              <label for="stock">Jumlah Stok *</label>
              <input id="stock" v-model.number="form.stock_quantity" type="number" min="0" class="form-control" placeholder="0" required />
            </div>
            <div class="form-group">
              <label for="category">Kategori *</label>
              <select id="category" v-model="form.category" class="form-control" required>
                <option value="Consumable">Consumable</option>
                <option value="Non-Consumable">Non-Consumable</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button v-if="isEditing" type="button" class="btn btn-secondary" @click="resetForm">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Asset' : 'Tambah Asset') }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Tabel Daftar Asset -->
    <section class="card">
      <div class="card-header">
        <h2>Daftar Asset</h2>
        <span class="badge badge-info">Total: {{ assets.length }} asset</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-box">
        <div class="spinner"></div>
        <p>Memuat data dari database...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="assets.length === 0" class="empty-box">
        <p>Belum ada data asset. Silakan tambahkan melalui form di atas.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th>Nama Asset</th>
              <th style="width: 140px;">Jumlah Stok</th>
              <th style="width: 180px;">Kategori</th>
              <th style="width: 160px;" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in assets" :key="item.asset_id">
              <td>#{{ item.asset_id }}</td>
              <td><strong>{{ item.asset_name }}</strong></td>
              <td>{{ item.stock_quantity }}</td>
              <td>
                <span :class="['badge', item.category === 'Consumable' ? 'badge-consumable' : 'badge-non-consumable']">
                  {{ item.category }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline" @click="editAsset(item)">Edit</button>
                  <button class="btn btn-sm btn-danger" @click="deleteAsset(item)">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Konfigurasi endpoint REST API dari environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// State aplikasi
const assets = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

// State form (satu form untuk Tambah dan Edit)
const isEditing = ref(false);
const form = ref({ asset_id: null, asset_name: '', stock_quantity: 0, category: 'Consumable' });

// Menampilkan notifikasi pesan otomatis hilang
const showAlert = (message, type = 'success') => {
  alertMessage.value = message;
  alertType.value = type;
  setTimeout(() => (alertMessage.value = ''), 4000);
};

// Reset form ke nilai default
const resetForm = () => {
  form.value = { asset_id: null, asset_name: '', stock_quantity: 0, category: 'Consumable' };
  isEditing.value = false;
};

// 1. READ: Mengambil seluruh asset dari API NestJS
const loadAssets = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/assets`);
    if (!res.ok) throw new Error('Gagal memuat data asset.');
    assets.value = await res.json();
  } catch (error) {
    showAlert(error.message, 'danger');
  } finally {
    isLoading.value = false;
  }
};

// 2. CREATE & UPDATE: Menyimpan data baru atau perubahan
const handleSubmit = async () => {
  if (!form.value.asset_name.trim()) {
    showAlert('Nama asset wajib diisi!', 'danger');
    return;
  }
  if (form.value.stock_quantity < 0 || !Number.isInteger(Number(form.value.stock_quantity))) {
    showAlert('Jumlah stok harus bilangan bulat dan tidak boleh negatif!', 'danger');
    return;
  }

  isSubmitting.value = true;
  try {
    const isEdit = isEditing.value;
    const url = isEdit ? `${API_URL}/assets/${form.value.asset_id}` : `${API_URL}/assets`;
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      asset_name: form.value.asset_name.trim(),
      stock_quantity: Number(form.value.stock_quantity),
      category: form.value.category,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(msg || 'Gagal menyimpan asset.');
    }

    showAlert(isEdit ? 'Asset berhasil diperbarui!' : 'Asset baru berhasil ditambahkan!');
    resetForm();
    await loadAssets();
  } catch (error) {
    showAlert(error.message, 'danger');
  } finally {
    isSubmitting.value = false;
  }
};

// Mode Edit: mengisi data yang dipilih ke form
const editAsset = (asset) => {
  form.value = { ...asset };
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 3. DELETE: Menghapus data asset dengan konfirmasi native
const deleteAsset = async (asset) => {
  if (!window.confirm(`Apakah Anda yakin ingin menghapus "${asset.asset_name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/assets/${asset.asset_id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Gagal menghapus asset.');
    }

    showAlert(`Asset "${asset.asset_name}" berhasil dihapus!`);
    if (form.value.asset_id === asset.asset_id) resetForm();
    await loadAssets();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
};

onMounted(() => {
  loadAssets();
});
</script>
