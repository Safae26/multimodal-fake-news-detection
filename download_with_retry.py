import subprocess
import time
import sys

MAX_RETRIES = 100
RETRY_DELAY = 30 

for attempt in range(1, MAX_RETRIES + 1):
    print(f"\n{'='*50}")
    print(f"Attempt {attempt}/{MAX_RETRIES}")
    print(f"{'='*50}\n")
    
    result = subprocess.run([
        sys.executable, "src/download_m4fc_images.py", "--sleep", "1"
    ])
    
    if result.returncode == 0:
        print("\n✅ Download completed successfully!")
        break
    else:
        print(f"\n⚠️  Download interrupted (timeout/error). Retrying in {RETRY_DELAY}s...")
        time.sleep(RETRY_DELAY)
else:
    print("\n❌ Max retries reached. Run again later to continue from where it left off.")