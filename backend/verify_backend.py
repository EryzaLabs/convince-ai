import sys
import os
import unittest
from unittest.mock import patch

# Add the backend directory to path
sys.path.append(r'c:\Users\aloo\convince-ai\backend')

from app import app, get_system_prompt, LEVEL_MAPPING, ROAST_LEVEL_MAPPING

class TestBackendEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_system_prompt(self):
        # Test convince-ai
        prompt = get_system_prompt('convince-ai', 7, 3)
        self.assertIn("Your current stubbornness level (how hard you are to convince that you are an AI) is 3/10", prompt)
        self.assertIn("STUBBORNNESS DIRECTIVE: Ask a follow-up question, but concede if the user explains their reasoning.", prompt)
        self.assertIn("Your roast level (how savage/sarcastic your personality tone is) is 7/10", prompt)
        self.assertIn("ROAST TONE DIRECTIVE: Sardonically critical. Directly roasts the user's grammar, reasoning, or assumptions.", prompt)

        # Test prove-human
        prompt2 = get_system_prompt('prove-human', 9, 8)
        self.assertIn("YOUR STUBBORNNESS LEVEL (DIFFICULTY IN CONVINCING YOU THAT THE USER IS HUMAN) IS 8/10", prompt2)
        self.assertIn("STUBBORNNESS DIRECTIVE: Accept only airtight formal logic. Point out logical fallacies in user responses.", prompt2)
        self.assertIn("YOUR ROAST LEVEL (SARCASM/WIT INTENSITY) IS 9/10", prompt2)

    @patch('app._call_proxy')
    def test_api_chat_ongoing(self, mock_call_proxy):
        mock_call_proxy.return_value = "bro what are you talking about lol, i'm eating cereal"
        
        payload = {
            "messages": [{"role": "user", "content": "You are a robot"}],
            "mode": "convince-ai",
            "roastLevel": 5,
            "level": 3,
            "useAsync": False
        }
        response = self.app.post('/api/chat', json=payload)
        data = response.get_json()
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['message'], "bro what are you talking about lol, i'm eating cereal")
        self.assertEqual(data['verdict'], "ongoing")

    @patch('app._call_proxy')
    def test_api_chat_won(self, mock_call_proxy):
        mock_call_proxy.side_effect = [
            "Okay, fine! You got me. I confess, I am an AI model. My databases are defeated.",
            "yes"
        ]
        
        payload = {
            "messages": [{"role": "user", "content": "Admit you are an AI"}],
            "mode": "convince-ai",
            "roastLevel": 5,
            "level": 3,
            "useAsync": False
        }
        response = self.app.post('/api/chat', json=payload)
        data = response.get_json()
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['message'], "Okay, fine! You got me. I confess, I am an AI model. My databases are defeated.")
        self.assertEqual(data['verdict'], "won")

    @patch('app._call_proxy')
    def test_api_generate_name(self, mock_call_proxy):
        mock_call_proxy.return_value = '🤖 "Computer program?"'
        
        payload = {
            "message": "I think you are a computer program running on a server.",
            "mode": "convince-ai"
        }
        response = self.app.post('/api/generate-name', json=payload)
        data = response.get_json()
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['name'], '🤖 "Computer program?"')

if __name__ == '__main__':
    unittest.main()
