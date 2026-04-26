import { computePosition, offset, shift } from "@floating-ui/dom";
import type { TextMatchTransformer, Transformer } from "@lexical/markdown";
import katex, { type KatexOptions } from "katex";
import {
  $create,
  $getState,
  $getStateChange,
  $setSelection,
  $setState,
  createState,
  DecoratorNode,
  defineExtension,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import "katex/dist/katex.min.css";

const equationState = createState("equation", {
  parse: (v) => (typeof v === "string" ? v : ""),
});

const inlineState = createState("inline", {
  parse: (v) => (typeof v === "boolean" ? v : true),
});

export class EquationNode extends DecoratorNode<null> {
  katexErrorMsg: string | null = null;

  $config() {
    return this.config("equation", {
      extends: DecoratorNode,
      stateConfigs: [{ stateConfig: equationState }, { stateConfig: inlineState }],
    });
  }

  createDOM(_config: EditorConfig, editor: LexicalEditor): HTMLSpanElement {
    const root = document.createElement("span");
    Object.assign(root.style, {
      cursor: "pointer",
    });

    this._renderKatex(root);
    this._setupDialog(root, editor);
    return root;
  }

  updateDOM(prevNode: EquationNode, root: HTMLSpanElement): false {
    const equationChange = $getStateChange(prevNode, this, equationState);
    const inlineChange = $getStateChange(prevNode, this, inlineState);
    if (equationChange || inlineChange) {
      this._renderKatex(root.querySelector("span")!);
    }

    return false;
  }

  _renderKatex(root: HTMLSpanElement): void {
    const equation = $getState(this, equationState);
    const inline = $getState(this, inlineState);

    const katexOptions: KatexOptions = {
      displayMode: !inline,
      errorColor: "#cc0000",
      output: "html",
      strict: "warn",
    };

    const errorSpan = document.querySelector(`dialog[data-katex-dialog] span[data-id="errorSpan"]`);

    try {
      if (equation.trim().length > 0) {
        katex.render(equation, root, katexOptions);
      } else {
        katex.render(String.raw`\LaTeX`, root);
      }

      this.katexErrorMsg = null;
      if (errorSpan) errorSpan.textContent = "";
    } catch (err) {
      if (err instanceof katex.ParseError) {
        this.katexErrorMsg = err.message;

        if (errorSpan) {
          errorSpan.textContent = this.katexErrorMsg;
        }

        katex.render(equation, root, {
          ...katexOptions,
          throwOnError: false,
        });
      } else {
        throw err;
      }
    }
  }

  _setupDialog(root: HTMLSpanElement, editor: LexicalEditor): void {
    // 수식 클릭 시 다이얼로그 표시.
    // 매번 클릭 시 새로운 다이얼로그 원소를 만들고, 다이얼로그가 닫히면 원소를 삭제.
    // 노드의 DOM에 미리 다이얼로그를 만들어 붙여놓으면 레이아웃에 문제가 발생하기 때문.
    root.addEventListener("click", async () => {
      // 다이얼로그 원소 생성
      const dialog = document.createElement("dialog") as HTMLDialogElement;
      dialog.setAttribute("data-katex-dialog", "");
      dialog.setAttribute("popover", "");
      dialog.setAttribute("closedby", "any");
      dialog.innerHTML = `
        <textarea placeholder="\\LaTeX" name="equation"></textarea>
        <p>
          <button>입력</button>
          <span data-id="errorSpan"></span>
        </p>
      `;
      const equationTextArea = dialog.querySelector("textarea") as HTMLTextAreaElement;
      const errorSpan = dialog.querySelector("span") as HTMLSpanElement;
      const closeBtn = dialog.querySelector("button") as HTMLButtonElement;

      Object.assign(dialog.style, {
        margin: 0,
        width: "max-content",
        position: "absolute",
        top: 0,
        left: 0,
      });
      Object.assign(equationTextArea.style, {
        "font-family": "monospace",
        width: "300px",
        height: "100px",
      });
      Object.assign(errorSpan.style, {
        color: "red",
        "margin-left": "5px",
      });
      Object.assign(errorSpan.parentElement!.style, {
        width: "300px",
        margin: 0,
      });

      // 다이얼로그 textarea의 값을 현재 수식으로 설정
      editor.getEditorState().read(() => {
        equationTextArea.value = $getState(this, equationState);
      });

      // 현재 수식에 오류가 있다면 다이얼로그에 표시
      if (this.katexErrorMsg !== null) {
        errorSpan.textContent = this.katexErrorMsg;
      }

      // 수식 변경 시 새로 랜더링
      equationTextArea.addEventListener("input", () => {
        editor.update(() => {
          // selection을 제거하지 않으면 (수식 노드 밖의) 기존에 선택된 부분에 텍스트가 입력되는 문제 발생.
          $setSelection(null);

          // 아래 코드 실행 시 lexical 에서 상태가 변경된 것을 감지하고 updateDOM() 함수를 실행함.
          $setState(this, equationState, equationTextArea.value);
        });
      });

      // 다이얼로그를 닫으면 다이얼로그 원소 삭제.
      dialog.addEventListener("toggle", (evt_) => {
        if (evt_.newState !== "closed") return;
        console.log("dialog closed");
        dialog.remove();

        // 수식의 끝 부분에 커서가 가도록 설정. 아래 코드가 없으면 커서가 수식의 맨 앞으로 이동.
        editor.update(() => {
          this.selectNext();
        });
      });

      // "입력" 버튼을 누르면 다이얼로그 숨기기.
      closeBtn.addEventListener("click", () => dialog.hidePopover());

      // 다이얼로그를 popover API를 이용해서 표시.
      document.body.appendChild(dialog);
      dialog.showPopover();
      equationTextArea.focus();

      // 다이얼로그 위치를 수식 아래로 설정.
      // 다이얼로그가 숨겨져 있으면 위치가 제대로 계산되지 않으므로 다음 코드는 반드시
      // dialog.showPopover()` 보다 뒤에 와야 함.
      await computePosition(root, dialog, {
        placement: "bottom",
        middleware: [offset(10), shift({ padding: 10 })],
      }).then(({ x, y }) => {
        Object.assign(dialog.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
  }

  decorate(): null {
    return null;
  }
}

export interface EquationNodeOptions {
  equation: string;
  inline: boolean;
}

export function $createEquationNode(opts: EquationNodeOptions): EquationNode {
  const node = $create(EquationNode);
  $setState(node, equationState, opts.equation);
  $setState(node, inlineState, opts.inline);
  return node;
}

export function $isEquationNode(node: LexicalNode | null | undefined): node is EquationNode {
  return node instanceof EquationNode;
}

const EQUATION_BLOCK_REGEX = /\$\$([^$]+?)\$\$/;
const EQUATION_INLINE_REGEX = /(?<!\$)\$([^$]+?)\$(?!\$)/;

export const EQUATION_BLOCK_TRANSFORMER: TextMatchTransformer = {
  dependencies: [EquationNode],
  export(node: LexicalNode): string | null {
    if (!$isEquationNode(node)) return null;
    const isInline = $getState(node, inlineState);
    if (isInline) return null;

    const equation = $getState(node, equationState);
    return `$$${equation}$$`;
  },
  importRegExp: EQUATION_BLOCK_REGEX,
  regExp: EQUATION_BLOCK_REGEX,
  replace(node: LexicalNode, match: RegExpMatchArray): void {
    const [, equation] = match;
    const equationNode = $createEquationNode({ equation, inline: false });
    node.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export const EQUATION_INLINE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [EquationNode],
  export(node: LexicalNode): string | null {
    if (!$isEquationNode(node)) return null;
    const isInline = $getState(node, inlineState);
    if (!isInline) return null;

    const equation = $getState(node, equationState);
    return `$${equation}$`;
  },
  importRegExp: EQUATION_INLINE_REGEX,
  regExp: EQUATION_INLINE_REGEX,
  replace(node: LexicalNode, match: RegExpMatchArray) {
    const [, equation] = match;
    const equationNode = $createEquationNode({ equation, inline: true });
    node.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export const EQUATION_TRANSFORMERS: Transformer[] = [
  EQUATION_BLOCK_TRANSFORMER,
  EQUATION_INLINE_TRANSFORMER,
];

export const KatexExtension = defineExtension({
  name: "@scilog/lexical-katex",
  nodes: () => [EquationNode],
});
