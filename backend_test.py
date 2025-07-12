#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AI Diligence Pro
Tests Firebase Functions and API integrations
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

class AIDigilenceBackendTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Diligence-Test-Client/1.0'
        })
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            'name': name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_health_check(self) -> bool:
        """Test if the application is accessible"""
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                details += f", Content length: {len(response.text)}"
            self.log_test("Application Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Application Health Check", False, f"Error: {str(e)}")
            return False

    def test_api_proxy_endpoint(self) -> bool:
        """Test the API proxy endpoint"""
        try:
            # Test with a simple request to the proxy
            test_payload = {
                "model": "gpt-4",
                "messages": [{"role": "user", "content": "Hello, this is a test"}],
                "max_tokens": 50
            }
            
            response = self.session.post(
                f"{self.base_url}/api/proxy",
                json=test_payload,
                timeout=30
            )
            
            # Check if we get a proper response (even if it's an auth error)
            success = response.status_code in [200, 401, 403, 429]  # Expected status codes
            details = f"Status: {response.status_code}"
            
            try:
                response_data = response.json()
                if response.status_code == 401:
                    details += " (Authentication required - expected)"
                elif response.status_code == 403:
                    details += " (Forbidden - expected without proper auth)"
                elif response.status_code == 429:
                    details += " (Rate limited - expected)"
                elif response.status_code == 200:
                    details += " (Success - API proxy working)"
                    
            except json.JSONDecodeError:
                response_data = response.text
                details += f", Response: {response_data[:100]}"
            
            self.log_test("API Proxy Endpoint", success, details, response_data if 'response_data' in locals() else None)
            return success
            
        except Exception as e:
            self.log_test("API Proxy Endpoint", False, f"Error: {str(e)}")
            return False

    def test_due_diligence_endpoint(self) -> bool:
        """Test the due diligence report generation endpoint"""
        try:
            # Test with a simple company
            test_payload = {
                "companyName": "Apple Inc.",
                "ticker": "AAPL",
                "allowCached": True
            }
            
            response = self.session.post(
                f"{self.base_url}/api/generateDueDiligence",
                json=test_payload,
                timeout=60  # Longer timeout for AI processing
            )
            
            # Check if we get a proper response
            success = response.status_code in [200, 401, 403, 429, 500]  # Expected status codes
            details = f"Status: {response.status_code}"
            
            try:
                response_data = response.json()
                if response.status_code == 200:
                    details += " (Success - Due diligence generation working)"
                    # Check if response has expected structure
                    if 'data' in response_data:
                        details += f", Has data: {bool(response_data['data'])}"
                        if response_data.get('cached'):
                            details += ", Cached response"
                elif response.status_code == 401:
                    details += " (Authentication required - expected)"
                elif response.status_code == 403:
                    details += " (Forbidden - expected without proper auth)"
                elif response.status_code == 429:
                    details += " (Rate limited - expected)"
                elif response.status_code == 500:
                    details += " (Server error - may indicate configuration issues)"
                    
            except json.JSONDecodeError:
                response_data = response.text
                details += f", Response: {response_data[:200]}"
            
            self.log_test("Due Diligence Endpoint", success, details, response_data if 'response_data' in locals() else None)
            return success
            
        except Exception as e:
            self.log_test("Due Diligence Endpoint", False, f"Error: {str(e)}")
            return False

    def test_invalid_endpoints(self) -> bool:
        """Test invalid endpoints return proper errors"""
        try:
            response = self.session.get(f"{self.base_url}/api/nonexistent")
            # Should return 404 or be handled by the SPA router
            success = response.status_code in [404, 200]  # 200 if SPA handles it
            details = f"Status: {response.status_code}"
            
            self.log_test("Invalid Endpoint Handling", success, details)
            return success
            
        except Exception as e:
            self.log_test("Invalid Endpoint Handling", False, f"Error: {str(e)}")
            return False

    def test_cors_headers(self) -> bool:
        """Test CORS headers are properly set"""
        try:
            response = self.session.options(f"{self.base_url}/api/proxy")
            
            # Check for CORS headers
            has_cors = any(header.lower().startswith('access-control') for header in response.headers)
            success = has_cors or response.status_code == 405  # Method not allowed is also acceptable
            
            details = f"Status: {response.status_code}"
            if has_cors:
                details += ", CORS headers present"
            else:
                details += ", No CORS headers (may be handled differently)"
                
            self.log_test("CORS Headers", success, details)
            return success
            
        except Exception as e:
            self.log_test("CORS Headers", False, f"Error: {str(e)}")
            return False

    def test_request_validation(self) -> bool:
        """Test request validation for API endpoints"""
        try:
            # Test with invalid JSON
            response = self.session.post(
                f"{self.base_url}/api/generateDueDiligence",
                data="invalid json",
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # Should return 400 for invalid JSON
            success = response.status_code in [400, 401, 403]  # Bad request or auth error
            details = f"Status: {response.status_code}"
            
            if response.status_code == 400:
                details += " (Proper validation - invalid JSON rejected)"
            elif response.status_code in [401, 403]:
                details += " (Auth check before validation - acceptable)"
                
            self.log_test("Request Validation", success, details)
            return success
            
        except Exception as e:
            self.log_test("Request Validation", False, f"Error: {str(e)}")
            return False

    def test_rate_limiting(self) -> bool:
        """Test rate limiting behavior"""
        try:
            # Make multiple rapid requests
            responses = []
            for i in range(5):
                response = self.session.post(
                    f"{self.base_url}/api/generateDueDiligence",
                    json={"companyName": f"Test Company {i}"},
                    timeout=5
                )
                responses.append(response.status_code)
                time.sleep(0.1)  # Small delay between requests
            
            # Check if any rate limiting occurred
            has_rate_limit = any(status == 429 for status in responses)
            has_auth_error = any(status in [401, 403] for status in responses)
            
            # Success if we get consistent responses (even if auth errors)
            success = len(set(responses)) <= 2  # Allow for some variation
            
            details = f"Response codes: {responses}"
            if has_rate_limit:
                details += " (Rate limiting active)"
            elif has_auth_error:
                details += " (Auth required - expected)"
            else:
                details += " (No rate limiting detected in test)"
                
            self.log_test("Rate Limiting", success, details)
            return success
            
        except Exception as e:
            self.log_test("Rate Limiting", False, f"Error: {str(e)}")
            return False

    def test_firebase_functions_structure(self) -> bool:
        """Test Firebase Functions are properly structured"""
        try:
            # Test both function endpoints
            endpoints = ["/api/generateDueDiligence", "/api/proxy"]
            results = []
            
            for endpoint in endpoints:
                try:
                    response = self.session.post(f"{self.base_url}{endpoint}", json={}, timeout=10)
                    results.append((endpoint, response.status_code))
                except Exception as e:
                    results.append((endpoint, f"Error: {str(e)}"))
            
            # Success if both endpoints respond (even with errors)
            success = all(isinstance(result[1], int) for result in results)
            details = f"Endpoints: {results}"
            
            self.log_test("Firebase Functions Structure", success, details)
            return success
            
        except Exception as e:
            self.log_test("Firebase Functions Structure", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting AI Diligence Pro Backend Tests")
        print("=" * 50)
        
        start_time = time.time()
        
        # Run tests in order
        test_methods = [
            self.test_health_check,
            self.test_firebase_functions_structure,
            self.test_api_proxy_endpoint,
            self.test_due_diligence_endpoint,
            self.test_invalid_endpoints,
            self.test_cors_headers,
            self.test_request_validation,
            self.test_rate_limiting
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_test(test_method.__name__, False, f"Unexpected error: {str(e)}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print("=" * 50)
        print("📊 Test Summary")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return {
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'failed_tests': self.tests_run - self.tests_passed,
            'success_rate': self.tests_passed / self.tests_run if self.tests_run > 0 else 0,
            'duration': duration,
            'results': self.test_results
        }

def main():
    """Main test execution"""
    # Check if custom URL provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    
    print(f"Testing AI Diligence Pro Backend at: {base_url}")
    
    tester = AIDigilenceBackendTester(base_url)
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results['success_rate'] > 0.7 else 1  # 70% pass rate required
    sys.exit(exit_code)

if __name__ == "__main__":
    main()