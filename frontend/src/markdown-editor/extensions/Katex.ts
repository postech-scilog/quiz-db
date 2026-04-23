import type { TextMatchTransformer, Transformer } from "@lexical/markdown";
import katex from "katex";
import {
  $create,
  $getState,
  $setState,
  createState,
  DecoratorNode,
  defineExtension,
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
  $config() {
    return this.config("equation", {
      extends: DecoratorNode,
      stateConfigs: [{ stateConfig: equationState }, { stateConfig: inlineState }],
    });
  }

  createDOM(): HTMLSpanElement {
    const span = document.createElement("span");
    this._renderKatex(span);
    return span;
  }

  updateDOM(prevNode: EquationNode, dom: HTMLSpanElement): false {
    const equation = $getState(this, equationState);
    const inline = $getState(this, inlineState);
    const prevEquation = $getState(prevNode, equationState);
    const prevInline = $getState(prevNode, inlineState);

    if (equation !== prevEquation || inline !== prevInline) {
      this._renderKatex(dom);
    }

    return false;
  }

  _renderKatex(dom: HTMLSpanElement): void {
    const equation = $getState(this, equationState);
    const inline = $getState(this, inlineState);

    if (equation) {
      katex.render(equation, dom, {
        displayMode: !inline,
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
      });
    }
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
