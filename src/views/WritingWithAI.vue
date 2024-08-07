<template>
  <NavigationBar />
  <section id="writing-with-ai" class="overflow-hidden writing-with-ai">
    <div id="writing-with-ai-container" class="flex flex-col items-center flex-1 w-full p-7 pt-[calc(1rem+var(--header))] 
      sm:px-20">
      <div class="flex flex-col lg:flex-row w-full max-w-[1024px]">
        <div ref="sideinfo" class="relative mb-6 lg:w-[250px] lg:mr-16">
          <h4 class="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">
            Academic Writing Assistant
          </h4>
          <h1 class="text-[2rem] sm:text-[3rem] scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Writing With AI
          </h1>
          <p class="text-sm mt-6">This chatbot guides students through the 6P pedagogy for academic writing. <a href="https://www.lttc.eduhk.hk/papers/6p.pdf" class="underline" target="_blank">Papers</a></p>
          <button @click="$router.push('/demo')" class="flex items-center w-full py-2 px-3 mt-6 rounded-lg border-x-theme-gridlight border duration-200 hover:bg-theme-light active:bg-theme-grid">
            <MessageSquareText size="20" :strokeWidth="1.5" class="mr-8" />
            <span class="mb-[0.125rem] font-medium text-sm">AI Chatbot</span>
          </button>
          <Alert v-if="connectError" class="my-8" variant="destructive">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Failed To Connect!</AlertTitle>
            <AlertDescription>
              {{ connectErrorMessage }}
            </AlertDescription>
          </Alert>
        </div>
        
        <div class="flex-1">
          <div class="flex">
            <form 
              @submit.prevent="" 
              class="w-full [&>*]:duration-300"
              :class="{ 
                '[&>*:last-child]:border-[#fff0]': !panelFade,
                '[&>*:last-child]:opacity-25': !panelFade,
                '[&>*:last-child]:pointer-events-none': !panelFade,
                '[&>*:last-child]:select-none': !panelFade,
              }"
            >
              <button 
                ref="formbutton"
                type="submit" 
                class="hidden"
                hidden
              >
              </button>
            
              <!-- 1. Plan -->
              <Card v-if="panelProgress >= 1" class="mb-6">
                <CardHeader>
                  <CardTitle class="font-semibold text-base">
                    <div class="flex justify-between">
                      <ClipboardPenLine class="mb-2" />
                      <Loader 
                        v-if="predictionsLoading['planningApproach'] === true" 
                        class="mb-2 animate-spin" 
                      />
                    </div>
                    <span>Plan</span>
                  </CardTitle>
                  <CardDescription>Please define the writing objectives, research question, or problem you aim to address.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField v-slot="{ componentField }" name="topic">
                    <FormItem class="mb-8">
                      <FormLabel>Your Topic</FormLabel>
                      <FormControl>
                        <div class="relative">
                          <Input 
                            @input="updatePanel('plan')"
                            @keyup.enter="createPrompt('planningApproach')"
                            type="text" 
                            class="h-[50px] pl-6 pr-12 bg-theme-light text-md" 
                            placeholder="" 
                            v-bind="componentField" 
                            maxlength="100" 
                            autofocus 
                          />
                          <button type="submit" @click="createPrompt('planningApproach')" class="absolute top-[50%] right-0 translate-y-[-50%] mr-6">
                            <WandSparkles width="16" height="16" alt="" />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField name="">
                    <FormItem v-if="'planningApproach' in predictions">
                      <div class="flex justify-between items-center">
                        <FormLabel>Planning Approach</FormLabel>
                        <button 
                          class="hover:-rotate-180 duration-200"
                          @click.prevent="createPrompt('planningApproach')"
                        >
                          <RotateCcw width="16" height="16" />
                        </button>
                      </div>
                      
                      <div class="!mb-8 !mt-4 pt-4">
                        <pre>{{ predictions['planningApproach'] }}</pre>
                      </div>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField v-slot="{ componentField }" name="plan">
                    <FormItem class="pt-6 border-t border-t-theme-gray border-dashed">
                      <FormLabel>Your Plan</FormLabel>
                      <FormControl>
                        <Textarea
                          @input="updatePanel('plan')"
                          placeholder=""
                          class="bg-theme-light text-md"
                          rows="4"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormDescription class="text-xs">
                        Outline the content and structure of the writing, considering the intended audience and purpose.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </CardContent>
                <CardFooter class="text-xs text-theme-black">
                  <Button 
                    v-if="isPanelHistoryEmpty[0]"
                    @click="updatePanelProgress(1)" 
                    class="flex items-center w-full h-[40px] py-2 px-3 mb-2 rounded-lg"
                  >
                    <ClipboardCheck size="20" :strokeWidth="1.5" class="mr-8" />
                    <span class="font-medium text-sm">Okay, I Finished</span>
                  </Button>
                </CardFooter>
              </Card>

              <!-- 2. Prompt -->
              <Card v-if="panelProgress >= 2" class="mb-6">
                <CardHeader>
                  <CardTitle class="font-semibold text-base">
                    <div class="flex justify-between">
                      <Sparkles class="mb-2" />
                      <!-- <Loader 
                        v-if="predictionsLoading['planningApproach'] === true" 
                        class="mb-2 animate-spin" 
                      /> -->
                    </div>
                    <span>Prompt</span>
                  </CardTitle>
                  <CardDescription>Create questions that can facilitate inquiry and further exploration of the topic.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    v-for="i in formSchemaPromptAmount" 
                    :key="i" 
                    v-slot="{ componentField }" 
                    :name="`prompt${i}`"
                  >
                    <FormItem class="mb-4">
                      <FormControl>
                        <div class="relative">
                          <Input 
                            @input="updatePanel('prompt')" 
                            type="text" 
                            class="h-[50px] pl-6 pr-12 bg-theme-light text-sm z-0" 
                            :placeholder="`Question ${i}`" 
                            v-bind="componentField" 
                            maxlength="300" 
                            autofocus 
                          />
                          <button type="submit" class="absolute top-[50%] right-0 translate-y-[-50%] mr-6">
                            <WandSparkles width="16" height="16" alt="" />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </CardContent>
                <CardFooter class="flex flex-col text-xs text-theme-black md:flex-row">
                  <Button 
                    v-if="isPanelHistoryEmpty[1]"
                    @click="$router.push('/demo')" 
                    class="flex items-center w-full h-[40px] py-2 px-3 mb-2 md:mr-2 rounded-lg border border-x-theme-gridlight bg-white hover:bg-theme-light active:bg-theme-grid"
                  >
                    <MessageSquareText size="20" :strokeWidth="1.5" class="mr-8" />
                    <span class="font-medium text-sm">AI Chatbot</span>
                  </Button>
                  <Button 
                    v-if="isPanelHistoryEmpty[1]"
                    @click="updatePanelProgress(2); createPrompt('preview')" 
                    class="flex items-center w-full h-[40px] py-2 px-3 mb-2 md:ml-2 rounded-lg"
                  >
                    <ClipboardCheck size="20" :strokeWidth="1.5" class="mr-8" />
                    <span class="font-medium text-sm">Okay, I Finished</span>
                  </Button>
                </CardFooter>
              </Card>

              <!-- 3. Preview -->
              <Card v-if="panelProgress >= 3" class="mb-6">
                <CardHeader>
                  <CardTitle class="font-semibold text-base">
                    <div class="flex justify-between">
                      <Eye class="mb-2" />
                      <Loader 
                        v-if="predictionsLoading['preview'] === true" 
                        class="mb-2 animate-spin" 
                      />
                    </div>
                    <span>Preview</span>
                  </CardTitle>
                  <CardDescription>Review the output from the AI-generated content, checking for accuracy, coherence, and alignment with your writing objectives.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField name="">
                    <FormItem class="mb-8">
                      <div class="flex justify-between items-center">
                        <FormLabel>Preview Panel</FormLabel>
                        <button 
                          class="hover:-rotate-180 duration-200"
                          @click.prevent="createPrompt('preview')"
                        >
                          <RotateCcw width="16" height="16" />
                        </button>
                      </div>
                      <div class="!mb-8 !mt-4 pt-4">
                        <pre>{{ predictions['preview'] }}</pre>
                      </div>
                      <FormMessage />
                      <FormDescription>
                        <span class="text-xs">The result will be automatically generated, but you can still make edits to it.</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField v-slot="{ componentField }" name="refinements">
                    <FormItem class="pt-6 border-t border-t-theme-gray border-dashed">
                      <FormLabel>Suggestion of Refinements</FormLabel>
                      <FormControl>
                        <div class="relative">
                          <Input 
                            @input="updatePanel('preview')" 
                            @keyup.enter="updatePanelProgress(3); createPrompt('refinements')"
                            type="text" 
                            class="h-[50px] pl-6 pr-12 bg-theme-light text-md" 
                            placeholder="" 
                            v-bind="componentField" 
                            maxlength="300" 
                            autofocus 
                          />
                          <button type="submit" @keyup.enter="updatePanelProgress(3); createPrompt('refinements')" class="absolute top-[50%] right-0 translate-y-[-50%] mr-6">
                            <WandSparkles width="16" height="16" alt="" />
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        <span class="text-xs">Supplement the content with your own knowledge, additional research, and alternative perspectives.</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </CardContent>
                <CardFooter class="text-xs text-theme-black">
                  <Button 
                    v-if="isPanelHistoryEmpty[2]"
                    @click="updatePanelProgress(3); createPrompt('refinements')" 
                    class="flex items-center w-full h-[40px] py-2 px-3 mb-2 rounded-lg"
                  >
                    <ClipboardCheck size="20" :strokeWidth="1.5" class="mr-8" />
                    <span class="font-medium text-sm">Produce Now</span>
                  </Button>
                </CardFooter>
              </Card>

              <!-- 4. Produce -->
              <Card v-if="panelProgress >= 4" class="mb-6">
                <CardHeader>
                  <CardTitle class="font-semibold text-base">
                    <div class="flex justify-between">
                      <BookOpenCheck class="mb-2" />
                      <Loader 
                        v-if="predictionsLoading['produce'] === true" 
                        class="mb-2 animate-spin" 
                      />
                    </div>
                    <span>Produce</span>
                  </CardTitle>
                  <CardDescription>Done. Be sure to integrate relevant academic sources and properly cite all references.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField name="">
                    <FormItem>
                      <div class="!mb-8 !mt-4 pt-4">
                        <pre>{{ predictions['produce'] }}</pre>
                      </div>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </CardContent>
              </Card>

              <div v-if="panelProgress >= 5" class="flex flex-col md:flex-row">
                <!-- 5. Peer Review -->
                <Card class="mb-6 flex-1 border-none">
                  <CardHeader>
                    <CardTitle class="font-semibold text-base">
                      <UserRoundSearch class="mb-2" />
                      <span>Peer Review</span>
                    </CardTitle>
                    <CardDescription>
                      Exchange your written assignments with your peers for review and feedback. And consider the feedback and make necessary revisions.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <!-- 6. Portfolio Tracking -->
                <Card class="mb-6 flex-1 border-none">
                  <CardHeader>
                    <CardTitle class="font-semibold text-base">
                      <FolderOpen class="mb-2" />
                      <span>Portfolio Tracking</span>
                    </CardTitle>
                    <CardDescription>Reflect on your writing and learning process, including the use of AI-enabled text-generating tools.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { useWritingBotStore } from '@/store/WritingBotStore'
