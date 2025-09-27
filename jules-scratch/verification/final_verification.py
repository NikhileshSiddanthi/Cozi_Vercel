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

    # Navigate to the auth page and log in
    page.goto("http://127.0.0.1:8080/auth")
    page.get_by_label("Email").fill("testuser@cozi.com")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Sign In", exact=True).click()

    # Wait for the dashboard to load
    expect(page.get_by_role("heading", name="Welcome to ConnectSphere")).to_be_visible()

    # Wait for a moment to let data fetching attempts happen
    page.wait_for_timeout(3000)

    page.screenshot(path="jules-scratch/verification/debug_dashboard.png")

    browser.close()

    print("--- CONSOLE LOGS ---")
    if console_logs:
        for log in console_logs:
            print(log)
    else:
        print("No console errors or warnings found.")

with sync_playwright() as playwright:
    run(playwright)