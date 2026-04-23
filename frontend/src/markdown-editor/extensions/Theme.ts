/*
 * https://github.com/facebook/lexical/blob/1ca42f1d88140abfd929a854615705c035c5b99b/packages/lexical-playground/src/themes/MarkdownEditorTheme.ts
 * 에서 가져옴.
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { defineExtension, type EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {
  blockCursor: "MarkdownEditorTheme__blockCursor",
  characterLimit: "MarkdownEditorTheme__characterLimit",
  code: "MarkdownEditorTheme__code",
  codeHighlight: {
    atrule: "MarkdownEditorTheme__tokenAttr",
    attr: "MarkdownEditorTheme__tokenAttr",
    boolean: "MarkdownEditorTheme__tokenProperty",
    builtin: "MarkdownEditorTheme__tokenSelector",
    cdata: "MarkdownEditorTheme__tokenComment",
    char: "MarkdownEditorTheme__tokenSelector",
    class: "MarkdownEditorTheme__tokenFunction",
    "class-name": "MarkdownEditorTheme__tokenFunction",
    comment: "MarkdownEditorTheme__tokenComment",
    constant: "MarkdownEditorTheme__tokenProperty",
    deleted: "MarkdownEditorTheme__tokenProperty",
    doctype: "MarkdownEditorTheme__tokenComment",
    entity: "MarkdownEditorTheme__tokenOperator",
    function: "MarkdownEditorTheme__tokenFunction",
    important: "MarkdownEditorTheme__tokenVariable",
    inserted: "MarkdownEditorTheme__tokenSelector",
    keyword: "MarkdownEditorTheme__tokenAttr",
    namespace: "MarkdownEditorTheme__tokenVariable",
    number: "MarkdownEditorTheme__tokenProperty",
    operator: "MarkdownEditorTheme__tokenOperator",
    prolog: "MarkdownEditorTheme__tokenComment",
    property: "MarkdownEditorTheme__tokenProperty",
    punctuation: "MarkdownEditorTheme__tokenPunctuation",
    regex: "MarkdownEditorTheme__tokenVariable",
    selector: "MarkdownEditorTheme__tokenSelector",
    string: "MarkdownEditorTheme__tokenSelector",
    symbol: "MarkdownEditorTheme__tokenProperty",
    tag: "MarkdownEditorTheme__tokenProperty",
    url: "MarkdownEditorTheme__tokenOperator",
    variable: "MarkdownEditorTheme__tokenVariable",
  },
  embedBlock: {
    base: "MarkdownEditorTheme__embedBlock",
    focus: "MarkdownEditorTheme__embedBlockFocus",
  },
  hashtag: "MarkdownEditorTheme__hashtag",
  heading: {
    h1: "MarkdownEditorTheme__h1",
    h2: "MarkdownEditorTheme__h2",
    h3: "MarkdownEditorTheme__h3",
    h4: "MarkdownEditorTheme__h4",
    h5: "MarkdownEditorTheme__h5",
    h6: "MarkdownEditorTheme__h6",
  },
  image: "editor-image",
  indent: "MarkdownEditorTheme__indent",
  inlineImage: "inline-editor-image",
  layoutContainer: "MarkdownEditorTheme__layoutContainer",
  layoutItem: "MarkdownEditorTheme__layoutItem",
  link: "MarkdownEditorTheme__link",
  list: {
    listitem: "MarkdownEditorTheme__listItem",
    listitemChecked: "MarkdownEditorTheme__listItemChecked",
    listitemUnchecked: "MarkdownEditorTheme__listItemUnchecked",
    nested: {
      listitem: "MarkdownEditorTheme__nestedListItem",
    },
    olDepth: [
      "MarkdownEditorTheme__ol1",
      "MarkdownEditorTheme__ol2",
      "MarkdownEditorTheme__ol3",
      "MarkdownEditorTheme__ol4",
      "MarkdownEditorTheme__ol5",
    ],
    ul: "MarkdownEditorTheme__ul",
  },
  ltr: "MarkdownEditorTheme__ltr",
  mark: "MarkdownEditorTheme__mark",
  markOverlap: "MarkdownEditorTheme__markOverlap",
  paragraph: "MarkdownEditorTheme__paragraph",
  quote: "MarkdownEditorTheme__quote",
  rtl: "MarkdownEditorTheme__rtl",
  table: "MarkdownEditorTheme__table",
  tableAddColumns: "MarkdownEditorTheme__tableAddColumns",
  tableAddRows: "MarkdownEditorTheme__tableAddRows",
  tableCell: "MarkdownEditorTheme__tableCell",
  tableCellActionButton: "MarkdownEditorTheme__tableCellActionButton",
  tableCellActionButtonContainer: "MarkdownEditorTheme__tableCellActionButtonContainer",
  tableCellEditing: "MarkdownEditorTheme__tableCellEditing",
  tableCellHeader: "MarkdownEditorTheme__tableCellHeader",
  tableCellPrimarySelected: "MarkdownEditorTheme__tableCellPrimarySelected",
  tableCellResizer: "MarkdownEditorTheme__tableCellResizer",
  tableCellSelected: "MarkdownEditorTheme__tableCellSelected",
  tableCellSortedIndicator: "MarkdownEditorTheme__tableCellSortedIndicator",
  tableResizeRuler: "MarkdownEditorTheme__tableCellResizeRuler",
  tableSelected: "MarkdownEditorTheme__tableSelected",
  tableSelection: "MarkdownEditorTheme__tableSelection",
  text: {
    bold: "MarkdownEditorTheme__textBold",
    code: "MarkdownEditorTheme__textCode",
    italic: "MarkdownEditorTheme__textItalic",
    strikethrough: "MarkdownEditorTheme__textStrikethrough",
    subscript: "MarkdownEditorTheme__textSubscript",
    superscript: "MarkdownEditorTheme__textSuperscript",
    underline: "MarkdownEditorTheme__textUnderline",
    underlineStrikethrough: "MarkdownEditorTheme__textUnderlineStrikethrough",
  },
};

export const ThemeExtension = defineExtension({
  name: "@scilog/lexical-theme",
  theme,
});
