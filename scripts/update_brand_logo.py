"""
BharatYatra - Brand Logo & Favicon Synchronization Script
Cleans user uploaded logo artifact (media_1794644374838_ca7b26ca.jpg),
optimizes transparency, antialiasing, defringes edges, and updates all brand assets.
"""
import os
import cv2
import numpy as np
from PIL import Image

SOURCE_IMAGE = r"C:\Users\Pandya Kaushal\.gemini\antigravity\brain\0d7337aa-9d3e-4ba3-998b-1e63169995ff\.user_uploaded\media_1794644374838_ca7b26ca.jpg"
REPO_ROOT = r"C:\Users\Pandya Kaushal\Desktop\BhartYatra_6"

def generate_clean_logo():
    print(f"1. Loading source logo: {SOURCE_IMAGE}")
    img_bgr = cv2.imread(SOURCE_IMAGE)
    if img_bgr is None:
        raise FileNotFoundError(f"Source image not found: {SOURCE_IMAGE}")
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # 2. Crop exactly the active logo bounds (y: 17 to 276, x: 34 to 455)
    crop = img_rgb[17:276, 34:455]
    h, w, _ = crop.shape
    print(f"2. Cropped active logo bounds: {w}x{h}")

    # 3. High-resolution 3x supersampling for ultra-smooth sub-pixel antialiasing
    scale = 3
    upscaled = cv2.resize(crop, (w * scale, h * scale), interpolation=cv2.INTER_LANCZOS4)
    uh, uw, _ = upscaled.shape

    # 4. White background detection
    gray = cv2.cvtColor(upscaled, cv2.COLOR_RGB2GRAY)
    is_white = (gray > 242).astype(np.uint8) * 255

    # Floodfill from outer corners to isolate exterior background
    fill_copy = is_white.copy()
    mask = np.zeros((uh + 2, uw + 2), dtype=np.uint8)
    cv2.floodFill(fill_copy, mask, (0, 0), 128)
    cv2.floodFill(fill_copy, mask, (uw - 1, 0), 128)
    cv2.floodFill(fill_copy, mask, (0, uh - 1), 128)
    cv2.floodFill(fill_copy, mask, (uw - 1, uh - 1), 128)

    exterior_bg = (fill_copy == 128)

    # Include loops/counters of bottom text letters in 'BharatYatra' (y > 72% of height)
    bottom_half = int(uh * 0.72)
    inside_letter_white = (fill_copy == 255) & (np.arange(uh)[:, None] > bottom_half)

    bg_mask = exterior_bg | inside_letter_white

    # 5. Smooth alpha transition and un-premultiply/defringe from white background
    dist_fg = cv2.distanceTransform((~bg_mask).astype(np.uint8), cv2.DIST_L2, 5)
    alpha = np.clip(dist_fg * 85, 0, 255).astype(np.uint8)
    alpha[~bg_mask] = 255

    alpha_f = alpha.astype(float) / 255.0
    rgb_f = upscaled.astype(float)
    defringed = np.zeros_like(rgb_f)
    m = alpha_f > 0.02
    for c in range(3):
        defringed[m, c] = np.clip((rgb_f[m, c] - (1.0 - alpha_f[m]) * 255.0) / alpha_f[m], 0, 255)
    defringed[~m] = rgb_f[~m]

    rgba = np.dstack([defringed.astype(np.uint8), alpha])
    master = Image.fromarray(rgba, "RGBA")

    # Target high-resolution master width = 1024
    target_w = 1024
    target_h = int(round(master.height * (target_w / master.width)))
    highres_logo = master.resize((target_w, target_h), Image.Resampling.LANCZOS)
    print(f"3. Master high-res logo generated: {highres_logo.size} (RGBA)")

    # Favicon base (square with centered logo)
    fav_dim = max(highres_logo.size)
    fav_square = Image.new("RGBA", (fav_dim, fav_dim), (0, 0, 0, 0))
    ox = (fav_dim - highres_logo.width) // 2
    oy = (fav_dim - highres_logo.height) // 2
    fav_square.paste(highres_logo, (ox, oy))

    return highres_logo, fav_square

def distribute_brand_assets():
    highres_logo, fav_square = generate_clean_logo()

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

    print("\n4. Writing high-res logo PNG to all destinations...")
    for target in png_targets:
        dir_name = os.path.dirname(target)
        if os.path.exists(dir_name):
            highres_logo.save(target, format="PNG", optimize=True)
            print(f"   -> Saved PNG ({os.path.getsize(target)} bytes): {target}")

    print("\n5. Writing multi-size favicon ICO to all destinations...")
    for target in ico_targets:
        dir_name = os.path.dirname(target)
        if os.path.exists(dir_name):
            fav_square.save(target, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
            print(f"   -> Saved ICO ({os.path.getsize(target)} bytes): {target}")

    print("\n✅ All brand logo and favicon assets updated successfully!")

if __name__ == "__main__":
    distribute_brand_assets()
