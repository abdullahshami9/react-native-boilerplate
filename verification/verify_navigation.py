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
                # Check if it looks like our app
                if "junr" in page.content():
                    base_url = url
                    print(f"Found app at {base_url}")
                    break
            except Exception as e:
                print(f"Failed {port}: {e}")
                continue

        if not base_url:
            print("Could not find running app. Defaulting to 3001.")
            base_url = "http://localhost:3001"

        # 1. Verify Public Nav (No Login)
        print("Verifying Public Nav...")
        page.goto(base_url)
        page.screenshot(path="verification_public_nav.png")

        # 2. Mock LocalStorage for Business User and Verify Nav
        # Since I can't easily login via UI without credentials, I will inject mock token/user
        print("Verifying Business Nav...")

        # Inject Business User
        business_user = '{"id": 1, "name": "Business User", "user_type": "Business", "is_tunnel_completed": 1}'
        page.add_init_script(f"""
            localStorage.setItem('userToken', 'mock_token');
            localStorage.setItem('userInfo', '{business_user}');
        """)

        page.goto(f"{base_url}/business/orders") # Should redirect if not auth, but with mock it should stay
        page.wait_for_timeout(2000) # Wait for hydration
        page.screenshot(path="verification_business_nav.png")

        # 3. Mock Customer User
        print("Verifying Customer Nav...")
        customer_user = '{"id": 2, "name": "Customer User", "user_type": "Individual", "is_tunnel_completed": 1}'

        # Clear and reset
        page.context.clear_cookies()
        page = browser.new_page()
        page.add_init_script(f"""
            localStorage.setItem('userToken', 'mock_token');
            localStorage.setItem('userInfo', '{customer_user}');
        """)

        page.goto(f"{base_url}/discover")
        page.wait_for_timeout(2000)
        page.screenshot(path="verification_customer_nav.png")

        print("Screenshots saved.")
        browser.close()

if __name__ == "__main__":
    run()
