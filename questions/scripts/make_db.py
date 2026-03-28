#!/usr/bin/env -S uv run --script

# create a sqlite database by reading meta.yml, question.md, and answer.md
# also replaces markdown links and images to MD5 hashed version.

print('making db')