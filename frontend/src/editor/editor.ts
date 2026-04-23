// Gemini Pro 3.1을 통해서 생성 후 수정됨.
// https://gemini.google.com/share/f8cc5e4a7a3e

import yaml from "js-yaml";
import { defineMarkdownEditor, type MarkdownEditor } from "../markdown-editor";

defineMarkdownEditor();

// 전역 상태.
let archiveHandle: FileSystemDirectoryHandle | null = null;
let isDirty = false;

// DOM 구성요소들.
const elems = {
  selectDirBtn: document.getElementById("selectDirBtn") as HTMLButtonElement,
  selectQuestionBtn: document.getElementById("selectQuestionBtn") as HTMLButtonElement,
  newQuestionBtn: document.getElementById("newQuestionBtn") as HTMLButtonElement,
  form: document.getElementById("questionForm") as HTMLFormElement,
  fieldset: document.querySelector("fieldset") as HTMLFieldSetElement,
  id: document.getElementById("questionIdInput") as HTMLInputElement,
  year: document.getElementById("questionYearInput") as HTMLInputElement,
  subject: document.getElementById("questionSubjectSelect") as HTMLSelectElement,
  shortAnswer: document.getElementById("questionShortAnswerInput") as HTMLInputElement,
  questionEditor: document.getElementById("questionEditor") as MarkdownEditor,
  answerEditor: document.getElementById("questionLongAnswerEditor") as MarkdownEditor,
  errorSpan: document.getElementById("error") as HTMLSpanElement,
};

// 변경 사항 발생 시 isDirty 플래그 변경.
elems.form.addEventListener("input", () => (isDirty = true));
elems.questionEditor.addEventListener("input", () => {
  console.log("question editor dirty");
  isDirty = true;
});
elems.answerEditor.addEventListener("input", () => {
  console.log("answer editor dirty");
  isDirty = true;
});

function confirmDiscard(): boolean {
  if (!isDirty) return true;
  return confirm("You have unsaved changes. Discard them?");
}

async function writeToHandle(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string | Blob,
) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function readFromHandle(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(filename);
  const file = await fileHandle.getFile();
  return await file.text();
}

async function selectArchiveDir() {
  archiveHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  elems.selectQuestionBtn.disabled = false;
  elems.newQuestionBtn.disabled = false;
  elems.fieldset.disabled = false;
}

function initNewQuestion() {
  if (!confirmDiscard()) return;
  elems.form.reset();
  elems.questionEditor.reset();
  elems.answerEditor.reset();
  isDirty = false;
}

async function readQuestion() {
  if (!confirmDiscard()) return;
  try {
    const qDirHandle = await window.showDirectoryPicker();

    const metaText = await readFromHandle(qDirHandle, "meta.yml");
    if (metaText) {
      const meta = yaml.load(metaText) as any;
      elems.id.value = meta.id || qDirHandle.name;
      elems.year.value = meta.year || "";
      elems.subject.value = meta.subject || "unknown";
      elems.shortAnswer.value = meta.short_answer || "";
    }

    const attachments: Record<string, Blob> = {};
    for await (const handle of qDirHandle.values()) {
      if (handle.kind !== "file") continue;
      const file = await handle.getFile();
      attachments[handle.name] = file;
    }

    elems.questionEditor.fromMarkdown(await readFromHandle(qDirHandle, "question.md"), attachments);
    elems.answerEditor.fromMarkdown(await readFromHandle(qDirHandle, "answer.md"), attachments);
    isDirty = false;
  } catch (err) {
    throw new Error("Failed to load question", { cause: err });
  }
}

async function saveQuestion(e: SubmitEvent) {
  e.preventDefault();
  if (!archiveHandle) return;

  const qId = elems.id.value.trim();
  if (!qId) return alert("Question ID is required");

  try {
    const qDirHandle = await archiveHandle.getDirectoryHandle(qId, { create: true });

    const meta = {
      id: qId,
      year: elems.year.value ? Number(elems.year.value) : undefined,
      subject: elems.subject.value,
      short_answer: elems.shortAnswer.value,
    };

    await writeToHandle(qDirHandle, "meta.yml", yaml.dump(meta));

    const qData = elems.questionEditor.toMarkdown();
    await writeToHandle(qDirHandle, "question.md", qData.markdown);
    for (const [name, blob] of Object.entries(qData.attachments)) {
      await writeToHandle(qDirHandle, name, blob);
    }

    const aData = elems.answerEditor.toMarkdown();
    await writeToHandle(qDirHandle, "answer.md", aData.markdown);
    for (const [name, blob] of Object.entries(aData.attachments)) {
      await writeToHandle(qDirHandle, name, blob);
    }

    alert("저장 완료");
    isDirty = false;
  } catch (err) {
    throw new Error("Failed to save", { cause: err });
  }
}

elems.selectDirBtn.addEventListener("click", selectArchiveDir);
elems.newQuestionBtn.addEventListener("click", initNewQuestion);
elems.selectQuestionBtn.addEventListener("click", readQuestion);
elems.form.addEventListener("submit", saveQuestion);

// biome-ignore lint/suspicious/noExplicitAny: Promise rejection 사유의 경우 any 타입을 가짐.
function getErrorMessage(error: any): string {
  if (!(error instanceof Error)) {
    if (typeof error === "string") return error;
    else return "unknown error";
  }

  let message = error.message;
  if (error.cause instanceof Error) {
    message += ` (cause: ${getErrorMessage(error.cause)})`;
  }
  return message;
}

window.addEventListener("error", (evt) => {
  elems.errorSpan.textContent = getErrorMessage(evt.error);
  console.error("unhandled error:", evt.error);
});

window.addEventListener("unhandledrejection", (evt) => {
  evt.preventDefault();
  elems.errorSpan.textContent = getErrorMessage(evt.reason);
  console.error("unhandled rejection:", evt.reason);
});
