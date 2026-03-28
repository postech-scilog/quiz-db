from pathlib import Path
from urllib.parse import urlsplit
import yaml
import mistune


META_FILENAME = 'meta.yml'
QUESTION_FILENAME = 'question.md'
LONG_ANSWER_FILENAME = 'answer.md'
SPECIAL_FILES = set([META_FILENAME, QUESTION_FILENAME, LONG_ANSWER_FILENAME])
META_REQUIRED_KEYS = set(['id', 'year', 'subject', 'short_answer'])

parse_markdown = mistune.create_markdown(renderer='ast')


class QuestionLoadingError(Exception):
    ...

class Question:
    def __init__(self, dir: Path):
        self.dir = dir
        self.try_load_meta()
        self.try_load_question()
        self.try_load_long_answer()
        self.assets = set(p.resolve() for p in dir.iterdir() if p.name not in SPECIAL_FILES)
        self.resolve_references()

    def try_load_meta(self):
        self.meta_path = self.dir / META_FILENAME
        if not self.meta_path.exists():
            self.raise_err(f'{META_FILENAME} does not exists')

        with self.meta_path.open('r') as f:
            try:
                self.meta = yaml.load(f, Loader=yaml.Loader)
            except Exception as e:
                self.raise_err(f'Failed to parse {META_FILENAME}', e)

        if not isinstance(self.meta, dict):
            self.raise_err(f'{META_FILENAME} must contain a single dictionary')

        actual_keys = set(self.meta.keys())
        missing_keys = META_REQUIRED_KEYS - actual_keys
        if len(missing_keys) > 0:
            missing_keys_str = ', '.join(missing_keys)
            self.raise_err(f'{META_FILENAME} is missing following keys: {missing_keys_str}')

        if not isinstance(self.meta['id'], str):
            self.raise_err(f'property `id` of {META_FILENAME} must be string')

        if not isinstance(self.meta['year'], int):
            self.raise_err(f'property `year` of {META_FILENAME} must be integer')

        if not isinstance(self.meta['subject'], str):
            self.raise_err(f'property `subject` of {META_FILENAME} must be string')

        if not isinstance(self.meta['short_answer'], str):
            self.raise_err(f'property `short_answer` of {META_FILENAME} must be string')

    def try_load_question(self):
        self.question_path = self.dir / QUESTION_FILENAME
        if not self.question_path.exists():
            self.raise_err(f'{QUESTION_FILENAME} does not exists')

        with self.question_path.open('r') as f:
            try:
                self.question_text = f.read()
            except Exception as e:
                self.raise_err(f'Failed to read {QUESTION_FILENAME}', e)

        try:
            self.question_ast = parse_markdown(self.question_text)
        except Exception as e:
            self.raise_err(f'Failed to parse {QUESTION_FILENAME}', e)

    def try_load_long_answer(self):
        self.long_answer_path = self.dir / LONG_ANSWER_FILENAME
        if not self.long_answer_path.exists():
            self.raise_err(f'{LONG_ANSWER_FILENAME} does not exists')

        with self.long_answer_path.open('r') as f:
            try:
                self.long_answer_text = f.read()
            except Exception as e:
                self.raise_err(f'Failed to read {LONG_ANSWER_FILENAME}', e)

        try:
            self.long_answer_ast = parse_markdown(self.long_answer_text)
        except Exception as e:
            self.raise_err(f'Failed to parse {QUESTION_FILENAME}', e)

    def resolve_references(self):
        self.question_refs = find_refs(self.question_ast, base=self.dir)
        self.long_answer_refs = find_refs(self.long_answer_ast, base=self.dir)
        self.refs = self.question_refs.union(self.long_answer_refs)

    def raise_err(self, msg, cause=None):
        e = QuestionLoadingError(msg + f' (source: directory {self.dir})')
        if cause:
            raise e from cause
        else:
            raise e
        
def find_refs(ast, base: Path) -> set[Path]:
    target_token_types = set(['image', 'link'])
    stack = list(reversed(ast))
    refs = set()
    while stack:
        token = stack.pop()

        if token['type'] in target_token_types:
            url = urlsplit(token['attrs']['url'])
            if len(url.scheme) > 0:
                continue
            refs.add(Path(base, url.path).resolve())
        elif 'children' in token:
            for child in reversed(token['children']):
                stack.append(child)

    return refs