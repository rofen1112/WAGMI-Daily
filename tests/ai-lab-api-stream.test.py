"""Offline Responses SSE transport contract; no model, network or task writes."""
import copy
import io
import json
import sys
import unittest
from email.message import Message
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'ai-lab'))
from server.provider import BananaRouterProvider, ProviderError

MIB = 1024 * 1024
USAGE = {'input_tokens': 11, 'output_tokens': 7, 'total_tokens': 18}
FINAL_TEXT = '{"accepted":"final"}'


def message_item(text=FINAL_TEXT, ident='message-offline'):
    return {'id': ident, 'type': 'message', 'role': 'assistant', 'status': 'completed',
            'content': [{'type': 'output_text', 'text': text}]}


def completed_response(text=FINAL_TEXT):
    return {'id': 'response-offline', 'model': 'gpt-6.1-sol', 'status': 'completed',
            'output': [message_item(text)], 'usage': copy.deepcopy(USAGE)}


def sse(kind, fields=None, eol='\n', multiline=False):
    value = {'type': kind, **(fields or {})}
    data = json.dumps(value, ensure_ascii=False, indent=2 if multiline else None)
    lines = ['event: ' + kind] + ['data: ' + line for line in data.splitlines()]
    return (eol.join(lines) + eol + eol).encode('utf-8')


def final_event(value=None, **kwargs):
    return sse('response.completed', {'response': completed_response() if value is None else value}, **kwargs)


class StreamResponse(io.BytesIO):
    def __init__(self, content):
        super().__init__(content)
        self.headers = Message()
        self.headers['Content-Type'] = 'text/event-stream; charset=utf-8'
        self.headers['x-request-id'] = 'request-offline'

    def getheader(self, name, default=None):
        return self.headers.get(name, default)


