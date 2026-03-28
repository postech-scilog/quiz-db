#!/usr/bin/env -S uv run --script

# copies assets (everything except meta.yml, question.md and answer.md) into assets/ directory,
# with file names changed to MD5 hash for name clash prevention

print('making assets')