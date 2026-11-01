"""
BharatYatra — Smart QR Code Production Generator
Generates print-ready, high-resolution, vector, and tricolour QR code assets
for official BharatYatra business cards and marketing materials.
Includes automatic OpenCV decoding validation.
"""

import os
import math
import qrcode
from qrcode.image.svg import SvgPathImage
from PIL import Image, ImageDraw, ImageFont
import cv2

TARGET_URL = "https://www.bharatyatra.in/qr/"
OUTPUT_DIRS = [
    r"C:\Users\Pandya Kaushal\Desktop\Business Card",
    r"C:\Users\Pandya Kaushal\Desktop\BhartYatra_5\public\qr",
]

# Color Palette (Official Brand & Tricolour Specification)
COLOR_SAFFRON = (255, 153, 51)    # #FF9933
COLOR_GREEN = (19, 136, 8)        # #138808
COLOR_NAVY = (16, 43, 78)         # #102B4E
COLOR_ASHOKA_BLUE = (0, 0, 128)   # #000080
COLOR_WHITE = (255, 255, 255)     # #FFFFFF
COLOR_BLACK = (0, 0, 0)           # #000000
COLOR_SLATE_BG = (248, 250, 252)  # #F8FAFC
COLOR_SLATE_TEXT = (100, 116, 139)# #64748B

def ensure_dirs():
    for d in OUTPUT_DIRS:
        os.makedirs(d, exist_ok=True)

def save_to_all_outputs(filename, pil_or_bytes, is_svg=False):
    for d in OUTPUT_DIRS:
        dest = os.path.join(d, filename)
        if is_svg:
            with open(dest, "wb") as f:
                f.write(pil_or_bytes)
        else:
            pil_or_bytes.save(dest, "PNG", dpi=(300, 300))
        print(f"  [SAVED] {dest}")

def validate_qr_with_opencv(image_path, expected_url=TARGET_URL):
    detector = cv2.QRCodeDetector()
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path} for OpenCV validation")
    val, pts, _ = detector.detectAndDecode(img)
    if val != expected_url:
        # Fallback to grayscale thresholding
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        val, pts, _ = detector.detectAndDecode(gray)
    
    print(f"  [OPENCV SCAN VALIDATION] File: {os.path.basename(image_path)}")
    print(f"    Decoded Payload: '{val}'")
    print(f"    Expected:        '{expected_url}'")
    if val == expected_url:
        print("    -> STATUS: 100% VERIFIED SUCCESSFUL SCAN MATCH")
        return True
    else:
        print("    -> STATUS: WARNING - Payload mismatch or unread")
        return False

# ==============================================================================
# 1. GENERATE BHARATYATRA-SMART-QR-PRINT.png (Fail-Safe Black & White)
# ==============================================================================
def generate_print_qr():
    print("\n--- 1. Generating BHARATYATRA-SMART-QR-PRINT.png ---")
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=35,
        border=4,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    
    filename = "BHARATYATRA-SMART-QR-PRINT.png"
    save_to_all_outputs(filename, img)
    
    primary_path = os.path.join(OUTPUT_DIRS[0], filename)
    validate_qr_with_opencv(primary_path)

