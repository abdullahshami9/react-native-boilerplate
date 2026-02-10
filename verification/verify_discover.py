from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Try finding the running port
        ports = [3000, 3001, 3002]
        base_url = None

        for port in ports:
            try:
                url = f"http://localhost:{port}"
                print(f"Trying {url}...")
                page.goto(url, timeout=2000)
                # Check if it looks like our app (has title 'junr' or similar? Root page has 'Designed for the Modern Professional')
                if "Designed for the Modern Professional" in page.content():
                    base_url = url
                    print(f"Found app at {base_url}")
                    break
            except Exception as e:
                print(f"Failed {port}: {e}")
                continue

        if not base_url:
            print("Could not find running app. Defaulting to 3001.")
            base_url = "http://localhost:3001"

        # Go to Discover
        print(f"Navigating to {base_url}/discover")
        page.goto(f"{base_url}/discover")
        # Wait a bit for data fetch (even if mock/empty)
        page.wait_for_timeout(3000)

        # Screenshot
        page.screenshot(path="verification_discover.png")
        print("Screenshot saved to verification_discover.png")

        browser.close()

if __name__ == "__main__":
    run()
