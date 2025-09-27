from playwright.sync_api import sync_playwright, expect
import json

def run(playwright):
    console_logs = []
    def handle_console(msg):
        if msg.type in ['error', 'warning']:
            console_logs.append(f"[{msg.type.upper()}] {msg.text}")

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", handle_console)

    # Navigate to the auth page
    page.goto("http://127.0.0.1:8080/auth", wait_until="networkidle")

    # Wait for the page to be in a somewhat stable state
    page.wait_for_timeout(2000)

    # Take a screenshot for visual inspection
    page.screenshot(path="jules-scratch/verification/debug_auth_page.png")

    # Get the full HTML of the page
    html_content = page.content()

    browser.close()

    print("--- CONSOLE LOGS ---")
    if console_logs:
        for log in console_logs:
            print(log)
    else:
        print("No console errors or warnings found.")

    print("\n--- PAGE HTML ---")
    print(html_content)

with sync_playwright() as playwright:
    run(playwright)