import { usePromptStore } from '@/store/PromptStore'
import { ref, toRaw, nextTick, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'

import { Alert, AlertDescription, AlertTitle } from '@/components_shadcn/ui/alert'
import { Button } from '@/components_shadcn/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components_shadcn/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components_shadcn/ui/form'
import { Input } from '@/components_shadcn/ui/input'
import { Textarea } from '@/components_shadcn/ui/textarea'
import { useToast } from '@/components_shadcn/ui/toast/use-toast'

import { 
  AlertCircle,
  ClipboardPenLine, 
  Sparkles,
  Plus,
  View,
  RotateCcw,
  MessageSquareText, 
  SendHorizontal,
  ClipboardCheck,
  WandSparkles,
  Eye,
  BookOpenCheck,
  UserRoundSearch,
  FolderOpen,
  Loader      
} from 'lucide-vue-next'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import axios from 'axios'

const api_key = import.meta.env.VITE_APP_REPLICATE_API_TOKEN

const writingBotStore = useWritingBotStore()
const promptStore = usePromptStore()
const panelHistory = toRaw(writingBotStore.getPanelHistory)
const panelProgress = ref(writingBotStore.getPanelProgress + 2)
const finalPanelProgress = ref(5)
const isPanelHistoryEmpty = writingBotStore.getIsPanelHistoryEmpty
watchEffect(
  () => writingBotStore.getIsPanelHistoryEmpty,
)
const panelFade = ref(panelProgress.value >= finalPanelProgress.value)
const predictions = writingBotStore.getPredictions
const predictionsLoading = ref({})
const promptList = promptStore.getPrompt

const router = useRouter()
const { toast } = useToast()

const formSchemaPromptAmount = 3
const formSchemaObject = {
  topic: z.string().optional().default(panelHistory[0]?.topic),
  plan: z.string().optional().default(panelHistory[0]?.plan),
  refinements: z.string().optional().default(panelHistory[2]?.refinements),
}

for (let i = 1; i <= formSchemaPromptAmount; i++) {
  formSchemaObject[`prompt${i}`] = z.string().optional().default(panelHistory[1]?.[`prompt${i}`])
}

const formSchema = toTypedSchema(z.object(formSchemaObject))

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const connectError = ref(false)
const connectErrorMessage = ref('')
const sideinfo = ref(null)
const formbutton = ref(null)

const llmLoading = ref(false)

onMounted(() => {
  const scroll = window.addEventListener("scroll", handleScroll)
  const resize = window.addEventListener("resize", handleScroll)

  function handleScroll() {
    if (window.innerWidth >= 1024) {
      sideinfo.value.style.top = `${window.scrollY}px`
    } else {
      sideinfo.value.style.top = `0px`
    }
  }
})

const onSubmit = handleSubmit((values) => {
  return values
})

/**
 * Updates the panel item based on the given phase when the user updates form input. 
 * The approach can ensure the form input values are remained after page leave.
 *
 * @param {string} phase - The phase of the writing process ('plan', 'prompt', or 'preview').
 * @returns {void}
 */
function updatePanel(phase) {
  formbutton.value.click()
  onSubmit().then((values) => {
    if (values) {
      switch (phase) {
        case 'plan':
          writingBotStore.updatePanelItem({
            name: phase,
            topic: values.topic,
            plan: values.plan
          })
          writingBotStore.updatePanelHistoryEmpty(0)
          break
        case 'prompt':
          writingBotStore.updatePanelItem({
            name: phase,
            ...Object.fromEntries(Object.entries(values).filter((v) => { return v[0].startsWith('prompt') }))
          })
          writingBotStore.updatePanelHistoryEmpty(1)
          break
        case 'preview':
          writingBotStore.updatePanelItem({
            name: phase,
            refinements: values.refinements ?? ' '
          })
          writingBotStore.updatePanelHistoryEmpty(2)
          break
      }
    } else {
      console.error('Empty form values')
    }
  })
}

/**
 * Control the visibility of the phase sections.
 *
 * @param {number} pnum - The panel number to update the progress for.
 */
function updatePanelProgress(pnum) {
  formbutton.value.click()
  onSubmit().then((values) => {
    if (values) {
      writingBotStore.updatePanelProgress(pnum)
      panelProgress.value = writingBotStore.getPanelProgress + 2
      
      if (panelProgress.value >= finalPanelProgress.value) {
        panelFade.value = true
      }
    } else {
      console.error('Empty form values')
    }
  })
  
}

/**
 * Creates a prompt string for the AI assistant. The prompt includes instructions and context relevant to the specified field.
 *
 * @param {string} [field=''] - The field for which the prompt should be generated.
 * @returns {void}
 */
function createPrompt(field = '') {
  let promptResult = ''
  promptResult += `${promptList[field]} \n`

  switch (field) {
    case 'planningApproach':
      promptResult += `Topic of the writing: ${panelHistory[0].topic}`
      break
    case 'preview':
      promptResult += `Topic of the writing: ${panelHistory[0].topic} \n`
      promptResult += `Writing Plan: ${panelHistory[0].plan}`
      break
    case 'refinements':
      promptResult += `Topic of the writing: ${panelHistory[0].topic} \n`
      promptResult += `Paper: ${predictions['preview']} \n`
      promptResult += `Refinements: ${panelHistory[2].refinements} \n`
      promptResult += `Revised Paper: `
      break
  }
  
  sendPrompt(promptResult, field)
}

/**
 * Sends a prompt to the API to generate a response.
 *
 * @param {string} [prompt='']
 * @param {string} [field='']
 */
function sendPrompt(prompt = '', field = '') {
  if (!llmLoading.value) {
    if (field === 'refinements') {
      field = 'produce'
    }

    llmLoading.value = true
    predictionsLoading.value[field] = true
    connectError.value = false
    connectErrorMessage.value = ''

    // Request the API to start generating the response and get the response ID. 
    // According to the Replicate API mechanism. No chat response will be returned in this stage. If you are using others APIs, you may directly get the response below instead of making another API call.
    axios({
      method: 'post',
      url: '/api',
      data: {
        input: {
          top_p: 1,
          prompt: prompt,
          temperature: 0.5,
          max_tokens: 1024,
          min_tokens: 0,
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\nYou are a professional instructor to insist students for academic writing using 6-P pedagogical approach. The 6-P pedagogical approach of 'Plan writing, Prompt questions and text, Preview draft(s), Produce an assignment, Peer review, and Portfolio tracking' promotes the productive use of Artificial Intelligence(AI)-enabled text-generating tools for the development of critical and/or reflective thinking by students. There are six phases, not necessarily sequential, but interactive and iterative in nature, when using AI-enabled text-generating tools for academic writing. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
          presence_penalty: 1,
          frequency_penalty: 0.2
        }
      },
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
    }).then(async (response) => {
      // Get the chat response according to the response ID
      getPredictions(response.data.id, field)
    }).catch((error) => {
      connectError.value = true
      connectErrorMessage.value = `${error.name}: ${error.message}`
      llmLoading.value = false
      predictionsLoading.value[field] = false
      console.error(error)
    }).finally(() => {
    })
  }
}

// TODO: Limit Maximum Trial
/**
 * Retrieves the predictions for a given prediction ID using the Replicate API and updates the chat history accordingly.
 *
 * @param {string} predictionId
 * @returns {Promise<void>}
 */
async function getPredictions(predictionId, field = '') {
  try {
    await axios({
      method: 'get',
      url: `/get/${predictionId}`,
      headers: {
        'Authorization': `Bearer ${api_key}`
      },
    }).then(async (response) => {
      const data = response.data
      const updateRate = 500
      llmLoading.value = true

      // Check if predictions are succeeded
      if (data.status === 'succeeded') {
        predictions.value = writingBotStore.updatePredictions(data.output.join(""), field)
        predictionsLoading.value[field] = false
        llmLoading.value = false
      } else if (data.status === 'processing' || data.status === 'starting') {
        if (data.status === 'processing') {
          predictions.value = writingBotStore.updatePredictions(data.output.join(""), field)
        }
        await delay(updateRate)
        await getPredictions(predictionId, field)
      } else {
        throw new Error('Unknown response status')
      }
    }).catch((error) => {
      connectError.value = true
      connectErrorMessage.value = `${error.name}: ${error.message}`
      predictionsLoading.value[field] = false
      console.error(error)
    }).finally(() => {
      llmLoading.value = false
    })
  } catch (error) {
    console.error(error)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
</script>