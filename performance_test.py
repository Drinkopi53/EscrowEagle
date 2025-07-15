import time
import subprocess
import os

def measure_command_time(command, cwd=None):
    """Measures the execution time of a shell command."""
    start_time = time.time()
    process = subprocess.Popen(command, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    end_time = time.time()
    return end_time - start_time

def main():
    """Main function to run the performance tests."""
    # --- Test Cases ---

    # 1. Frontend Compilation Speed (npm run dev)
    print("--- 1. Frontend Compilation Speed (npm run dev) ---")
    # NOTE: This will start the dev server. We will kill it after a short delay.
    # You might need to adjust the path to your project directory.
    project_dir = "."
    dev_server_process = subprocess.Popen("npm run dev", shell=True, cwd=project_dir)
    time.sleep(10) # Give it some time to compile
    dev_server_process.terminate()
    dev_server_process.wait()
    # This is a rough estimate, as "npm run dev" keeps running.
    # A more accurate measurement would involve parsing the output for "compiled successfully".
    npm_run_dev_time = 10
    print(f"Nama_kategori_uji: Kecepatan Kompilasi Frontend (npm run dev)")
    print(f"Latency: {npm_run_dev_time:.4f} s")
    print(f"Speed: {1/npm_run_dev_time if npm_run_dev_time > 0 else 0:.4f} tasks/s\n")


    # 2. Create Bounty (Admin) and Claim Bounty (Client)
    print("--- 2. Create & Claim Bounty ---")
    create_bounty_time = float(input("Enter time for Create Bounty (seconds): "))
    claim_bounty_time = float(input("Enter time for Claim Bounty (seconds): "))
    print(f"Nama_kategori_uji: Kecepatan Membuat Bounty (Admin)")
    print(f"Latency: {create_bounty_time:.4f} s")
    print(f"Speed: {1/create_bounty_time if create_bounty_time > 0 else 0:.4f} tasks/s\n")
    print(f"Nama_kategori_uji: Kecepatan Klaim Bounty (Client)")
    print(f"Latency: {claim_bounty_time:.4f} s")
    print(f"Speed: {1/claim_bounty_time if claim_bounty_time > 0 else 0:.4f} tasks/s\n")


    # 3. Metamask Interaction Speed
    print("--- 3. Metamask Interaction Speed ---")
    approve_bounty_time = float(input("Enter time for Approve Bounty (seconds): "))
    cancel_bounty_time = float(input("Enter time for Cancel Bounty (seconds): "))
    print(f"Nama_kategori_uji: Kecepatan Approve Bounty (Admin)")
    print(f"Latency: {approve_bounty_time:.4f} s")
    print(f"Speed: {1/approve_bounty_time if approve_bounty_time > 0 else 0:.4f} tasks/s\n")
    print(f"Nama_kategori_uji: Kecepatan Cancel Bounty (Client)")
    print(f"Latency: {cancel_bounty_time:.4f} s")
    print(f"Speed: {1/cancel_bounty_time if cancel_bounty_time > 0 else 0:.4f} tasks/s\n")


    # 4. View Detail Page Compilation Speed
    print("--- 4. View Detail Page Compilation Speed ---")
    view_detail_time = float(input("Enter time for View Detail Page (seconds): "))
    print(f"Nama_kategori_uji: Kecepatan Kompilasi Halaman Detail")
    print(f"Latency: {view_detail_time:.4f} s")
    print(f"Speed: {1/view_detail_time if view_detail_time > 0 else 0:.4f} tasks/s\n")


    # 5. Hardhat Server Start Speed (npm start)
    print("--- 5. Hardhat Server Start Speed (npm start) ---")
    npm_start_time = measure_command_time("npm start", cwd=project_dir)
    print(f"Nama_kategori_uji: Kecepatan Menjalankan Server Hardhat (npm start)")
    print(f"Latency: {npm_start_time:.4f} s")
    print(f"Speed: {1/npm_start_time if npm_start_time > 0 else 0:.4f} tasks/s\n")


    # 6. Bounty Card Display Speed
    print("--- 6. Bounty Card Display Speed ---")
    bounty_card_display_time = float(input("Enter time for Bounty Card Display (seconds): "))
    print(f"Nama_kategori_uji: Kecepatan Menampilkan Kartu Bounty")
    print(f"Latency: {bounty_card_display_time:.4f} s")
    print(f"Speed: {1/bounty_card_display_time if bounty_card_display_time > 0 else 0:.4f} tasks/s\n")


if __name__ == "__main__":
    main()
