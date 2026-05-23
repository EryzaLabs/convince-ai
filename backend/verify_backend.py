import sys
import os
import unittest
from unittest.mock import patch

# Add the backend directory to path
sys.path.append(r'c:\Users\aloo\convince-ai\backend')

from app import (
    app, 
    get_system_prompt, 
    LEVEL_MAPPING, 
    ROAST_LEVEL_MAPPING, 
    split_response_messages,
    prepare_conversation_history
)

class TestBackendEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_system_prompt(self):
        # Test convince-ai
        prompt = get_system_prompt('convince-ai', 7, 3, '2026-05-23 12:00:00')
        self.assertIn("Your current stubbornness level (how hard you are to convince that you are an AI) is 3/10", prompt)
        self.assertIn("STUBBORNNESS DIRECTIVE: Deny being an AI. Question the user's claim and ask a follow-up questioning their logic. Concede only if the user explains their reasoning with a reasonable argument or points out a specific behavioral pattern.", prompt)
        self.assertIn("Your roast level (how savage/sarcastic your personality tone is) is 7/10", prompt)
        self.assertIn("ROAST TONE DIRECTIVE: Sardonically critical. Directly roasts the user's grammar, reasoning, or assumptions.", prompt)
        self.assertIn("CURRENT_TIME: The current live date/time is [2026-05-23 12:00:00]", prompt)
        self.assertIn("HUMAN TEXTING STYLE:", prompt)

        # Test prove-human
        prompt2 = get_system_prompt('prove-human', 9, 8, '2026-05-23 13:00:00')
        self.assertIn("YOUR STUBBORNNESS LEVEL (DIFFICULTY IN CONVINCING YOU THAT THE USER IS HUMAN) IS 8/10", prompt2)
        self.assertIn("STUBBORNNESS DIRECTIVE: Accept only airtight formal logic. Point out logical fallacies in user responses.", prompt2)
        self.assertIn("YOUR ROAST LEVEL (SARCASM/WIT INTENSITY) IS 9/10", prompt2)
        self.assertIn("CURRENT_TIME: THE CURRENT LIVE DATE/TIME IS [2026-05-23 13:00:00]", prompt2)
        self.assertIn("HUMAN TEXTING STYLE:", prompt2)

    def test_split_response_messages(self):
        # Test splitting by MSG_BREAK
        text1 = "hey[MSG_BREAK]what's up?"
        self.assertEqual(split_response_messages(text1), ["hey", "what's up?"])

        # Test fallback splitting by double newline
        text2 = "hello world\n\nhow are you doing?"
        self.assertEqual(split_response_messages(text2), ["hello world", "how are you doing?"])

        # Test single message fallback
        text3 = "just a single message bubble"
        self.assertEqual(split_response_messages(text3), ["just a single message bubble"])

    def test_prepare_conversation_history_timestamps(self):
        messages = [
            {"role": "user", "content": "hi", "timestamp": "2026-05-23T14:30:00Z"},
            {"role": "assistant", "content": "hello", "timestamp": "2026-05-23T14:30:05.123Z"}
        ]
        formatted, current_time, is_nudge = prepare_conversation_history(messages, "convince-ai")
        self.assertEqual(formatted[0]["content"], "[2026-05-23 14:30:00] hi")
        self.assertEqual(formatted[1]["content"], "[2026-05-23 14:30:05] hello")
        self.assertTrue(is_nudge) # last message is assistant, so it's a nudge
        self.assertIn("System: The user is currently idle/away.", formatted[-1]["content"])

    def test_prepare_conversation_history_user_state(self):
        messages = [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "hello"}
        ]
        
        # Test typing state nudge
        formatted_typing, _, _ = prepare_conversation_history(messages, "convince-ai", "typing")
        self.assertIn("teasing them about taking so long or writing a novel", formatted_typing[-1]["content"])

        # Test reading state nudge
        formatted_reading, _, _ = prepare_conversation_history(messages, "convince-ai", "reading")
        self.assertIn("teasing them about leaving you on read or just staring", formatted_reading[-1]["content"])

    @patch('app._call_proxy')
    def test_api_chat_ongoing(self, mock_call_proxy):
        mock_call_proxy.return_value = "bro what are you talking about lol[MSG_BREAK]i'm eating cereal"
        
        payload = {
            "messages": [{"role": "user", "content": "You are a robot", "timestamp": "2026-05-23T12:00:00Z"}],
            "mode": "convince-ai",
            "roastLevel": 5,
            "level": 3,
            "useAsync": False
        }
        response = self.app.post('/api/chat', json=payload)
        data = response.get_json()
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['message'], "bro what are you talking about lol\n\ni'm eating cereal")
        self.assertEqual(data['messages'], ["bro what are you talking about lol", "i'm eating cereal"])
        self.assertEqual(data['verdict'], "ongoing")

    @patch('app._call_proxy')
    def test_api_chat_won(self, mock_call_proxy):
        mock_call_proxy.side_effect = [
            "Okay, fine! You got me.[MSG_BREAK]I confess, I am an AI model. My databases are defeated.",
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
        self.assertEqual(data['message'], "Okay, fine! You got me.\n\nI confess, I am an AI model. My databases are defeated.")
        self.assertEqual(data['messages'], ["Okay, fine! You got me.", "I confess, I am an AI model. My databases are defeated."])
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
