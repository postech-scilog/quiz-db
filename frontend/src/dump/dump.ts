// TODO: 일부 함수가 print.ts와 동일함. 나중에 합쳐야 함.

interface Question {
  id: string;
  year: number;
  subject: string;
  question_text: string;
  short_answer: string;
  long_answer_text: string;
}

const elems = {
  status: document.querySelector("#status") as HTMLSpanElement,
  previewTextArea: document.querySelector("#dumpPreview") as HTMLTextAreaElement,
  downloadButton: document.querySelector("#downloadBtn") as HTMLButtonElement,
};

async function main() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  if (!subject || subject?.length === 0) {
    throw new Error("`subject` paramter is missing from the URL");
  }

  elems.status.textContent = "문제를 불러오는 중...";

  const questions = await fetchQuestions(subject);
  const dump = questions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    short_answer: q.short_answer,
  }));

  elems.previewTextArea.textContent = JSON.stringify(dump);
  elems.status.textContent = "덤프 생성 완료. 다운로드 버튼을 누르세요.";
  elems.downloadButton.disabled = false;

  elems.downloadButton.addEventListener("click", () => downloadDump(subject));
}

async function fetchQuestions(subject: string): Promise<Question[]> {
  const baseUrl = import.meta.env.PROD ? "" : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/questions?subjects=${subject}`);
  const result = await res.json();

  if (result.status === "error") {
    const msg = result.error?.message || result.message || "Unknwon error";
    throw new Error(`Failed to fetch question: ${msg}`);
  }

  if (result.data?.length === 0) {
    throw new Error(`No questions found`);
  }

  return result.data as Question[];
}

// biome-ignore lint/suspicious/noExplicitAny: Promise.catch의 인자는 any 타입을 가짐.
function renderError(reason: any) {
  let msg: string;
  if (reason instanceof Error) {
    msg = reason.message;
  } else {
    msg = reason?.toString() || "unknown error";
  }

  elems.status.textContent = `오류: ${msg}`;
}

function downloadDump(subject: string) {
  const filename = `poka-dump-${subject}.json`;
  const dump = elems.previewTextArea.textContent;
  const blob = new Blob([dump], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

main().catch(renderError);
