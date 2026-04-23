import { buildEditorFromExtensions } from "@lexical/extension";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  registerMarkdownShortcuts,
  type Transformer,
} from "@lexical/markdown";
import { $getRoot, $insertNodes, type LexicalEditor, UpdateListenerPayload } from "lexical";
import { createTransformers, MarkdownEditorExtension } from "./extensions";
import { $createImageNode } from "./extensions/Image";
import "./theme.css";

export interface MarkdownContents {
  markdown: string;
  attachments: Record<string, Blob>;
}

export interface Attachment {
  blob: Blob;
  url: string;
}

export class MarkdownEditor extends HTMLElement {
  attachments: Map<string, Attachment>;
  editorRoot: HTMLDivElement;
  editor?: LexicalEditor;
  transformers?: Transformer[];
  private _clearInputEventEmitter?: () => void;

  static observedAttributes = ["readonly"];

  constructor() {
    super();
    this._initShadowRoot();
    this.editorRoot = this.querySelector(".editor-container")!;
    this.attachments = new Map();
  }

  _initShadowRoot() {
    /* BUG: shadow DOM 안에서 lexical 편집기가 작동하지 않음
     * (https://github.com/facebook/lexical/issues/8125)
     * 따라서 문제가 해결되기 전까진 light DOM 사용.
     */
    this.innerHTML = `
      <style>
          .editor-container { 
            outline: 1px solid; 
            padding: 1rem; 
            min-height: 200px; 
            max-width: 800px;
            font-family: sans-serif;
          }
      </style>
      <div class="editor-container" contenteditable="true"></div>
    `;
  }

  connectedCallback() {
    this.transformers = createTransformers((name) => this.attachments.get(name)?.url);
    this._initLexicalEditor();
    this._initDragAndDrop();
  }

  _initLexicalEditor() {
    this.editor = buildEditorFromExtensions(MarkdownEditorExtension);
    registerMarkdownShortcuts(this.editor, this.transformers);
    this.editor.setRootElement(this.editorRoot);
    this.editor.setEditable(!this.readonly);
  }

  _registerInputEventEmitter() {
    this._clearInputEventEmitter = this.editor!.registerUpdateListener(
      this._emitInputEvent.bind(this),
    );
  }

  _emitInputEvent(updateEvent: UpdateListenerPayload) {
    const { editorState } = updateEvent;
    const evt = new CustomEvent("input", {
      bubbles: true,
      cancelable: true,
      detail: {
        editorState,
      },
    });
    this.dispatchEvent(evt);
  }

  attributeChangedCallback(name: string) {
    if (name === "readonly") {
      this.editor?.setEditable(!this.readonly);
    }
  }

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }

  set readonly(val: boolean) {
    if (val) this.setAttribute("readonly", "");
    else this.removeAttribute("readonly");
  }

  fromMarkdown(md: string, attachments: Record<string, Blob>): void {
    if (!this.editor || !this.transformers) throw new Error("editor is not initialized");

    this.reset();
    for (const [key, blob] of Object.entries(attachments)) {
      this.attachments.set(key, {
        blob,
        url: URL.createObjectURL(blob),
      });
    }
    this.editor.update(() => {
      $convertFromMarkdownString(md, this.transformers);
    });
  }

  toMarkdown(): MarkdownContents {
    if (!this.editor || !this.transformers) throw new Error("editor is not initialized");

    let markdown = "";
    // TODO: is this really synchronous?
    this.editor.getEditorState().read(() => {
      markdown = $convertToMarkdownString(this.transformers);
    });
    return {
      markdown,
      attachments: Object.fromEntries(
        Array.from(this.attachments.entries()).map(([key, entry]) => [key, entry.blob]),
      ),
    };
  }

  reset(): void {
    for (const { url } of Object.values(this.attachments)) {
      URL.revokeObjectURL(url);
    }
    this.attachments.clear();

    if (this._clearInputEventEmitter) this._clearInputEventEmitter();
    this.editor?.update(
      () => {
        $getRoot().clear();
      },
      { discrete: true },
    );
    this._registerInputEventEmitter();
  }

  _initDragAndDrop() {
    this.editorRoot.addEventListener("drop", (evt) => {
      evt.preventDefault();
      if (this.readonly) return;

      if (evt.dataTransfer?.items) {
        for (const item of Array.from(evt.dataTransfer.items)) {
          const file = item.getAsFile();
          if (file) this._handleImageUpload(file);
        }
      }

      const inputEvt = new CustomEvent("input", {
        bubbles: true,
        cancelable: true,
      });
      this.dispatchEvent(inputEvt);
    });
  }

  _handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size exceeds 10MB");
      return;
    }

    const name = `${Math.random().toString(36).substring(2, 15)}-${file.name}`;
    const url = URL.createObjectURL(file);
    this.attachments.set(name, {
      blob: file,
      url,
    });

    if (!this.editor) throw new Error("editor is not initialized");
    this.editor.update(() => {
      const node = $createImageNode({ src: url, alt: name, markdownSrc: name });
      $insertNodes([node]);
    });
  }
}

export function defineMarkdownEditor() {
  customElements.define("markdown-editor", MarkdownEditor);
}
