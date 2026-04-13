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
아카이브를 sqlite 데이터베이스 파일로 변환하기 위한 스크립트.

이 스크립트는 mistune 등 외부 패키지에 의존하므로 `uv` 등의 도구를 이용해서 다음과 같이
실행되어야 한다:

```
uv run --script make_db.py
```

또는 맨 윗줄에 자동으로 `uv`를 호출하는 shebang이 포함되어 있다는 것을 이용해 바로 실행하는 것도
가능하다:

```
./scripts/make_db.py
```

이 스크립트는 `questions` 디렉토리 안의 어느 위치에서 실행해도 정상적으로 동작한다.
"""

from __future__ import annotations
import sqlite3
from pathlib import Path
from typing import cast
from Question import Question
from urllib.parse import urlsplit
import mistune
from mistune.renderers.markdown import MarkdownRenderer


OUTPUT_NAME = "questions.db"

# == 타입 참조들:

# 데이터베이스의 `question` 테이블의 각 행을 나타내는 튜플.
# (문제 ID, 연도, 과목, 문제 텍스트, 정답, 해설)
QuestionRow = tuple[str, int, str, str, str, str]

# 첨부파일의 기존 경로(키)와 새로운 경로(값)를 매핑하는 딕셔너리.
AssetMapping = dict[Path, Path]


def main():
    src_dir = Path(__file__, "../../src").resolve()
    db_path = Path(__file__, f"../../{OUTPUT_NAME}").resolve()

    # 모든 문제들의 내용과 모든 첨부파일들의 경로 매핑을 불러옴.
    all_question_rows: list[QuestionRow] = []
    all_assets: AssetMapping = dict()
    for question_dir in src_dir.iterdir():
        if not question_dir.is_dir():
            continue
        q = Question(question_dir)
        question_row, assets = process_question(question_dir, q)
        all_question_rows.append(question_row)
        all_assets |= assets

    if db_path.exists():
        db_path.unlink()

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # questions 테이블 생성.
    cur.execute(
        """
        CREATE TABLE questions(
            id PRIMARY KEY, 
            year, 
            subject, 
            question_text, 
            short_answer, 
            long_answer_text
        )
        """
    )
    cur.executemany("INSERT INTO questions VALUES(?, ?, ?, ?, ?, ?)", all_question_rows)

    # assets 테이블 생성.
    cur.execute("CREATE TABLE assets(name PRIMARY KEY, data)")
    for data_path, asset_path in all_assets.items():
        with data_path.open("rb") as f:
            data = f.read()
            cur.execute("INSERT INTO assets VALUES(?, ?)", (asset_path.name, data))

    con.commit()

    print(
        (
            f"Generated {OUTPUT_NAME} with {len(all_question_rows)} questions "
            f"and {len(all_assets)} assets"
        )
    )


def process_question(
    question_dir: Path, q: Question
) -> tuple[QuestionRow, AssetMapping]:
    """
    문제 `q` 를 데이터베이스에 삽입될 수 있는 형태로 변환하는 함수.
    문제의 모든 첨부파일 참조를 `/assets/{ID}_{filename}` 형태로 변환 후, 테이블 행 형태로 변환된
    문제와 첨부파일 참조의 매핑을 반환한다.

    첨부파일 참조의 매핑의 키는 기존 경로, 값은 새로운 경로이다.
    """
    qid = q.meta["id"]

    # 첨부파일 매핑 생성.
    # 첨부파일들은 모두 동일한 테이블에 저장되기에 이름 충돌을 방지하기 위해서 고유한 이름이 부여되어야 한다.
    # 따라서 문제 ID를 접두사로 사용한다.
    asset_mapping = {k: Path(f"/assets/{qid}_{k.name}") for k in q.assets}

    # 문제 텍스트와 해설의 참조를 매핑을 이용해서 변환.
    question_text = convert_ref(q.question_text, question_dir, asset_mapping)
    long_answer_text = convert_ref(q.long_answer_text, question_dir, asset_mapping)

    # 테이블 행 형태의 문제와 첨부파일 매핑을 반환.
    return (
        (
            q.meta["id"],
            q.meta["year"],
            q.meta["subject"],
            question_text,
            q.meta["short_answer"],
            long_answer_text,
        ),
        asset_mapping,
    )


def convert_ref(
    markdown_text: str, asset_base_dir: Path, asset_mapping: dict[Path, Path]
) -> str:
    """
    마크다운 텍스트 `markdown_text` 가 참조 (링크, 이미지) 하는 첨부파일들의 링크를 `asset_mapping` 에
    따라 변환한다. 모든 첨부파일들은 `asset_base_dir` 디렉토리 내부에 존재해야 한다.
    """
    convert = mistune.create_markdown(
        renderer=RefConverter(asset_base_dir, asset_mapping)
    )
    return cast(str, convert(markdown_text))


class RefConverter(MarkdownRenderer):
    """
    마크다운 텍스트가 참조하는 모든 첨부파일 (링크 및 사진) 의 경로를 딕셔너리 `asset_mapping` 에 따라서
    변환하는 마크다운 프로세서.
    """

    def __init__(self, asset_base_dir, asset_mapping):
        self.asset_base_dir = asset_base_dir
        self.asset_mapping = asset_mapping

    def link(self, token, state):
        return super().link(self.replace_asset_ref(token), state)

    def image(self, token, state):
        return super().image(self.replace_asset_ref(token), state)

    def replace_asset_ref(self, token):
        url = urlsplit(token["attrs"]["url"])
        if len(url.scheme) > 0:
            return token
        if url.path.startswith("/assets"):
            return token

        path = Path(self.asset_base_dir, url.path).resolve()
        new_path = str(self.asset_mapping[path])
        return dict(token, attrs=dict(token["attrs"], url=new_path))


if __name__ == "__main__":
    main()
