#!/usr/bin/env python3
"""
Simple Frontend Test for AI Diligence Pro
Tests the application accessibility and basic functionality
"""

import requests
import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class SimpleFrontendTester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.driver = None
        self.setup_driver()
        
    def setup_driver(self):
        """Setup Chrome driver with headless options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome driver initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Chrome driver: {e}")
            sys.exit(1)
    
    def test_application_load(self):
        """Test if the application loads successfully"""
        try:
            print(f"🔄 Loading application from {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for the page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check if the title contains AI Diligence Pro
            title = self.driver.title
            print(f"📄 Page title: {title}")
            
            if "AI Diligence Pro" in title:
                print("✅ Application loaded successfully")
                return True
            else:
                print("⚠️ Application loaded but title doesn't match expected")
                return False
                
        except TimeoutException:
            print("❌ Application failed to load within timeout")
            return False
        except Exception as e:
            print(f"❌ Error loading application: {e}")
            return False
    
    def test_authentication_screen(self):
        """Test the authentication screen"""
        try:
            # Look for AI Diligence Pro heading
            heading = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'AI Diligence Pro')]"))
            )
            print("✅ Found AI Diligence Pro heading")
            
            # Look for Enter Demo Platform button
            demo_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Enter Demo Platform')]")
            print("✅ Found 'Enter Demo Platform' button")
            
            # Click the demo button
            demo_button.click()
            print("🔄 Clicked 'Enter Demo Platform' button")
            
            # Wait for dashboard to load
            time.sleep(3)
            
            # Check if we're in the dashboard
            try:
                dashboard_title = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'MCP Dashboard')]"))
                )
                print("✅ Successfully entered dashboard")
                return True
            except TimeoutException:
                print("❌ Dashboard did not load after authentication")
                return False
                
        except NoSuchElementException as e:
            print(f"❌ Authentication screen element not found: {e}")
            return False
        except Exception as e:
            print(f"❌ Error during authentication test: {e}")
            return False
    
    def test_dashboard_features(self):
        """Test dashboard features"""
        try:
            # Test stock selector
            try:
                stock_selector = self.driver.find_element(By.TAG_NAME, "select")
                print("✅ Found stock symbol selector")
                
                # Try to select MSFT
                from selenium.webdriver.support.ui import Select
                select = Select(stock_selector)
                select.select_by_value("MSFT")
                print("🔄 Changed stock symbol to MSFT")
                time.sleep(2)
            except NoSuchElementException:
                print("⚠️ Stock selector not found")
            
            # Test ESG button
            try:
                esg_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Get ESG Data')]")
                print("✅ Found 'Get ESG Data' button")
                esg_button.click()
                print("🔄 Clicked 'Get ESG Data' button")
                time.sleep(3)
            except NoSuchElementException:
                print("⚠️ ESG button not found")
            
            # Test Due Diligence Report button
            try:
                report_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Generate Comprehensive Report')]")
                print("✅ Found 'Generate Comprehensive Report' button")
                report_button.click()
                print("🔄 Clicked 'Generate Comprehensive Report' button")
                time.sleep(5)
            except NoSuchElementException:
                print("⚠️ Report generation button not found")
            
            # Check for MCP Integration Status
            try:
                mcp_status = self.driver.find_element(By.XPATH, "//*[contains(text(), 'MCP Integration Status')]")
                print("✅ Found MCP Integration Status section")
            except NoSuchElementException:
                print("⚠️ MCP Integration Status section not found")
            
            return True
            
        except Exception as e:
            print(f"❌ Error during dashboard feature test: {e}")
            return False
    
    def check_for_errors(self):
        """Check for any error messages on the page"""
        try:
            # Check browser console for errors
            logs = self.driver.get_log('browser')
            errors = [log for log in logs if log['level'] == 'SEVERE']
            
            if errors:
                print("⚠️ Browser console errors found:")
                for error in errors:
                    print(f"  - {error['message']}")
                return False
            else:
                print("✅ No severe browser console errors found")
                return True
                
        except Exception as e:
            print(f"⚠️ Could not check browser console: {e}")
            return True
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("🚀 Starting AI Diligence Pro Frontend Tests")
        print("=" * 50)
        
        tests_passed = 0
        total_tests = 4
        
        # Test 1: Application Load
        if self.test_application_load():
            tests_passed += 1
        
        # Test 2: Authentication Screen
        if self.test_authentication_screen():
            tests_passed += 1
        
        # Test 3: Dashboard Features
        if self.test_dashboard_features():
            tests_passed += 1
        
        # Test 4: Error Check
        if self.check_for_errors():
            tests_passed += 1
        
        print("=" * 50)
        print(f"📊 Frontend Test Summary")
        print(f"Tests Passed: {tests_passed}/{total_tests}")
        print(f"Success Rate: {(tests_passed/total_tests*100):.1f}%")
        
        return tests_passed == total_tests
    
    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            self.driver.quit()
            print("🧹 Driver cleanup completed")

def main():
    """Main test execution"""
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
    
    print(f"Testing AI Diligence Pro Frontend at: {base_url}")
    
    tester = SimpleFrontendTester(base_url)
    
    try:
        success = tester.run_all_tests()
        exit_code = 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        exit_code = 1
    finally:
        tester.cleanup()
    
    sys.exit(exit_code)

if __name__ == "__main__":
    main()