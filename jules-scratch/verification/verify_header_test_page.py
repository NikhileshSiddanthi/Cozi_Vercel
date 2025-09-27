from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the header test page
    page.goto("http://127.0.0.1:8080/header-test")

    # Wait for the header to be visible using a more specific locator
    expect(page.locator("header[role='navigation']")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/header_test_page_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)