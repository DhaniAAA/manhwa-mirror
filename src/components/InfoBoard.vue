<template>
    <div v-if="isVisible"
        class="relative my-12 rounded-2xl border border-border-color bg-bg-secondary p-6 transition-all duration-300 animate-fade-in-scale">
        <button
            class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Tutup informasi">
            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div class="flex items-start gap-4">
            <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>

            <div>
                <h3 class="mb-2 text-lg font-semibold text-text-primary">
                    Selamat Datang di Manhwa Mirror!
                </h3>
                <p class="text-sm leading-relaxed text-text-secondary">
                    Proyek ini adalah
                    <strong class="text-text-primary">sumber terbuka (open-source)</strong> dan
                    dibuat untuk tujuan pembelajaran. Data diambil dari sumber publik dan tidak
                    di-host di sini.
                </p>
                <p class="text-sm leading-relaxed text-text-secondary">
                    Chapter terbaru otomatis update setiap hari, jika ingin melihat sumber codenya
                    bisa di
                    <a href="https://github.com/DhaniAAA/Scrape" target="_blank" rel="noopener noreferrer"
                        class="font-medium text-accent-primary hover:underline">
                        GitHub
                    </a>
                </p>
                <p class="mt-2 text-sm leading-relaxed text-text-secondary">
                    Jangan ragu untuk berkontribusi atau melihat kode sumbernya di
                    <a href="https://github.com/DhaniAAA/manhwa-mirror" target="_blank" rel="noopener noreferrer"
                        class="font-medium text-accent-primary hover:underline">
                        GitHub </a>.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Kunci untuk menyimpan status di localStorage
const INFO_BOARD_DISMISSED_KEY = "info_board_dismissed_v1";

const isVisible = ref(false);

onMounted(() => {
    // Cek apakah pengguna sudah menutup papan ini sebelumnya
    const dismissed = localStorage.getItem(INFO_BOARD_DISMISSED_KEY);
    if (dismissed !== "true") {
        // Jika belum, tampilkan papan informasi
        isVisible.value = true;
    }
});

const closeBoard = () => {
    isVisible.value = false;
    // Simpan preferensi pengguna agar tidak muncul lagi
    try {
        localStorage.setItem(INFO_BOARD_DISMISSED_KEY, "true");
    } catch (error) {
        console.error("Gagal menyimpan preferensi info board:", error);
    }
};
</script>

<style scoped>
/* Animasi sederhana untuk memunculkan papan informasi */
@keyframes fade-in-scale {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.animate-fade-in-scale {
    animation: fade-in-scale 0.3s ease-out;
}
</style>
