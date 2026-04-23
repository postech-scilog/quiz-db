/*
 * `@lexical/code-prism` 패키지가 `CodePrismExtension` 을 노출하지 않는 관계로
 * https://github.com/facebook/lexical/blob/1ca42f1d88140abfd929a854615705c035c5b99b/packages/lexical-code-prism/src/CodeHighlighterPrism.ts#L921
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

import { CodeExtension } from "@lexical/code";
import { PrismTokenizer, registerCodeHighlighting } from "@lexical/code-prism";
import { defineExtension, effect, namedSignals } from "@lexical/extension";

export const CodePrismExtension = defineExtension({
  build: (_editor, config) => namedSignals(config),
  config: {
    disabled: false,
    tokenizer: PrismTokenizer,
  },
  dependencies: [CodeExtension],
  name: "@scilog/code-prism",
  register(editor, _config, state) {
    const stores = state.getOutput();
    return effect(() => {
      if (stores.disabled.value) return;
      return registerCodeHighlighting(editor, stores.tokenizer.value);
    });
  },
});
