#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "mistune>=3.2.0",
#     "pyyaml>=6.0.3",
#     "termcolor>=3.3.0",
# ]
# ///

"""
아카이브의 문제들이 실수 없이 작성되었는지 검사하기 위한 스크립트.

아카이브의 유지관리성을 위해서는 문제 작성 과정에서 흔하게 발생하는 실수들을 방지해야 한다.
이러한 실수들은 파일 형식의 올바름과는 관계없이 발생할 수 있는데,
예를 들어 아무 곳에도 참조되지 않는 첨부 파일이 특정 문제의 디렉토리에 포함되는 경우가 대표적이다.
이 스크립트는 이러한 실수들의 일부를 자동화된 방식으로 빠르게 잡아내기 위한 목적으로 작성되었다.

이 스크립트는 mistune 등 외부 패키지에 의존하므로 `uv` 등의 도구를 이용해서 다음과 같이
실행되어야 한다:

```
uv run --script lint.py
```

또는 맨 윗줄에 자동으로 `uv`를 호출하는 shebang이 포함되어 있다는 것을 이용해 바로 실행하는 것도
가능하다:

```
./scripts/lint.py
```

이 스크립트는 `questions` 디렉토리 안의 어느 위치에서 실행해도 정상적으로 동작한다.
"""

from __future__ import annotations
from pathlib import Path
from typing import Optional, Protocol
import sys
import re
from termcolor import colored
from Question import (
    Question,
    META_REQUIRED_KEYS,
    META_FILENAME,
    QUESTION_FILENAME,
    LONG_ANSWER_FILENAME,
    QuestionLoadingError,
)


def main():
    src_dir = Path(__file__, "../../src").resolve()

    # src 디렉토리 안의 모든 디렉토리에 대해서 `check_all()` 호출.
    failed = False
    count = 0
    for p in src_dir.iterdir():
        if not p.is_dir():
            continue
        ok = check_all(p)
        if ok:
            count += 1
        elif not failed:
            failed = True

    # 단 한 문제에서라도 문제가 발생했을 시 종료 코드 설정.
    if failed:
        sys.exit(1)
    else:
        print(f"Checked {count} questions. OK.")


def check_all(question_dir: Path) -> bool:
    """
    `question_dir` 디렉토리에 대해 정의된 모든 체크들을 실행한다.
    모든 체크를 통과했을 시 `True`를, 한 체크라도 실패했을시 `False`를 반환한다.
    """

    checks = [
        CheckIdFormat(),
        CheckDirname(),
        CheckExtraKeys(),
        CheckYearRange(),
        CheckSubject(),
        CheckNoEmptyQuestion(),
        CheckQuestionNoInvalidRef(),
        CheckLongAnswerNoInvalidRef(),
        CheckNoUnusedAsset(),
    ]

    try:
        q = Question(question_dir)
    except QuestionLoadingError as e:
        print(colored("ERR", "red"), "failed to load question:", str(e))
        return False

    # 각 체크들은 어느 정도 독립적으므로, 번거로움을 줄이기 위해 모든 체크를 실행한 후
    # 발생한 오류들을 한번에 모아 출력.
    failures = []
    for c in checks:
        result = c(q)
        if not result.ok:
            failures.append(result)

    if len(failures) > 0:
        print(q.dir)
        for f in failures:
            print("  " + f.output())
        return False

    return True


class Check(Protocol):
    """
    각 체크 항목을 나타내는 프로토콜.
    """

    def __call__(self, q: Question) -> CheckResult:
        """
        문제 `q` 에 대해서 체크를 실행한다.
        """
        ...

    def rule_name(self) -> str:
        """
        체크 항목의 이름을 반환하는 함수. 결과 출력시 유용히 사용된다.
        """
        ...

    def default_msg(self) -> str:
        """
        체크 항목의 기본 오류 메시지. 결과 출력시 설정된 오류 메시지가 별도로 없다면 해당 메시지가
        출력된다.
        """
        ...


