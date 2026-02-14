#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Ventur - Startup Pitch Deck Analyzer
Tests all API endpoints including auth, pitch deck, data room, and dashboard functionality.
"""

import requests
import sys
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path

class VenturAPITester:
    def __init__(self, base_url="https://startup-doc-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.test_name = "Test User"
        self.test_company = "Test Startup Inc"

    def log_result(self, test_name, success, details="", error=""):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            print(f"✅ {test_name}: PASSED - {details}")
            self.tests_passed += 1
        else:
            print(f"❌ {test_name}: FAILED - {error}")
        
        self.tests_run += 1

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        # Merge with provided headers
        if headers:
            default_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            default_headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=default_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.content else {}
                    self.log_result(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except json.JSONDecodeError:
                    self.log_result(name, True, f"Status: {response.status_code} (No JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json() if response.content else {}
                    error_msg = error_data.get('detail', f"HTTP {response.status_code}")
                except:
                    error_msg = f"HTTP {response.status_code}"
                
                self.log_result(name, False, "", f"Expected {expected_status}, got {response.status_code}: {error_msg}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, "", f"Request failed: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_result(name, False, "", f"Unexpected error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        print("\n🔍 Testing Health Check...")
        success, _ = self.run_test("Health Check", "GET", "health", 200)
        return success

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name,
            "company_name": self.test_company
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.log_result("Token Extraction", True, "Successfully extracted auth token")
            return True
        elif success:
            self.log_result("Token Extraction", False, "", "No access_token in response")
            return False
        
        return success

    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n🔍 Testing User Login...")
        
        data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, data)
        
        if success and 'access_token' in response:
            # Update token in case it's different
            self.token = response['access_token']
            return True
        
        return success

    def test_get_user_profile(self):
        """Test getting current user profile"""
        print("\n🔍 Testing User Profile...")
        success, response = self.run_test("Get User Profile", "GET", "auth/me", 200)
        
        if success and response.get('email') == self.test_email:
            self.log_result("Profile Data Validation", True, "User profile data matches")
            return True
        elif success:
            self.log_result("Profile Data Validation", False, "", "Profile data doesn't match expected values")
            return False
        
        return success

    def test_data_room_categories(self):
        """Test getting data room categories"""
        print("\n🔍 Testing Data Room Categories...")
        success, response = self.run_test("Get Data Room Categories", "GET", "data-room/categories", 200)
        
        if success and isinstance(response, list) and len(response) >= 8:
            expected_categories = ['summary', 'financials', 'legal', 'previous_funding', 
                                 'intellectual_property', 'staff', 'metrics', 'other']
            found_categories = [cat.get('value') for cat in response]
            
            if all(cat in found_categories for cat in expected_categories):
                self.log_result("Categories Validation", True, f"Found all {len(expected_categories)} expected categories")
                return True
            else:
                missing = [cat for cat in expected_categories if cat not in found_categories]
                self.log_result("Categories Validation", False, "", f"Missing categories: {missing}")
                return False
        elif success:
            self.log_result("Categories Validation", False, "", f"Expected 8+ categories, got {len(response) if isinstance(response, list) else 'non-list'}")
            return False
        
        return success

    def create_test_file(self, filename, content="Test file content for Ventur API testing"):
        """Create a temporary test file"""
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix=f'.{filename.split(".")[-1]}', delete=False)
        temp_file.write(content)
        temp_file.close()
        return temp_file.name

    def test_pitch_deck_upload(self):
        """Test pitch deck upload"""
        print("\n🔍 Testing Pitch Deck Upload...")
        
        # Create a test PDF file
        test_file_path = self.create_test_file("test_pitch_deck.pdf", "Test pitch deck content")
        
        try:
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test_pitch_deck.pdf', f, 'application/pdf')}
                success, response = self.run_test("Pitch Deck Upload", "POST", "pitch-deck/upload", 200, files=files)
            
            if success and 'id' in response:
                self.pitch_deck_id = response['id']
                self.log_result("Pitch Deck ID Extraction", True, f"Deck ID: {self.pitch_deck_id}")
                return True
            elif success:
                self.log_result("Pitch Deck ID Extraction", False, "", "No ID in upload response")
                return False
            
            return success
        
        finally:
            # Clean up temp file
            try:
                os.unlink(test_file_path)
            except:
                pass

    def test_pitch_deck_analysis(self):
        """Test pitch deck analysis"""
        if not hasattr(self, 'pitch_deck_id'):
            self.log_result("Pitch Deck Analysis", False, "", "No pitch deck ID available")
            return False
        
        print("\n🔍 Testing Pitch Deck Analysis...")
        success, response = self.run_test("Pitch Deck Analysis", "POST", f"pitch-deck/{self.pitch_deck_id}/analyze", 200)
        
        if success and response.get('status') in ['analyzing', 'analyzed']:
            self.log_result("Analysis Status", True, f"Status: {response.get('status')}")
            return True
        elif success:
            self.log_result("Analysis Status", False, "", f"Unexpected status: {response.get('status')}")
            return False
        
        return success

    def test_get_pitch_decks(self):
        """Test getting all pitch decks"""
        print("\n🔍 Testing Get Pitch Decks...")
        success, response = self.run_test("Get Pitch Decks", "GET", "pitch-decks", 200)
        
        if success and isinstance(response, list):
            self.log_result("Pitch Decks List", True, f"Found {len(response)} pitch decks")
            return True
        elif success:
            self.log_result("Pitch Decks List", False, "", "Response is not a list")
            return False
        
        return success

    def test_data_room_upload(self):
        """Test data room document upload"""
        print("\n🔍 Testing Data Room Upload...")
        
        # Create a test document
        test_file_path = self.create_test_file("test_financial.pdf", "Test financial document content")
        
        try:
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test_financial.pdf', f, 'application/pdf')}
                data = {'category': 'financials'}
                success, response = self.run_test("Data Room Upload", "POST", "data-room/upload", 200, data=data, files=files)
            
            if success and 'id' in response:
                self.data_room_doc_id = response['id']
                self.log_result("Data Room Doc ID Extraction", True, f"Doc ID: {self.data_room_doc_id}")
                return True
            elif success:
                self.log_result("Data Room Doc ID Extraction", False, "", "No ID in upload response")
                return False
            
            return success
        
        finally:
            # Clean up temp file
            try:
                os.unlink(test_file_path)
            except:
                pass

    def test_data_room_analysis(self):
        """Test data room document analysis"""
        if not hasattr(self, 'data_room_doc_id'):
            self.log_result("Data Room Analysis", False, "", "No data room document ID available")
            return False
        
        print("\n🔍 Testing Data Room Analysis...")
        success, response = self.run_test("Data Room Analysis", "POST", f"data-room/{self.data_room_doc_id}/analyze", 200)
        
        if success and response.get('status') in ['analyzing', 'analyzed']:
            self.log_result("Data Room Analysis Status", True, f"Status: {response.get('status')}")
            return True
        elif success:
            self.log_result("Data Room Analysis Status", False, "", f"Unexpected status: {response.get('status')}")
            return False
        
        return success

    def test_get_data_room_documents(self):
        """Test getting data room documents"""
        print("\n🔍 Testing Get Data Room Documents...")
        success, response = self.run_test("Get Data Room Documents", "GET", "data-room", 200)
        
        if success and isinstance(response, list):
            self.log_result("Data Room Documents List", True, f"Found {len(response)} documents")
            return True
        elif success:
            self.log_result("Data Room Documents List", False, "", "Response is not a list")
            return False
        
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n🔍 Testing Dashboard Stats...")
        success, response = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)
        
        if success and all(key in response for key in ['total_pitch_decks', 'total_documents', 'analyzed_documents', 'pending_analysis']):
            self.log_result("Dashboard Stats Structure", True, "All required stats fields present")
            return True
        elif success:
            missing_fields = [key for key in ['total_pitch_decks', 'total_documents', 'analyzed_documents', 'pending_analysis'] if key not in response]
            self.log_result("Dashboard Stats Structure", False, "", f"Missing fields: {missing_fields}")
            return False
        
        return success

    def test_history(self):
        """Test history endpoint"""
        print("\n🔍 Testing History...")
        success, response = self.run_test("Get History", "GET", "history", 200)
        
        if success and isinstance(response, list):
            self.log_result("History List", True, f"Found {len(response)} history items")
            return True
        elif success:
            self.log_result("History List", False, "", "Response is not a list")
            return False
        
        return success

    def test_delete_operations(self):
        """Test delete operations"""
        print("\n🔍 Testing Delete Operations...")
        
        results = []
        
        # Delete pitch deck if exists
        if hasattr(self, 'pitch_deck_id'):
            success, _ = self.run_test("Delete Pitch Deck", "DELETE", f"pitch-deck/{self.pitch_deck_id}", 200)
            results.append(success)
        
        # Delete data room document if exists
        if hasattr(self, 'data_room_doc_id'):
            success, _ = self.run_test("Delete Data Room Document", "DELETE", f"data-room/{self.data_room_doc_id}", 200)
            results.append(success)
        
        return all(results) if results else True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Ventur API Testing...")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        test_sequence = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_user_profile,
            self.test_data_room_categories,
            self.test_pitch_deck_upload,
            self.test_pitch_deck_analysis,
            self.test_get_pitch_decks,
            self.test_data_room_upload,
            self.test_data_room_analysis,
            self.test_get_data_room_documents,
            self.test_dashboard_stats,
            self.test_history,
            self.test_delete_operations
        ]
        
        # Run tests
        for test_func in test_sequence:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_func.__name__, False, "", f"Test execution error: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = VenturAPITester()
    
    try:
        success = tester.run_all_tests()
        
        # Save detailed results
        results_file = "/app/backend_test_results.json"
        with open(results_file, 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'failed_tests': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                    'timestamp': datetime.now().isoformat()
                },
                'detailed_results': tester.test_results
            }, indent=2)
        
        print(f"\n📄 Detailed results saved to: {results_file}")
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())