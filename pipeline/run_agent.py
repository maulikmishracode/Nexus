import sys
import json
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

question = sys.argv[1] if len(sys.argv) > 1 else "What is this document about?"

from agent import multi_hop_answer
result = multi_hop_answer(question)

# Remove chunks from output (too large for JSON response)
result.pop("chunks", None)
print(json.dumps(result))