class CheckResult:
    """
    체크 항목의 결과를 나타내는 클래스.
    """

    def __init__(self, q: Question, check: Check, ok: bool, msg: Optional[str] = None):
        self.q = q
        self.check = check
        self.ok = ok
        self.msg = msg

    def output(self) -> str:
        """
        터미널에 출력하기 위한 용도로 스타일링된 결과 문자열을 반환하는 함수.
        """

        status = colored("OK", "green") if self.ok else colored("WARN", "yellow")
        msg = self.check.default_msg() if self.msg is None else self.msg
        rule_name = colored("(" + self.check.rule_name() + ")", "dark_grey")
        return f"{status} {msg} {rule_name}"


class CheckIdFormat(Check):
    """
    `meta.yml` 의 `id` 필드가 `{year}-{subject}-{digit}` 포멧인지 확인한다.

    `year` 부분은 `year` 필드와, `subject` 부분은 `subject` 필드와 일치해야 하며,
    `digit` 부분에는 임의의 숫자가 들어갈 수 있다.

    올바른 예시:

    .. code-block:: yaml

        id: 2024-cs-1
        year: 2024
        subject: cs

    올바르지 않은 예시:

    .. code-block:: yaml

        id: 2023-math-x
        year: 2024
        subject: cs
    """

    def __call__(self, q: Question) -> CheckResult:
        year = q.meta["year"]
        subject = q.meta["subject"]
        id_regex = re.compile(f"{year}-{subject}-\\d+")
        return CheckResult(q, self, id_regex.match(q.meta["id"]) is not None)

    def rule_name(self) -> str:
        return "id-format"

    def default_msg(self) -> str:
        return "ID format should be in {year}-{subject}-{digit} format"


class CheckDirname(Check):
    """
    문제 디렉토리 이름이 `meta.yml` 의 `id` 필드와 일치하는지 확인한다.
    """

    def __call__(self, q: Question) -> CheckResult:
        return CheckResult(q, self, q.dir.parts[-1] == q.meta["id"])

    def rule_name(self):
        return "dirname"

    def default_msg(self):
        return "directory name should match question ID"


class CheckExtraKeys(Check):
    """
    `meta.yml` 에 알려지지 않은 키가 포함되어 있는지 확인한다.

    만약 새로운 키를 추가해야 할 경우, 해당 체크는 그대로 두고 `Question.py` 모듈의
    `META_REQUIRED_KEYS` 에 키를 추가하면 된다.

    올바른 예시:

    .. code-block:: yaml

        id: 2024-cs-1
        year: 2024
        subject: cs
        short_answer: '16'

    올바르지 않은 예시:

    .. code-block:: yaml

        priority: high  # 알려지지 않은 키
        id: 2024-cs-1
        year: 2024
        subject: cs
        short_answer: '16'
    """

    def __call__(self, q):
        extra_keys = set(q.meta.keys()) - META_REQUIRED_KEYS
        if len(extra_keys) > 0:
            extra_keys_str = ", ".join(extra_keys)
            return CheckResult(
                q,
                self,
                False,
                self.default_msg() + f". Extra keys found: {extra_keys_str}",
            )
        return CheckResult(q, self, True)

    def rule_name(self):
        return "extra-keys"

    def default_msg(self):
        return f"{META_FILENAME} should not contain extra keys"


class CheckYearRange(Check):
    """
    `meta.yml` 의 `year` 필드의 값이 적절한 구간의 값 (2000 이상 3000 미만) 인지 확인한다.
    """

    def __call__(self, q):
        return CheckResult(q, self, 2000 <= q.meta["year"] < 3000)

    def rule_name(self):
        return "year-range"

    def default_msg(self):
        return "year should be in range [2000, 3000)"


