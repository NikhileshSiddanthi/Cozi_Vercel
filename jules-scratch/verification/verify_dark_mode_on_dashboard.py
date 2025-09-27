from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the auth page and log in
    page.goto("http://127.0.0.1:8080/auth")
    page.get_by_label("Email").fill("testuser@cozi.com")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Sign In", exact=True).click()

    # Wait for the dashboard to load
    expect(page.get_by_role("heading", name="Welcome to COZI")).to_be_visible()

    # Take a screenshot of the light mode
    page.screenshot(path="jules-scratch/verification/light_mode.png")

    # Click the dropdown menu to open the theme options
    page.get_by_test_id("theme-toggle").click()

    # Click the "Dark" option
    page.get_by_role("menuitem", name="Dark").click()

    # Wait for the theme to change
    expect(page.locator("html")).to_have_class("dark")

    # Give the UI a moment to settle
    page.wait_for_timeout(1000)

    # Take a screenshot of the dark mode
    page.screenshot(path="jules-scratch/verification/dark_mode.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)