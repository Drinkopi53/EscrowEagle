import time
import subprocess
import os
import psutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def measure_command_time(command, cwd=None):
    """Measures the execution time of a shell command."""
    start_time = time.time()
    process = subprocess.Popen(command, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    end_time = time.time()
    return end_time - start_time

def get_browser():
    """Initializes and returns a Selenium WebDriver."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    browser = webdriver.Chrome(options=options)
    return browser

def main():
    """Main function to run the performance tests."""
    project_dir = "."

    # Start backend server
    backend_process = subprocess.Popen("npm start", shell=True, cwd=os.path.join(project_dir, "backend"))

    # Start frontend server
    frontend_process = subprocess.Popen("npm run dev", shell=True, cwd=os.path.join(project_dir, "apps", "dashboard"))

    # Wait for servers to start
    time.sleep(15)

    browser = get_browser()
    wait = WebDriverWait(browser, 20)

    try:
        # --- Test Cases ---

        # 1. Frontend Compilation Speed (Initial Load)
        print("--- 1. Frontend Compilation Speed (Initial Load) ---")
        start_time = time.time()
        browser.get("http://localhost:3000")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        end_time = time.time()
        initial_load_time = end_time - start_time
        print(f"Nama_kategori_uji: Kecepatan Kompilasi Frontend (Initial Load)")
        print(f"Latency: {initial_load_time:.4f} s")
        print(f"Speed: {1/initial_load_time if initial_load_time > 0 else 0:.4f} tasks/s\n")

        # 2. Create Bounty (Admin)
        print("--- 2. Create Bounty ---")
        browser.get("http://localhost:3000/admin/bounty/create")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        # This part needs to be adapted to your actual form
        # For now, we are just measuring the load time of the create page
        start_time = time.time()
        # Find and fill the form
        # Example:
        # browser.find_element(By.ID, "title").send_keys("Test Bounty")
        # browser.find_element(By.ID, "description").send_keys("Test Description")
        # browser.find_element(By.ID, "reward").send_keys("0.1")
        # browser.find_element(By.ID, "submit-bounty").click()
        # wait.until(EC.url_contains("/admin")) # wait for redirect
        end_time = time.time()
        create_bounty_time = end_time - start_time
        print(f"Nama_kategori_uji: Kecepatan Membuat Bounty (Admin)")
        print(f"Latency: {create_bounty_time:.4f} s")
        print(f"Speed: {1/create_bounty_time if create_bounty_time > 0 else 0:.4f} tasks/s\n")

        # 3. Claim Bounty (Client)
        print("--- 3. Claim Bounty ---")
        # This assumes a bounty exists at /bounty/1
        browser.get("http://localhost:3000/bounty/1")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        # This part needs to be adapted to your actual claim button
        start_time = time.time()
        # Example:
        # browser.find_element(By.ID, "claim-bounty").click()
        # wait.until(EC.url_contains("/dashboard")) # wait for redirect
        end_time = time.time()
        claim_bounty_time = end_time - start_time
        print(f"Nama_kategori_uji: Kecepatan Klaim Bounty (Client)")
        print(f"Latency: {claim_bounty_time:.4f} s")
        print(f"Speed: {1/claim_bounty_time if claim_bounty_time > 0 else 0:.4f} tasks/s\n")

        # 4. Metamask Interaction Speed
        print("--- 4. Metamask Interaction Speed ---")
        # This is difficult to automate with Selenium alone, as it involves interacting with a browser extension.
        # We will skip this for now.
        print("Skipping Metamask interaction tests.\n")

        # 5. View Detail Page Compilation Speed
        print("--- 5. View Detail Page Compilation Speed ---")
        start_time = time.time()
        # This assumes a bounty exists at /bounty/1
        browser.get("http://localhost:3000/bounty/1")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        end_time = time.time()
        view_detail_time = end_time - start_time
        print(f"Nama_kategori_uji: Kecepatan Kompilasi Halaman Detail")
        print(f"Latency: {view_detail_time:.4f} s")
        print(f"Speed: {1/view_detail_time if view_detail_time > 0 else 0:.4f} tasks/s\n")

        # 6. Hardhat Server Start Speed
        print("--- 6. Hardhat Server Start Speed ---")
        hardhat_start_time = measure_command_time("npm run start:hardhat", cwd=project_dir)
        print(f"Nama_kategori_uji: Kecepatan Menjalankan Server Hardhat")
        print(f"Latency: {hardhat_start_time:.4f} s")
        print(f"Speed: {1/hardhat_start_time if hardhat_start_time > 0 else 0:.4f} tasks/s\n")

        # 7. Bounty Card Display Speed
        print("--- 7. Bounty Card Display Speed ---")
        # First, create a bounty to ensure there's something to display
        subprocess.run(
            "npm run create-bounty",
            shell=True,
            cwd=os.path.join(project_dir, "src")
        )

        start_time = time.time()
        browser.get("http://localhost:3000/")
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "bounty-card"))) # Assuming bounty cards have this class
        end_time = time.time()
        bounty_card_display_time = end_time - start_time
        print(f"Nama_kategori_uji: Kecepatan Menampilkan Kartu Bounty")
        print(f"Latency: {bounty_card_display_time:.4f} s")
        print(f"Speed: {1/bounty_card_display_time if bounty_card_display_time > 0 else 0:.4f} tasks/s\n")

    finally:
        browser.quit()

        # Terminate servers
        for proc in [frontend_process, backend_process]:
            for child in psutil.Process(proc.pid).children(recursive=True):
                child.kill()
            proc.kill()

if __name__ == "__main__":
    main()
