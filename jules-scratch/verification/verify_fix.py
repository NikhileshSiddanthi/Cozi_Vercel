from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the auth page
    page.goto("http://127.0.0.1:8080/auth")

    # Fill in login credentials for the existing test user
    page.get_by_label("Email").fill("testuser@cozi.com")
    page.get_by_label("Password").fill("password123")

    # Click the sign-in button
    page.get_by_role("button", name="Sign In", exact=True).click()

    # Wait for the dashboard to load by looking for the welcome message
    expect(page.get_by_role("heading", name="Welcome to COZI")).to_be_visible()

    # Give animations time to settle
    page.wait_for_timeout(2000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)