# python tojpg.py in.png out.jpg: the card screenshot as a compact JPEG (used by scripts/cards.mjs)
import sys
from PIL import Image

Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2], "JPEG", quality=84, optimize=True, progressive=True)
