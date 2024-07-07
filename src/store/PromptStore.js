import { defineStore } from 'pinia'

// To manage the prompts used for different stages of the writing process
export const usePromptStore = defineStore('promptStore', {
  state: () => {
    return { 
      prompt: {
        planningApproach: 'Please assist students to plan the content and structure of the writing to effectively respond to an issue, research question, or problem.',
        preview: 'Please create a draft according to the topic and the writing plan.',
        refinements: 'Please adjust the following paper according to the suggestion of refinements.'
      },
      prefix: '',
      suffix: '',
    }
  },
  getters: {
    getPrompt() {
      return this.prompt
    },
  },
  actions: {
    interpolatePrompt() {

    }
  }
})