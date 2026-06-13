import { ref } from 'vue'
import type { AtmosphereTag, Reaction, TopicType } from '@/types'
import { getRoomById, saveRoom } from '@/utils/storage'
import { generateId } from '@/utils/helpers'

export function useReaction() {
  const selectedTags = ref<AtmosphereTag[]>([])

  const toggleTag = (tag: AtmosphereTag) => {
    const idx = selectedTags.value.indexOf(tag)
    if (idx >= 0) {
      selectedTags.value.splice(idx, 1)
    } else {
      selectedTags.value.push(tag)
    }
  }

  const recordReactions = (roomId: string, topicId: string, recorder: string): boolean => {
    const room = getRoomById(roomId)
    if (!room) return false

    if (!room.reactions) {
      room.reactions = []
    }

    for (const tag of selectedTags.value) {
      const reaction: Reaction = {
        topicId,
        tag,
        recorder,
        createdAt: new Date().toISOString()
      }
      room.reactions.push(reaction)
    }

    saveRoom(room)
    selectedTags.value = []
    return true
  }

  const getReactionsForTopic = (roomId: string, topicId: string): Reaction[] => {
    const room = getRoomById(roomId)
    if (!room || !room.reactions) return []
    return room.reactions.filter(r => r.topicId === topicId)
  }

  const getReactionsByTopicType = (roomId: string): Record<TopicType, Reaction[]> => {
    const room = getRoomById(roomId)
    if (!room || !room.reactions) {
      return { trouble: [], music: [], gossip: [], recommend: [], deep: [], silly: [] }
    }

    const result: Record<string, Reaction[]> = {
      trouble: [], music: [], gossip: [], recommend: [], deep: [], silly: []
    }

    for (const reaction of room.reactions) {
      const topic = room.topics.find(t => t.id === reaction.topicId)
      if (topic) {
        if (!result[topic.type]) {
          result[topic.type] = []
        }
        result[topic.type].push(reaction)
      }
    }

    return result as Record<TopicType, Reaction[]>
  }

  const getTagCountsByType = (roomId: string): Record<TopicType, Record<AtmosphereTag, number>> => {
    const grouped = getReactionsByTopicType(roomId)
    const result: Record<string, Record<string, number>> = {}

    for (const [type, reactions] of Object.entries(grouped)) {
      const counts: Record<string, number> = {}
      for (const reaction of reactions) {
        counts[reaction.tag] = (counts[reaction.tag] || 0) + 1
      }
      result[type] = counts
    }

    return result as Record<TopicType, Record<AtmosphereTag, number>>
  }

  return {
    selectedTags,
    toggleTag,
    recordReactions,
    getReactionsForTopic,
    getReactionsByTopicType,
    getTagCountsByType
  }
}
