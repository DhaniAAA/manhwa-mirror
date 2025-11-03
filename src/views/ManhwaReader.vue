<template>
  <div class="fixed inset-0 z-[9999] flex flex-col" :class="isFullscreen ? 'bg-black' : 'bg-bg-primary'">
    <!-- Reader Header -->
    <div
      class="fixed top-0 left-0 right-0 z-[10000] bg-bg-primary/95 backdrop-blur-xl border-b border-border-color transition-transform duration-300"
      :class="hideControls ? '-translate-y-full' : 'translate-y-0'">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-[60px] gap-8">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent text-text-secondary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
            @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Kembali</span>
          </button>

          <div class="flex-1 text-center hidden md:block">
            <h2 class="text-base font-semibold text-text-primary mb-1">
              {{ manhwaTitle }}
            </h2>
            <span class="text-[13px] text-text-muted">Chapter {{ currentChapter }}</span>
          </div>

          <div class="flex gap-2">
            <button
              class="w-10 h-10 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
              @click="toggleFullscreen">
              <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </button>
            <button
              class="w-10 h-10 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
              @click="toggleSettings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 1v6m0 6v6m5.66-15.66l-4.24 4.24m-2.83 2.83l-4.24 4.24m12.73 0l-4.24-4.24m-2.83-2.83L1.34 1.34" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Content -->
    <div class="flex-1 overflow-y-auto pt-20 pb-24 px-4 flex justify-center" ref="contentContainer">
      <div class="w-full mx-auto" :style="{ maxWidth: `${pageWidth}px` }">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] text-text-secondary gap-4">
          <div class="w-12 h-12 border-4 border-bg-tertiary border-t-accent-primary rounded-full animate-spin"></div>
          <p>Memuat chapter...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error"
          class="flex flex-col items-center justify-center min-h-[400px] text-text-secondary gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="text-base font-medium text-text-primary">{{ error }}</p>
          <div v-if="error.includes('CORS') || error.includes('fetch')"
            class="mt-4 p-6 bg-bg-secondary border border-border-color rounded-xl max-w-[500px] text-left">
            <p class="text-[15px] font-semibold text-accent-primary mb-3">
              💡 Possible CORS Issue
            </p>
            <p class="text-sm text-text-secondary leading-relaxed mb-2">
              Please check Supabase Storage bucket CORS configuration.
            </p>
            <p class="text-sm text-text-secondary leading-relaxed">
              Make sure the bucket is public or has proper CORS settings.
            </p>
          </div>
        </div>

        <!-- Images -->
        <div v-if="!loading && !error" v-for="(image, index) in chapterImages" :key="index"
          class="w-full relative m-0 p-0 leading-[0] animate-[fadeIn_0.3s_ease-out]"
          :style="{ marginBottom: `${pageGap}px` }">
          <!-- Loading skeleton -->
          <div v-if="!loadedImages.has(index)"
            class="w-full aspect-[2/3] bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-border-color">
            <div
              class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]">
            </div>
            <span class="text-sm text-text-muted z-10">Loading page {{ index + 1 }}...</span>
          </div>

          <img :src="image" :alt="`Page ${index + 1}`"
            class="w-full h-auto block rounded-none shadow-none m-0 p-0 transition-opacity duration-300 cursor-pointer"
            :class="loadedImages.has(index) ? 'opacity-100' : 'opacity-0'" :loading="index < 3 ? 'eager' : 'lazy'"
            :fetchpriority="index < 3 ? 'high' : 'auto'" @error="handleImageError(index)" @load="handleImageLoad(index)"
            @click="toggleControls" />
        </div>

        <!-- Chapter Comments Section -->
        <div v-if="!loading && !error" class="w-full max-w-4xl mx-auto mt-12 mb-8">
          <div class="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden">
            <div class="p-6 border-b border-border-color bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-text-primary">
                    Komentar Chapter {{ currentChapter }}
                  </h3>
                  <p class="text-sm text-text-secondary">
                    Diskusikan chapter ini dengan pembaca lain
                  </p>
                </div>
              </div>
            </div>

            <div class="p-6">
              <CommentSection :manhwa-slug="manhwaSlug" :chapter-slug="`chapter-${currentChapter}`" />
            </div>
          </div>
        </div>

        <!-- Recommendations Section -->
        <div v-if="!loading && !error && recommendations.length > 0" class="w-full max-w-4xl mx-auto mt-8 mb-8">
          
          <div class="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden">
            <div class="p-6 border-b border-border-color bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-text-primary">
                    Rekomendasi Untuk Anda
                  </h3>
                  <p class="text-sm text-text-secondary">
                    Manhwa serupa yang mungkin Anda suka
                  </p>
                </div>
              </div>
            </div>

            <div class="p-6">
              
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div v-for="manhwa in recommendations" :key="manhwa.slug" @click="goToManhwa(manhwa.slug)"
                  class="group cursor-pointer">
                  <div
                    class="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-tertiary border border-border-color mb-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-accent-primary">
                    <img v-if="manhwa.cover_url" :src="manhwa.cover_url" :alt="manhwa.title"
                    
                      class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>

                    <!-- Country Flag Badge -->
                    <img v-if="manhwa.type" :src="getCountryFlagImage(manhwa.type)" :alt="manhwa.type" :title="manhwa.type" class="absolute top-3 left-3 w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rounded-sm object-cover" />


                    <!-- Badge -->
                    <div v-if="manhwa.rating"
                      class="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {{ manhwa.rating }}
                    </div>
                  </div>

                  <h4
                    class="text-sm font-semibold text-text-primary line-clamp-2 mb-1 group-hover:text-accent-primary transition-colors">
                    {{ manhwa.title }}
                  </h4>

                  <div class="flex items-center gap-2 text-xs text-text-muted">
                    <span v-if="manhwa.type" class="px-2 py-0.5 rounded bg-bg-tertiary">{{ manhwa.type }}</span>
                    <div v-if="manhwa.status"
                      class="px-2 py-0.5 rounded bg-bg-tertiary"
                      :class="{
                        'bg-green-500 text-white': manhwa.status.toLowerCase() === 'ongoing',
                        'bg-blue-600 text-white': manhwa.status.toLowerCase() === 'completed',
                        'bg-orange-400 text-white': manhwa.status.toLowerCase() === 'hiatus'
                      }">
                      {{ manhwa.status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Footer -->
    <div
      class="fixed bottom-0 left-0 right-0 z-[10000] bg-bg-primary/95 backdrop-blur-xl border-t border-border-color transition-transform duration-300"
      :class="hideControls ? 'translate-y-full' : 'translate-y-0'">
      <div class="container mx-auto px-4">
        <div class="py-4">
          <div class="flex items-center justify-between gap-4 mb-4">
            <button
              class="flex items-center gap-2 px-5 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="currentChapter <= 1" @click="previousChapter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span class="hidden md:inline">Chapter Sebelumnya</span>
            </button>

            <div class="flex-1 max-w-[200px]">
              <select v-model="currentChapter"
                class="w-full px-4 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm cursor-pointer transition-all duration-200 hover:border-accent-primary focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
                @change="onChapterSelect">
                <!-- FIX: Use availableChapters which is just [1, 2, 3...] for the options -->
                <option v-for="ch in availableChapters" :key="ch" :value="ch">
                  Chapter {{ ch }}
                </option>
              </select>
            </div>

            <button
              class="flex items-center gap-2 px-5 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary text-sm font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="currentChapter >= totalChapters" @click="nextChapter">
              <span class="hidden md:inline">Chapter Selanjutnya</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-sm text-text-muted min-w-[80px]">{{ currentPage }} / {{ totalPages }}</span>
            <div class="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-300"
                :style="{ width: `${readProgress}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to Top Button -->
    <Transition name="fade">
      <button v-if="showScrollTop" @click="scrollToTop"
        class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg z-[10001] hover:bg-accent-secondary transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        aria-label="Kembali ke atas">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </Transition>

    <!-- Settings Panel -->
    <Transition name="slide-left">
      <div v-if="showSettings"
        class="fixed top-0 right-0 bottom-0 w-full md:w-80 bg-bg-secondary border-l border-border-color z-[10002] flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
        <div class="flex items-center justify-between p-6 border-b border-border-color">
          <h3 class="text-lg font-semibold text-text-primary">
            Pengaturan Pembaca
          </h3>
          <button
            class="w-8 h-8 rounded-lg bg-transparent text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
            @click="toggleSettings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Lebar Halaman</label>
            <input type="range" v-model="pageWidth" min="600" max="1200" step="50"
              class="w-full h-1.5 rounded-full bg-bg-tertiary outline-none appearance-none mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110" />
            <span class="block text-xs text-text-muted text-right">{{ pageWidth }}px</span>
          </div>

          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Jarak Halaman</label>
            <input type="range" v-model="pageGap" min="0" max="40" step="5"
              class="w-full h-1.5 rounded-full bg-bg-tertiary outline-none appearance-none mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110" />
            <span class="block text-xs text-text-muted text-right">{{ pageGap }}px</span>
          </div>

          <div class="mb-8">
            <label class="block text-sm font-medium text-text-primary mb-3">Mode Baca</label>
            <div class="flex gap-2">
              <button class="flex-1 px-2.5 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200"
                :class="readMode === 'vertical'
                    ? 'bg-accent-primary border-accent-primary text-white'
                    : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-accent-primary hover:text-text-primary'
                  " @click="readMode = 'vertical'">
                Vertikal
              </button>
              <button class="flex-1 px-2.5 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200"
                :class="readMode === 'horizontal'
                    ? 'bg-accent-primary border-accent-primary text-white'
                    : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-accent-primary hover:text-text-primary'
                  " @click="readMode = 'horizontal'">
                Horizontal
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ManhwaService } from "../services/manhwaService";
import { ReadingHistoryService } from "../services/readingHistoryService";
import CommentSection from "../components/community/CommentSection.vue";

import koreaFlag from "../assets/bendera/south-korea.png";
import chinaFlag from "../assets/bendera/china.png";
import japanFlag from "../assets/bendera/japan.png";
type ChapterSummary = {
  slug: string;
};

type ChaptersResponse = {
  chapters: ChapterSummary[];
};

// methode bendera
const getCountryFlagImage = (type: string): string => {
  const typeMap: Record<string, string> = {
    manhwa: koreaFlag,
    manhua: chinaFlag,
    manga: japanFlag,
  };
  return typeMap[type.toLowerCase()] || "";
};
// Initialize router
const router = useRouter();

// Tambahkan di antara deklarasi ref lainnya
const showScrollTop = ref(false);

// Fungsi scroll ke atas
const scrollToTop = () => {
  if (contentContainer.value) {
    contentContainer.value.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

// Update status tombol saat scroll
const updateScrollTopButton = () => {
  if (!contentContainer.value) return;
  showScrollTop.value = contentContainer.value.scrollTop > 400; // Muncul setelah scroll 400px
};

const props = defineProps<{
  manhwaTitle: string;
  manhwaSlug: string;
  chapterSlug?: string;
  initialChapter?: number;
}>();

const emit = defineEmits<{
  close: [];
  chapterChange: [chapter: number];
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const chapterImages = ref<string[]>([]);
const loadedImages = ref(new Set<number>()); // Track loaded images
const availableChapters = ref<number[]>([]); // Store all available chapter numbers
const chaptersData = ref<ChaptersResponse | null>(null); // Store full chapters data
const resolvedManhwaSlug = ref(props.manhwaSlug || "");
const activeChapterSlug = ref<string | null>(null);

const currentChapter = ref(1);
const totalChapters = ref(0); // Will be loaded from data
const currentPage = ref(1);
const totalPages = computed(() => chapterImages.value.length);

const isSyncingFromRoute = ref(false);

const isFullscreen = ref(false);
const hideControls = ref(true); // Default hidden saat reading
const showSettings = ref(false);

const pageWidth = ref(800);
const pageGap = ref(0); // No gap between images for seamless reading
const readMode = ref("vertical");

const contentContainer = ref<HTMLElement | null>(null);
let scrollTimeout: number | null = null;

const readProgress = computed(() => {
  if (totalPages.value === 0) return 0;
  return (currentPage.value / totalPages.value) * 100;
});

// Recommendations
const recommendations = ref<any[]>([]);

const loadRecommendations = async () => {
  try {
    // Get current manhwa metadata to find similar ones
    const metadata = await ManhwaService.getMetadata(props.manhwaSlug);
    if (!metadata) return;

    // Get all manhwa list
    const allManhwa = await ManhwaService.getAllManhwa();

    // Filter similar manhwa based on genre and type
    const similar = allManhwa
      .filter((m) => {
        // Don't recommend the current manhwa
        if (m.slug === props.manhwaSlug) return false;

        // Match by type (manhwa, manhua, manga)
        const sameType = m.type === metadata.type;

        // Match by genre (if available)
        const metadataGenres = metadata.genres || [];
        const manhwaGenres = m.genres || [];
        const hasCommonGenre =
          metadataGenres.length > 0 &&
          manhwaGenres.length > 0 &&
          metadataGenres.some((g: string) =>
            manhwaGenres.some(
              (mg: string) =>
                mg.toLowerCase().includes(g.toLowerCase()) ||
                g.toLowerCase().includes(mg.toLowerCase())
            )
          );

        return sameType || hasCommonGenre;
      })
      .sort((a, b) => {
        // Sort by rating
        const ratingA = parseFloat(a.rating || "0");
        const ratingB = parseFloat(b.rating || "0");
        return ratingB - ratingA;
      })
      .slice(0, 8); // Take top 8 recommendations

    recommendations.value = similar;
  } catch (err) {
    console.error("Failed to load recommendations:", err);
  }
};

const goToManhwa = async (slug: string) => {
  console.log(`🔗 Navigating to manhwa: ${slug}`);
  
  try {
    // Navigate directly to the manhwa detail page
    // Don't emit "close" because that would redirect back to current manhwa
    console.log(`📍 Using router to navigate to: /detail/${slug}`);
    await router.push({ name: 'detail', params: { slug } });
  } catch (error) {
    console.error("❌ Navigation error:", error);
    // Fallback to direct navigation if router fails
    console.log(`🔄 Fallback: Using window.location.href`);
    window.location.href = `/detail/${slug}`;
  }
};

// Track reading history
const trackReadingHistory = async () => {
  if (
    !props.manhwaTitle ||
    !resolvedManhwaSlug.value ||
    !activeChapterSlug.value
  ) {
    console.log("⚠️ Skipping history tracking - missing data:", {
      title: !!props.manhwaTitle,
      slug: !!resolvedManhwaSlug.value,
      chapterSlug: !!activeChapterSlug.value,
    });
    return;
  }

  try {
    // Get manhwa metadata for cover
    const metadata = await ManhwaService.getMetadata(resolvedManhwaSlug.value);

    // Ensure we have valid chapter numbers
    const total = totalChapters.value || 1;
    const current = currentChapter.value || 1;
    const progress = Math.round((current / total) * 100);

    const historyItem = {
      slug: resolvedManhwaSlug.value,
      title: props.manhwaTitle,
      coverUrl: metadata?.cover_url || "",
      lastChapterSlug: activeChapterSlug.value,
      lastChapterTitle: `Chapter ${current}`,
      lastReadAt: new Date().toISOString(),
      progress,
      totalChapters: total,
      currentChapter: current,
    };

    console.log("📝 Tracking reading history:", historyItem);
    ReadingHistoryService.addToHistory(historyItem);
  } catch (error) {
    console.error("❌ Error tracking reading history:", error);
  }
};

// Update current page based on scroll position
const updateCurrentPage = () => {
  if (!contentContainer.value) return;

  const container = contentContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight - container.clientHeight;

  if (scrollHeight <= 0) {
    currentPage.value = 1;
    return;
  }

  const scrollRatio = scrollTop / scrollHeight;
  const calculatedPage = Math.ceil(scrollRatio * totalPages.value);
  currentPage.value = Math.max(
    1,
    Math.min(calculatedPage || 1, totalPages.value)
  );
};

// Auto-hide controls when scrolling
const handleScroll = () => {
  if (!contentContainer.value) return;

  // Update scroll to top button
  updateScrollTopButton();

  // Hanya lakukan logika auto-hide jika kontrol saat ini *sedang terlihat*
  if (!hideControls.value) {
    // Sembunyikan kontrol karena pengguna sedang scroll
    hideControls.value = true;
  }

  // Reset timeout (bersihkan timeout lama jika ada)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  // Atur timeout untuk menampilkan kontrol kembali setelah 2 detik tidak scroll
  scrollTimeout = window.setTimeout(() => {
    hideControls.value = false; // Tampilkan kembali kontrol setelah jeda
  }, 2000); // 2000 milidetik = 2 detik

  // Update halaman saat ini
  updateCurrentPage();
};

// *** THIS IS THE ONLY onMounted HOOK NOW ***
onMounted(async () => {
  const pathParts = window.location.pathname.split("/");
  if (!resolvedManhwaSlug.value) {
    resolvedManhwaSlug.value = pathParts[2] || "";
  }

  const manhwaSlug = resolvedManhwaSlug.value;
  const initialChapterSlug = props.chapterSlug || pathParts[4];

  if (!manhwaSlug) {
    error.value = "Invalid manhwa URL";
    return;
  }

  // Load and sort chapters *first*
  await loadTotalChapters(manhwaSlug);

  // Now sync from slug, which relies on the sorted list
  if (typeof initialChapterSlug === "string") {
    await syncChapterFromSlug(initialChapterSlug);
  } else {
    error.value = "Invalid chapter URL";
  }

  // Tunggu DOM siap, lalu pasang listener
  await nextTick();
  if (contentContainer.value) {
    contentContainer.value.addEventListener("scroll", handleScroll, {
      passive: true,
    });
  }

  // Load recommendations
  loadRecommendations();
});

// *** THIS IS THE ONLY onUnmounted HOOK NOW ***
onUnmounted(() => {
  if (contentContainer.value) {
    contentContainer.value.removeEventListener("scroll", handleScroll);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});

const onChapterSelect = () => {
  console.log(`📖 Chapter selected from dropdown: ${currentChapter.value}`);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};

const toggleControls = () => {
  hideControls.value = !hideControls.value;
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const previousChapter = () => {
  if (currentChapter.value > 1) {
    currentChapter.value--;
    console.log(`⬅️ Previous chapter: ${currentChapter.value}`);
  }
};

const nextChapter = () => {
  if (currentChapter.value < totalChapters.value) {
    currentChapter.value++;
    console.log(`➡️ Next chapter: ${currentChapter.value}`);
  }
};

// Watch for chapter changes
watch(currentChapter, async (newChapter, oldChapter) => {
  if (isSyncingFromRoute.value || newChapter === oldChapter || !newChapter) {
    return;
  }

  if (newChapter !== oldChapter) {
    console.log(`🔄 Chapter changed: ${oldChapter} → ${newChapter}`);

    // Get chapter slug from stored data
    let chapterSlug = `chapter-${String(newChapter).padStart(2, "0")}`; // Default fallback

    // If we have chapters data, use the actual slug
    if (chaptersData.value && chaptersData.value.chapters) {
      const chapterIndex = newChapter - 1; // 0-based index
      if (chaptersData.value.chapters[chapterIndex]) {
        chapterSlug = chaptersData.value.chapters[chapterIndex].slug;
        console.log(`📖 Using actual chapter slug: ${chapterSlug}`);
      } else {
        // This warning should no longer appear if sorting is correct
        console.warn(
          `⚠️ Chapter ${newChapter} not found in data, using generated slug: ${chapterSlug}`
        );
      }
    }

    // Reload chapter images
    await loadChapterImages(
      resolvedManhwaSlug.value || props.manhwaSlug,
      chapterSlug
    );

    // Emit event to parent
    emit("chapterChange", newChapter);

    // Scroll to top
    contentContainer.value?.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// *** FIX 2: Updated syncChapterFromSlug ***
const syncChapterFromSlug = async (chapterSlug?: string) => {
  if (!chapterSlug) {
    error.value = "Invalid chapter URL";
    return;
  }

  const manhwaSlug = resolvedManhwaSlug.value || props.manhwaSlug;
  if (!manhwaSlug) {
    error.value = "Invalid manhwa URL";
    return;
  }

  isSyncingFromRoute.value = true;
  try {
    // Ensure chapters are loaded (they should be from onMounted, but as a safeguard)
    if (!chaptersData.value?.chapters) {
      console.log("syncChapterFromSlug: chapters not loaded, awaiting...");
      await loadTotalChapters(manhwaSlug); // This will sort them
    }

    await loadChapterImages(manhwaSlug, chapterSlug);

    // Extract chapter number from slug (e.g., "chapter-176" -> 176)
    const chapterMatch = chapterSlug.match(/chapter-(\d+(\.\d+)?)/);
    if (chapterMatch && chapterMatch[1]) {
      currentChapter.value = parseFloat(chapterMatch[1]);
      console.log(
        `syncChapterFromSlug: Synced to chapter ${currentChapter.value} from slug ${chapterSlug}`
      );
    } else {
      console.warn(
        `syncChapterFromSlug: Could not extract chapter number from slug ${chapterSlug}`
      );
      // Fallback: try to find in chapters list
      const sortedChapters: ChapterSummary[] =
        chaptersData.value?.chapters ?? [];
      const chapterIndex = sortedChapters.findIndex(
        (ch) => ch.slug === chapterSlug
      );
      if (chapterIndex !== -1) {
        currentChapter.value = chapterIndex + 1;
      }
    }

    contentContainer.value?.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(`syncChapterFromSlug: Failed to sync:`, err);
    // Error is already set by loadChapterImages
  } finally {
    isSyncingFromRoute.value = false;
  }
};

watch(
  () => props.chapterSlug,
  async (newSlug) => {
    if (!newSlug) {
      error.value = "Invalid chapter URL";
      return;
    }
    if (newSlug === activeChapterSlug.value) {
      return;
    }
    await syncChapterFromSlug(newSlug);
  }
);

// *** FIX 1: Updated loadTotalChapters with SORTING ***
const loadTotalChapters = async (manhwaSlug: string) => {
  try {
    console.log(`📊 Loading total chapters for: ${manhwaSlug}`);
    const data = await ManhwaService.getChapters(manhwaSlug);

    // Helper to extract number from slug for sorting
    const extractNum = (slug: string) => {
      // Matches chapter-123 or chapter-123-end or chapter-123.5
      const match = slug.match(/chapter-(\d+(\.\d+)?)/i);
      return match && match[1]
        ? parseFloat(match[1])
        : Number.NEGATIVE_INFINITY;
    };

    if (data?.chapters?.length) {
      // Sort chapters ascending (Chapter 1, Chapter 2, ...)
      const sorted = [...data.chapters].sort(
        (a, b) => extractNum(a.slug) - extractNum(b.slug)
      );

      chaptersData.value = { ...data, chapters: sorted };
      totalChapters.value = sorted.length;
      availableChapters.value = sorted.map((_, i) => i + 1); // [1, 2, 3...]

      console.log(`✅ Total chapters available: ${totalChapters.value}`);
      console.log(
        `📋 First 10 sorted chapter slugs:`,
        sorted.map((ch) => ch.slug).slice(0, 10)
      );
    } else {
      console.warn("⚠️ No chapters data found");
      chaptersData.value = { chapters: [] };
      totalChapters.value = 0;
      availableChapters.value = [];
    }
  } catch (err) {
    console.error("❌ Error loading total chapters:", err);
    chaptersData.value = { chapters: [] };
    totalChapters.value = 0;
    availableChapters.value = [];
  }
};

const loadChapterImages = async (manhwaSlug: string, chapterSlug: string) => {
  loading.value = true;
  error.value = null;
  loadedImages.value.clear(); // Reset loaded images

  try {
    console.log(`📖 Loading chapter: ${manhwaSlug}/${chapterSlug}`);

    const chapterData = await ManhwaService.getChapter(manhwaSlug, chapterSlug);

    if (
      !chapterData ||
      !chapterData.images ||
      chapterData.images.length === 0
    ) {
      // Check for empty array too
      throw new Error("Chapter not found or is empty");
    }

    chapterImages.value = chapterData.images || [];
    activeChapterSlug.value = chapterSlug;
    console.log(`✅ Loaded ${chapterImages.value.length} images`);

    // Preload first 3 images immediately
    preloadInitialImages();

    // Track reading history (non-blocking, don't fail if this errors)
    trackReadingHistory().catch((err) => {
      console.warn("⚠️ Failed to track reading history (non-critical):", err);
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load chapter";
    console.error("❌ Error loading chapter:", err);
  } finally {
    loading.value = false;
  }
};

const preloadInitialImages = () => {
  // Preload first 3 images for faster initial display
  const preloadCount = Math.min(3, chapterImages.value.length);
  for (let i = 0; i < preloadCount; i++) {
    const imageUrl = chapterImages.value[i];
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
    }
  }
};

const handleImageError = (index: number) => {
  console.warn(`❌ Failed to load image ${index + 1}`);
  loadedImages.value.delete(index);
};

const handleImageLoad = (index: number) => {
  loadedImages.value.add(index);
  // console.log(`✅ Loaded image ${index + 1}/${totalPages.value}`) // Too noisy

  // Preload next few images
  preloadNextImages(index);
};

const preloadNextImages = (currentIndex: number) => {
  // Preload next 3 images
  const preloadCount = 3;
  for (let i = 1; i <= preloadCount; i++) {
    const nextIndex = currentIndex + i;
    if (
      nextIndex < chapterImages.value.length &&
      !loadedImages.value.has(nextIndex)
    ) {
      const imageUrl = chapterImages.value[nextIndex];
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
      }
    }
  }
};

// *** FIX 3: REMOVED DUPLICATE onMounted and onUnmounted HOOKS ***
// (The hooks from lines 593-627 in the old file are gone)
</script>

<style scoped>
/* Custom animations that can't be done with Tailwind */
@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions for Settings Panel */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* Fade transition for Scroll to Top button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
