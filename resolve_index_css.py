import re
import sys

def resolve_conflict(match):
    head_content = match.group(1)
    # Strategy: Keep HEAD's version throughout.
    return head_content

pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n?=======\n.*?\n?>>>>>>> \w+.*?\n', re.DOTALL)

with open('client/src/index.css', 'r') as f:
    content = f.read()

# Initial attempt to resolve based on standard markers
new_content = pattern.sub(resolve_conflict, content)

# Check for any remaining markers and clean them up if they are nested or weird
# Actually, the user rules are: Keep every line between <<<<<<< HEAD and =======
# Discard every line between ======= and >>>>>>> 2c71447

# Let's do it more robustly
lines = content.splitlines()
output = []
skip = False
keep_head = False

i = 0
while i < len(lines):
    line = lines[i]
    if line.startswith('<<<<<<< HEAD'):
        keep_head = True
        i += 1
        continue
    elif line.startswith('======='):
        keep_head = False
        skip = True
        i += 1
        continue
    elif line.startswith('>>>>>>>'):
        skip = False
        i += 1
        continue
    
    if keep_head:
        output.append(line)
    elif not skip:
        output.append(line)
    i += 1

with open('client/src/index.css', 'w') as f:
    f.write('\n'.join(output) + '\n')

