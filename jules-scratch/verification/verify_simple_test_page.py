from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the simple test page
    page.goto("http://127.0.0.1:8080/simple-test")

    # Wait for the heading to be visible
    expect(page.get_by_role("heading", name="Hello World")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/simple_test_page_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)