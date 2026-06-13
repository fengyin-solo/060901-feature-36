<script setup lang="ts">
import { computed } from 'vue'
import type { Topic, Reaction } from '@/types'
import { TOPIC_EMOJIS, ATMOSPHERE_LABELS } from '@/types'
import { formatDate } from '@/utils/helpers'

const props = defineProps<{
  topic: Topic
  canDelete?: boolean
  reactions?: Reaction[]
}>()

const emit = defineEmits<{
  (e: 'delete'): void
}>()

const topicReactions = computed(() => {
  if (!props.reactions || props.reactions.length === 0) return []
  const tagCounts: Record<string, number> = {}
  for (const r of props.reactions) {
    tagCounts[r.tag] = (tagCounts[r.tag] || 0) + 1
  }
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag: tag as keyof typeof ATMOSPHERE_LABELS, label: ATMOSPHERE_LABELS[tag as keyof typeof ATMOSPHERE_LABELS], count }))
})
</script>

<template>
  <div 
    class="topic-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border-l-4 relative overflow-hidden group"
    :style="{ borderLeftColor: topic.color }"
  >
    <div 
      class="absolute top-0 right-0 w-20 h-20 rounded-full -mr-8 -mt-8 opacity-10"
      :style="{ backgroundColor: topic.color }"
    ></div>
    
    <div class="relative z-10">
      <div class="flex justify-between items-start mb-2">
        <span 
          class="px-2 py-1 rounded-lg text-xs font-medium text-white"
          :style="{ backgroundColor: topic.color }"
        >
          {{ TOPIC_EMOJIS[topic.type] }} {{ topic.type }}
        </span>
        
        <button 
          v-if="canDelete"
          class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
          @click.stop="emit('delete')"
        >
          ✕
        </button>
      </div>
      
      <p class="text-gray-800 font-medium mb-3 leading-relaxed">
        {{ topic.content }}
      </p>
      
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>
          {{ topic.isAnonymous ? '🎭 匿名' : `👤 ${topic.author}` }}
        </span>
        <span>{{ formatDate(topic.createdAt) }}</span>
      </div>

      <div v-if="topicReactions.length > 0" class="flex flex-wrap gap-1.5 mt-3">
        <span 
          v-for="r in topicReactions" 
          :key="r.tag"
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          :style="{ 
            backgroundColor: topic.color + '18', 
            color: topic.color 
          }"
        >
          {{ r.label }}
        </span>
      </div>
      
      <div 
        v-if="topic.isFlipped"
        class="absolute inset-0 bg-green-500/10 flex items-center justify-center rounded-xl"
      >
        <span class="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium transform rotate-12">
          ✓ 已聊过
        </span>
      </div>
    </div>
  </div>
</template>
