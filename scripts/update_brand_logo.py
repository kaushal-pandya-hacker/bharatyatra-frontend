"""
BharatYatra - Brand Logo & Favicon Synchronization Script
Cleans user uploaded logo artifact, optimizes transparency, and updates all brand assets.
"""
from PIL import Image
import numpy as np
import os

SOURCE_IMAGE = r"C:\Users\Pandya Kaushal\.gemini\antigravity\brain\0d7337aa-9d3e-4ba3-998b-1e63169995ff\.user_uploaded\media_1794572457915_13836701.png"
REPO_ROOT = r"C:\Users\Pandya Kaushal\Desktop\BhartYatra_6"

def process_and_distribute_logo():
    print("1. Loading source logo...")
    im = Image.open(SOURCE_IMAGE).convert("RGBA")
    arr = np.array(im)

    print("2. Removing stray screenshot artifact at (y: 328-337, x: 165-195)...")
    arr[328:337, 165:195, 3] = 0

    cleaned = Image.fromarray(arr)
    bbox = cleaned.getbbox()
    print(f"   Cleaned bounding box: {bbox}")
    cropped = cleaned.crop(bbox)
    print(f"   Cropped dimensions: {cropped.size}")

    # Add minimal 1px transparent padding for maximum visibility
    pad = 1
    padded_w = cropped.width + (pad * 2)
    padded_h = cropped.height + (pad * 2)
    padded = Image.new("RGBA", (padded_w, padded_h), (0, 0, 0, 0))
    padded.paste(cropped, (pad, pad))

    # Master high-resolution logo (width 1024)
    target_w = 1024
    target_h = int(round(padded_h * (target_w / padded_w)))
    highres_logo = padded.resize((target_w, target_h), Image.Resampling.LANCZOS)
    print(f"   Master high-res logo generated: {highres_logo.size} (RGBA)")

    # Favicon base (square 64x64 multi-resolution ICO)
    fav_dim = max(padded.size)
    fav_square = Image.new("RGBA", (fav_dim, fav_dim), (0, 0, 0, 0))
    ox = (fav_dim - padded.width) // 2
    oy = (fav_dim - padded.height) // 2
    fav_square.paste(padded, (ox, oy))

    # Target PNG file paths
    png_targets = [
        # Root Next.js
        os.path.join(REPO_ROOT, "public", "logo.png"),
        os.path.join(REPO_ROOT, "public", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "public", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "public", "images", "logo.png"),

        # 18_DEVELOPMENT Frontend
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "public", "logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "public", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "public", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "public", "images", "logo.png"),

        # 18_DEVELOPMENT Frontend out (if exists)
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "out", "logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "out", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "out", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "out", "images", "logo.png"),

        # BharatYatra-Vercel-Frontend
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "public", "logo.png"),
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "public", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "public", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "public", "images", "logo.png"),

        # Android Assets
        os.path.join(REPO_ROOT, "android", "app", "src", "main", "assets", "public", "logo.png"),
        os.path.join(REPO_ROOT, "android", "app", "src", "main", "assets", "public", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "android", "app", "src", "main", "assets", "public", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "android", "app", "src", "main", "assets", "public", "images", "logo.png"),

        # iOS Assets
        os.path.join(REPO_ROOT, "ios", "App", "App", "public", "logo.png"),
        os.path.join(REPO_ROOT, "ios", "App", "App", "public", "bharatyatra-logo.png"),
        os.path.join(REPO_ROOT, "ios", "App", "App", "public", "chalo-farva-logo.png"),
        os.path.join(REPO_ROOT, "ios", "App", "App", "public", "images", "logo.png"),
    ]

    # Target ICO file paths
    ico_targets = [
        os.path.join(REPO_ROOT, "public", "favicon.ico"),
        os.path.join(REPO_ROOT, "app", "favicon.ico"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "public", "favicon.ico"),
        os.path.join(REPO_ROOT, "18_DEVELOPMENT", "Frontend", "app", "favicon.ico"),
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "public", "favicon.ico"),
        os.path.join(REPO_ROOT, "BharatYatra-Vercel-Frontend", "app", "favicon.ico"),
    ]

    print("\n3. Writing high-res logo PNG to all destinations...")
    for target in png_targets:
        dir_name = os.path.dirname(target)
        if os.path.exists(dir_name):
            highres_logo.save(target, format="PNG", optimize=True)
            print(f"   -> Saved PNG ({os.path.getsize(target)} bytes): {target}")

    print("\n4. Writing multi-size favicon ICO to all destinations...")
    for target in ico_targets:
        dir_name = os.path.dirname(target)
        if os.path.exists(dir_name):
            fav_square.save(target, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
            print(f"   -> Saved ICO ({os.path.getsize(target)} bytes): {target}")

    print("\n✅ All brand logo and favicon assets updated successfully!")

if __name__ == "__main__":
    process_and_distribute_logo()