class CheckSubject(Check):
    """
    `meta.yml` 의 `subject` 필드가 알려진 값 중 하나인지 확인한다.

    현재 허용된 값으로는 컴퓨터공학 (`cs`), 수학 (`math`), 화학 (`chem`), 생명공학 (`bio`),
    물리학 (`phys`), 그리고 미분류 (`unknown`) 이 있다.
    """

    valid_subjects = set(["cs", "math", "chem", "bio", "phys", "unknown"])

    def __call__(self, q):
        return CheckResult(q, self, q.meta["subject"] in self.valid_subjects)

    def rule_name(self):
        return "subject"

    def default_msg(self):
        subjects_str = ", ".join(self.valid_subjects)
        return f"subject should be one of known types: {subjects_str}"


class CheckNoEmptyQuestion(Check):
    """
    `question.md` 파일의 내용이 없는 경우를 잡아낸다.
    """

    def __call__(self, q):
        return CheckResult(q, self, len(q.question_text.strip()) > 0)

    def rule_name(self):
        return "no-empty-question"

    def default_msg(self):
        return f"{QUESTION_FILENAME} should not be empty"


class CheckQuestionNoInvalidRef(Check):
    """
    `question.md` 파일이 참조하는 첨부파일들이 모두 올바른지 확인한다.

    마크다운 파일은 첨부파일을 사진 또는 링크의 형태로 참조할 수 있는데, 이 참조가 가리키는 파일이
    동일 디렉토리에 존재하지 않는 경우를 잡아낸다.

    아래 예시에서는 다음과 같은 파일들이 디렉토리에 포함되어 있다고 상정한다.

    .. code-block:: text
        - meta.yml
        - question.md
        - answer.md
        - tree.png
        - extra.txt

    올바른 예시:

    .. code-block:: markdown

        아래 트리를 보아라:
        ![트리](./tree.png)

        또는 [이 파일](./extra.txt)을 보아라.

    올바르지 않은 예시:

    .. code-block:: markdown

        아래 트리를 보아라:
        ![트리](./the-tree.png)

        또는 [이 파일](./this-file.txt)을 보아라.
    """

    def __call__(self, q):
        invalid_refs = q.question_refs - q.assets
        if len(invalid_refs) > 0:
            invalid_refs_str = ", ".join(str(p) for p in invalid_refs)
            return CheckResult(
                q, self, False, f"{self.default_msg()}: {invalid_refs_str}"
            )
        return CheckResult(q, self, True)

    def rule_name(self):
        return "question-no-invalid-ref"

    def default_msg(self):
        return f"{QUESTION_FILENAME} should not have invalid reference"


class CheckLongAnswerNoInvalidRef(Check):
    """
    `answer.md` 파일이 참조하는 첨부파일들이 모두 올바른지 확인한다.

    자세한 설명은 `CheckQuestionNoInvalidRef` 클래스의 docstring 을 참조하여라.
    """

    def __call__(self, q):
        invalid_refs = q.long_answer_refs - q.assets
        if len(invalid_refs) > 0:
            invalid_refs_str = ", ".join(str(p) for p in invalid_refs)
            return CheckResult(
                q, self, False, f"{self.default_msg()}: {invalid_refs_str}"
            )
        return CheckResult(q, self, True)

    def rule_name(self):
        return "long-answer-no-invalid-ref"

    def default_msg(self):
        return f"{LONG_ANSWER_FILENAME} should not have invalid reference"


class CheckNoUnusedAsset(Check):
    """
    `question.md` 및 `answer.md` 가 참조하지 않는 첨부파일이 존재하는지 확인한다.
    """

    def __call__(self, q):
        unused_assets = q.assets - q.refs
        if len(unused_assets) > 0:
            unused_assets_str = ", ".join(str(p) for p in unused_assets)
            return CheckResult(
                q, self, False, f"{self.default_msg()}: {unused_assets_str}"
            )
        return CheckResult(q, self, True)

    def rule_name(self):
        return "no-unused-asset"

    def default_msg(self):
        return f"all assets must be referenced either by {QUESTION_FILENAME} or {LONG_ANSWER_FILENAME}"


if __name__ == "__main__":
    main()
