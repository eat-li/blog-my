import { reactive } from 'vue'

const state = reactive({
  visible: false,
  type: 'confirm', // 'alert' | 'confirm' | 'prompt'
  title: '',
  message: '',
  inputValue: '',
  resolve: null
})

export function useConfirm() {
  function alert(message) {
    return new Promise((resolve) => {
      state.type = 'alert'
      state.title = ''
      state.message = message
      state.inputValue = ''
      state.visible = true
      state.resolve = resolve
    })
  }

  function confirm(message, title = '') {
    return new Promise((resolve) => {
      state.type = 'confirm'
      state.title = title
      state.message = message
      state.inputValue = ''
      state.visible = true
      state.resolve = resolve
    })
  }

  function prompt(message, defaultValue = '') {
    return new Promise((resolve) => {
      state.type = 'prompt'
      state.title = ''
      state.message = message
      state.inputValue = defaultValue
      state.visible = true
      state.resolve = resolve
    })
  }

  return { alert, confirm, prompt, dialogState: state }
}
