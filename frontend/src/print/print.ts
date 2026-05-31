import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.min.css";
import bioNotesHtml from "./notes_bio.html?raw";
import chemNotesHtml from "./notes_chem.html?raw";
import csNotesHtml from "./notes_cs.html?raw";
import mathNotesHtml from "./notes_math.html?raw";
import physNotesHtml from "./notes_phys.html?raw";

interface Question {
  id: string;
  year: number;
  subject: string;
  question_text: string;
  short_answer: string;
  long_answer_text: string;
}

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  markedKatex({
    throwOnError: false,
    nonStandard: true,
    strict: false,
  }),
);

const elems = {
  main: document.querySelector("main") as HTMLElement,
  header: document.querySelector("header") as HTMLElement,
  article: document.querySelector("article") as HTMLElement,
};

async function main() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  if (!subject || subject?.length === 0) {
    throw new Error("`subject` paramter is missing from the URL");
  }

  // 시험지의 헤더 랜더링
  renderHeader(subject);

  // 시험지의 문제들 렌더링
  elems.article.textContent = "rendering...";
  const questions = await fetchQuestions(subject);
  questions.sort((x, y) => {
    // 우선 연도 역순으로 정렬
    const yearOrder = y.year - x.year;
    if (yearOrder !== 0) return yearOrder;

    // 같은 연도끼리는 문제 순서에 따라서 정렬
    const ordRegex = /^\d\d\d\d-.*?-(\d+)$/;
    const xOrd = x.id.match(ordRegex)?.[1];
    const yOrd = y.id.match(ordRegex)?.[1];

    if (!xOrd || !yOrd) return yearOrder;
    return +xOrd - +yOrd;
  });
  renderQuestionList(questions);

  // 개발 시 웹페이지의 주소와 서버의 주소가 다르므로 이미지가 정상적으로 표시되지 않음.
  // 따라서 이미지 원소들의 URL을 모두 변경.
  if (import.meta.env.DEV) {
    document.querySelectorAll("article img").forEach((elem) => {
      const imgElem = elem as HTMLImageElement;
      const imgUrl = new URL(imgElem.src);
      imgUrl.host = "localhost:3000";
      imgElem.src = imgUrl.toString();
    });
  }

  // (개발용) `openAnswers` 파라미터를 이용 시 모든 정답을 펼칠 수 있음
  if (params.get("openAnswers") === "true") {
    document.querySelectorAll("details").forEach((elem) => {
      elem.setAttribute("open", "");
    });
  }
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

function renderQuestionList(questions: Question[]): void {
  const html = questions.map(questionAsHtml).join("");
  elems.article.innerHTML = html;
}

function questionAsHtml(question: Question): string {
  return `
    <div class="question">
      <h2>${question.id}</h2>
      <div class="question-body">${marked.parse(question.question_text)}</div>
      <details>
        <summary>정답 및 해설</summary>
        <p class="short-answer">정답: ${marked.parseInline(question.short_answer)}</p>
        <div class="long-answer">${marked.parse(question.long_answer_text)}</div>
      </details>
    </div>
  `;
}

function renderHeader(subject: string) {
  let subjectKr: string;
  let notesHtml: string;
  if (subject === "cs") {
    subjectKr = "컴퓨터공학";
    notesHtml = csNotesHtml;
  } else if (subject === "math") {
    subjectKr = "수학";
    notesHtml = mathNotesHtml;
  } else if (subject === "bio") {
    subjectKr = "생명과학";
    notesHtml = bioNotesHtml;
  } else if (subject === "phys") {
    subjectKr = "물리학";
    notesHtml = physNotesHtml;
  } else if (subject === "chem") {
    subjectKr = "화학";
    notesHtml = chemNotesHtml;
  } else {
    subjectKr = "";
    notesHtml = "";
  }

  let html = `
    <h1>포카전 과학퀴즈 ${subjectKr} 기출문제</h1>
  `;

  if (notesHtml.trim().length > 0) {
    html += `<h2>유의 사항</h2>${notesHtml}`;
  }

  elems.header.innerHTML = html;
}

// biome-ignore lint/suspicious/noExplicitAny: Promise.catch의 인자는 any 타입을 가짐.
function renderError(reason: any) {
  let msg: string;
  if (reason instanceof Error) {
    msg = reason.message;
  } else {
    msg = reason?.toString() || "unknown error";
  }

  elems.main.innerHTML = `<div class="error">오류: ${msg}</div>`;
}

main().catch(renderError);

// 인쇄 시 모든 <details> 원소 열어서 정답 표시하기.
window.addEventListener("beforeprint", () => {
  document.querySelectorAll("details").forEach((elem) => {
    if (elem.hasAttribute("open")) {
      elem.dataset.wasOpen = "true";
    } else {
      elem.setAttribute("open", "");
    }
  });
});

// 인쇄 모드 종료 시 다시 원상복구.
window.addEventListener("afterprint", () => {
  document.querySelectorAll("details").forEach((elem) => {
    if (elem.dataset.wasOpen === "true") {
      delete elem.dataset.wasOpen;
    } else {
      elem.removeAttribute("open");
    }
  });
});
