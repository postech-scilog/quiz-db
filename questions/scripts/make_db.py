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
import sqlite3
from pathlib import Path
from Question import (
    Question
)
from urllib.parse import urlsplit
import mistune
from mistune.renderers.markdown import MarkdownRenderer

class RefConverter(MarkdownRenderer):
    def __init__(self, asset_base_dir, asset_mapping):
        self.asset_base_dir = asset_base_dir
        self.asset_mapping = asset_mapping

    def link(self, token, state):
        return super().link(self.replace_asset_ref(token), state)
    
    def image(self, token, state):
        return super().image(self.replace_asset_ref(token), state)

    def replace_asset_ref(self, token):
        url = urlsplit(token['attrs']['url'])
        if len(url.scheme) > 0:
            return token
        if url.path.startswith('/assets'):
            return token
        
        path = Path(self.asset_base_dir, url.path).resolve()
        new_path = str(self.asset_mapping[path])
        return dict(token, attrs=dict(token['attrs'], url=new_path))


SRC_DIR = Path(__file__, '../../src').resolve()
DB_PATH = Path(__file__, '../../questions.db').resolve()

def convert_ref(text, asset_name_mapping, base_dir):
    convert = mistune.create_markdown(renderer=RefConverter(base_dir, asset_name_mapping))
    return convert(text)

def process_question(p):
    q = Question(p)
    qid = q.meta['id']

    # assign each assets new path
    asset_mapping = {k: Path(f'/assets/{qid}_{k.name}') for k in q.assets}

    # convert all references (image, link) to /assets/{uuid}.{ext} format
    question_text = convert_ref(q.question_text, asset_mapping, p)
    long_answer_text = convert_ref(q.long_answer_text, asset_mapping, p)
    return (
        (q.meta['id'], q.meta['year'], q.meta['subject'], question_text, q.meta['short_answer'], long_answer_text), 
        {v: k for k, v in asset_mapping.items()}
    )

all_questions = []
all_assets = dict()
for p in SRC_DIR.iterdir():
    if not p.is_dir():
        continue

    question, assets = process_question(p)
    all_questions.append(question)
    all_assets |= assets
    
# dump loaded questions as sqlite DB
if DB_PATH.exists():
    DB_PATH.unlink()

con = sqlite3.connect(DB_PATH)
cur = con.cursor()
cur.execute('CREATE TABLE questions(id, year, subject, question_text, short_answer, long_answer_text)')
cur.executemany('INSERT INTO questions VALUES(?, ?, ?, ?, ?, ?)', all_questions)

cur.execute('CREATE TABLE assets(name, data)')
for asset_path, data_path in all_assets.items():
    with data_path.open('rb') as f:
        data = f.read()
        cur.execute('INSERT INTO assets VALUES(?, ?)', (asset_path.name, data))

con.commit()
