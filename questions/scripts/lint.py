#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "mistune>=3.2.0",
#     "pyyaml>=6.0.3",
#     "termcolor>=3.3.0",
# ]
# ///

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
    QuestionLoadingError
)


SRC_DIR = Path(__file__, '../../src').resolve()
VALID_SUBJECTS = set(['cs', 'math', 'chem', 'bio', 'phys', 'unknown'])


class LintError(Exception):
    def __init__(self, message, rule=None, question=None):
        super().__init__(message)
        self.rule = rule
        self.question = question
        

class Check(Protocol):
    def __call__(self, q: Question) -> CheckResult:
        ...

    def rule_name(self) -> str:
        ...

    def default_msg(self) -> str:
        ...

class CheckResult:
    def __init__(self, q: Question, check: Check, ok: bool, msg: Optional[str] = None):
        self.q = q
        self.check = check
        self.ok = ok
        self.msg = msg

    def output(self) -> str:
        status = colored('OK', 'green') if self.ok else colored('WARN', 'yellow')
        msg = self.check.default_msg() if self.msg is None else self.msg
        rule_name = colored('(' + self.check.rule_name() + ')', 'dark_grey')
        return f'{status} {msg} {rule_name}'
        

class CheckIdFormat(Check):
    def __call__(self, q: Question) -> CheckResult:
        year = q.meta['year']
        subject = q.meta['subject']
        id_regex = re.compile(f'{year}-{subject}-\\d+')
        return CheckResult(q, self, id_regex.match(q.meta['id']) is not None)

    def rule_name(self) -> str:
        return 'id-format'
    
    def default_msg(self) -> str:
        return 'ID format should be in {year}-{subject}-{digit} format'

class CheckDirname(Check):
    def __call__(self, q: Question) -> CheckResult:
        return CheckResult(q, self, q.dir.parts[-1] == q.meta['id'])

    def rule_name(self):
        return 'dirname'
    
    def default_msg(self):
        return 'directory name should match question ID'
    
class CheckExtraKeys(Check):
    def __call__(self, q):
        extra_keys = set(q.meta.keys()) - META_REQUIRED_KEYS
        if len(extra_keys) > 0:
            extra_keys_str = ', '.join(extra_keys)
            return CheckResult(q, self, False, self.default_msg() + f'. Extra keys found: {extra_keys_str}')
        return CheckResult(q, self,  True)

    def rule_name(self):
        return 'extra-keys'
    
    def default_msg(self):
        return f'{META_FILENAME} should not contain extra keys'

class CheckYearRange(Check):
    def __call__(self, q):
        return CheckResult(q, self, 2000 <= q.meta['year'] < 3000)

    def rule_name(self):
        return 'year-range'
    
    def default_msg(self):
        return 'year should be in range [2000, 3000)'

class CheckSubject(Check):
    def __call__(self, q):
        return CheckResult(q, self, q.meta['subject'] in VALID_SUBJECTS)

    def rule_name(self):
        return 'subject'

    def default_msg(self):
        subjects_str = ', '.join(VALID_SUBJECTS)
        return f'subject should be one of known types: {subjects_str}'

class CheckNoEmptyQuestion(Check):
    def __call__(self, q):
        return CheckResult(q, self, len(q.question_text.strip()) > 0)

    def rule_name(self):
        return 'no-empty-question'
    
    def default_msg(self):
        return f'{QUESTION_FILENAME} should not be empty'
    
class CheckNoEmptyAnswer(Check):
    def __call__(self, q):
        return CheckResult(q, self, len(q.long_answer_text.strip()) > 0)
    
    def rule_name(self):
        return 'no-empty-answer'

    def default_msg(self):
        return f'{LONG_ANSWER_FILENAME} should not be empty'
    
class CheckQuestionNoInvalidRef(Check):
    def __call__(self, q):
        invalid_refs = q.question_refs - q.assets
        if len(invalid_refs) > 0:
            invalid_refs_str = ', '.join(str(p) for p in invalid_refs)
            return CheckResult(q, self, False, f'{self.default_msg()}: {invalid_refs_str}')
        return CheckResult(q, self, True)
    
    def rule_name(self):
        return 'question-no-invalid-ref'
    
    def default_msg(self):
        return f'{QUESTION_FILENAME} should not have invalid reference'

class CheckLongAnswerNoInvalidRef(Check):
    def __call__(self, q):
        invalid_refs = q.long_answer_refs - q.assets
        if len(invalid_refs) > 0:
            invalid_refs_str = ', '.join(str(p) for p in invalid_refs)
            return CheckResult(q, self, False, f'{self.default_msg()}: {invalid_refs_str}')
        return CheckResult(q, self, True)
    
    def rule_name(self):
        return 'long-answer-no-invalid-ref'
    
    def default_msg(self):
        return f'{LONG_ANSWER_FILENAME} should not have invalid reference'
    
class CheckNoUnusedAsset(Check):
    def __call__(self, q):
        unused_assets = q.assets - q.refs
        if len(unused_assets) > 0:
            unused_assets_str = ', '.join(str(p) for p in unused_assets)
            return CheckResult(q, self, False, f'{self.default_msg()}: {unused_assets_str}')
        return CheckResult(q, self, True)
    
    def rule_name(self):
        return 'no-unused-asset'
    
    def default_msg(self):
        return f'all assets must be referenced either by {QUESTION_FILENAME} or {LONG_ANSWER_FILENAME}'

checks = [
    CheckIdFormat(),
    CheckDirname(),
    CheckExtraKeys(),
    CheckYearRange(),
    CheckSubject(),
    CheckNoEmptyQuestion(),
    CheckNoEmptyAnswer(),
    CheckQuestionNoInvalidRef(),
    CheckLongAnswerNoInvalidRef(),
    CheckNoUnusedAsset(),
]

def check_all(path: Path) -> bool:
    try:
        q = Question(path)
    except QuestionLoadingError as e:
        print(colored('ERR', 'red'), 'failed to load question:', str(e))
        return False
    
    failures = []
    for c in checks:
        result = c(q)
        if not result.ok:
            failures.append(result)

    if len(failures) > 0:
        print(q.dir)
        for f in failures:
            print('  ' + f.output())
        return False

    return True
    

failed = False
for p in SRC_DIR.iterdir():
    if not p.is_dir():
        continue
    ok = check_all(p)
    if not ok and not failed:
        failed = True

if failed:
    sys.exit(1)