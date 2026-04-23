import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/extension";
import {
  type ElementTransformer,
  TRANSFORMERS as MARKDOWN_TRANSFORMERS,
  type Transformer,
} from "@lexical/markdown";
import type { LexicalNode } from "lexical";
import { createImageTransformer, type FileImportHelper } from "./Image";
import { EQUATION_TRANSFORMERS } from "./Katex";

const HORIZONTAL_RULE_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "---" : null;
  },
  regExp: /^---\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const hrNode = $createHorizontalRuleNode();

    // 마크다운 문서를 가져오는 상황이라면 노드를 그대로 교체.
    // 편집중인 상황이라면 현재 문장 바로 전에 삽입.
    if (isImport || parentNode.getNextSibling() !== null) {
      parentNode.replace(hrNode);
    } else {
      parentNode.insertBefore(hrNode);
    }

    // 다음 노드로 포커스 이동.
    hrNode.selectNext();
  },
  type: "element",
};

export function createTransformers(importHelper: FileImportHelper): Transformer[] {
  return [
    createImageTransformer(importHelper),
    HORIZONTAL_RULE_TRANSFORMER,
    ...EQUATION_TRANSFORMERS,
    ...MARKDOWN_TRANSFORMERS,
  ];
}