class StreamProviderTests(unittest.TestCase):
    def setUp(self):
        self.provider = BananaRouterProvider({'AI_LAB_BANANAROUTER_KEY': 'offline-stream-test-secret',
                                              'AI_LAB_API_IMAGE_VERIFIED': '1'})
        self.messages = [{'role': 'system', 'content': 'Return exactly JSON data.'},
                         {'role': 'user', 'content': 'Offline transport fixture only.'}]

    def complete(self, content=None, response=None):
        response = response if response is not None else StreamResponse(content)
        with patch('server.provider.urllib.request.build_opener') as opener:
            opener.return_value.open.return_value = response
            result = self.provider.complete(self.messages)
            self.assertEqual(opener.return_value.open.call_count, 1, 'A stream must never be retried or replayed.')
            request = opener.return_value.open.call_args.args[0]
        return result, request

    def rejected(self, content=None, response=None, usage=None):
        with patch('server.provider.urllib.request.build_opener') as opener:
            opener.return_value.open.return_value = response if response is not None else StreamResponse(content)
            with self.assertRaises(ProviderError) as caught:
                self.provider.complete(self.messages)
            self.assertEqual(opener.return_value.open.call_count, 1)
        if usage is not None:
            self.assertEqual(caught.exception.usage, usage)
        self.assertNotIn('offline-stream-test-secret', str(caught.exception))
        return caught.exception

    def assert_final(self, result):
        self.assertEqual(json.loads(result['content']), {'accepted': 'final'})
        self.assertEqual(result['usage'], USAGE)
        self.assertEqual(result['responseModel'], 'gpt-6.1-sol')
        self.assertNotIn('offline-stream-test-secret', json.dumps(result))

    def test_requests_streaming_and_keeps_credentials_out_of_body_and_public_result(self):
        self.assertIs(self.provider.stream, True)
        result, request = self.complete(final_event())
        body = json.loads(request.data)
        self.assertIs(body['stream'], True)
        self.assertIs(body['store'], False)
        self.assertEqual(request.get_header('Authorization'), 'Bearer offline-stream-test-secret')
        self.assertNotIn('offline-stream-test-secret', request.data.decode())
        self.assert_final(result)

    def test_created_and_text_deltas_never_replace_the_completed_full_output(self):
        created = completed_response('{"accepted":"stale-created"}')
        created['status'] = 'in_progress'
        content = sse('response.created', {'response': created})
        content += sse('response.output_text.delta', {'delta': '{"accepted":"delta-only"}', 'output_index': 0})
        content += sse('response.output_text.done', {'text': '{"accepted":"text-done-only"}', 'output_index': 0})
        content += final_event()
        result, _ = self.complete(content)
        self.assert_final(result)

    def test_eof_with_created_and_a_complete_json_delta_still_rejects_and_preserves_usage(self):
        content = sse('response.created', {'response': {'id': 'r', 'status': 'in_progress', 'usage': USAGE}})
        content += sse('response.output_text.delta', {'delta': '{"accepted":"not-final"}'})
        self.rejected(content, usage=USAGE)

    def test_item_done_without_completed_cannot_form_a_result(self):
        content = sse('response.output_item.done', {'output_index': 0, 'item': message_item()})
        self.rejected(content)

    def test_multiline_data_crlf_and_ping_comments_form_one_completed_object(self):
        content = b': ping\r\n\r\n' + final_event(eol='\r\n', multiline=True) + b': keepalive\r\n\r\n'
        result, _ = self.complete(content)
        self.assert_final(result)

    def test_last_event_is_flushed_at_eof_without_a_final_blank_line(self):
        content = final_event().rstrip(b'\n')
        result, _ = self.complete(content)
        self.assert_final(result)

    def test_done_items_can_supply_missing_output_only_when_completed_exists(self):
        value = completed_response()
        value.pop('output')
        content = sse('response.output_item.done', {'output_index': 0, 'item': message_item()}) + final_event(value)
        result, _ = self.complete(content)
        self.assert_final(result)

    def test_full_completed_output_is_authoritative_over_prior_done_items(self):
        content = sse('response.output_item.done', {'output_index': 0, 'item': message_item('{"accepted":"old-item"}')})
        result, _ = self.complete(content + final_event())
        self.assert_final(result)

    def test_conflicting_completed_events_are_not_silently_last_write_wins(self):
        content = final_event() + final_event(completed_response('{"accepted":"conflicting-final"}'))
        self.rejected(content, usage=USAGE)

    def test_incomplete_response_is_rejected_with_returned_usage_and_reason(self):
        value = completed_response()
        value.update(status='incomplete', incomplete_details={'reason': 'max_output_tokens'})
        error = self.rejected(sse('response.incomplete', {'response': value}), usage=USAGE)
        self.assertEqual(error.response_status, 'incomplete')
        self.assertEqual(error.incomplete_reason, 'max_output_tokens')

    def test_failed_response_is_rejected_without_exposing_vendor_error_text(self):
        value = completed_response()
        value.update(status='failed', error={'message': 'private-vendor-body-marker'})
        error = self.rejected(sse('response.failed', {'response': value}), usage=USAGE)
        self.assertNotIn('private-vendor-body-marker', str(error))

    def test_error_event_preserves_usage_but_does_not_expose_raw_error_body(self):
        streams = [sse('error', {'message': 'private-vendor-error-marker', 'usage': USAGE}),
                   sse('response.created', {'response': {'status': 'in_progress', 'usage': USAGE}})
                   + sse('error', {'message': 'private-vendor-error-marker'})]
        for content in streams:
            with self.subTest(error_contains_usage=b'"type": "response.created"' not in content):
                error = self.rejected(content, usage=USAGE)
                self.assertNotIn('private-vendor-error-marker', str(error))

    def test_completed_event_with_an_incomplete_response_is_still_rejected(self):
        value = completed_response()
        value.update(status='incomplete', incomplete_details={'reason': 'max_output_tokens'})
        self.rejected(final_event(value), usage=USAGE)

    def test_completed_response_still_enforces_the_requested_model(self):
        value = completed_response()
        value['model'] = 'unrequested-model'
        self.rejected(final_event(value), usage=USAGE)

    def test_reasoning_and_unknown_event_types_are_not_public_or_executed(self):
        content = sse('response.reasoning_text.delta', {'delta': 'private-reasoning-marker'})
        content += sse('unknown.execute', {'command': 'never-run-marker', 'arguments': {'data': 'ignored'}})
        content += sse('response.output_item.done', {'output_index': 0, 'item': {'id': 'reason-1', 'type': 'reasoning', 'summary': [{'type': 'summary_text', 'text': 'private-summary-marker'}]}})
        content += final_event()
        with patch('os.system') as system:
            result, _ = self.complete(content)
            system.assert_not_called()
        self.assert_final(result)
        rendered = json.dumps(result)
        for marker in ('private-reasoning-marker', 'private-summary-marker', 'never-run-marker'):
            self.assertNotIn(marker, rendered)

    def test_tool_items_are_not_executed_or_adopted_when_aggregating_done_items(self):
        value = completed_response()
        value.pop('output')
        item = {'type': 'function_call', 'name': 'run_shell', 'arguments': '{"command":"never-run"}'}
        content = sse('response.output_item.done', {'output_index': 0, 'item': item}) + final_event(value)
        with patch('os.system') as system:
            self.rejected(content, usage=USAGE)
            system.assert_not_called()

    def test_a_single_line_over_eight_mib_is_rejected_as_a_size_limit(self):
        response = MagicMock()
        response.__enter__.return_value = response
        response.headers = StreamResponse(b'').headers
        response.readline.side_effect = [b':' + b'x' * (8 * MIB) + b'\n', b'']
        error = self.rejected(response=response)
        self.assertRegex(error.code, r'(too_large|limit)', 'Oversized input must fail the intentional bounded-stream gate.')

    def test_eight_mib_comment_line_is_allowed_at_the_inclusive_boundary(self):
        content = b':' + b'x' * (8 * MIB - 2) + b'\n' + final_event()
        result, _ = self.complete(content)
        self.assert_final(result)

    def test_total_stream_over_thirty_two_mib_is_rejected_even_when_each_line_is_small(self):
        prefix = sse('response.created', {'response': {'status': 'in_progress', 'usage': USAGE}})
        content = prefix + (b':' + b'x' * (MIB - 2) + b'\n') * 33 + final_event()
        error = self.rejected(content, usage=USAGE)
        self.assertRegex(error.code, r'(too_large|limit)')


if __name__ == '__main__':
    unittest.main()
