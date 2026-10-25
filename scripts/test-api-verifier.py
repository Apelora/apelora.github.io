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


class CredentialTests(unittest.TestCase):
    def setUp(self):
        verifier.SECRETS.clear()
        verifier.LOCAL.clear()

    def test_credentials_are_replaced_by_name_and_wherever_they_reappear(self):
        token = "apu_" + "a" * 64
        verifier.remember_secrets({"token": token, "expiresAt": "2026-10-26T00:00:00Z"})
        self.assertEqual(verifier.scrub({"token": token})["token"], "<token, shown once>")
        self.assertEqual(verifier.scrub({"enrolCommand": f"enrol --token {token}"})["enrolCommand"], "enrol --token <token>")
        self.assertEqual(verifier.scrub({"note": "apw_" + "b" * 64}), {"note": "<token>"})

    def test_a_body_written_for_the_page_keeps_its_own_placeholders(self):
        shown = {"token": "<setup token from the setup link>", "password": "<new password>"}
        self.assertEqual(verifier.scrub(shown, by_name=False), shown)

    def test_local_paths_and_the_internal_test_record_are_replaced(self):
        verifier.LOCAL["/var/folders/x/T/apelora-docs-db-backups-1"] = "/var/backups/apelora"
        self.assertEqual(verifier.scrub({"directory": "/var/folders/x/T/apelora-docs-db-backups-1"}), {"directory": "/var/backups/apelora"})
        self.assertNotIn("TESTED", verifier.scrub({"incusTestedWith": "REAL INCUS TESTED 2026-10-23"})["incusTestedWith"])


if __name__ == "__main__":
    unittest.main()
