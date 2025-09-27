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
    expect(page.get_by_role("heading", name="Welcome to ConnectSphere")).to_be_visible()

    # Click the first category card
    page.locator(".group.cursor-pointer.overflow-hidden").first.click()

    # Wait for the category page to load
    expect(page.get_by_role("heading", name="Groups in this category")).to_be_visible()

    # Click the first group card
    page.locator(".group.cursor-pointer.overflow-hidden").first.click()

    # Wait for the group page to load by looking for the post composer
    expect(page.get_by_placeholder("What's on your mind?")).to_be_visible()

    # Give animations time to settle
    page.wait_for_timeout(2000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/group_page_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)