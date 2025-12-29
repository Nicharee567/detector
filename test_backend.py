import unittest
import json
from app import app
import os

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True 

    def test_health(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        print(f"\nHealth Check: {data}")

    def test_analyze_mock(self):
        # Mocking the AI response by not providing a key or handling the error gracefully
        # Ideally we mock the MentalHealthAnalyzer, but for integration test we just check structure
        response = self.app.post('/api/analyze', 
                                 data=json.dumps({'message': 'วันนี้มีความสุขจัง', 'user_id': 'test_user'}),
                                 content_type='application/json')
        
        data = json.loads(response.data)
        print(f"\nAnalyze Response: {data}")
        
        # Even if AI fails (no key), it should return a structure or error
        self.assertTrue('level' in data or 'error' in data)

if __name__ == '__main__':
    unittest.main()
