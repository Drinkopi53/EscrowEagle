import time
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def measure_speed(command):
    start_time = time.time()
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    return latency, speed

def main():
    results = {}

    # Initialize WebDriver
    # Make sure you have chromedriver installed and in your PATH
    driver = webdriver.Chrome()

    # 1. Test frontend compilation speed
    print("Testing frontend compilation speed...")
    latency, speed = measure_speed("npm run dev")
    results["Frontend_Compilation"] = {"Latency": latency, "Speed": speed}

    # 2. Test create bounty speed with Selenium
    print("Testing create bounty speed...")
    start_time = time.time()
    driver.get("http://localhost:3000") # Make sure your development server is running
    try:
        # Wait for the "Create Bounty" button to be clickable
        create_bounty_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "create-bounty-button"))  # Replace with the actual ID of your button
        )
        create_bounty_button.click()
        # Add other interactions here, like filling out a form

        # Wait for the new bounty card to appear on the dashboard
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "bounty-card"))  # Replace with the actual class name of your bounty card
        )
    except Exception as e:
        print(f"An error occurred during the 'Create Bounty' test: {e}")

    end_time = time.time()
    latency = end_time - start_time
    speed = 1 / latency if latency != 0 else float('inf')
    results["Create_Bounty_Selenium"] = {"Latency": latency, "Speed": speed}

    # 3. Test hardhat server startup speed
    print("Testing hardhat server startup speed...")
    latency, speed = measure_speed("npm start")
    results["Hardhat_Server_Startup"] = {"Latency": latency, "Speed": speed}

    # Close the browser
    driver.quit()

    with open("processing.md", "w") as f:
        for name, data in results.items():
            f.write(f"{name}: Latency: {data['Latency']:.4f}s Speed: {data['Speed']:.4f} m/s\n")

if __name__ == "__main__":
    main()
