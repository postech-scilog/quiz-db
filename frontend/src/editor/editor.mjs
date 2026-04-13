import Editor from '@toast-ui/editor'
import '@toast-ui/editor/toastui-editor.css'

// DOM 요소들
const selectDirBtn = document.querySelector('#selectDirBtn')
const newQuestionBtn = document.querySelector('#newQuestionBtn')
const questionForm = document.querySelector('#questionForm')
const questionEditorElem = document.querySelector('#questionEditor')
const questionLongAnswerEditorElem = document.querySelector('#questionLongAnswerEditor')

// 마크다운 에디터 초기화
const questionEditor = new Editor({
    el: questionEditorElem,
    height: '500px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
})
const questionLongAnswerEditor = new Editor({
    el: questionLongAnswerEditorElem,
    height: '500px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
})

