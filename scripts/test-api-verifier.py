# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.23,<5"]
# ///
"""uv run scripts/test-api-verifier.py — no server or database needed."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("verifier", Path(__file__).with_name("verify-api-examples.py"))
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)


class ResponseContractTests(unittest.TestCase):
    operation = {"responses": {"200": {"content": {"application/json": {"schema": {"type": "object", "required": ["ok"], "properties": {"ok": {"type": "boolean"}}}}}}, "204": {}}}

    def test_wrong_media_type_fails_instead_of_skipping_validation(self):
        with self.assertRaises(AssertionError):
            verifier.validate_response(self.operation, 200, "text/plain", b"looks fine")

    def test_unknown_status_fails(self):
        with self.assertRaises(AssertionError):
            verifier.validate_response(self.operation, 202, "application/json", b'{}')

    def test_correct_json_and_empty_no_content_response(self):
        self.assertEqual(verifier.validate_response(self.operation, 200, "application/json", b'{"ok":true}'), {"ok": True})
        self.assertIsNone(verifier.validate_response(self.operation, 204, "text/plain", b""))

    def test_invalid_body_fails(self):
        with self.assertRaises(verifier.ValidationError):
            verifier.validate_response(self.operation, 200, "application/json", b'{}')
        with self.assertRaises(AssertionError):
            verifier.validate_response(self.operation, 204, "text/plain", b"unexpected")


if __name__ == "__main__":
    unittest.main()