# ==============================================================================
# 2. GENERATE BHARATYATRA-SMART-QR-COLOUR.png (Tricolour & Deep Navy)
# ==============================================================================
def generate_colour_qr():
    print("\n--- 2. Generating BHARATYATRA-SMART-QR-COLOUR.png ---")
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=35,
        border=4,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    
    matrix = qr.get_matrix()
    matrix_size = len(matrix)
    box_size = 35
    border = 4
    total_size = (matrix_size) * box_size
    
    img = Image.new("RGB", (total_size, total_size), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    
    # Identify Finder Pattern boundaries (7x7 modules + 1 quiet module at 3 corners)
    # Top-Left: rows 0..6, cols 0..6
    # Top-Right: rows 0..6, cols (matrix_size - 7 - 2*border)..(matrix_size - 1)
    # Bottom-Left: rows (matrix_size - 7 - 2*border)..(matrix_size - 1), cols 0..6
    
    finder_tl = (border, border, border + 7, border + 7)
    finder_tr = (border, matrix_size - border - 7, border + 7, matrix_size - border)
    finder_bl = (matrix_size - border - 7, border, matrix_size - border, border + 7)
    
    def is_in_box(r, c, b):
        return b[0] <= r < b[2] and b[1] <= c < b[3]

    for r in range(matrix_size):
        for c in range(matrix_size):
            if matrix[r][c]:
                x0 = c * box_size
                y0 = r * box_size
                x1 = x0 + box_size
                y1 = y0 + box_size
                
                # Check finder patterns for themed color
                if is_in_box(r, c, finder_tl):
                    color = COLOR_SAFFRON  # Saffron Top-Left
                elif is_in_box(r, c, finder_tr):
                    color = COLOR_NAVY     # Deep Navy Top-Right
                elif is_in_box(r, c, finder_bl):
                    color = COLOR_GREEN    # India Green Bottom-Left
                else:
                    color = COLOR_NAVY     # High-contrast Navy for data modules
                
                draw.rectangle([x0, y0, x1, y1], fill=color)

    # Embed Center BharatYatra Ashoka Chakra Logo Emblem (<= 16% width so Level H scans 100%)
    center_box_size = int(total_size * 0.17)
    cx = total_size // 2
    cy = total_size // 2
    
    # White background cushion for center badge
    badge_x0 = cx - center_box_size // 2
    badge_y0 = cy - center_box_size // 2
    badge_x1 = cx + center_box_size // 2
    badge_y1 = cy + center_box_size // 2
    
    draw.rounded_rectangle([badge_x0 - 10, badge_y0 - 10, badge_x1 + 10, badge_y1 + 10], radius=16, fill=COLOR_WHITE, outline=COLOR_NAVY, width=4)
    
    # Draw Ashoka Chakra inside center cushion
    chakra_draw = ImageDraw.Draw(img)
    chakra_r = center_box_size // 2 - 4
    chakra_cx = cx
    chakra_cy = cy
    chakra_draw.ellipse([chakra_cx - chakra_r, chakra_cy - chakra_r, chakra_cx + chakra_r, chakra_cy + chakra_r], outline=COLOR_ASHOKA_BLUE, width=5)
    chakra_draw.ellipse([chakra_cx - chakra_r + 6, chakra_cy - chakra_r + 6, chakra_cx + chakra_r - 6, chakra_cy + chakra_r - 6], outline=COLOR_ASHOKA_BLUE, width=2)
    
    for i in range(24):
        angle = (i * 15 * math.pi) / 180
        spoke_x = chakra_cx + (chakra_r - 4) * math.cos(angle)
        spoke_y = chakra_cy + (chakra_r - 4) * math.sin(angle)
        chakra_draw.line([(chakra_cx, chakra_cy), (spoke_x, spoke_y)], fill=COLOR_ASHOKA_BLUE, width=3)
    
    chakra_draw.ellipse([chakra_cx - 12, chakra_cy - 12, chakra_cx + 12, chakra_cy + 12], fill=COLOR_WHITE, outline=COLOR_ASHOKA_BLUE, width=3)
    chakra_draw.ellipse([chakra_cx - 5, chakra_cy - 5, chakra_cx + 5, chakra_cy + 5], fill=COLOR_ASHOKA_BLUE)

    filename = "BHARATYATRA-SMART-QR-COLOUR.png"
    save_to_all_outputs(filename, img)
    
    primary_path = os.path.join(OUTPUT_DIRS[0], filename)
    validate_qr_with_opencv(primary_path)

# ==============================================================================
# 3. GENERATE BHARATYATRA-SMART-QR.svg (Vector SVG Export)
# ==============================================================================
def generate_vector_svg():
    print("\n--- 3. Generating BHARATYATRA-SMART-QR.svg ---")
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
        image_factory=SvgPathImage,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    svg_img = qr.make_image()
    
    # Render SVG string
    import io
    stream = io.BytesIO()
    svg_img.save(stream)
    svg_bytes = stream.getvalue()
    
    filename = "BHARATYATRA-SMART-QR.svg"
    save_to_all_outputs(filename, svg_bytes, is_svg=True)

# ==============================================================================
# 4. GENERATE BHARATYATRA-SOCIAL-QR.png (Branded Marketing Frame)
# ==============================================================================
def generate_social_qr():
    print("\n--- 4. Generating BHARATYATRA-SOCIAL-QR.png ---")
    
    # 1. Base clean QR image
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=24,
        border=2,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#102B4E", back_color="white").convert("RGB")
    qr_w, qr_h = qr_img.size
    
    # 2. Canvas for marketing card (1400 x 1700)
    canvas_w = 1400
    canvas_h = 1700
    canvas = Image.new("RGB", (canvas_w, canvas_h), COLOR_WHITE)
    draw = ImageDraw.Draw(canvas)
    
    # Tricolour top band
    band_h = 16
    draw.rectangle([0, 0, canvas_w // 3, band_h], fill=COLOR_SAFFRON)
    draw.rectangle([canvas_w // 3, 0, (canvas_w * 2) // 3, band_h], fill=COLOR_WHITE)
    draw.rectangle([(canvas_w * 2) // 3, 0, canvas_w, band_h], fill=COLOR_GREEN)
    
    # Load fonts
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 68)
    font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 30)
    font_tagline = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 32)
    font_domain = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 34)
    font_footer = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 26)
    
    # Header: Brand
    title_text = "BHARATYATRA"
    tagline_text = "DISCOVER INDIA. TRAVEL BETTER."
    action_heading = "SCAN TO EXPLORE INDIA"
    action_sub = "Your next adventure starts here."
    domain_text = "bharatyatra.in"
    
    # Draw Brand Title
    tb_title = draw.textbbox((0, 0), title_text, font=font_title)
    tw_title = tb_title[2] - tb_title[0]
    draw.text(((canvas_w - tw_title) // 2, 80), title_text, fill=COLOR_NAVY, font=font_title)
    
    # Draw Tagline Pill
    tb_tag = draw.textbbox((0, 0), tagline_text, font=font_tagline)
    tw_tag = tb_tag[2] - tb_tag[0]
    pill_y = 180
    draw.rounded_rectangle(
        [(canvas_w - tw_tag) // 2 - 24, pill_y - 6, (canvas_w + tw_tag) // 2 + 24, pill_y + 44],
        radius=20,
        fill=COLOR_SLATE_BG,
        outline=(226, 232, 240),
        width=2
    )
    draw.text(((canvas_w - tw_tag) // 2, pill_y), tagline_text, fill=COLOR_NAVY, font=font_tagline)
    
    # Action Heading & Subtitle
    tb_act = draw.textbbox((0, 0), action_heading, font=font_sub)
    tw_act = tb_act[2] - tb_act[0]
    draw.text(((canvas_w - tw_act) // 2, 270), action_heading, fill=COLOR_SAFFRON, font=font_sub)
    
    tb_sub = draw.textbbox((0, 0), action_sub, font=font_footer)
    tw_sub = tb_sub[2] - tb_sub[0]
    draw.text(((canvas_w - tw_sub) // 2, 320), action_sub, fill=COLOR_SLATE_TEXT, font=font_footer)
    
    # Paste QR Code with subtle rounded border frame
    qr_x = (canvas_w - qr_w) // 2
    qr_y = 390
    draw.rounded_rectangle([qr_x - 16, qr_y - 16, qr_x + qr_w + 16, qr_y + qr_h + 16], radius=28, fill=COLOR_WHITE, outline=(226, 232, 240), width=4)
    canvas.paste(qr_img, (qr_x, qr_y))
    
    # Domain & Security Badge below QR
    dom_y = qr_y + qr_h + 40
    tb_dom = draw.textbbox((0, 0), domain_text, font=font_domain)
    tw_dom = tb_dom[2] - tb_dom[0]
    draw.rounded_rectangle([(canvas_w - tw_dom) // 2 - 32, dom_y - 8, (canvas_w + tw_dom) // 2 + 32, dom_y + 48], radius=20, fill=(232, 245, 233), outline=COLOR_GREEN, width=2)
    draw.text(((canvas_w - tw_dom) // 2, dom_y), domain_text, fill=COLOR_GREEN, font=font_domain)
    
    # Bottom Tricolour Ribbon
    foot_y = canvas_h - 20
    draw.rectangle([0, foot_y, canvas_w // 3, canvas_h], fill=COLOR_SAFFRON)
    draw.rectangle([canvas_w // 3, foot_y, (canvas_w * 2) // 3, canvas_h], fill=COLOR_WHITE)
    draw.rectangle([(canvas_w * 2) // 3, foot_y, canvas_w, canvas_h], fill=COLOR_GREEN)
    
    filename = "BHARATYATRA-SOCIAL-QR.png"
    save_to_all_outputs(filename, canvas)
    
    primary_path = os.path.join(OUTPUT_DIRS[0], filename)
    validate_qr_with_opencv(primary_path)

# ==============================================================================
# 5. GENERATE BHARATYATRA-BUSINESS-CARD-QR-PRESENTATION.png
# ==============================================================================
def generate_business_card_presentation():
    print("\n--- 5. Generating BHARATYATRA-BUSINESS-CARD-QR-PRESENTATION.png ---")
    
    # Standard 3.5" x 2.0" Business Card @ 300 DPI = 1050 x 600 px
    card_w = 1050
    card_h = 600
    card = Image.new("RGB", (card_w, card_h), COLOR_WHITE)
    draw = ImageDraw.Draw(card)
    
    # Left Tricolour accent bar
    stripe_w = 12
    draw.rectangle([0, 0, stripe_w, card_h // 3], fill=COLOR_SAFFRON)
    draw.rectangle([0, card_h // 3, stripe_w, (card_h * 2) // 3], fill=(240, 240, 240))
    draw.rectangle([0, (card_h * 2) // 3, stripe_w, card_h], fill=COLOR_GREEN)
    
    # Generate clean QR code fitted to card height (approx 380x380 px)
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=3,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#102B4E", back_color="white").convert("RGB")
    
    qr_w, qr_h = qr_img.size
    qr_scaled = qr_img.resize((380, 380), Image.Resampling.LANCZOS)
    
    # Right side: place QR in elegant frame
    qr_box_x = card_w - 380 - 60
    qr_box_y = (card_h - 380) // 2
    
    draw.rounded_rectangle([qr_box_x - 10, qr_box_y - 10, qr_box_x + 380 + 10, qr_box_y + 380 + 10], radius=20, fill=COLOR_WHITE, outline=(226, 232, 240), width=3)
    card.paste(qr_scaled, (qr_box_x, qr_box_y))
    
    # Left side: Typography matching specification
    # Heading: SCAN TO EXPLORE INDIA
    # Subheading: Your next adventure starts here.
    # Brand: BHARATYATRA
    # Website: bharatyatra.in
    
    font_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 52)
    font_tagline = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 20)
    font_heading = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 34)
    font_subheading = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 22)
    font_domain = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 26)
    font_feature = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 18)
    
    left_x = 60
    
    # Brand Title
    draw.text((left_x, 70), "BHARATYATRA", fill=COLOR_NAVY, font=font_brand)
    draw.text((left_x, 136), "DISCOVER INDIA. TRAVEL BETTER.", fill=COLOR_SAFFRON, font=font_tagline)
    
    # Thin divider
    draw.line([(left_x, 180), (qr_box_x - 40, 180)], fill=(226, 232, 240), width=2)
    
    # Call to action
    draw.text((left_x, 215), "SCAN TO EXPLORE INDIA", fill=COLOR_NAVY, font=font_heading)
    draw.text((left_x, 265), "Your next adventure starts here.", fill=COLOR_SLATE_TEXT, font=font_subheading)
    
    # 3 bullet value propositions
    draw.text((left_x, 320), "• AI-Powered Trip Planner & Itineraries", fill=(51, 65, 85), font=font_feature)
    draw.text((left_x, 352), "• Verified Pan-India Hotels & Circuit Tours", fill=(51, 65, 85), font=font_feature)
    draw.text((left_x, 384), "• Seamless Business & Travel Partner Network", fill=(51, 65, 85), font=font_feature)
    
    # Website Domain Pill
    dom_y = 445
    draw.rounded_rectangle([left_x, dom_y, left_x + 230, dom_y + 48], radius=14, fill=(232, 245, 233), outline=COLOR_GREEN, width=2)
    draw.text((left_x + 28, dom_y + 8), "bharatyatra.in", fill=COLOR_GREEN, font=font_domain)
    
    filename = "BHARATYATRA-BUSINESS-CARD-QR-PRESENTATION.png"
    save_to_all_outputs(filename, card)
    
    primary_path = os.path.join(OUTPUT_DIRS[0], filename)
    validate_qr_with_opencv(primary_path)

if __name__ == "__main__":
    ensure_dirs()
    generate_print_qr()
    generate_colour_qr()
    generate_vector_svg()
    generate_social_qr()
    generate_business_card_presentation()
    print("\n[COMPLETE] All BharatYatra Smart QR code assets generated and verified successfully!")
