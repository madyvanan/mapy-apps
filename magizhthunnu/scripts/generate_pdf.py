#!/usr/bin/env python3
"""
Generate Magizhthunnu_System_Design.pdf from system-design.html.
Tries multiple PDF engines in order: weasyprint → pdfkit → playwright → fallback.
"""
import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_FILE = os.path.join(BASE_DIR, "system-design.html")
PDF_FILE  = os.path.join(BASE_DIR, "Magizhthunnu_System_Design.pdf")

def try_weasyprint():
    try:
        from weasyprint import HTML
        print("Using weasyprint ...")
        HTML(filename=HTML_FILE).write_pdf(PDF_FILE)
        return True
    except ImportError:
        print("weasyprint not installed, trying next ...")
        return False
    except Exception as e:
        print(f"weasyprint failed: {e}")
        return False

def try_pdfkit():
    try:
        import pdfkit
        print("Using pdfkit (wkhtmltopdf) ...")
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': 'UTF-8',
            'enable-local-file-access': '',
            'javascript-delay': '2000',  # wait for Mermaid.js
            'no-outline': None,
            'print-media-type': '',
        }
        pdfkit.from_file(HTML_FILE, PDF_FILE, options=options)
        return True
    except ImportError:
        print("pdfkit not installed, trying next ...")
        return False
    except Exception as e:
        print(f"pdfkit failed: {e}")
        return False

def try_playwright():
    try:
        from playwright.sync_api import sync_playwright
        print("Using playwright (Chromium) ...")
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(f"file://{HTML_FILE}", wait_until="networkidle")
            page.wait_for_timeout(3000)  # let Mermaid render
            page.pdf(
                path=PDF_FILE,
                format="A4",
                margin={"top": "0.75in", "right": "0.75in",
                        "bottom": "0.75in", "left": "0.75in"},
                print_background=True,
            )
            browser.close()
        return True
    except ImportError:
        print("playwright not installed, trying next ...")
        return False
    except Exception as e:
        print(f"playwright failed: {e}")
        return False

def try_chromium_cli():
    """Try system Chromium / Chrome headless CLI."""
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "chromium-browser",
        "chromium",
        "google-chrome",
        "google-chrome-stable",
    ]
    for chrome in candidates:
        try:
            cmd = [
                chrome,
                "--headless=new",
                "--no-sandbox",
                "--disable-gpu",
                f"--print-to-pdf={PDF_FILE}",
                "--print-to-pdf-no-header",
                f"file://{HTML_FILE}",
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0 and os.path.exists(PDF_FILE):
                print(f"Used Chrome/Chromium CLI: {chrome}")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return False

def install_and_retry(package):
    print(f"Installing {package} ...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

def main():
    print(f"\n{'='*60}")
    print("  Magizhthunnu — PDF Generator")
    print(f"{'='*60}\n")
    print(f"Input:  {HTML_FILE}")
    print(f"Output: {PDF_FILE}\n")

    if not os.path.exists(HTML_FILE):
        print(f"ERROR: {HTML_FILE} not found!")
        sys.exit(1)

    # Attempt 1: weasyprint
    if try_weasyprint():
        pass
    # Attempt 2: install weasyprint and retry
    elif input("Install weasyprint? (y/n): ").strip().lower() == 'y':
        install_and_retry("weasyprint")
        if not try_weasyprint():
            # Attempt 3: playwright
            if not try_playwright():
                install_and_retry("playwright")
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=False)
                try_playwright()
    else:
        # Try other engines without installing
        if not try_pdfkit():
            if not try_playwright():
                if not try_chromium_cli():
                    print("\nCould not find a PDF engine.")
                    print("Manual options:")
                    print("  pip install weasyprint && python3 generate_pdf.py")
                    print("  pip install playwright && playwright install chromium && python3 generate_pdf.py")
                    print("  Open system-design.html in Chrome → File > Print > Save as PDF")
                    sys.exit(1)

    if os.path.exists(PDF_FILE):
        size_kb = os.path.getsize(PDF_FILE) / 1024
        print(f"\n✓ PDF generated successfully!")
        print(f"  File: {PDF_FILE}")
        print(f"  Size: {size_kb:.1f} KB")
        # Open on macOS
        if sys.platform == "darwin":
            subprocess.run(["open", PDF_FILE])
    else:
        print("\nPDF generation failed — file not created.")
        sys.exit(1)

if __name__ == "__main__":
    main()
