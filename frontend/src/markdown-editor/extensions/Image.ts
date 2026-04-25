import type { TextMatchTransformer } from "@lexical/markdown";
import {
  $create,
  $getState,
  $setState,
  createState,
  DecoratorNode,
  defineExtension,
  type LexicalNode,
  type TextNode,
} from "lexical";

const srcState = createState("src", {
  parse(v) {
    return typeof v === "string" ? v : "";
  },
});

const altState = createState("alt", {
  parse(v) {
    return typeof v === "string" ? v : "";
  },
});

const markdownSrcState = createState("markdownSrc", {
  parse(v) {
    if (typeof v === "string") return v;
    else if (v === null) return null;
    else return "";
  },
});

export class ImageNode extends DecoratorNode<null> {
  $config() {
    return this.config("image", {
      extends: DecoratorNode,
      stateConfigs: [
        { stateConfig: srcState },
        { stateConfig: altState },
        { stateConfig: markdownSrcState },
      ],
    });
  }

  createDOM(): HTMLImageElement {
    const img = document.createElement("img");
    img.src = $getState(this, srcState);
    img.alt = $getState(this, altState);
    img.style.maxWidth = "100%";
    img.style.display = "block";
    return img;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLImageElement): false {
    const src = $getState(this, srcState);
    const prevSrc = $getState(prevNode, srcState);
    if (src !== prevSrc) dom.src = src;

    const alt = $getState(this, altState);
    const prevAlt = $getState(prevNode, altState);
    if (alt !== prevAlt) dom.alt = alt;

    return false;
  }

  decorate(): null {
    return null;
  }
}

export interface ImageNodeOptions {
  src: string;
  markdownSrc?: string | null;
  alt?: string;
}

export function $createImageNode(opts: ImageNodeOptions) {
  const node = $create(ImageNode);
  $setState(node, srcState, opts.src);
  $setState(node, altState, opts.alt || "");
  $setState(node, markdownSrcState, opts.markdownSrc || null);
  return node;
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

const IMAGE_REGEX = /!(?:\[([^[]*)\])(?:\(([^(]+)\))/;

export type FileImportHelper = (path: string) => string | undefined;

export function createImageTransformer(importHelper: FileImportHelper): TextMatchTransformer {
  return {
    dependencies: [ImageNode],
    export(node: LexicalNode): string | null {
      if (!$isImageNode(node)) return null;
      const alt = $getState(node, altState) || "";
      const markdownSrc = $getState(node, markdownSrcState);
      const src = $getState(node, srcState);
      const url = markdownSrc ?? src;
      return `![${alt}](${url})`;
    },
    importRegExp: IMAGE_REGEX,
    regExp: IMAGE_REGEX,
    replace(textNode: TextNode, match: RegExpMatchArray): void {
      const [, altText, url] = match;

      // 이미지 URL이 로컬 파일을 가리키는지, 아니면 http 상 문서를 가리키는지 확인.
      // 로컬 파일을 가리킬 경우 `importHelper` 를 이용해 URL을 blob URL로 변환한 후 src 속성으로 사용하고,
      // 실제 URL은 markdownSrc 속성으로 별도로 기록
      let src = "";
      let markdownSrc = null;
      if (!url.startsWith("http")) {
        const resolved = importHelper(url);
        if (!resolved) throw new Error(`Can't resolve path '${url}' to blob URL`);
        src = resolved;
        markdownSrc = url;
      } else {
        src = url;
      }

      const imageNode = $createImageNode({
        src,
        markdownSrc,
        alt: altText,
      });
      textNode.replace(imageNode);
    },
    trigger: ")",
    type: "text-match",
  };
}

export const ImageExtension = defineExtension({
  name: "@scilog/lexical-image",
  nodes: () => [ImageNode],
});
