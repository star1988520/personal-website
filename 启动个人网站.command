#!/bin/zsh
cd "$(dirname "$0")"
open "http://127.0.0.1:4173/#home"
python3 -m http.server 4173 --bind 127.0.0.1
